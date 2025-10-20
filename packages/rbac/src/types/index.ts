export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  role: string;
  schoolId?: string;
  roles?: Role[];
}

export type PermissionCheck = {
  resource: string;
  action: string;
};

export type PermissionResult = {
  allowed: boolean;
  reason?: string;
};
