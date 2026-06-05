/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 'marcacion' | 'exitoso' | 'historial' | 'reportes' | 'horarios';

export interface Worker {
  id: string;
  name: string;
  photoUrl: string;
  status: 'Presente' | 'Tarde' | 'Revisión';
  time: string;
  locationStatus: 'Dentro de Rango' | 'Fuera de Rango';
  biometricsStatus: 'Verificado' | 'Fallido';
  locationValidated: string;
  email?: string;
  dni?: string;
  password?: string;
  role?: 'Empleado' | 'Administrador';
}

export interface AttendanceRecord {
  id: string;
  workerId: string;
  workerName: string;
  date: string; // e.g. "Hoy, 24 de Mayo"
  fullDate: string; // e.g., "2026-05-24"
  entryTime: string; // e.g. "08:02 AM"
  exitTime: string; // e.g. "05:15 PM" or "--:--"
  location: string; // e.g. "En sitio - Sede Central" or "Remoto - Teletrabajo"
  locationStatus: 'Dentro de Rango' | 'Fuera de Rango';
  biometricsStatus: 'Verificado' | 'Fallido';
  status: 'Completado' | 'Falta Salida';
}
