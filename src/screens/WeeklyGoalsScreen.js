import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { habitOperations, taskOperations } from '../database/asyncStorage';
import { weeklyGoalsOperations, xpOperations, XP_VALUES } from '../database/xpSystem';

export default function WeeklyGoalsScreen() {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState(null);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [xpProgress, setXpProgress] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsData, tasksData, goalsData, xpData] = await Promise.all([
        habitOperations.getAll(),
        taskOperations.getAll(),
        weeklyGoalsOperations.get(),
        xpOperations.getLevelProgress()
      ]);

      setHabits(habitsData);
      setTasks(tasksData.filter(task => !task.voltooid)); // Only incomplete tasks
      setWeeklyGoals(goalsData);
      setXpProgress(xpData);

      // Set selected items from existing goals
      if (goalsData && goalsData.habits && goalsData.tasks) {
        setSelectedHabits(goalsData.habits.map(h => h.id));
        setSelectedTasks(goalsData.tasks.map(t => t.id));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const toggleHabitSelection = (habitId) => {
    setSelectedHabits(prev => 
      prev.includes(habitId) 
        ? prev.filter(id => id !== habitId)
        : [...prev, habitId]
    );
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const saveWeeklyGoals = async () => {
    try {
      const selectedHabitsData = habits.filter(h => selectedHabits.includes(h.id));
      const selectedTasksData = tasks.filter(t => selectedTasks.includes(t.id));

      if (selectedHabitsData.length === 0 && selectedTasksData.length === 0) {
        Alert.alert('Fout', 'Selecteer minimaal één gewoonte of taak');
        return;
      }

      await weeklyGoalsOperations.set(selectedHabitsData, selectedTasksData);
      loadData();
      Alert.alert('Succes', 'Wekelijkse doelen opgeslagen!');
    } catch (error) {
      console.error('Error saving weekly goals:', error);
      Alert.alert('Fout', 'Kon wekelijkse doelen niet opslaan');
    }
  };

  const calculateTargetXP = () => {
    const habitXP = selectedHabits.length * XP_VALUES.HABIT_COMPLETION * 7;
    const taskXP = selectedTasks.length * XP_VALUES.TASK_COMPLETION;
    return habitXP + taskXP;
  };

  const getWeekProgress = () => {
    if (!weeklyGoals || !xpProgress) return 0;
    return Math.min((xpProgress.weeklyXP / weeklyGoals.targetXP) * 100, 100);
  };

  const renderHabitItem = (habit) => {
    const isSelected = selectedHabits.includes(habit.id);
    return (
      <TouchableOpacity
        key={habit.id}
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => toggleHabitSelection(habit.id)}
      >
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{habit.naam}</Text>
          <Text style={styles.itemDescription}>
            {XP_VALUES.HABIT_COMPLETION} XP per dag × 7 dagen = {XP_VALUES.HABIT_COMPLETION * 7} XP
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderTaskItem = (task) => {
    const isSelected = selectedTasks.includes(task.id);
    return (
      <TouchableOpacity
        key={task.id}
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => toggleTaskSelection(task.id)}
      >
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{task.naam}</Text>
          <Text style={styles.itemDescription}>
            {XP_VALUES.TASK_COMPLETION} XP bij voltooiing
          </Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Current Week Progress */}
        {weeklyGoals && weeklyGoals.targetXP > 0 && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>Deze Week</Text>
            <Text style={styles.progressText}>
              {xpProgress?.weeklyXP || 0} / {weeklyGoals.targetXP} XP
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${getWeekProgress()}%` }]} 
              />
            </View>
            {weeklyGoals.completed && (
              <Text style={styles.completedText}>🎉 Wekelijks doel behaald!</Text>
            )}
          </View>
        )}

        {/* Target XP Display */}
        <View style={styles.targetSection}>
          <Text style={styles.sectionTitle}>Doel voor deze week</Text>
          <Text style={styles.targetXP}>{calculateTargetXP()} XP</Text>
        </View>

        {/* Habits Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecteer Gewoontes</Text>
          {habits.length === 0 ? (
            <Text style={styles.emptyText}>Geen gewoontes beschikbaar</Text>
          ) : (
            habits.map(renderHabitItem)
          )}
        </View>

        {/* Tasks Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecteer Taken</Text>
          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>Geen openstaande taken</Text>
          ) : (
            tasks.map(renderTaskItem)
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={saveWeeklyGoals}>
          <Text style={styles.saveButtonText}>Wekelijkse Doelen Opslaan</Text>
        </TouchableOpacity>
      </View>
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
  progressSection: {
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
  targetSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 12,
  },
  progressText: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  completedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  targetXP: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: '#E8F5E8',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
    color: '#757575',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    paddingVertical: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

