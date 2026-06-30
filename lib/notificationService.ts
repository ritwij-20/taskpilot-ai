import { DataService } from './dataService';

export interface NotificationSettings {
  enabled: boolean;
  aiSmartReminders: boolean;
  quietHours: { start: string; end: string };
  dailyBriefingTime: string;
  reminderIntensity: 'low' | 'medium' | 'high';
}

export const defaultNotificationSettings: NotificationSettings = {
  enabled: true,
  aiSmartReminders: true,
  quietHours: { start: '22:00', end: '07:00' },
  dailyBriefingTime: '08:00',
  reminderIntensity: 'medium',
};

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'habit' | 'goal' | 'briefing' | 'alert';
  timestamp: string;
  read: boolean;
}

export const NotificationService = {
  // Request notification permission
  async requestPermission() {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  },

  // Trigger a native browser notification
  async triggerNativeNotification(title: string, message: string) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  },

  // Save notification to Firestore/LocalStorage
  async saveNotification(notification: AppNotification, userId?: string, isGuest: boolean = false) {
    await DataService.saveItem('notifications', notification.id, notification, userId, isGuest);
  },

  // Get notifications
  async getNotifications(userId?: string, isGuest: boolean = false): Promise<AppNotification[]> {
    return await DataService.getItems('notifications', userId, isGuest) as AppNotification[];
  },

  // Calculate reminder schedule (This will eventually use Gemini API)
  async calculateReminderSchedule(task: any) {
    // Basic implementation for now
    return [new Date(new Date(task.dueDate).getTime() - 3600000).toISOString()];
  }
};
