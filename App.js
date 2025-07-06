import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// Import screens
import DashboardScreen from './src/screens/DashboardScreen';
import HabitsScreen from './src/screens/HabitsScreen';
import TasksScreen from './src/screens/TasksScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import StatsScreen from './src/screens/StatsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4CAF50',
          tabBarInactiveTintColor: '#424242',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#EEEEEE',
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
            headerTitle: 'Dashboard',
          }}
        />
        <Tab.Screen 
          name="Habits" 
          component={HabitsScreen}
          options={{
            tabBarLabel: 'Gewoontes',
            headerTitle: 'Gewoontes',
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
          name="Goals" 
          component={GoalsScreen}
          options={{
            tabBarLabel: 'Doelen',
            headerTitle: 'Doelen',
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
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

