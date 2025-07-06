import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import WeeklySetupScreen from '../screens/WeeklySetupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import HabitsScreen from '../screens/HabitsScreen';
import TasksScreen from '../screens/TasksScreen';
import WeeklyGoalsScreen from '../screens/WeeklyGoalsScreen';
import StatsScreen from '../screens/StatsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';

import { initDatabase } from '../database/asyncStorage';
import { getWeekStartDate } from '../database/xpSystem';

const Tab = createBottomTabNavigator();

const WEEKLY_SETUP_KEY = '@weekly_setup_completed';

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initDatabase();
      const weekStart = getWeekStartDate();
      const setupKey = `${WEEKLY_SETUP_KEY}_${weekStart}`;
      const setupCompleted = await AsyncStorage.getItem(setupKey);
      setShowSetup(!setupCompleted);
    } catch (error) {
      console.error('Error initializing app:', error);
      setShowSetup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = async () => {
    try {
      const weekStart = getWeekStartDate();
      const setupKey = `${WEEKLY_SETUP_KEY}_${weekStart}`;
      await AsyncStorage.setItem(setupKey, 'true');
      setShowSetup(false);
    } catch (error) {
      console.error('Error completing setup:', error);
    }
  };

  const resetWeeklySetup = async () => {
    try {
      const weekStart = getWeekStartDate();
      const setupKey = `${WEEKLY_SETUP_KEY}_${weekStart}`;
      await AsyncStorage.removeItem(setupKey);
      setShowSetup(true);
    } catch (error) {
      console.error('Error resetting setup:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {showSetup ? (
        <WeeklySetupScreen onSetupComplete={handleSetupComplete} />
      ) : (
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#4CAF50',
            tabBarInactiveTintColor: '#757575',
            tabBarStyle: {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E0E0E0',
            },
            headerStyle: {
              backgroundColor: '#4CAF50',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Tab.Screen 
            name="Dashboard" 
            component={DashboardScreen}
            options={{
              tabBarLabel: 'Dashboard',
              headerTitle: 'Dagelijkse Gewoontes',
            }}
          />
          <Tab.Screen 
            name="Habits" 
            component={HabitsScreen}
            options={{
              tabBarLabel: 'Gewoontes',
              headerTitle: 'Gewoontes Beheren',
            }}
          />
          <Tab.Screen 
            name="Tasks" 
            component={TasksScreen}
            options={{
              tabBarLabel: 'Taken',
              headerTitle: 'Taken',
            }}
          />
          <Tab.Screen 
            name="WeeklyGoals" 
            component={WeeklyGoalsScreen}
            options={{
              tabBarLabel: 'Week Doelen',
              headerTitle: 'Wekelijkse Doelen',
            }}
          />
          <Tab.Screen 
            name="Stats" 
            component={StatsScreen}
            options={{
              tabBarLabel: 'Statistieken',
              headerTitle: 'Statistieken',
            }}
          />
          <Tab.Screen 
            name="Notifications" 
            component={NotificationSettingsScreen}
            options={{
              tabBarLabel: 'Notificaties',
              headerTitle: 'Notificatie Instellingen',
            }}
          />
        </Tab.Navigator>
      )}
    </NavigationContainer>
  );
}


