import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { DAYS_OF_WEEK } from '../models/Doctor.js';
import type { DoctorService } from '../services/DoctorService.js';
import { AppError } from '../utils/AppError.js';

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour time in HH:MM format.');
const availabilitySchema = z
  .array(z.object({
    day: z.enum(DAYS_OF_WEEK),
    startTime: timeSchema,
    endTime: timeSchema,
  }).strict())
  .max(7)
  .superRefine((slots, context) => {
    const seen = new Set<string>();
    slots.forEach((slot, index) => {
      if (seen.has(slot.day)) {
        context.addIssue({ code: 'custom', message: `${slot.day} appears more than once.`, path: [index, 'day'] });
      }
      seen.add(slot.day);
      if (slot.startTime >= slot.endTime) {
        context.addIssue({ code: 'custom', message: 'End time must be after start time.', path: [index, 'endTime'] });
      }
    });
  });

const doctorFields = {
  name: z.string().trim().min(2).max(120),
  specialization: z.string().trim().min(2).max(120),
  department: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[0-9+().\-\s]{7,20}$/, 'Enter a valid phone number.'),
  email: z.string().trim().email('Enter a valid email address.').max(255),
  room: z.string().trim().min(1).max(50),
  consultationFee: z.coerce.number().min(0).max(1_000_000),
  availability: availabilitySchema,
};

const createDoctorSchema = z.object(doctorFields).strict();
const updateDoctorSchema = z
  .object(doctorFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
const listDoctorsSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    specialization: z.string().trim().max(120).optional(),
    department: z.string().trim().max(120).optional(),
    availableDay: z.enum(DAYS_OF_WEEK).optional(),
    minFee: z.coerce.number().min(0).max(1_000_000).optional(),
    maxFee: z.coerce.number().min(0).max(1_000_000).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    (value) => value.minFee === undefined || value.maxFee === undefined || value.minFee <= value.maxFee,
    { message: 'Minimum fee cannot exceed maximum fee.' },
  );
const identifierSchema = z.string().trim().min(1).max(64);

export class DoctorController {
  public constructor(private readonly doctorService: DoctorService) {}

  public create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = this.parse(createDoctorSchema, request.body);
      response.status(201).json({ doctor: await this.doctorService.createDoctor(input) });
    } catch (error) { next(error); }
  };

  public list = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = this.parse(listDoctorsSchema, request.query);
      response.json(await this.doctorService.listDoctors(filters));
    } catch (error) { next(error); }
  };

  public get = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parse(identifierSchema, request.params.id);
      response.json({ doctor: await this.doctorService.getDoctor(id) });
    } catch (error) { next(error); }
  };

  public update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parse(identifierSchema, request.params.id);
      const input = this.parse(updateDoctorSchema, request.body);
      response.json({ doctor: await this.doctorService.updateDoctor(id, input) });
    } catch (error) { next(error); }
  };

  public remove = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parse(identifierSchema, request.params.id);
      await this.doctorService.deleteDoctor(id);
      response.status(204).send();
    } catch (error) { next(error); }
  };

  private parse<T>(schema: z.ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Doctor data validation failed.', result.error.flatten());
    }
    return result.data;
  }
}
