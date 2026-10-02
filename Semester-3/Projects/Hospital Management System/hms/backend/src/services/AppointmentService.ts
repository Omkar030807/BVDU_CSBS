import type { Appointment, AppointmentFilters, AppointmentListResult, AppointmentOptions, CreateAppointmentInput, UpdateAppointmentInput } from '../models/Appointment.js';
import type { IAppointmentRepository } from '../repositories/AppointmentRepository.js';
import { AppError } from '../utils/AppError.js';

export class AppointmentService {
  public constructor(private readonly repository: IAppointmentRepository) {}

  public async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    await this.validateReferences(input.patientId, input.doctorId);
    this.validateScheduledDate(input.appointmentDate, input.status);
    try { return await this.repository.create(this.normalize(input) as CreateAppointmentInput); }
    catch (error) { this.handleError(error); }
  }
  public async getAppointment(id: string): Promise<Appointment> {
    const item = await this.repository.findById(id);
    if (!item) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment was not found.');
    return item;
  }
  public async listAppointments(filters: AppointmentFilters): Promise<AppointmentListResult> {
    return this.repository.list({ ...filters, ...(filters.search ? { search: filters.search.trim() } : {}) });
  }
  public async updateAppointment(id: string, input: UpdateAppointmentInput): Promise<Appointment> {
    const current = await this.getAppointment(id);
    const patientId = input.patientId ?? current.patient.id;
    const doctorId = input.doctorId ?? current.doctor.id;
    await this.validateReferences(patientId, doctorId);
    this.validateScheduledDate(input.appointmentDate ?? current.appointmentDate, input.status ?? current.status);
    try {
      const item = await this.repository.update(id, this.normalize(input));
      if (!item) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment was not found.');
      return item;
    } catch (error) { this.handleError(error); }
  }
  public async deleteAppointment(id: string): Promise<void> {
    await this.getAppointment(id);
    if (!(await this.repository.softDelete(id))) throw new AppError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment was not found.');
  }
  public options(): Promise<AppointmentOptions> { return this.repository.options(); }

  private async validateReferences(patientId: string, doctorId: string): Promise<void> {
    const [patient, doctor] = await Promise.all([this.repository.patientExists(patientId), this.repository.doctorExists(doctorId)]);
    if (!patient) throw new AppError(400, 'INVALID_PATIENT', 'Select an active patient.');
    if (!doctor) throw new AppError(400, 'INVALID_DOCTOR', 'Select an active doctor.');
  }
  private validateScheduledDate(date: string, status: string): void {
    if (status === 'Scheduled' && date < new Date().toISOString().slice(0, 10)) {
      throw new AppError(400, 'INVALID_APPOINTMENT_DATE', 'A scheduled appointment cannot be in the past.');
    }
  }
  private normalize<T extends CreateAppointmentInput | UpdateAppointmentInput>(input: T): T {
    const value: UpdateAppointmentInput = { ...input };
    if (input.reason !== undefined) value.reason = input.reason.trim();
    if (input.notes !== undefined) value.notes = input.notes?.trim() || null;
    return value as T;
  }
  private handleError(error: unknown): never {
    if (typeof error === 'object' && error && 'code' in error && (error as { code?: string }).code === '23505') {
      throw new AppError(409, 'DOCTOR_DOUBLE_BOOKED', 'This doctor already has a scheduled appointment at that date and time.');
    }
    throw error;
  }
}
