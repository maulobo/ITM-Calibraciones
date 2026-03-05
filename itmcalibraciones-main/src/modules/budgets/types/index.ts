export type BudgetStatus = "PENDING" | "APPROVED" | "REJECTED";
export type BudgetType = "Calibración" | "Venta" | "Alquiler" | "Mantenimiento";
export type CurrencyType = "USD" | "ARS";
export type VatType = "21" | "10,5" | "NO_IVA" | "EXEMPT";

export interface BudgetDetail {
  _id?: string;
  itemNumber?: number;
  quantity: number;
  description: string;
  unitPrice: number;
  discount: number;
  totalPrice: number;
  linkedOtCode?: string;
  linkedEquipmentId?: string;
}

export interface PopulatedOffice {
  _id: string;
  name: string;
  client?: {
    _id: string;
    socialReason: string;
    cuit?: string;
  };
}

export interface PopulatedAdvisor {
  _id: string;
  name: string;
  lastName: string;
}

export interface PopulatedServiceOrder {
  _id: string;
  code: string;
}

export interface Budget {
  _id: string;
  id?: string;
  code?: string; // virtual "26-03003"
  client?: string; // set when budget is sent to client
  number: number;
  year: number;
  types: BudgetType[];
  status: BudgetStatus;
  office: PopulatedOffice;
  advisor: PopulatedAdvisor;
  attention?: string;
  date: string;
  reference?: string;
  deliveryTime: string;
  offerValidity: number;
  paymentTerms: string;
  currency: CurrencyType;
  vat: VatType;
  showTotal: boolean;
  notes?: string;
  selectedNotes: string[];
  instrumentsRelated?: string[];
  serviceOrder?: PopulatedServiceOrder;
  details: BudgetDetail[];
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDTO {
  types: BudgetType[];
  office: string;
  advisor?: string;
  attention?: string;
  date: string;
  reference?: string;
  deliveryTime: string;
  offerValidity: number;
  paymentTerms: string;
  currency: CurrencyType;
  vat: VatType;
  showTotal?: boolean;
  notes?: string;
  selectedNotes?: string[];
  serviceOrder?: string;
  details: Omit<BudgetDetail, "_id" | "itemNumber">[];
}

export interface UpdateBudgetStatusDTO {
  status: BudgetStatus;
}
