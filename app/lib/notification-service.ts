// /app/lib/notification-service.ts
import { prisma } from '@/lib/prisma';
import NotificationWebSocketServer from './websocket-server';

interface NotificationEvent {
  userId: number;
  type: 'course_assigned' | 'course_completed' | 'course_due';
  content: string;
  relatedId?: number;
}

export class NotificationService {
  private static wss: NotificationWebSocketServer;

  static setWebSocketServer(webSocketServer: NotificationWebSocketServer) {
    this.wss = webSocketServer;
  }

  static async createNotification({
    userId,
    type,
    content,
    relatedId
  }: NotificationEvent) {
    try {
      const notification = await prisma.notification.create({
        data: {
          user_id: userId,
          type,
          content,
          related_id: relatedId,
          created_at: new Date(),
          read: false
        }
      });

      // Send real-time notification if WebSocket is available
      if (this.wss) {
        this.wss.sendNotification(userId, {
          id: notification.id,
          type: notification.type,
          content: notification.content,
          created_at: notification.created_at
        });
      }

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  static async createCourseAssignmentNotification(
    userId: number,
    courseTitle: string,
    assignedBy: string
  ) {
    return this.createNotification({
      userId,
      type: 'course_assigned',
      content: `You have been assigned to the course "${courseTitle}" by ${assignedBy}.`
    });
  }

  static async createCourseCompletionNotification(
    userId: number,
    courseTitle: string
  ) {
    return this.createNotification({
      userId,
      type: 'course_completed',
      content: `Congratulations! You have completed the course "${courseTitle}".`
    });
  }

  static async createCourseDueNotification(
    userId: number,
    courseTitle: string,
    daysLeft: number
  ) {
    return this.createNotification({
      userId,
      type: 'course_due',
      content: `Your course "${courseTitle}" is due in ${daysLeft} days.`
    });
  }
}