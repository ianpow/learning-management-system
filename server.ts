// /server.ts
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import NotificationWebSocketServer from './app/lib/websocket-server';
import { CourseReminderJob } from './app/lib/course-reminder-job';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize WebSocket server
  const wss = new NotificationWebSocketServer(server);

  // Initialize and start the reminder job
  const reminderJob = CourseReminderJob.initializeJob();
  reminderJob.start();

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});