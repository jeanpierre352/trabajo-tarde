/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Worker, AttendanceRecord } from './types';

// Let's define the simulated current date
export const TODAY_DATE = 'Hoy, 24 de Mayo';
export const YESTERDAY_DATE = 'Ayer, 23 de Mayo';

export const INITIAL_WORKERS: Worker[] = [
  {
    id: '74829412',
    name: 'Jean Pierre Suclupe Lopez (Empleado)',
    photoUrl: 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=120',
    status: 'Presente',
    time: '08:00 AM',
    locationStatus: 'Dentro de Rango',
    biometricsStatus: 'Verificado',
    locationValidated: 'Oficina Central',
    email: 'jean.suclupe@empresa.com',
    dni: '74829412',
    password: 'jean123',
    role: 'Empleado'
  },
  {
    id: '87654321',
    name: 'Jean Pierre Suclupe Lopez (Administrador)',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120',
    status: 'Presente',
    time: '07:45 AM',
    locationStatus: 'Dentro de Rango',
    biometricsStatus: 'Verificado',
    locationValidated: 'Oficina Central',
    email: 'admin.jean@empresa.com',
    dni: '87654321',
    password: 'admin123',
    role: 'Administrador'
  }
];

export const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'rec-1',
    workerId: '74829412',
    workerName: 'Jean Pierre Suclupe Lopez (Empleado)',
    date: TODAY_DATE,
    fullDate: '2026-05-24',
    entryTime: '08:02 AM',
    exitTime: '05:15 PM',
    location: 'En sitio - Oficina Central',
    locationStatus: 'Dentro de Rango',
    biometricsStatus: 'Verificado',
    status: 'Completado'
  },
  {
    id: 'rec-2',
    workerId: '87654321',
    workerName: 'Jean Pierre Suclupe Lopez (Administrador)',
    date: YESTERDAY_DATE,
    fullDate: '2026-05-23',
    entryTime: '07:55 AM',
    exitTime: '06:00 PM',
    location: 'En sitio - Oficina Central',
    locationStatus: 'Dentro de Rango',
    biometricsStatus: 'Verificado',
    status: 'Completado'
  }
];

// Helper to query/save local storage
export function getStoredWorkers(): Worker[] {
  const data = localStorage.getItem('asistencia_workers');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const validIds = INITIAL_WORKERS.map(iw => iw.id);
        const filtered = parsed.filter((w: any) => validIds.includes(w.id));
        if (filtered.length > 0) {
          return filtered.map((w: any) => {
            const initial = INITIAL_WORKERS.find(iw => iw.id === w.id)!;
            return {
              ...initial,
              ...w,
              dni: w.dni || initial.dni,
              password: w.password || initial.password,
              role: w.role || initial.role
            };
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  return INITIAL_WORKERS;
}

export function saveStoredWorkers(workers: Worker[]) {
  localStorage.setItem('asistencia_workers', JSON.stringify(workers));
}

export function getStoredRecords(): AttendanceRecord[] {
  const data = localStorage.getItem('asistencia_records');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        const validIds = INITIAL_WORKERS.map(iw => iw.id);
        const filtered = parsed.filter((rec: any) => validIds.includes(rec.workerId));
        if (filtered.length > 0) {
          return filtered;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  return INITIAL_RECORDS;
}

export function saveStoredRecords(records: AttendanceRecord[]) {
  localStorage.setItem('asistencia_records', JSON.stringify(records));
}

export function getStoredCurrentUser(): Worker {
  const data = localStorage.getItem('asistencia_current_user');
  if (data) {
    try {
      const parsed = JSON.parse(data);
      const initial = INITIAL_WORKERS.find(iw => iw.id === parsed.id);
      if (initial) {
        return {
          ...initial,
          ...parsed,
          dni: parsed.dni || initial.dni,
          password: parsed.password || initial.password,
          role: parsed.role || initial.role
        };
      }
      return parsed;
    } catch (e) {
      console.error(e);
    }
  }
  // Default is the first initial worker (Jean Pierre Suclupe Lopez)
  return INITIAL_WORKERS[0];
}

export function saveStoredCurrentUser(user: Worker) {
  localStorage.setItem('asistencia_current_user', JSON.stringify(user));
}
