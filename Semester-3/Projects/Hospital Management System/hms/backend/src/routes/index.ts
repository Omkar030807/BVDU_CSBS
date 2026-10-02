import { Router, type RequestHandler } from 'express';
import type { AdmissionController, BedController } from '../controllers/AdmissionController.js';
import type { AppointmentController } from '../controllers/AppointmentController.js';
import type { AuthController } from '../controllers/AuthController.js';
import type { BillingController } from '../controllers/BillingController.js';
import type { DoctorController } from '../controllers/DoctorController.js';
import type { HealthController } from '../controllers/HealthController.js';
import type { MedicineController } from '../controllers/MedicineController.js';
import type { NotificationController } from '../controllers/NotificationController.js';
import type { PatientController } from '../controllers/PatientController.js';
import type { PrescriptionController } from '../controllers/PrescriptionController.js';
import type { StatisticsController } from '../controllers/StatisticsController.js';
import type { UserController } from '../controllers/UserController.js';
import { createAdmissionRouter, createBedRouter } from './admissionRoutes.js';
import { createAppointmentRouter } from './appointmentRoutes.js';
import { createAuthRouter } from './authRoutes.js';
import { createBillingRouter } from './billingRoutes.js';
import { createDoctorRouter } from './doctorRoutes.js';
import { createHealthRouter } from './healthRoutes.js';
import { createMedicineRouter } from './medicineRoutes.js';
import { createNotificationRouter } from './notificationRoutes.js';
import { createPatientRouter } from './patientRoutes.js';
import { createPrescriptionRouter } from './prescriptionRoutes.js';
import { createStatisticsRouter } from './statisticsRoutes.js';
import { createUserRouter } from './userRoutes.js';

export interface ApiRouterDependencies {
  healthController: HealthController;
  authController: AuthController;
  billingController: BillingController;
  userController: UserController;
  patientController: PatientController;
  doctorController: DoctorController;
  appointmentController: AppointmentController;
  admissionController: AdmissionController;
  bedController: BedController;
  medicineController: MedicineController;
  notificationController: NotificationController;
  prescriptionController: PrescriptionController;
  statisticsController: StatisticsController;
  authenticate: RequestHandler;
}

export const createApiRouter = (dependencies: ApiRouterDependencies): Router => {
  const router = Router();

  router.get('/', (_request, response) => {
    response.json({
      name: 'Hospital Management System API',
      version: '1.0.0',
      phase: 'Production acceptance',
    });
  });
  router.use('/health', createHealthRouter(dependencies.healthController));
  router.use('/auth', createAuthRouter(dependencies.authController, dependencies.authenticate));
  router.use('/billing', createBillingRouter(dependencies.billingController, dependencies.authenticate));
  router.use('/users', createUserRouter(dependencies.userController, dependencies.authenticate));
  router.use('/patients', createPatientRouter(dependencies.patientController, dependencies.authenticate));
  router.use('/doctors', createDoctorRouter(dependencies.doctorController, dependencies.authenticate));
  router.use('/appointments', createAppointmentRouter(dependencies.appointmentController, dependencies.authenticate));
  router.use('/beds', createBedRouter(dependencies.bedController, dependencies.authenticate));
  router.use('/admissions', createAdmissionRouter(dependencies.admissionController, dependencies.authenticate));
  router.use('/medicines', createMedicineRouter(dependencies.medicineController, dependencies.authenticate));
  router.use('/notifications', createNotificationRouter(dependencies.notificationController, dependencies.authenticate));
  router.use('/prescriptions', createPrescriptionRouter(dependencies.prescriptionController, dependencies.authenticate));
  router.use('/statistics', createStatisticsRouter(dependencies.statisticsController, dependencies.authenticate));

  return router;
};
