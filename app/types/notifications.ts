export interface Notification {
    id: number;
    type: 'course_assigned' | 'course_completed' | 'course_due';
    content: string;
    created_at: string;
    read: boolean;
  }
  
  export interface NotificationResponse {
    notifications: Notification[];
  }