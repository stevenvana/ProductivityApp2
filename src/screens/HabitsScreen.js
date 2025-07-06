import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { habitOperations, initDatabase } from '../database/asyncStorage';

export default function HabitsScreen() {
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    naam: "",
    beschrijving: "",
    frequentie: "Dagelijks"
  });

  useEffect(() => {
    initializeDatabase();
  }, []);

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

  const handleAddHabit = async () => {
    if (!formData.naam.trim()) {
      Alert.alert('Fout', 'Voer een naam in voor de gewoonte');
      return;
    }

    try {
      const habit = {
        naam: formData.naam.trim(),
        beschrijving: formData.beschrijving.trim(),
        frequentie: formData.frequentie
      };

      await habitOperations.create(habit);
      loadHabits();
      setShowForm(false);
      setFormData({        naam: "",
        beschrijving: "",
        frequentie: "Dagelijks"
      });
      Alert.alert('Succes', 'Gewoonte toegevoegd!');
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Fout', 'Kon gewoonte niet toevoegen');
    }
  };

  const handleToggleHabit = async (habitId, currentStatus) => {
    try {
      await habitOperations.updateCompletion(habitId, !currentStatus);
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
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.naam}</Text>
          <Text style={styles.habitFrequency}>{habit.frequentie}</Text>
          <Text style={styles.habitStreak}>Streak: {habit.streak}</Text>
          {habit.beschrijving ? (
            <Text style={styles.habitDescription}>{habit.beschrijving}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[
            styles.statusIndicator,
            { backgroundColor: completed ? '#4CAF50' : '#2196F3' }
          ]}
          onPress={() => handleToggleHabit(habit.id, completed)}
        >
          <Text style={styles.statusText}>
            {completed ? '✓' : '○'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAddForm = () => (
    <View style={styles.addForm}>
      <Text style={styles.formTitle}>Nieuwe Gewoonte</Text>
      <TextInput
        style={styles.input}
        placeholder="Naam van de gewoonte"
        value={formData.naam}
        onChangeText={(text) => setFormData({...formData, naam: text})}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Beschrijving (optioneel)"
        value={formData.beschrijving}
        onChangeText={(text) => setFormData({...formData, beschrijving: text})}
        multiline
        numberOfLines={2}
      />
      <View style={styles.frequencyContainer}>
        <Text style={styles.label}>Frequentie:</Text>
        <View style={styles.frequencyButtons}>
          {['Dagelijks', 'Wekelijks', 'Maandelijks'].map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyButton,
                formData.frequentie === freq && styles.frequencyButtonActive
              ]}
              onPress={() => setFormData({...formData, frequentie: freq})}
            >
              <Text style={[
                styles.frequencyButtonText,
                formData.frequentie === freq && styles.frequencyButtonTextActive
              ]}>
                {freq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formButtons}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setShowForm(false)}
        >
          <Text style={styles.cancelButtonText}>Annuleren</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleAddHabit}
        >
          <Text style={styles.saveButtonText}>Opslaan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mijn Gewoontes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>{showForm ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {showForm && renderAddForm()}
        {habits.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nog geen gewoontes toegevoegd</Text>
            <Text style={styles.emptySubtext}>Tik op de + knop om te beginnen</Text>
          </View>
        ) : (
          habits.map(renderHabit)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#424242',
  },
  addButton: {
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  addForm: {
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
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#424242',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  frequencyContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 8,
  },
  frequencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#4CAF50',
  },
  frequencyButtonText: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '500',
  },
  frequencyButtonTextActive: {
    color: '#FFFFFF',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
  habitItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  habitFrequency: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  habitStreak: {
    fontSize: 14,
    color: '#757575',
  },
  habitDescription: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
  },
});
