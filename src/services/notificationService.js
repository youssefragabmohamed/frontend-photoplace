import { io } from 'socket.io-client';

class NotificationService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket) return;

    this.socket = io(process.env.REACT_APP_API_URL, {
      auth: {
        token: localStorage.getItem('authToken')
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification service');
      const userId = localStorage.getItem('userId');
      if (userId) {
        this.socket.emit('authenticate', userId);
      }
    });

    this.socket.on('notification', (notification) => {
      this.notifyListeners('notification', notification);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  async getNotifications(page = 1, limit = 20) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch notifications');

      return await response.json();
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  async markAsRead(notificationIds) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notificationIds })
      });

      if (!response.ok) throw new Error('Failed to mark notifications as read');

      return await response.json();
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to mark all notifications as read');

      return await response.json();
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId) {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      return await response.json();
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }
}

export default new NotificationService(); 