import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { penaltyOperations, habitOperations, taskOperations, goalOperations, initDatabase } from '../database/asyncStorage';

export default function StatsScreen() {
  const [penalties, setPenalties] = useState([]);
  const [totalPenaltyPoints, setTotalPenaltyPoints] = useState(0);
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [penaltyFormData, setPenaltyFormData] = useState({
    beschrijving: '',
    punten: '1'
  });
  const [stats, setStats] = useState({
    habits: { total: 0, completed: 0 },
    tasks: { total: 0, completed: 0 },
    goals: { total: 0, completed: 0 }
  });

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      loadPenalties();
      loadStats();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  };

  const loadPenalties = async () => {
    try {
      const penaltiesData = await penaltyOperations.getAll();
      setPenalties(penaltiesData);
      
      // Calculate total penalty points
      const total = penaltiesData.reduce((sum, penalty) => sum + (penalty.punten || 0), 0);
      setTotalPenaltyPoints(total);
    } catch (error) {
      console.error('Error loading penalties:', error);
    }
  };

  const loadStats = async () => {
    try {
      const [habitsData, tasksData, goalsData] = await Promise.all([
        habitOperations.getAll(),
        taskOperations.getAll(),
        goalOperations.getAll()
      ]);

      const habitsCompleted = habitsData.filter(h => {
        const today = new Date().toISOString().split('T')[0];
        return h.laatst_voltooid === today;
      }).length;

      const tasksCompleted = tasksData.filter(t => t.voltooid).length;
      const goalsCompleted = goalsData.filter(g => g.voltooid).length;

      setStats({
        habits: { total: habitsData.length, completed: habitsCompleted },
        tasks: { total: tasksData.length, completed: tasksCompleted },
        goals: { total: goalsData.length, completed: goalsCompleted }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddPenalty = async () => {
    if (!penaltyFormData.beschrijving.trim()) {
      Alert.alert('Fout', 'Voer een beschrijving in voor de strafpunten');
      return;
    }

    const punten = parseInt(penaltyFormData.punten);
    if (isNaN(punten) || punten < 1 || punten > 10) {
      Alert.alert('Fout', 'Voer een geldig aantal punten in (1-10)');
      return;
    }

    try {
      const penalty = {
        beschrijving: penaltyFormData.beschrijving.trim(),
        punten: punten,
        datum: new Date().toISOString().split('T')[0]
      };

      await penaltyOperations.create(penalty);
      loadPenalties();
      setShowPenaltyForm(false);
      setPenaltyFormData({
        beschrijving: '',
        punten: '1'
      });
      Alert.alert('Toegevoegd', `${punten} strafpunt${punten > 1 ? 'en' : ''} toegevoegd voor: ${penalty.beschrijving}`);
    } catch (error) {
      console.error('Error adding penalty:', error);
      Alert.alert('Fout', 'Kon strafpunten niet toevoegen');
    }
  };

  const handleDeletePenalty = async (penaltyId) => {
    Alert.alert(
      'Strafpunten verwijderen',
      'Weet je zeker dat je deze strafpunten wilt verwijderen?',
      [
        { text: 'Annuleren', style: 'cancel' },
        { 
          text: 'Verwijderen', 
          style: 'destructive',
          onPress: async () => {
            try {
              await penaltyOperations.delete(penaltyId);
              loadPenalties();
            } catch (error) {
              console.error('Error deleting penalty:', error);
              Alert.alert('Fout', 'Kon strafpunten niet verwijderen');
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

  const getPenaltyLevel = (points) => {
    if (points === 0) return { level: 'Perfect', color: '#4CAF50', emoji: '😇' };
    if (points <= 5) return { level: 'Goed', color: '#8BC34A', emoji: '😊' };
    if (points <= 10) return { level: 'Oké', color: '#FFC107', emoji: '😐' };
    if (points <= 20) return { level: 'Slecht', color: '#FF9800', emoji: '😟' };
    return { level: 'Zeer slecht', color: '#F44336', emoji: '😞' };
  };

  const renderPenalty = (penalty) => (
    <View key={penalty.id} style={styles.penaltyItem}>
      <View style={styles.penaltyInfo}>
        <Text style={styles.penaltyDescription}>{penalty.beschrijving}</Text>
        <Text style={styles.penaltyDate}>{formatDate(penalty.datum)}</Text>
      </View>
      <View style={styles.penaltyActions}>
        <Text style={styles.penaltyPoints}>-{penalty.punten}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePenalty(penalty.id)}
        >
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPenaltyForm = () => (
    <View style={styles.penaltyForm}>
      <Text style={styles.formTitle}>Strafpunten Toevoegen</Text>
      <Text style={styles.formSubtitle}>
        Voor dingen die je niet zou moeten doen
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Wat heb je gedaan? (bijv. te laat naar bed, junk food gegeten)"
        value={penaltyFormData.beschrijving}
        onChangeText={(text) => setPenaltyFormData({...penaltyFormData, beschrijving: text})}
        multiline
        numberOfLines={2}
      />
      
      <View style={styles.pointsContainer}>
        <Text style={styles.label}>Aantal strafpunten (1-10):</Text>
        <View style={styles.pointsButtons}>
          {[1, 2, 3, 5, 10].map((points) => (
            <TouchableOpacity
              key={points}
              style={[
                styles.pointsButton,
                parseInt(penaltyFormData.punten) === points && styles.pointsButtonActive
              ]}
              onPress={() => setPenaltyFormData({...penaltyFormData, punten: points.toString()})}
            >
              <Text style={[
                styles.pointsButtonText,
                parseInt(penaltyFormData.punten) === points && styles.pointsButtonTextActive
              ]}>
                {points}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.formButtons}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => setShowPenaltyForm(false)}
        >
          <Text style={styles.cancelButtonText}>Annuleren</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleAddPenalty}
        >
          <Text style={styles.saveButtonText}>Toevoegen</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const penaltyLevel = getPenaltyLevel(totalPenaltyPoints);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistieken</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowPenaltyForm(!showPenaltyForm)}
        >
          <Text style={styles.addButtonText}>{showPenaltyForm ? '×' : '+'}</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Penalty Points Section */}
        <View style={styles.penaltySection}>
          <Text style={styles.sectionTitle}>Strafpunten Systeem</Text>
          <View style={[styles.penaltyCard, { borderLeftColor: penaltyLevel.color }]}>
            <View style={styles.penaltyHeader}>
              <Text style={styles.penaltyEmoji}>{penaltyLevel.emoji}</Text>
              <View style={styles.penaltyStats}>
                <Text style={styles.penaltyTotal}>{totalPenaltyPoints}</Text>
                <Text style={styles.penaltyLabel}>Totaal strafpunten</Text>
              </View>
              <Text style={[styles.penaltyLevel, { color: penaltyLevel.color }]}>
                {penaltyLevel.level}
              </Text>
            </View>
          </View>
        </View>

        {showPenaltyForm && renderPenaltyForm()}

        {/* Recent Penalties */}
        {penalties.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recente Strafpunten</Text>
            {penalties.slice(0, 5).map(renderPenalty)}
          </View>
        )}

        {/* Performance Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prestatie Overzicht</Text>
          
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Gewoontes (Vandaag)</Text>
            <Text style={styles.statValue}>
              {stats.habits.completed} / {stats.habits.total}
            </Text>
            <View style={styles.statBar}>
              <View 
                style={[
                  styles.statBarFill, 
                  { 
                    width: stats.habits.total > 0 ? `${(stats.habits.completed / stats.habits.total) * 100}%` : '0%',
                    backgroundColor: '#4CAF50'
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Taken</Text>
            <Text style={styles.statValue}>
              {stats.tasks.completed} / {stats.tasks.total}
            </Text>
            <View style={styles.statBar}>
              <View 
                style={[
                  styles.statBarFill, 
                  { 
                    width: stats.tasks.total > 0 ? `${(stats.tasks.completed / stats.tasks.total) * 100}%` : '0%',
                    backgroundColor: '#2196F3'
                  }
                ]} 
              />
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Doelen</Text>
            <Text style={styles.statValue}>
              {stats.goals.completed} / {stats.goals.total}
            </Text>
            <View style={styles.statBar}>
              <View 
                style={[
                  styles.statBarFill, 
                  { 
                    width: stats.goals.total > 0 ? `${(stats.goals.completed / stats.goals.total) * 100}%` : '0%',
                    backgroundColor: '#9C27B0'
                  }
                ]} 
              />
            </View>
          </View>
        </View>
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
    backgroundColor: '#F44336',
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
  section: {
    marginBottom: 24,
  },
  penaltySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 12,
  },
  penaltyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  penaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  penaltyEmoji: {
    fontSize: 32,
  },
  penaltyStats: {
    alignItems: 'center',
    flex: 1,
  },
  penaltyTotal: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#424242',
  },
  penaltyLabel: {
    fontSize: 14,
    color: '#757575',
  },
  penaltyLevel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  penaltyForm: {
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
    marginBottom: 4,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#757575',
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
    textAlignVertical: 'top',
  },
  pointsContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 8,
  },
  pointsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pointsButton: {
    backgroundColor: '#F5F5F5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsButtonActive: {
    backgroundColor: '#F44336',
  },
  pointsButtonText: {
    fontSize: 16,
    color: '#424242',
    fontWeight: '600',
  },
  pointsButtonTextActive: {
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
    backgroundColor: '#F44336',
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
  penaltyItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  penaltyInfo: {
    flex: 1,
  },
  penaltyDescription: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 2,
  },
  penaltyDate: {
    fontSize: 12,
    color: '#757575',
  },
  penaltyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  penaltyPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
    marginRight: 8,
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
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statTitle: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 8,
  },
  statBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
  },
});

