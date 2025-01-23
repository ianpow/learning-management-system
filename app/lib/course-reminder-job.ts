// app/lib/course-reminder-job.ts
import { prisma } from '@/lib/prisma';
import { NotificationService } from './notification-service';
import { CronJob } from 'cron';

interface CourseEnrollment {
 user_id: number;
 due_date: Date | null;
 course: {
   title: string;
 };
}

export class CourseReminderJob {
 static initializeJob() {
   return new CronJob('0 0 * * *', async () => {
     try {
       const dateInSevenDays = new Date();
       dateInSevenDays.setDate(dateInSevenDays.getDate() + 7);

       const dueCourses = await prisma.courseEnrollment.findMany({
         where: {
           due_date: {
             lte: dateInSevenDays,
             gt: new Date(),
             not: null
           },
           completion_date: null
         },
         include: {
           course: {
             select: { title: true }
           }
         }
       }) as CourseEnrollment[];

       for (const enrollment of dueCourses) {
         if (enrollment.due_date) {
           const daysLeft = Math.ceil(
             (enrollment.due_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
           );

           await NotificationService.createCourseDueNotification(
             enrollment.user_id,
             enrollment.course.title,
             daysLeft
           );
         }
       }
     } catch (error) {
       console.error('Course reminder job error:', error);
     }
   });
 }
}