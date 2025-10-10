
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { Stack } from 'expo-router';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      title: 'Calendario',
      icon: 'calendar',
      route: '/(home)',
    },
    {
      name: 'profile',
      title: 'Impostazioni',
      icon: 'gear',
      route: '/profile',
    },
  ];

  if (Platform.OS === 'ios') {
    return (
      <>
        <NativeTabs>
          <NativeTabs.Screen
            name="(home)"
            options={{
              title: 'Calendario',
              tabBarIcon: ({ color, size }) => (
                <Icon name="calendar" color={color} size={size} />
              ),
            }}
          />
          <NativeTabs.Screen
            name="profile"
            options={{
              title: 'Impostazioni',
              tabBarIcon: ({ color, size }) => (
                <Icon name="gear" color={color} size={size} />
              ),
            }}
          />
        </NativeTabs>
      </>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(home)" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
