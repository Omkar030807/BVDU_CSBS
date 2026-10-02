import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BLOOD_GROUPS, PATIENT_GENDERS } from '../models/Patient.js';
import type { PatientService } from '../services/PatientService.js';
import { AppError } from '../utils/AppError.js';

const isValidIsoDate = (value: string): boolean => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
};

const dateOfBirthSchema = z.string().refine(isValidIsoDate, 'Enter a valid date of birth.');
const nullableEmailSchema = z.union([
  z.string().trim().email('Enter a valid email address.').max(255),
  z.literal(''),
  z.null(),
]);
const patientFields = {
  fullName: z.string().trim().min(2).max(120),
  dateOfBirth: dateOfBirthSchema,
  gender: z.enum(PATIENT_GENDERS),
  bloodGroup: z.enum(BLOOD_GROUPS),
  phone: z.string().trim().regex(/^[0-9+().\-\s]{7,20}$/, 'Enter a valid phone number.'),
  email: nullableEmailSchema,
  address: z.string().trim().min(5).max(1_000),
  emergencyContact: z.string().trim().min(3).max(255),
  reasonForVisit: z.string().trim().min(2).max(1_000),
  medicalHistory: z.union([z.string().trim().max(5_000), z.null()]),
};

const createPatientSchema = z.object({
  ...patientFields,
  email: nullableEmailSchema.optional().default(null),
  medicalHistory: patientFields.medicalHistory.optional().default(null),
}).strict();
const updatePatientSchema = z
  .object(patientFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required.');
const listPatientsSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
    gender: z.enum(PATIENT_GENDERS).optional(),
    bloodGroup: z.enum(BLOOD_GROUPS).optional(),
    minAge: z.coerce.number().int().min(0).max(130).optional(),
    maxAge: z.coerce.number().int().min(0).max(130).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine(
    (value) => value.minAge === undefined || value.maxAge === undefined || value.minAge <= value.maxAge,
    { message: 'Minimum age cannot exceed maximum age.' },
  );
const identifierSchema = z.string().trim().min(1).max(64);

export class PatientController {
  public constructor(private readonly patientService: PatientService) {}

  public create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const input = this.parse(createPatientSchema, request.body);
      const patient = await this.patientService.createPatient(input);
      response.status(201).json({ patient });
    } catch (error) { next(error); }
  };

  public list = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = this.parse(listPatientsSchema, request.query);
      response.json(await this.patientService.listPatients(filters));
    } catch (error) { next(error); }
  };

  public get = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parse(identifierSchema, request.params.id);
      response.json({ patient: await this.patientService.getPatient(id) });
    } catch (error) { next(error); }
  };

  public update = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parse(identifierSchema, request.params.id);
      const input = this.parse(updatePatientSchema, request.body);
      response.json({ patient: await this.patientService.updatePatient(id, input) });
    } catch (error) { next(error); }
  };

  public remove = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const id = this.parse(identifierSchema, request.params.id);
      await this.patientService.deletePatient(id);
      response.status(204).send();
    } catch (error) { next(error); }
  };

  private parse<T>(schema: z.ZodType<T>, input: unknown): T {
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'Patient data validation failed.',
        result.error.flatten(),
      );
    }
    return result.data;
  }
}
