import type { PermissionCheck } from '../types';

/**
 * Build permission check object
 */
export function permission(resource: string, action: string): PermissionCheck {
  return { resource, action };
}

/**
 * Common permission builders
 */
export const Permissions = {
  // Users
  createUser: () => permission('users', 'create'),
  readUser: () => permission('users', 'read'),
  updateUser: () => permission('users', 'update'),
  deleteUser: () => permission('users', 'delete'),
  listUsers: () => permission('users', 'list'),

  // Schools
  createSchool: () => permission('schools', 'create'),
  readSchool: () => permission('schools', 'read'),
  updateSchool: () => permission('schools', 'update'),
  deleteSchool: () => permission('schools', 'delete'),
  listSchools: () => permission('schools', 'list'),

  // Students
  createStudent: () => permission('students', 'create'),
  readStudent: () => permission('students', 'read'),
  updateStudent: () => permission('students', 'update'),
  deleteStudent: () => permission('students', 'delete'),
  listStudents: () => permission('students', 'list'),

  // Teachers
  createTeacher: () => permission('teachers', 'create'),
  readTeacher: () => permission('teachers', 'read'),
  updateTeacher: () => permission('teachers', 'update'),
  deleteTeacher: () => permission('teachers', 'delete'),
  listTeachers: () => permission('teachers', 'list'),

  // Grades
  createGrade: () => permission('grades', 'create'),
  readGrade: () => permission('grades', 'read'),
  updateGrade: () => permission('grades', 'update'),
  deleteGrade: () => permission('grades', 'delete'),
  listGrades: () => permission('grades', 'list'),

  // Attendance
  createAttendance: () => permission('attendance', 'create'),
  readAttendance: () => permission('attendance', 'read'),
  updateAttendance: () => permission('attendance', 'update'),
  deleteAttendance: () => permission('attendance', 'delete'),

  // Roles
  assignRole: () => permission('roles', 'assign'),
  revokeRole: () => permission('roles', 'revoke'),
  manageRoles: () => permission('roles', 'manage'),

  // Permissions
  viewPermissions: () => permission('permissions', 'view'),
  managePermissions: () => permission('permissions', 'manage'),

  // Custom permission
  custom: (resource: string, action: string) => permission(resource, action),
};
