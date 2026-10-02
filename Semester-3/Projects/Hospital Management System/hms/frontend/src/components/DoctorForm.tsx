import { Clock3, LoaderCircle, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  DAYS_OF_WEEK,
  type DayOfWeek,
  type Doctor,
  type DoctorAvailabilitySlot,
  type DoctorPayload,
} from '../types/doctor';

interface DoctorFormProps {
  doctor?: Doctor;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (payload: DoctorPayload) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  name: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  room: string;
  consultationFee: string;
  availability: DoctorAvailabilitySlot[];
}

const initialState = (doctor?: Doctor): FormState => ({
  name: doctor?.name ?? '',
  specialization: doctor?.specialization ?? '',
  department: doctor?.department ?? '',
  phone: doctor?.phone ?? '',
  email: doctor?.email ?? '',
  room: doctor?.room ?? '',
  consultationFee: doctor ? String(doctor.consultationFee) : '',
  availability: doctor?.availability.map((slot) => ({ ...slot })) ?? [],
});

export const DoctorForm = ({ doctor, isSubmitting, error, onSubmit, onCancel }: DoctorFormProps) => {
  const [form, setForm] = useState<FormState>(() => initialState(doctor));

  const setField = <K extends keyof Omit<FormState, 'availability'>>(field: K, value: FormState[K]): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleDay = (day: DayOfWeek): void => {
    setForm((current) => {
      const exists = current.availability.some((slot) => slot.day === day);
      const availability = exists
        ? current.availability.filter((slot) => slot.day !== day)
        : [...current.availability, { day, startTime: '09:00', endTime: '17:00' }]
            .sort((a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day));
      return { ...current, availability };
    });
  };

  const updateSlot = (day: DayOfWeek, field: 'startTime' | 'endTime', value: string): void => {
    setForm((current) => ({
      ...current,
      availability: current.availability.map((slot) =>
        slot.day === day ? { ...slot, [field]: value } : slot,
      ),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await onSubmit({
      name: form.name,
      specialization: form.specialization,
      department: form.department,
      phone: form.phone,
      email: form.email,
      room: form.room,
      consultationFee: Number(form.consultationFee),
      availability: form.availability,
    });
  };

  return (
    <form className="doctor-form patient-form" onSubmit={(event) => void handleSubmit(event)}>
      {error && <div className="form-error patient-form__error" role="alert"><strong>Could not save doctor</strong><span>{error}</span></div>}

      <fieldset disabled={isSubmitting}>
        <legend>Professional profile</legend>
        <div className="form-grid form-grid--2">
          <label className="form-field form-field--full"><span>Doctor name *</span><input required minLength={2} maxLength={120} value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Dr. Full Name" /></label>
          <label className="form-field"><span>Specialization *</span><input required minLength={2} maxLength={120} value={form.specialization} onChange={(event) => setField('specialization', event.target.value)} placeholder="e.g. Cardiology" /></label>
          <label className="form-field"><span>Department *</span><input required minLength={2} maxLength={120} value={form.department} onChange={(event) => setField('department', event.target.value)} placeholder="e.g. Medicine" /></label>
          <label className="form-field"><span>Room *</span><input required maxLength={50} value={form.room} onChange={(event) => setField('room', event.target.value)} placeholder="e.g. M-204" /></label>
          <label className="form-field"><span>Consultation fee (₹) *</span><input required type="number" min="0" max="1000000" step="0.01" value={form.consultationFee} onChange={(event) => setField('consultationFee', event.target.value)} placeholder="750.00" /></label>
        </div>
      </fieldset>

      <fieldset disabled={isSubmitting}>
        <legend>Contact information</legend>
        <div className="form-grid form-grid--2">
          <label className="form-field"><span>Phone *</span><input required minLength={7} maxLength={20} value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="+91 98765 43210" /></label>
          <label className="form-field"><span>Email *</span><input required type="email" maxLength={255} value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="doctor@hospital.org" /></label>
        </div>
      </fieldset>

      <fieldset disabled={isSubmitting}>
        <legend>Weekly availability</legend>
        <p className="availability-help">Select working days and set the regular consultation window for each day.</p>
        <div className="day-selector">
          {DAYS_OF_WEEK.map((day) => {
            const selected = form.availability.some((slot) => slot.day === day);
            return <button key={day} type="button" className={selected ? 'day-chip day-chip--selected' : 'day-chip'} onClick={() => toggleDay(day)}>{day.slice(0, 3)}</button>;
          })}
        </div>
        {form.availability.length === 0 ? (
          <div className="availability-empty"><Clock3 size={18} /><span>No regular availability selected. The doctor will appear as unavailable.</span></div>
        ) : (
          <div className="availability-editor">
            {form.availability.map((slot) => (
              <div className="availability-row" key={slot.day}>
                <strong>{slot.day}</strong>
                <label><span>From</span><input required type="time" value={slot.startTime} onChange={(event) => updateSlot(slot.day, 'startTime', event.target.value)} /></label>
                <label><span>To</span><input required type="time" min={slot.startTime} value={slot.endTime} onChange={(event) => updateSlot(slot.day, 'endTime', event.target.value)} /></label>
              </div>
            ))}
          </div>
        )}
      </fieldset>

      <footer className="patient-form__actions">
        <button className="button" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><LoaderCircle className="spin" size={17} /> Saving…</> : <><Save size={17} /> {doctor ? 'Save changes' : 'Add doctor'}</>}
        </button>
      </footer>
    </form>
  );
};
