import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { habitOperations, initDatabase } from '../database/asyncStorage';
import XPDisplay from '../components/XPDisplay';
import LevelUpModal from '../components/LevelUpModal';
import NotificationService from '../services/NotificationService';

export default function DashboardScreen() {
  const [habits, setHabits] = useState([]);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  useEffect(() => {
    initializeDatabase();
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      await NotificationService.initialize();
      await NotificationService.setupNotificationCategories();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      loadHabits();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  const loadHabits = async () => {
    try {
      const habitsData = await habitOperations.getAll();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleToggleHabit = async (habitId, currentStatus) => {
    try {
      await habitOperations.updateCompletion(habitId, !currentStatus);
      
      // Check for level up
      const { xpOperations } = require('../database/xpSystem');
      const result = await xpOperations.get();
      if (result && result.leveledUp) {
        setNewLevel(result.level);
        setShowLevelUpModal(true);
        // Schedule level up notification
        await NotificationService.scheduleLevelUpNotification(result.level);
      }
      
      // Check for streak milestone and schedule celebration
      if (!currentStatus) { // If we're completing the habit
        const updatedHabits = await habitOperations.getAll();
        const updatedHabit = updatedHabits.find(h => h.id === habitId);
        if (updatedHabit && updatedHabit.streak > 0 && updatedHabit.streak % 7 === 0) {
          await NotificationService.scheduleStreakCelebration(updatedHabit);
        }
      }
      
      loadHabits();
    } catch (error) {
      console.error('Error updating habit:', error);
      Alert.alert('Fout', 'Kon gewoonte niet bijwerken');
    }
  };

  const isHabitCompletedToday = (habit) => {
    const today = new Date().toISOString().split('T')[0];
    return habit.laatst_voltooid === today;
  };

  const renderHabit = (habit) => {
    const completed = isHabitCompletedToday(habit);
    return (
      <View key={habit.id} style={styles.habitItem}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            { backgroundColor: completed ? '#4CAF50' : '#FFFFFF' }
          ]}
          onPress={() => handleToggleHabit(habit.id, completed)}
        >
          {completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <View style={styles.habitInfo}>
          <Text style={[styles.habitName, completed && styles.completedText]}>
            {habit.naam}
          </Text>
          {habit.beschrijving ? (
            <Text style={[styles.habitDescription, completed && styles.completedText]}>
              {habit.beschrijving}
            </Text>
          ) : null}
          <Text style={styles.habitStreak}>Streak: {habit.streak} dagen</Text>
        </View>
      </View>
    );
  };

  const completedCount = habits.filter(habit => isHabitCompletedToday(habit)).length;
  const totalCount = habits.length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* XP Display */}
        <XPDisplay />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Dagelijkse Gewoontes</Text>
          <Text style={styles.progressText}>
            {completedCount} van {totalCount} voltooid
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }
              ]} 
            />
          </View>
        </View>

        {/* Habits List */}
        <View style={styles.section}>
          {habits.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Geen gewoontes gevonden</Text>
              <Text style={styles.emptySubtext}>Ga naar het Gewoontes tabblad om gewoontes toe te voegen</Text>
            </View>
          ) : (
            habits.map(renderHabit)
          )}
        </View>
      </View>
      
      <LevelUpModal 
        visible={showLevelUpModal}
        level={newLevel}
        onClose={() => setShowLevelUpModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    color: '#757575',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  habitDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  habitStreak: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});

