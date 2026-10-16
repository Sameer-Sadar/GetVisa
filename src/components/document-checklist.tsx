import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import * as api from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { documentStatusMeta, formatBytes } from '@/lib/status';
import { useCurrentUser } from '@/state/auth';
import type { Application, VisaService } from '@/types';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

type Props = {
  application: Application;
  service: VisaService;
  /** Uploads are only allowed while drafting or after staff request more information. */
  canUpload: boolean;
};

export function DocumentChecklist({ application, service, canUpload }: Props) {
  const theme = useTheme();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const upload = useMutation({
    mutationFn: api.uploadDocument,
    onSuccess: (updated) => {
      queryClient.setQueryData(['application', user.id, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['applications', user.id] });
    },
  });

  const pick = async (documentType: string) => {
    setErrors((current) => ({ ...current, [documentType]: '' }));
    const result = await DocumentPicker.getDocumentAsync({
      type: ALLOWED_TYPES,
      copyToCacheDirectory: true,
      base64: false,
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];

    setUploadingType(documentType);
    try {
      await upload.mutateAsync({
        applicationId: application.id,
        userId: user.id,
        documentType,
        fileName: asset.name,
        sizeBytes: asset.size ?? 0,
      });
    } catch (error) {
      setErrors((current) => ({
        ...current,
        [documentType]: error instanceof Error ? error.message : 'Upload failed. Try again.',
      }));
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <Card>
      <ThemedText type="heading">Documents</ThemedText>
      <ThemedText type="caption" themeColor="textSecondary">
        PDF, JPG or PNG, up to 10 MB each. Files are stored privately.
      </ThemedText>

      {service.checklist.map((item, index) => {
        const uploaded = application.documents.find((d) => d.documentType === item.type);
        const meta = uploaded ? documentStatusMeta[uploaded.reviewStatus] : null;
        const needsReplacement = uploaded?.reviewStatus === 'replacement_requested';
        const canChange = canUpload && (!uploaded || application.status === 'draft' || needsReplacement);

        return (
          <View
            key={item.type}
            style={[styles.item, index > 0 && { borderTopColor: theme.border, borderTopWidth: StyleSheet.hairlineWidth }]}>
            <View style={styles.itemHeader}>
              <Ionicons
                name={uploaded ? 'checkmark-circle' : 'ellipse-outline'}
                size={22}
                color={uploaded ? theme.success : theme.textSecondary}
              />
              <View style={styles.flex}>
                <ThemedText type="smallBold">
                  {item.label}
                  {item.required ? '' : ' (optional)'}
                </ThemedText>
                {item.hint ? (
                  <ThemedText type="caption" themeColor="textSecondary">
                    {item.hint}
                  </ThemedText>
                ) : null}
              </View>
              {meta ? <Badge label={meta.label} tone={meta.tone} /> : null}
            </View>

            {uploaded ? (
              <ThemedText type="caption" themeColor="textSecondary" style={styles.indent}>
                {uploaded.fileName} · {formatBytes(uploaded.sizeBytes)}
              </ThemedText>
            ) : null}

            {uploaded?.reviewNote ? (
              <View style={[styles.note, { backgroundColor: theme.warningSoft }]}>
                <ThemedText type="caption" themeColor="warning">
                  {uploaded.reviewNote}
                </ThemedText>
              </View>
            ) : null}

            {errors[item.type] ? (
              <ThemedText type="caption" themeColor="danger" style={styles.indent} accessibilityLiveRegion="polite">
                {errors[item.type]}
              </ThemedText>
            ) : null}

            {canChange ? (
              <View style={styles.indent}>
                <Button
                  label={uploaded ? 'Replace file' : 'Upload file'}
                  variant={needsReplacement ? 'primary' : 'secondary'}
                  loading={uploadingType === item.type}
                  disabled={uploadingType !== null}
                  onPress={() => pick(item.type)}
                  icon={
                    <Ionicons
                      name="cloud-upload-outline"
                      size={18}
                      color={needsReplacement ? theme.onPrimary : theme.text}
                    />
                  }
                />
              </View>
            ) : null}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  flex: {
    flex: 1,
  },
  indent: {
    marginLeft: 30,
  },
  note: {
    marginLeft: 30,
    padding: Spacing.two,
    borderRadius: Radius.sm,
  },
});
