import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { habitOperations } from '../database/asyncStorage';
import NotificationService from '../services/NotificationService';

export default function NotificationSettingsScreen() {
  const [habits, setHabits] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({});

  useEffect(() => {
    loadHabits();
    loadNotificationSettings();
  }, []);

  const loadHabits = async () => {
    try {
      const habitsData = await habitOperations.getAll();
      setHabits(habitsData);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const loadNotificationSettings = async () => {
    try {
      // Load saved notification settings from AsyncStorage
      // For now, default all to enabled at 9:00 AM
      const settings = {};
      habits.forEach(habit => {
        settings[habit.id] = {
          enabled: true,
          time: '09:00'
        };
      });
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const toggleNotification = async (habitId, enabled) => {
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const newSettings = {
        ...notificationSettings,
        [habitId]: {
          ...notificationSettings[habitId],
          enabled
        }
      };
      setNotificationSettings(newSettings);

      if (enabled) {
        const time = newSettings[habitId]?.time || '09:00';
        await NotificationService.scheduleHabitReminder(habit, time);
        Alert.alert('Notificatie ingeschakeld', `Je krijgt dagelijks om ${time} een herinnering voor "${habit.naam}"`);
      } else {
        await NotificationService.cancelHabitNotifications(habitId);
        Alert.alert('Notificatie uitgeschakeld', `Herinneringen voor "${habit.naam}" zijn uitgeschakeld`);
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
      Alert.alert('Fout', 'Kon notificatie-instelling niet wijzigen');
    }
  };

  const changeNotificationTime = (habitId, time) => {
    Alert.prompt(
      'Notificatie tijd',
      'Voer de gewenste tijd in (HH:MM)',
      [
        {
          text: 'Annuleren',
          style: 'cancel'
        },
        {
          text: 'Opslaan',
          onPress: async (inputTime) => {
            if (inputTime && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(inputTime)) {
              const habit = habits.find(h => h.id === habitId);
              if (habit) {
                const newSettings = {
                  ...notificationSettings,
                  [habitId]: {
                    ...notificationSettings[habitId],
                    time: inputTime
                  }
                };
                setNotificationSettings(newSettings);
                
                if (newSettings[habitId].enabled) {
                  await NotificationService.scheduleHabitReminder(habit, inputTime);
                  Alert.alert('Tijd bijgewerkt', `Notificatie voor "${habit.naam}" is ingesteld op ${inputTime}`);
                }
              }
            } else {
              Alert.alert('Ongeldige tijd', 'Voer een geldige tijd in (bijv. 09:00)');
            }
          }
        }
      ],
      'plain-text',
      time
    );
  };

  const renderHabitNotificationSetting = (habit) => {
    const setting = notificationSettings[habit.id] || { enabled: false, time: '09:00' };
    
    return (
      <View key={habit.id} style={styles.habitItem}>
        <View style={styles.habitInfo}>
          <Text style={styles.habitName}>{habit.naam}</Text>
          <Text style={styles.habitDescription}>
            {setting.enabled ? `Herinnering om ${setting.time}` : 'Geen herinneringen'}
          </Text>
        </View>
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.timeButton, !setting.enabled && styles.timeButtonDisabled]}
            onPress={() => setting.enabled && changeNotificationTime(habit.id, setting.time)}
            disabled={!setting.enabled}
          >
            <Text style={[styles.timeButtonText, !setting.enabled && styles.timeButtonTextDisabled]}>
              {setting.time}
            </Text>
          </TouchableOpacity>
          <Switch
            value={setting.enabled}
            onValueChange={(enabled) => toggleNotification(habit.id, enabled)}
            trackColor={{ false: '#E0E0E0', true: '#4CAF50' }}
            thumbColor={setting.enabled ? '#FFFFFF' : '#F4F3F4'}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notificatie Instellingen</Text>
          <Text style={styles.headerSubtitle}>
            Stel herinneringen in voor je dagelijkse gewoontes
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gewoonte Herinneringen</Text>
          {habits.length === 0 ? (
            <Text style={styles.emptyText}>
              Geen gewoontes gevonden. Voeg eerst gewoontes toe via het wekelijkse setup scherm.
            </Text>
          ) : (
            habits.map(renderHabitNotificationSetting)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Algemene Instellingen</Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              Alert.alert(
                'Alle notificaties uitschakelen',
                'Weet je zeker dat je alle notificaties wilt uitschakelen?',
                [
                  { text: 'Annuleren', style: 'cancel' },
                  {
                    text: 'Uitschakelen',
                    style: 'destructive',
                    onPress: async () => {
                      await NotificationService.cancelAllNotifications();
                      const newSettings = {};
                      habits.forEach(habit => {
                        newSettings[habit.id] = { enabled: false, time: '09:00' };
                      });
                      setNotificationSettings(newSettings);
                      Alert.alert('Voltooid', 'Alle notificaties zijn uitgeschakeld');
                    }
                  }
                ]
              );
            }}
          >
            <Text style={styles.actionButtonText}>Alle Notificaties Uitschakelen</Text>
          </TouchableOpacity>
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
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
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
    shadowOffset: { width: 0, height: 2 },
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
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F8F8F8',
    marginBottom: 8,
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
    fontSize: 12,
    color: '#757575',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 12,
  },
  timeButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  timeButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  timeButtonTextDisabled: {
    color: '#9E9E9E',
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  actionButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

