import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { RefreshControl, StyleSheet, View } from 'react-native';

import * as api from '@/api';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/ui/state-views';
import { Radius, Spacing } from '@/constants/theme';
import { useNotifications } from '@/hooks/use-api';
import { useTheme } from '@/hooks/use-theme';
import { formatDateTime } from '@/lib/status';
import { useCurrentUser } from '@/state/auth';
import type { AppNotification, NotificationType } from '@/types';

const ICONS: Record<NotificationType, React.ComponentProps<typeof Ionicons>['name']> = {
  status: 'git-branch-outline',
  document: 'document-attach-outline',
  payment: 'card-outline',
  info: 'information-circle-outline',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  const notifications = useNotifications();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
  const markRead = useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id, user.id),
    onSuccess: invalidate,
  });
  const markAll = useMutation({
    mutationFn: () => api.markAllNotificationsRead(user.id),
    onSuccess: invalidate,
  });

  const unread = notifications.data?.filter((n) => !n.readAt).length ?? 0;

  const open = (notification: AppNotification) => {
    if (!notification.readAt) markRead.mutate(notification.id);
    if (notification.applicationId) {
      router.push({ pathname: '/application/[id]', params: { id: notification.applicationId } });
    }
  };

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={notifications.isRefetching} onRefresh={() => notifications.refetch()} />
      }>
      {notifications.isLoading ? (
        <LoadingView />
      ) : notifications.isError ? (
        <ErrorView onRetry={() => notifications.refetch()} />
      ) : notifications.data?.length === 0 ? (
        <EmptyView
          icon="notifications-off-outline"
          title="You are all caught up"
          message="Updates about your cases, documents and payments will appear here."
        />
      ) : (
        <>
          {unread > 0 ? (
            <Button
              label={`Mark all ${unread} as read`}
              variant="ghost"
              loading={markAll.isPending}
              onPress={() => markAll.mutate()}
            />
          ) : null}
          {notifications.data?.map((notification) => {
            const isUnread = !notification.readAt;
            return (
              <Card
                key={notification.id}
                onPress={() => open(notification)}
                accessibilityLabel={`${isUnread ? 'Unread. ' : ''}${notification.message}`}
                style={isUnread ? { borderColor: theme.primary } : undefined}>
                <View style={styles.row}>
                  <View style={[styles.icon, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons name={ICONS[notification.type]} size={20} color={theme.primary} />
                  </View>
                  <View style={styles.flex}>
                    <ThemedText type={isUnread ? 'smallBold' : 'small'}>{notification.message}</ThemedText>
                    <ThemedText type="caption" themeColor="textSecondary">
                      {formatDateTime(notification.createdAt)}
                    </ThemedText>
                  </View>
                  {isUnread ? <View style={[styles.dot, { backgroundColor: theme.primary }]} /> : null}
                </View>
              </Card>
            );
          })}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flex: {
    flex: 1,
    gap: Spacing.half,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
