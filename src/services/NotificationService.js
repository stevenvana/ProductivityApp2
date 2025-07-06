import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('habits', {
          name: 'Habit Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4CAF50',
        });
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  async scheduleHabitReminder(habit, time = '09:00') {
    try {
      await this.initialize();

      // Cancel existing notifications for this habit
      await this.cancelHabitNotifications(habit.id);

      const [hours, minutes] = time.split(':').map(Number);

      // Schedule daily notification
      const trigger = {
        hour: hours,
        minute: minutes,
        repeats: true,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎯 Tijd voor je gewoonte!',
          body: `Vergeet niet: ${habit.naam}`,
          data: {
            habitId: habit.id,
            type: 'habit_reminder',
          },
          categoryIdentifier: 'habit_reminder',
        },
        trigger,
      });

      console.log(`Scheduled notification for habit ${habit.naam} at ${time}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling habit reminder:', error);
      return null;
    }
  }

  async cancelHabitNotifications(habitId) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const habitNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.habitId === habitId
      );

      for (const notification of habitNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`Cancelled ${habitNotifications.length} notifications for habit ${habitId}`);
    } catch (error) {
      console.error('Error cancelling habit notifications:', error);
    }
  }

  async scheduleStreakCelebration(habit) {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Streak Milestone!',
          body: `Geweldig! Je hebt ${habit.streak} dagen op rij ${habit.naam} volgehouden!`,
          data: {
            habitId: habit.id,
            type: 'streak_celebration',
            streak: habit.streak,
          },
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling streak celebration:', error);
      return null;
    }
  }

  async scheduleLevelUpNotification(newLevel) {
    try {
      await this.initialize();

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Level Up!',
          body: `Gefeliciteerd! Je hebt level ${newLevel} bereikt!`,
          data: {
            type: 'level_up',
            level: newLevel,
          },
        },
        trigger: null, // Show immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling level up notification:', error);
      return null;
    }
  }

  async scheduleWeeklyGoalReminder() {
    try {
      await this.initialize();

      // Schedule for Sunday evening (day 0, hour 20)
      const trigger = {
        weekday: 1, // Sunday
        hour: 20,
        minute: 0,
        repeats: true,
      };

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Nieuwe Week Setup',
          body: 'Tijd om je gewoontes en taken voor de nieuwe week in te stellen!',
          data: {
            type: 'weekly_setup_reminder',
          },
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling weekly goal reminder:', error);
      return null;
    }
  }

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }

  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Add notification action categories
  async setupNotificationCategories() {
    try {
      await Notifications.setNotificationCategoryAsync('habit_reminder', [
        {
          identifier: 'mark_complete',
          buttonTitle: 'Voltooid ✓',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: 'snooze',
          buttonTitle: 'Later herinneren',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }
}

export default new NotificationService();

