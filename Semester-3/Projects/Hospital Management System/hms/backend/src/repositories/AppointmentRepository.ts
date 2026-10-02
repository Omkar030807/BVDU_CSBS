import type pg from 'pg';
import type {
  Appointment,
  AppointmentFilters,
  AppointmentListResult,
  AppointmentOptions,
  AppointmentStatus,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../models/Appointment.js';
import type { DoctorAvailabilitySlot } from '../models/Doctor.js';

interface AppointmentRow {
  id: string; appointment_id: string; patient_uuid: string; patient_number: string;
  patient_name: string; doctor_uuid: string; doctor_number: string; doctor_name: string;
  doctor_specialization: string; appointment_date: string | Date; appointment_time: string;
  reason: string; status: AppointmentStatus; notes: string | null; created_at: Date; updated_at: Date;
}

const SELECT_COLUMNS = `
  a.id, a.appointment_id, p.id AS patient_uuid, p.patient_id AS patient_number,
  p.full_name AS patient_name, d.id AS doctor_uuid, d.doctor_id AS doctor_number,
  d.name AS doctor_name, d.specialization AS doctor_specialization,
  a.appointment_date, TO_CHAR(a.appointment_time, 'HH24:MI') AS appointment_time,
  a.reason, a.status, a.notes, a.created_at, a.updated_at
`;

const mapRow = (row: AppointmentRow): Appointment => ({
  id: row.id,
  appointmentId: row.appointment_id,
  patient: { id: row.patient_uuid, patientId: row.patient_number, fullName: row.patient_name },
  doctor: { id: row.doctor_uuid, doctorId: row.doctor_number, name: row.doctor_name, specialization: row.doctor_specialization },
  appointmentDate: row.appointment_date instanceof Date ? row.appointment_date.toISOString().slice(0, 10) : row.appointment_date,
  appointmentTime: row.appointment_time,
  reason: row.reason,
  status: row.status,
  notes: row.notes,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export interface IAppointmentRepository {
  create(input: CreateAppointmentInput): Promise<Appointment>;
  findById(identifier: string): Promise<Appointment | null>;
  list(filters: AppointmentFilters): Promise<AppointmentListResult>;
  update(id: string, input: UpdateAppointmentInput): Promise<Appointment | null>;
  softDelete(id: string): Promise<boolean>;
  patientExists(id: string): Promise<boolean>;
  doctorExists(id: string): Promise<boolean>;
  options(): Promise<AppointmentOptions>;
}

export class PostgreSQLAppointmentRepository implements IAppointmentRepository {
  public constructor(private readonly pool: pg.Pool) {}

  public async create(input: CreateAppointmentInput): Promise<Appointment> {
    const inserted = await this.pool.query<{ id: string }>(
      `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [input.patientId, input.doctorId, input.appointmentDate, input.appointmentTime, input.reason, input.status, input.notes],
    );
    return (await this.findById(inserted.rows[0]!.id))!;
  }

  public async findById(identifier: string): Promise<Appointment | null> {
    const result = await this.pool.query<AppointmentRow>(
      `SELECT ${SELECT_COLUMNS} FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN doctors d ON d.id = a.doctor_id
       WHERE (a.id::TEXT = $1 OR a.appointment_id = $1) AND a.deleted_at IS NULL LIMIT 1`,
      [identifier],
    );
    return result.rows[0] ? mapRow(result.rows[0]) : null;
  }

  public async list(filters: AppointmentFilters): Promise<AppointmentListResult> {
    const conditions = ['a.deleted_at IS NULL'];
    const values: unknown[] = [];
    const add = (value: unknown): string => { values.push(value); return `$${values.length}`; };
    if (filters.search) {
      const p = add(`%${filters.search}%`);
      conditions.push(`(a.appointment_id ILIKE ${p} OR p.full_name ILIKE ${p} OR d.name ILIKE ${p} OR a.reason ILIKE ${p})`);
    }
    if (filters.status) conditions.push(`a.status = ${add(filters.status)}`);
    if (filters.doctorId) conditions.push(`a.doctor_id = ${add(filters.doctorId)}`);
    if (filters.patientId) conditions.push(`a.patient_id = ${add(filters.patientId)}`);
    if (filters.dateFrom) conditions.push(`a.appointment_date >= ${add(filters.dateFrom)}`);
    if (filters.dateTo) conditions.push(`a.appointment_date <= ${add(filters.dateTo)}`);
    const where = conditions.join(' AND ');
    const totalResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*)::TEXT AS total FROM appointments a JOIN patients p ON p.id=a.patient_id JOIN doctors d ON d.id=a.doctor_id WHERE ${where}`,
      values,
    );
    const total = Number(totalResult.rows[0]?.total ?? 0);
    const offset = (filters.page - 1) * filters.limit;
    const result = await this.pool.query<AppointmentRow>(
      `SELECT ${SELECT_COLUMNS} FROM appointments a
       JOIN patients p ON p.id=a.patient_id JOIN doctors d ON d.id=a.doctor_id
       WHERE ${where} ORDER BY a.appointment_date DESC, a.appointment_time DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, filters.limit, offset],
    );
    return { appointments: result.rows.map(mapRow), pagination: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) } };
  }

  public async update(id: string, input: UpdateAppointmentInput): Promise<Appointment | null> {
    const map: Array<[keyof UpdateAppointmentInput, string]> = [
      ['patientId','patient_id'],['doctorId','doctor_id'],['appointmentDate','appointment_date'],
      ['appointmentTime','appointment_time'],['reason','reason'],['status','status'],['notes','notes'],
    ];
    const values: unknown[] = []; const assignments: string[] = [];
    for (const [key, column] of map) if (input[key] !== undefined) { values.push(input[key]); assignments.push(`${column}=$${values.length}`); }
    values.push(id);
    const result = await this.pool.query<{ id: string }>(
      `UPDATE appointments SET ${assignments.join(', ')}, updated_at=CURRENT_TIMESTAMP
       WHERE id::TEXT=$${values.length} AND deleted_at IS NULL RETURNING id`, values,
    );
    return result.rows[0] ? this.findById(result.rows[0].id) : null;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE appointments SET deleted_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
       WHERE id::TEXT=$1 AND deleted_at IS NULL`, [id],
    );
    return (result.rowCount ?? 0) > 0;
  }

  public async patientExists(id: string): Promise<boolean> {
    const result = await this.pool.query(`SELECT 1 FROM patients WHERE id=$1 AND deleted_at IS NULL`, [id]);
    return Boolean(result.rows[0]);
  }
  public async doctorExists(id: string): Promise<boolean> {
    const result = await this.pool.query(`SELECT 1 FROM doctors WHERE id=$1 AND deleted_at IS NULL`, [id]);
    return Boolean(result.rows[0]);
  }
  public async options(): Promise<AppointmentOptions> {
    const [patients, doctors] = await Promise.all([
      this.pool.query<{ id: string; patient_id: string; full_name: string }>(
        `SELECT id, patient_id, full_name FROM patients WHERE deleted_at IS NULL ORDER BY full_name`,
      ),
      this.pool.query<{ id: string; doctor_id: string; name: string; specialization: string; availability: DoctorAvailabilitySlot[] }>(
        `SELECT id, doctor_id, name, specialization, availability FROM doctors WHERE deleted_at IS NULL ORDER BY name`,
      ),
    ]);
    return {
      patients: patients.rows.map((p) => ({ id: p.id, patientId: p.patient_id, fullName: p.full_name })),
      doctors: doctors.rows.map((d) => ({ id: d.id, doctorId: d.doctor_id, name: d.name, specialization: d.specialization, availability: d.availability })),
    };
  }
}
