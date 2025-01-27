// /app/api/notifications/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Notification, NotificationResponse } from '@/types/notifications';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: parseInt(session.user.id)
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 50
    });
    
    const response: NotificationResponse = {
      notifications: notifications.map(notification => ({
        id: notification.id,
        type: notification.type as 'course_assigned' | 'course_completed' | 'course_due',
        content: notification.content,
        created_at: notification.created_at.toISOString(),
        read: notification.read
      }))
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}