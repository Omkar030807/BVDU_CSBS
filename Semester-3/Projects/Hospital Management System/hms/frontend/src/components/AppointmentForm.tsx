import { LoaderCircle, Save } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { APPOINTMENT_STATUSES, type Appointment, type AppointmentOptions, type AppointmentPayload, type AppointmentStatus } from '../types/appointment';

interface Props { appointment?:Appointment; options:AppointmentOptions; isSubmitting:boolean; error:string|null; onSubmit:(p:AppointmentPayload)=>Promise<void>; onCancel:()=>void; }
export const AppointmentForm=({appointment,options,isSubmitting,error,onSubmit,onCancel}:Props)=>{
  const [form,setForm]=useState<AppointmentPayload>({patientId:appointment?.patient.id??'',doctorId:appointment?.doctor.id??'',appointmentDate:appointment?.appointmentDate??'',appointmentTime:appointment?.appointmentTime??'',reason:appointment?.reason??'',status:appointment?.status??'Scheduled',notes:appointment?.notes??null});
  const set=<K extends keyof AppointmentPayload>(key:K,value:AppointmentPayload[K])=>setForm(v=>({...v,[key]:value}));
  const submit=async(e:FormEvent)=>{e.preventDefault();await onSubmit({...form,notes:form.notes?.trim()||null});};
  const selectedDoctor=options.doctors.find(d=>d.id===form.doctorId);
  return <form className="patient-form" onSubmit={e=>void submit(e)}>
    {error&&<div className="form-error patient-form__error"><strong>Could not save appointment</strong><span>{error}</span></div>}
    <fieldset disabled={isSubmitting}><legend>Appointment parties</legend><div className="form-grid form-grid--2">
      <label className="form-field"><span>Patient *</span><select required value={form.patientId} onChange={e=>set('patientId',e.target.value)}><option value="">Select patient</option>{options.patients.map(p=><option key={p.id} value={p.id}>{p.fullName} · {p.patientId}</option>)}</select></label>
      <label className="form-field"><span>Doctor *</span><select required value={form.doctorId} onChange={e=>set('doctorId',e.target.value)}><option value="">Select doctor</option>{options.doctors.map(d=><option key={d.id} value={d.id}>{d.name} · {d.specialization}</option>)}</select></label>
    </div>{selectedDoctor&&<p className="form-context">Regular availability: {selectedDoctor.availability.length?selectedDoctor.availability.map(s=>`${s.day.slice(0,3)} ${s.startTime}–${s.endTime}`).join(' · '):'No regular schedule configured'}</p>}</fieldset>
    <fieldset disabled={isSubmitting}><legend>Schedule</legend><div className="form-grid form-grid--3">
      <label className="form-field"><span>Date *</span><input required type="date" min={form.status==='Scheduled'?new Date().toISOString().slice(0,10):undefined} value={form.appointmentDate} onChange={e=>set('appointmentDate',e.target.value)}/></label>
      <label className="form-field"><span>Time *</span><input required type="time" value={form.appointmentTime} onChange={e=>set('appointmentTime',e.target.value)}/></label>
      <label className="form-field"><span>Status *</span><select value={form.status} onChange={e=>set('status',e.target.value as AppointmentStatus)}>{APPOINTMENT_STATUSES.map(s=><option key={s}>{s}</option>)}</select></label>
    </div></fieldset>
    <fieldset disabled={isSubmitting}><legend>Clinical context</legend><div className="form-grid form-grid--2">
      <label className="form-field form-field--full"><span>Reason *</span><textarea required minLength={2} maxLength={1000} rows={2} value={form.reason} onChange={e=>set('reason',e.target.value)}/></label>
      <label className="form-field form-field--full"><span>Notes</span><textarea maxLength={5000} rows={3} value={form.notes??''} onChange={e=>set('notes',e.target.value)}/></label>
    </div></fieldset>
    <footer className="patient-form__actions"><button className="button" type="button" onClick={onCancel}>Cancel</button><button className="button button--primary" disabled={isSubmitting}>{isSubmitting?<><LoaderCircle className="spin" size={17}/> Saving…</>:<><Save size={17}/> {appointment?'Save changes':'Schedule appointment'}</>}</button></footer>
  </form>;
};
