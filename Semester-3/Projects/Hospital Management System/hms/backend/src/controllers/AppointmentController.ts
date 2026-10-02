import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { APPOINTMENT_STATUSES } from '../models/Appointment.js';
import type { AppointmentService } from '../services/AppointmentService.js';
import { AppError } from '../utils/AppError.js';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const fields = {
  patientId: z.string().uuid(), doctorId: z.string().uuid(), appointmentDate: date,
  appointmentTime: time, reason: z.string().trim().min(2).max(1000),
  status: z.enum(APPOINTMENT_STATUSES), notes: z.union([z.string().trim().max(5000), z.null()]),
};
const createSchema = z.object({ ...fields, status: fields.status.optional().default('Scheduled'), notes: fields.notes.optional().default(null) }).strict();
const updateSchema = z.object(fields).partial().strict().refine((v) => Object.keys(v).length > 0);
const listSchema = z.object({
  search: z.string().trim().max(100).optional(), status: z.enum(APPOINTMENT_STATUSES).optional(),
  doctorId: z.string().uuid().optional(), patientId: z.string().uuid().optional(),
  dateFrom: date.optional(), dateTo: date.optional(), page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).refine((v) => !v.dateFrom || !v.dateTo || v.dateFrom <= v.dateTo, { message: 'Start date must be before end date.' });
const idSchema = z.string().trim().min(1).max(64);

export class AppointmentController {
  public constructor(private readonly service: AppointmentService) {}
  public create = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.status(201).json({ appointment: await this.service.createAppointment(this.parse(createSchema, req.body)) }); } catch (e) { next(e); } };
  public list = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await this.service.listAppointments(this.parse(listSchema, req.query))); } catch (e) { next(e); } };
  public options = async (_req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json(await this.service.options()); } catch (e) { next(e); } };
  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json({ appointment: await this.service.getAppointment(this.parse(idSchema, req.params.id)) }); } catch (e) { next(e); } };
  public update = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { res.json({ appointment: await this.service.updateAppointment(this.parse(idSchema, req.params.id), this.parse(updateSchema, req.body)) }); } catch (e) { next(e); } };
  public remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => { try { await this.service.deleteAppointment(this.parse(idSchema, req.params.id)); res.status(204).send(); } catch (e) { next(e); } };
  private parse<T>(schema: z.ZodType<T>, input: unknown): T { const result = schema.safeParse(input); if (!result.success) throw new AppError(400, 'VALIDATION_ERROR', 'Appointment data validation failed.', result.error.flatten()); return result.data; }
}
