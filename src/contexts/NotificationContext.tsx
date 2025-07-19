import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  showToast: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove notification after duration
    const duration = notification.duration || 5000;
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, duration);
    }

    return newNotification.id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const showToast = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const toastOptions = {
      duration: notification.duration || 5000,
      action: notification.action ? {
        label: notification.action.label,
        onClick: notification.action.onClick,
      } : undefined,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      case 'error':
        toast.error(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      case 'warning':
        toast.warning(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
      case 'info':
      default:
        toast.info(notification.title, {
          description: notification.message,
          ...toastOptions,
        });
        break;
    }

    // Also add to notifications list
    addNotification(notification);
  };

  const value: NotificationContextType = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    showToast,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Helper hooks for common notification patterns
export const useGoogleIntegrationNotifications = () => {
  const { showToast } = useNotifications();

  return {
    notifyEmailSent: (to: string[], subject: string) => {
      showToast({
        type: 'success',
        title: 'Email Sent Successfully',
        message: `Email "${subject}" sent to ${to.join(', ')}`,
        duration: 4000,
      });
    },

    notifyMeetingCreated: (title: string, meetLink: string) => {
      showToast({
        type: 'success',
        title: 'Meeting Created',
        message: `"${title}" has been scheduled`,
        action: {
          label: 'Join Meeting',
          onClick: () => window.open(meetLink, '_blank'),
        },
        duration: 6000,
      });
    },

    notifyEventCreated: (title: string, startTime: string) => {
      showToast({
        type: 'success',
        title: 'Calendar Event Created',
        message: `"${title}" scheduled for ${new Date(startTime).toLocaleString()}`,
        duration: 4000,
      });
    },

    notifyAuthenticationRequired: () => {
      showToast({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please connect your Google account to use this feature',
        duration: 5000,
      });
    },

    notifyIntegrationError: (service: string, error: string) => {
      showToast({
        type: 'error',
        title: `${service} Integration Error`,
        message: error,
        duration: 8000,
      });
    },

    notifyTokenRefreshed: () => {
      showToast({
        type: 'info',
        title: 'Authentication Refreshed',
        message: 'Your Google account connection has been renewed',
        duration: 3000,
      });
    },

    notifySearchCompleted: (resultsCount: number) => {
      showToast({
        type: 'info',
        title: 'Search Completed',
        message: `Found ${resultsCount} results across your Google services`,
        duration: 3000,
      });
    },

    notifyActionProcessing: (action: string) => {
      showToast({
        type: 'info',
        title: 'Processing Request',
        message: `${action} is being processed...`,
        duration: 2000,
      });
    },
  };
};
