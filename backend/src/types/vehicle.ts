export interface Vehicle {
  id: number
  company_name: string
  license_plate: string
  inspection_date: string
  created_at: string
  updated_at: string
}

export interface CreateVehicleData {
  company_name: string
  license_plate: string
  inspection_date: string
}

export interface UpdateVehicleData {
  company_name?: string
  license_plate?: string
  inspection_date?: string
}

export interface VehicleResponse {
  id: number
  company_name: string
  license_plate: string
  inspection_date: string
  created_at: string
  updated_at: string
}

export interface VehicleFilter {
  company_name?: string
  license_plate?: string
  status?: string
}

export interface ImportVehicleData {
  company_name: string
  license_plate: string
  inspection_date: string
}
