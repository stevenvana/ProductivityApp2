import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { goalOperations, initDatabase } from '../database/asyncStorage';

export default function GoalsScreen() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    naam: '',
    beschrijving: '',
    deadline: '',
    commitment_period: 'week' // week or month
  });

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      loadGoals();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  const loadGoals = async () => {
    try {
      const goalsData = await goalOperations.getAll();
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddGoal = async () => {
    if (!formData.naam.trim()) {
      Alert.alert('Fout', 'Voer een naam in voor het doel');
      return;
    }

    if (!formData.deadline.trim()) {
      Alert.alert('Fout', 'Voer een deadline in voor het doel');
      return;
    }

    // Show warning about non-changeable deadline
    Alert.alert(
      'Belangrijk',
      `Let op: De deadline van dit doel kan NIET meer worden gewijzigd nadat het is opgeslagen. Dit doel wordt vastgezet voor een ${formData.commitment_period === 'week' ? 'week' : 'maand'}. Weet je zeker dat je door wilt gaan?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Ja, opslaan', 
          onPress: async () => {
            try {
              const goal = {
                naam: formData.naam.trim(),
                beschrijving: formData.beschrijving.trim(),
                deadline: formData.deadline,
                deadline_locked: true, // Always lock deadlines
                commitment_period: formData.commitment_period,
                voortgang: 0
              };

              await goalOperations.create(goal);
              loadGoals();
              setShowForm(false);
              setFormData({
                naam: '',
                beschrijving: '',
                deadline: '',
                commitment_period: 'week'
              });
              Alert.alert('Succes', 'Doel toegevoegd! De deadline is nu vastgezet en kan niet meer worden gewijzigd.');
            } catch (error) {
              console.error('Error adding goal:', error);
              Alert.alert('Fout', 'Kon doel niet toevoegen');
            }
          }
        }
      ]
    );
  };

  const handleUpdateProgress = async (goalId, currentProgress) => {
    Alert.alert(
      'Voortgang bijwerken',
      'Voer de nieuwe voortgang in (0-100%):',
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Bijwerken',
          onPress: () => {
            // In a real app, you'd show a number input here
            // For now, we'll increment by 10%
            const newProgress = Math.min(currentProgress + 10, 100);
            updateGoalProgress(goalId, newProgress);
          }
        }
      ]
    );
  };

  const updateGoalProgress = async (goalId, newProgress) => {
    try {
      await goalOperations.updateProgress(goalId, newProgress);
      loadGoals();
      if (newProgress >= 100) {
        Alert.alert('Gefeliciteerd!', 'Je hebt dit doel behaald! 🎉');
      }
    } catch (error) {
      console.error('Error updating goal progress:', error);
      Alert.alert('Fout', 'Kon voortgang niet bijwerken');
    }
  };

  const handleDeleteGoal = async (goalId) => {
    Alert.alert(
      'Doel verwijderen',
      'Weet je zeker dat je dit doel wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          style: 'destructive',
          onPress: async () => {
            try {
              await goalOperations.delete(goalId);
              loadGoals();
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Fout', 'Kon doel niet verwijderen');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL');
  };

  const isNearDeadline = (deadline) => {
    if (!deadline) return false;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
  };

  const renderGoal = (goal) => {
    const nearDeadline = isNearDeadline(goal.deadline);
    const overdue = isOverdue(goal.deadline);
    
    return (
      <View key={goal.id} style={styles.goalItem}>
        <View style={styles.goalInfo}>
          <View style={styles.goalHeader}>
            <Text style={[
              styles.goalName,
              goal.voltooid && styles.goalCompleted,
              overdue && !goal.voltooid && styles.goalOverdue
            ]}>
              {goal.naam}
            </Text>
            {(nearDeadline || overdue) && !goal.voltooid && (
              <Text style={styles.warningIcon}>⚠️</Text>
            )}
          </View>
          
          {goal.beschrijving ? (
            <Text style={styles.goalDescription}>{goal.beschrijving}</Text>
          ) : null}
          
          <Text style={[
            styles.goalDeadline,
            overdue && !goal.voltooid && styles.goalOverdue,
            nearDeadline && !goal.voltooid && styles.goalNearDeadline
          ]}>
            🔒 Deadline: {formatDate(goal.deadline)} (Vastgezet)
            {overdue && !goal.voltooid && ' - VERLOPEN'}
            {nearDeadline && !goal.voltooid && !overdue && ' - BIJNA VERLOPEN'}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${goal.voortgang || 0}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{goal.voortgang || 0}%</Text>
          </View>
          
          {goal.commitment_period && (
            <Text style={styles.commitmentText}>
              Vastgezet voor: {goal.commitment_period === 'week' ? 'Een week' : 'Een maand'}
            </Text>
          )}
        </View>
        
        <View style={styles.goalActions}>
          <TouchableOpacity
            style={styles.progressButton}
            onPress={() => handleUpdateProgress(goal.id, goal.voortgang || 0)}
          >
            <Text style={styles.progressButtonText}>+10%</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteGoal(goal.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAddForm = () => (
    <View style={styles.addForm}>
      <Text style={styles.formTitle}>Nieuw Doel</Text>
      <Text style={styles.warningText}>
        ⚠️ Let op: De deadline kan NIET meer worden gewijzigd nadat het doel is opgeslagen!
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Naam van het doel"
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
      
      <TextInput
        style={styles.input}
        placeholder="Deadline (YYYY-MM-DD)"
        value={formData.deadline}
        onChangeText={(text) => setFormData({...formData, deadline: text})}
      />
      
      <View style={styles.commitmentContainer}>
        <Text style={styles.label}>Vastzetperiode:</Text>
        <View style={styles.commitmentButtons}>
          {['week', 'month'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.commitmentButton,
                formData.commitment_period === period && styles.commitmentButtonActive
              ]}
              onPress={() => setFormData({...formData, commitment_period: period})}
            >
              <Text style={[
                styles.commitmentButtonText,
                formData.commitment_period === period && styles.commitmentButtonTextActive
              ]}>
                {period === 'week' ? 'Een week' : 'Een maand'}
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
          onPress={handleAddGoal}
        >
          <Text style={styles.saveButtonText}>Opslaan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mijn Doelen</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>{showForm ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {showForm && renderAddForm()}
        
        {goals.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nog geen doelen toegevoegd</Text>
            <Text style={styles.emptySubtext}>Tik op de + knop om te beginnen</Text>
          </View>
        ) : (
          goals.map(renderGoal)
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
    borderBottomWidth: '#EEEEEE',
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
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
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
  commitmentContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 8,
  },
  commitmentButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commitmentButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  commitmentButtonActive: {
    backgroundColor: '#4CAF50',
  },
  commitmentButtonText: {
    fontSize: 12,
    color: '#424242',
    fontWeight: '500',
  },
  commitmentButtonTextActive: {
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
  goalItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goalInfo: {
    flex: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    flex: 1,
  },
  goalCompleted: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  goalOverdue: {
    color: '#F44336',
  },
  goalNearDeadline: {
    color: '#FF9800',
  },
  warningIcon: {
    fontSize: 20,
  },
  goalDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  goalDeadline: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 12,
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    minWidth: 35,
    textAlign: 'right',
  },
  commitmentText: {
    fontSize: 12,
    color: '#9E9E9E',
    fontStyle: 'italic',
  },
  goalActions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  progressButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  progressButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#F44336',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
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

