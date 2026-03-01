import express from 'express';
import cors from 'cors';
import { AppDataSource } from './data-source';
import mastersRouter from './routes/masters';
import applicantsRouter from './routes/applicants';
import allocationRouter from './routes/allocation';
import dashboardRouter from './routes/dashboard';
import authRouter from './routes/auth';
import userRouter from './routes/users';
import { authenticate, requireRole } from './middlewares/authMiddleware';
import { AuthService } from './services/authService';

const app = express();
app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.json());

// Public: auth
app.use('/api/auth', authRouter);

// Protected: Admin only
app.use('/api/users', authenticate, requireRole('ADMIN'), userRouter);

// Protected: masters (Admin write / all roles read)
app.use('/api/masters', authenticate, mastersRouter);

// Protected: applicants (Officer)
app.use('/api/applicants', authenticate, requireRole('ADMIN', 'OFFICER'), applicantsRouter);

// Protected: allocation (Officer)
app.use('/api/allocation', authenticate, requireRole('ADMIN', 'OFFICER'), allocationRouter);

// Protected: dashboard (Management can only view dashboard, plus others can as well probably)
app.use('/api/dashboard', authenticate, dashboardRouter);

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

AppDataSource.initialize()
  .then(async () => {
    await AuthService.seedAdminUser();
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('Data Source initialization error', err);
    process.exit(1);
  });
