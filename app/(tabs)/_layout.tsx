import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

import { useSQLiteContext } from 'expo-sqlite';

export default function TabLayout() {
  const db = useSQLiteContext();
  useDrizzleStudio(db)
  
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarStyle: {
          height: 70,
          borderTopWidth: 2,
          borderColor: "black",
          },
        
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarItemStyle: {
          },
          tabBarIconStyle: {
            width: "100%",
            height: "100%",
          },
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <IconSymbol size={38} name="note" color={color} />,
        }}
      />
      <Tabs.Screen
        name='(modals)/newBill'
        options={{
          tabBarItemStyle: {
            flex: 1/2,
            bottom: 40,
            borderWidth: 2,
            backgroundColor: "white",
            borderRadius: "100%",
            aspectRatio: 1,
            justifyContent: 'center',
            elevation: 5,
          },
          tabBarIconStyle: {
            width: "100%",
            height: "100%",
          },
          tabBarShowLabel: false,
          tabBarIcon: ({ color }) => <IconSymbol size={38} name="plus.app.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="payers"
        options={{
          tabBarItemStyle: {
            flex: 1
          },
          tabBarIconStyle: {
            width: "100%",
            height: "100%",
          },
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={38} name="person.badge.plus" color={color} />,
        }}
      />
    </Tabs>
  );
}
