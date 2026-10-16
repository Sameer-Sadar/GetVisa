import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import * as api from '@/api';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCurrentUser } from '@/state/auth';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(active: IconName, inactive: IconName) {
  return function TabIcon({ color, focused, size }: { color: ColorValue; focused: boolean; size: number }) {
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  };
}

export default function TabsLayout() {
  const theme = useTheme();
  const user = useCurrentUser();

  const { data: notifications } = useQuery({
    queryKey: ['notifications', user.id],
    queryFn: () => api.listNotifications(user.id),
  });
  const unread = notifications?.filter((n) => !n.readAt).length ?? 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerStyle: { backgroundColor: theme.card },
        headerTitleStyle: { color: theme.text, fontWeight: '700' },
        headerShadowVisible: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: tabIcon('home', 'home-outline') }}
      />
      <Tabs.Screen
        name="applications"
        options={{ title: 'My cases', tabBarIcon: tabIcon('document-text', 'document-text-outline') }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Updates',
          tabBarIcon: tabIcon('notifications', 'notifications-outline'),
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.light.danger },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: tabIcon('person', 'person-outline') }}
      />
    </Tabs>
  );
}
