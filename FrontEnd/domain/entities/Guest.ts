// Guest domain entity

export interface Guest {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone?: string;
  idType?: string;
  idNumber?: string;
  idScanUrl?: string;
  createdAt: string;
  updatedAt: string;
}
