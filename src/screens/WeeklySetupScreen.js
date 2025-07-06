import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { habitOperations, taskOperations } from '../database/asyncStorage';
import { weeklyGoalsOperations, getWeekStartDate } from '../database/xpSystem';

export default function WeeklySetupScreen({ onSetupComplete }) {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newTaskName, setNewTaskName] = useState('');
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsData, tasksData] = await Promise.all([
        habitOperations.getAll(),
        taskOperations.getAll()
      ]);
      
      // Filter out completed tasks
      setHabits(habitsData);
      setTasks(tasksData.filter(task => !task.voltooid));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addHabit = async () => {
    if (!newHabitName.trim()) {
      Alert.alert('Fout', 'Voer een naam in voor de gewoonte');
      return;
    }

    try {
      const habit = {
        naam: newHabitName.trim(),
        beschrijving: '',
        frequentie: 'Dagelijks'
      };

      await habitOperations.create(habit);
      setNewHabitName('');
      setShowHabitForm(false);
      loadData();
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Fout', 'Kon gewoonte niet toevoegen');
    }
  };

  const addTask = async () => {
    if (!newTaskName.trim()) {
      Alert.alert('Fout', 'Voer een naam in voor de taak');
      return;
    }

    try {
      const task = {
        naam: newTaskName.trim(),
        beschrijving: '',
        deadline: null
      };

      await taskOperations.create(task);
      setNewTaskName('');
      setShowTaskForm(false);
      loadData();
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Fout', 'Kon taak niet toevoegen');
    }
  };

  const deleteHabit = async (habitId) => {
    try {
      await habitOperations.delete(habitId);
      loadData();
    } catch (error) {
      console.error('Error deleting habit:', error);
      Alert.alert('Fout', 'Kon gewoonte niet verwijderen');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await taskOperations.delete(taskId);
      loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
      Alert.alert('Fout', 'Kon taak niet verwijderen');
    }
  };

  const startWeek = async () => {
    if (habits.length === 0 && tasks.length === 0) {
      Alert.alert('Geen items', 'Voeg minimaal één gewoonte of taak toe om te beginnen');
      return;
    }

    try {
      await weeklyGoalsOperations.set(habits, tasks);
      
      Alert.alert(
        'Week gestart!', 
        `Je hebt ${habits.length} gewoontes en ${tasks.length} taken voor deze week. Veel succes!`,
        [{ text: 'Oké', onPress: onSetupComplete }]
      );
    } catch (error) {
      console.error('Error starting week:', error);
      Alert.alert('Fout', 'Kon week niet starten');
    }
  };

  const getWeekDateRange = () => {
    const startDate = new Date(getWeekStartDate());
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const formatDate = (date) => {
      return date.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'short' 
      });
    };
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const renderHabitItem = (habit) => (
    <View key={habit.id} style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{habit.naam}</Text>
        <Text style={styles.itemDescription}>Dagelijks - 10 XP per dag</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteHabit(habit.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTaskItem = (task) => (
    <View key={task.id} style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{task.naam}</Text>
        <Text style={styles.itemDescription}>Eenmalig - 15 XP</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTask(task.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Week Setup</Text>
          <Text style={styles.weekRange}>{getWeekDateRange()}</Text>
          <Text style={styles.headerSubtitle}>
            Stel je gewoontes en taken in voor deze week
          </Text>
        </View>

        {/* Habits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dagelijkse Gewoontes</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowHabitForm(!showHabitForm)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {showHabitForm && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Naam van de gewoonte"
                value={newHabitName}
                onChangeText={setNewHabitName}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowHabitForm(false);
                    setNewHabitName('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={addHabit}
                >
                  <Text style={styles.saveButtonText}>Toevoegen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {habits.length === 0 ? (
            <Text style={styles.emptyText}>Geen gewoontes toegevoegd</Text>
          ) : (
            habits.map(renderHabitItem)
          )}
        </View>

        {/* Tasks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Taken voor deze Week</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowTaskForm(!showTaskForm)}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {showTaskForm && (
            <View style={styles.addForm}>
              <TextInput
                style={styles.input}
                placeholder="Naam van de taak"
                value={newTaskName}
                onChangeText={setNewTaskName}
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowTaskForm(false);
                    setNewTaskName('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Annuleren</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={addTask}
                >
                  <Text style={styles.saveButtonText}>Toevoegen</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>Geen taken toegevoegd</Text>
          ) : (
            tasks.map(renderTaskItem)
          )}
        </View>

        {/* Start Week Button */}
        <TouchableOpacity style={styles.startButton} onPress={startWeek}>
          <Text style={styles.startButtonText}>Start de Week!</Text>
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
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  weekRange: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addForm: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#424242',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F8F8F8',
    marginBottom: 8,
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
  deleteButton: {
    backgroundColor: '#F44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


