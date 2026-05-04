import { router, Tabs } from "expo-router";
import React, { useEffect } from "react";

import { HapticTab } from "@/components/haptic-tab";
import {
  DashboardIcon,
  TrackerIcon,
  TransactionsIcon,
  InvoicesIcon,
  ProfileIcon,
} from "@/components/icons/tab-icons";
import { useThomo } from "@/lib/thomo-context";
import { useAuth } from "@/lib/auth-context";

export default function TabLayout() {
  const { connected } = useThomo();
  const { user, loading: authLoading } = useAuth();
  const hideTabs = connected !== true;

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/welcome");
    }
  }, [authLoading, user]);

  if (authLoading || !user) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#1A1A1A",
        tabBarInactiveTintColor: "#BBBBBB",
        headerShown: false,
        tabBarButton: HapticTab,
        // Pre-mount every tab so switching is instant — no first-visit render cost
        lazy: false,
        freezeOnBlur: true,
        tabBarStyle: hideTabs
          ? { display: "none" }
          : {
              backgroundColor: "#fff",
              borderTopColor: "#F0F0F0",
              paddingTop: 8,
              height: 88,
            },
        tabBarLabelStyle: {
          fontFamily: "NeueMontreal-Medium",
          fontSize: 10,
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <DashboardIcon size={20} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: "Tracker",
          tabBarIcon: ({ color, focused }) => (
            <TrackerIcon size={20} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color, focused }) => (
            <TransactionsIcon size={20} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="invoices"
        options={{
          title: "Invoices",
          tabBarIcon: ({ color, focused }) => (
            <InvoicesIcon size={20} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <ProfileIcon size={20} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
