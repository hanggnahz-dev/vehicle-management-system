export interface Role {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface CreateRoleData {
  name: string
  description?: string
}

export interface UpdateRoleData {
  name?: string
  description?: string
}

export interface RoleResponse {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}
