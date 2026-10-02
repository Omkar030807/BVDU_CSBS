import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type CookieOptions, type Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { AdmissionController, BedController } from './controllers/AdmissionController.js';
import { AppointmentController } from './controllers/AppointmentController.js';
import { AuthController } from './controllers/AuthController.js';
import { BillingController } from './controllers/BillingController.js';
import { DoctorController } from './controllers/DoctorController.js';
import { HealthController } from './controllers/HealthController.js';
import { MedicineController } from './controllers/MedicineController.js';
import { NotificationController } from './controllers/NotificationController.js';
import { PatientController } from './controllers/PatientController.js';
import { PrescriptionController } from './controllers/PrescriptionController.js';
import { StatisticsController } from './controllers/StatisticsController.js';
import { UserController } from './controllers/UserController.js';
import { environment } from './config/environment.js';
import { Database } from './config/database.js';
import { createAuthenticationMiddleware } from './middleware/auth.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import {
  PostgreSQLAdmissionRepository,
  type IAdmissionRepository,
} from './repositories/AdmissionRepository.js';
import {
  PostgreSQLAppointmentRepository,
  type IAppointmentRepository,
} from './repositories/AppointmentRepository.js';
import {
  PostgreSQLBillingRepository,
  type IBillingRepository,
} from './repositories/BillingRepository.js';
import {
  PostgreSQLDoctorRepository,
  type IDoctorRepository,
} from './repositories/DoctorRepository.js';
import {
  PostgreSQLHealthRepository,
  type IHealthRepository,
} from './repositories/HealthRepository.js';
import {
  PostgreSQLMedicineRepository,
  type IMedicineRepository,
} from './repositories/MedicineRepository.js';
import {
  PostgreSQLNotificationRepository,
  type INotificationRepository,
} from './repositories/NotificationRepository.js';
import {
  PostgreSQLPatientRepository,
  type IPatientRepository,
} from './repositories/PatientRepository.js';
import {
  PostgreSQLPrescriptionRepository,
  type IPrescriptionRepository,
} from './repositories/PrescriptionRepository.js';
import {
  PostgreSQLStatisticsRepository,
  type IStatisticsRepository,
} from './repositories/StatisticsRepository.js';
import {
  PostgreSQLUserRepository,
  type IUserRepository,
} from './repositories/UserRepository.js';
import { createApiRouter } from './routes/index.js';
import { AdmissionService } from './services/AdmissionService.js';
import { AppointmentService } from './services/AppointmentService.js';
import { AuthService } from './services/AuthService.js';
import { BillingService } from './services/BillingService.js';
import { DoctorService } from './services/DoctorService.js';
import { HealthService } from './services/HealthService.js';
import { MedicineService } from './services/MedicineService.js';
import { NotificationService } from './services/NotificationService.js';
import { PatientService } from './services/PatientService.js';
import { PrescriptionService } from './services/PrescriptionService.js';
import { StatisticsService } from './services/StatisticsService.js';
import {
  BcryptPasswordHasher,
  type IPasswordHasher,
} from './services/PasswordService.js';
import { JwtTokenService, type ITokenService } from './services/TokenService.js';
import { UserService } from './services/UserService.js';

export interface AppDependencies {
  healthRepository?: IHealthRepository;
  billingRepository?: IBillingRepository;
  userRepository?: IUserRepository;
  patientRepository?: IPatientRepository;
  doctorRepository?: IDoctorRepository;
  appointmentRepository?: IAppointmentRepository;
  admissionRepository?: IAdmissionRepository;
  medicineRepository?: IMedicineRepository;
  notificationRepository?: INotificationRepository;
  prescriptionRepository?: IPrescriptionRepository;
  statisticsRepository?: IStatisticsRepository;
  passwordHasher?: IPasswordHasher;
  tokenService?: ITokenService;
}

export const createApp = (dependencies: AppDependencies = {}): Express => {
  const app = express();
  const allowedOrigins = environment.CORS_ORIGIN.split(',').map((origin) => origin.trim());

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: allowedOrigins, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (environment.NODE_ENV !== 'test') app.use(morgan(environment.LOG_LEVEL));

  const database = Database.getInstance();
  const healthRepository =
    dependencies.healthRepository ?? new PostgreSQLHealthRepository(database.getPool());
  const billingRepository =
    dependencies.billingRepository ?? new PostgreSQLBillingRepository(database.getPool());
  const userRepository =
    dependencies.userRepository ?? new PostgreSQLUserRepository(database.getPool());
  const patientRepository =
    dependencies.patientRepository ?? new PostgreSQLPatientRepository(database.getPool());
  const doctorRepository =
    dependencies.doctorRepository ?? new PostgreSQLDoctorRepository(database.getPool());
  const appointmentRepository =
    dependencies.appointmentRepository ?? new PostgreSQLAppointmentRepository(database.getPool());
  const admissionRepository =
    dependencies.admissionRepository ?? new PostgreSQLAdmissionRepository(database.getPool());
  const medicineRepository =
    dependencies.medicineRepository ?? new PostgreSQLMedicineRepository(database.getPool());
  const notificationRepository =
    dependencies.notificationRepository ?? new PostgreSQLNotificationRepository(database.getPool());
  const prescriptionRepository =
    dependencies.prescriptionRepository ?? new PostgreSQLPrescriptionRepository(database.getPool());
  const statisticsRepository =
    dependencies.statisticsRepository ?? new PostgreSQLStatisticsRepository(database.getPool());
  const passwordHasher = dependencies.passwordHasher ?? new BcryptPasswordHasher(12);
  const tokenService =
    dependencies.tokenService ?? new JwtTokenService(environment.JWT_SECRET, environment.SESSION_HOURS);

  const healthController = new HealthController(new HealthService(healthRepository));
  const billingController = new BillingController(new BillingService(billingRepository));
  const authService = new AuthService(userRepository, passwordHasher, tokenService);
  const userController = new UserController(new UserService(userRepository));
  const patientController = new PatientController(new PatientService(patientRepository));
  const doctorController = new DoctorController(new DoctorService(doctorRepository));
  const appointmentController = new AppointmentController(new AppointmentService(appointmentRepository));
  const admissionService = new AdmissionService(admissionRepository);
  const admissionController = new AdmissionController(admissionService);
  const bedController = new BedController(admissionService);
  const medicineController = new MedicineController(new MedicineService(medicineRepository));
  const notificationController = new NotificationController(new NotificationService(notificationRepository));
  const prescriptionController = new PrescriptionController(new PrescriptionService(prescriptionRepository));
  const statisticsController = new StatisticsController(new StatisticsService(statisticsRepository));

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: environment.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: environment.SESSION_HOURS * 60 * 60 * 1_000,
  };
  const authController = new AuthController(
    authService,
    environment.COOKIE_NAME,
    cookieOptions,
  );
  const authenticate = createAuthenticationMiddleware(
    authService,
    tokenService,
    environment.COOKIE_NAME,
  );

  app.use(
    '/api',
    createApiRouter({
      healthController,
      authController,
      billingController,
      userController,
      patientController,
      doctorController,
      appointmentController,
      admissionController,
      bedController,
      medicineController,
      notificationController,
      prescriptionController,
      statisticsController,
      authenticate,
    }),
  );
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
