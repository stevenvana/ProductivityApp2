import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { taskOperations, initDatabase } from '../database/asyncStorage';

export default function TasksScreen() {
  const [tasks, setTasks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    naam: '',
    beschrijving: '',
    deadline: ''
  });

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      loadTasks();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const tasksData = await taskOperations.getAll();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!formData.naam.trim()) {
      Alert.alert('Fout', 'Voer een naam in voor de taak');
      return;
    }

    try {
      const task = {
        naam: formData.naam.trim(),
        beschrijving: formData.beschrijving.trim(),
        deadline: formData.deadline || null
      };

      await taskOperations.create(task);
      loadTasks();
      setShowForm(false);
      setFormData({
        naam: '',
        beschrijving: '',
        deadline: ''
      });
      Alert.alert('Succes', 'Taak toegevoegd!');
    } catch (error) {
      console.error('Error adding task:', error);
      Alert.alert('Fout', 'Kon taak niet toevoegen');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await taskOperations.updateCompletion(taskId, !currentStatus);
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Fout', 'Kon taak niet bijwerken');
    }
  };

  const handleDeleteTask = async (taskId) => {
    Alert.alert(
      'Taak verwijderen',
      'Weet je zeker dat je deze taak wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          style: 'destructive',
          onPress: async () => {
            try {
              await taskOperations.delete(taskId);
              loadTasks();
            } catch (error) {
              console.error('Error deleting task:', error);
              Alert.alert('Fout', 'Kon taak niet verwijderen');
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

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
  };

  const renderTask = (task) => {
    const overdue = isOverdue(task.deadline);
    
    return (
      <View key={task.id} style={styles.taskItem}>
        <View style={styles.taskInfo}>
          <Text style={[
            styles.taskName,
            task.voltooid && styles.taskCompleted,
            overdue && !task.voltooid && styles.taskOverdue
          ]}>
            {task.naam}
          </Text>
          {task.beschrijving ? (
            <Text style={styles.taskDescription}>{task.beschrijving}</Text>
          ) : null}
          {task.deadline ? (
            <Text style={[
              styles.taskDeadline,
              overdue && !task.voltooid && styles.taskOverdue
            ]}>
              Deadline: {formatDate(task.deadline)}
              {overdue && !task.voltooid && ' (Verlopen)'}
            </Text>
          ) : null}
        </View>
        <View style={styles.taskActions}>
          <TouchableOpacity
            style={[
              styles.statusIndicator,
              { backgroundColor: task.voltooid ? '#4CAF50' : '#2196F3' }
            ]}
            onPress={() => handleToggleTask(task.id, task.voltooid)}
          >
            <Text style={styles.statusText}>
              {task.voltooid ? '✓' : '○'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTask(task.id)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderAddForm = () => (
    <View style={styles.addForm}>
      <Text style={styles.formTitle}>Nieuwe Taak</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Naam van de taak"
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
        placeholder="Deadline (YYYY-MM-DD, optioneel)"
        value={formData.deadline}
        onChangeText={(text) => setFormData({...formData, deadline: text})}
      />
      
      <View style={styles.formButtons}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setShowForm(false)}
        >
          <Text style={styles.cancelButtonText}>Annuleren</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleAddTask}
        >
          <Text style={styles.saveButtonText}>Opslaan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mijn Taken</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.addButtonText}>{showForm ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {showForm && renderAddForm()}
        
        {tasks.length === 0 && !showForm ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Nog geen taken toegevoegd</Text>
            <Text style={styles.emptySubtext}>Tik op de + knop om te beginnen</Text>
          </View>
        ) : (
          tasks.map(renderTask)
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
  taskItem: {
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
  taskInfo: {
    flex: 1,
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#9E9E9E',
  },
  taskOverdue: {
    color: '#F44336',
  },
  taskDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  taskDeadline: {
    fontSize: 12,
    color: '#757575',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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

