import type { Appointment, AppointmentFilters, AppointmentListResponse, AppointmentOptions, AppointmentPayload } from '../types/appointment';
import { apiRequest } from './api';
const queryString=(filters:Record<string,unknown>)=>{const q=new URLSearchParams();Object.entries(filters).forEach(([k,v])=>{if(v!==undefined&&v!=='')q.set(k,String(v));});return q.toString();};
export const listAppointmentsRequest=(filters:AppointmentFilters)=>apiRequest<AppointmentListResponse>(`/appointments?${queryString(filters as Record<string,unknown>)}`);
export const appointmentOptionsRequest=()=>apiRequest<AppointmentOptions>('/appointments/options');
export const createAppointmentRequest=async(payload:AppointmentPayload)=>(await apiRequest<{appointment:Appointment}>('/appointments',{method:'POST',body:JSON.stringify(payload)})).appointment;
export const updateAppointmentRequest=async(id:string,payload:AppointmentPayload)=>(await apiRequest<{appointment:Appointment}>(`/appointments/${id}`,{method:'PATCH',body:JSON.stringify(payload)})).appointment;
export const deleteAppointmentRequest=(id:string)=>apiRequest<void>(`/appointments/${id}`,{method:'DELETE'});
