import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Progress Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voortgangsoverzicht</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>72%</Text>
            </View>
            <Text style={styles.progressLabel}>Dagelijkse Voltooiing</Text>
          </View>
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vandaag's Overzicht</Text>
          
          <View style={styles.taskItem}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>Mediteren</Text>
              <Text style={styles.taskDescription}>Voor 10 minuten</Text>
            </View>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.buttonText}>Voltooid</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskItem}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>Lezen</Text>
              <Text style={styles.taskDescription}>50 pagina's van een boek</Text>
            </View>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.buttonText}>Voltooid</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.taskItem}>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>Rapport afmaken</Text>
              <Text style={styles.taskDescription}>Product by quarterly tragos</Text>
            </View>
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.buttonText}>Voltooid</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Goal Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Doel Voortgang</Text>
          
          <View style={styles.goalItem}>
            <View style={styles.goalInfo}>
              <Text style={styles.goalTitle}>Marathon lopen</Text>
              <Text style={styles.goalDeadline}>Deadline: 15 december</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Snelle Acties</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>Nieuwe Gewoonte</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>Nieuwe Taak</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>Nieuw Doel</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  progressContainer: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#4CAF50',
    borderTopColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressLabel: {
    fontSize: 14,
    color: '#757575',
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  taskDescription: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  goalItem: {
    paddingVertical: 12,
  },
  goalInfo: {
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  goalDeadline: {
    fontSize: 14,
    color: '#757575',
    marginTop: 2,
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 4,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

