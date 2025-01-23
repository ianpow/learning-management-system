// /app/lib/course-reminder-job.ts
import { prisma } from '@/lib/prisma';
import { NotificationService } from './notification-service';
import { CronJob } from 'cron';

export class CourseReminderJob {
  static initializeJob() {
    // Run every day at midnight
    return new CronJob('0 0 * * *', async () => {
      try {
        // Find courses due in the next 7 days
        const dateInSevenDays = new Date();
        dateInSevenDays.setDate(dateInSevenDays.getDate() + 7);

        const dueCourses = await prisma.courseEnrollment.findMany({
          where: {
            due_date: {
              lte: dateInSevenDays,
              gt: new Date()
            },
            completion_date: null
          },
          include: {
            course: {
              select: { title: true }
            }
          }
        });

        // Send notifications for each due course
        for (const enrollment of dueCourses) {
          const daysLeft = Math.ceil(
            (enrollment.due_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );

          await NotificationService.createCourseDueNotification(
            enrollment.user_id,
            enrollment.course.title,
            daysLeft
          );
        }
      } catch (error) {
        console.error('Course reminder job error:', error);
      }
    });
  }
}