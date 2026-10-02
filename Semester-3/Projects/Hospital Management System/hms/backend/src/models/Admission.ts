export const BED_TYPES=['General','ICU','Private','Semi-Private','Emergency'] as const;export type BedType=typeof BED_TYPES[number];
export const BED_STATUSES=['Available','Occupied','Maintenance'] as const;export type BedStatus=typeof BED_STATUSES[number];
export const ADMISSION_STATUSES=['Admitted','Discharged','Cancelled'] as const;export type AdmissionStatus=typeof ADMISSION_STATUSES[number];
export interface Bed{id:string;bedNumber:string;ward:string;type:BedType;status:BedStatus;currentPatient:{id:string;patientId:string;fullName:string}|null;createdAt:string;updatedAt:string;}
export interface BedInput{bedNumber:string;ward:string;type:BedType;status:'Available'|'Maintenance';}
export interface Admission{id:string;admissionId:string;patient:{id:string;patientId:string;fullName:string};doctor:{id:string;doctorId:string;name:string};bed:{id:string;bedNumber:string;ward:string;type:BedType};admissionDate:string;expectedDischarge:string|null;dischargeDate:string|null;diagnosis:string;status:AdmissionStatus;createdAt:string;updatedAt:string;}
export interface AdmissionInput{patientId:string;doctorId:string;bedId:string;admissionDate:string;expectedDischarge:string|null;diagnosis:string;}
export interface AdmissionUpdate{doctorId?:string;expectedDischarge?:string|null;diagnosis?:string;}
export interface AdmissionOptions{patients:Array<{id:string;patientId:string;fullName:string}>;doctors:Array<{id:string;doctorId:string;name:string}>;availableBeds:Bed[];}
