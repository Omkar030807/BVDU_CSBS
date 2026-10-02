export interface Medicine{ id:string;medicineId:string;name:string;category:string;manufacturer:string;quantity:number;unitPrice:number;expiryDate:string;lowStockThreshold:number;isLowStock:boolean;isExpired:boolean;isExpiringSoon:boolean;createdAt:string;updatedAt:string; }
export interface MedicineInput{name:string;category:string;manufacturer:string;quantity:number;unitPrice:number;expiryDate:string;lowStockThreshold:number;}
export type MedicineUpdate=Omit<MedicineInput,'quantity'>;
export interface MedicineStockUpdate{quantityChange:number;reason:string;}
export interface StockMovement{id:string;quantityChange:number;previousQuantity:number;newQuantity:number;reason:string;createdAt:string;}
export interface PharmacyAlerts{lowStock:Medicine[];expired:Medicine[];expiringSoon:Medicine[];counts:{lowStock:number;expired:number;expiringSoon:number};}
