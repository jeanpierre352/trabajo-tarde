/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, Plus, AlertCircle, Edit2, ShieldCheck, Check } from 'lucide-react';
import { Worker } from '../types';
import Avatar from './Avatar';

interface Schedule {
  workerId: string;
  workerName: string;
  photoUrl: string;
  shift: string; // T1, T2, T3
  entryTime: string; // "08:00"
  exitTime: string; // "17:00"
  status: string; // "OK", "Suspendido"
}

interface HorariosScreenProps {
  workers: Worker[];
}

export default function HorariosScreen({ workers }: HorariosScreenProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedShift, setSelectedShift] = useState('T1');
  const [entryTime, setEntryTime] = useState('08:00');
  const [exitTime, setExitTime] = useState('17:00');
  const [scheduleStatus, setScheduleStatus] = useState('OK');
  const [notification, setNotification] = useState<string | null>(null);

  // Load schedules on mount
  useEffect(() => {
    const saved = localStorage.getItem('asistencia_schedules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migración: Forzar imagen local si se detectan enlaces externos en cuentas demo
        const migrated = parsed.map((s: Schedule) => ({
          ...s,
          photoUrl: (s.workerId === '74829412' || s.workerId === '87654321') ? '/perfil.jpeg' : s.photoUrl
        }));
        setSchedules(migrated);
        localStorage.setItem('asistencia_schedules', JSON.stringify(migrated));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Pre-initialize default schedules matching the workers
      const defaults: Schedule[] = [
        {
          workerId: '74829412',
          workerName: 'Jean Pierre Suclupe Lopez (Empleado)',
          photoUrl: '/perfil.jpeg',
          shift: 'T1',
          entryTime: '08:00',
          exitTime: '17:00',
          status: 'OK'
        },
        {
          workerId: '87654321',
          workerName: 'Jean Pierre Suclupe Lopez (Administrador)',
          photoUrl: '/perfil.jpeg',
          shift: 'T2',
          entryTime: '08:30',
          exitTime: '17:30',
          status: 'OK'
        }
      ];
      setSchedules(defaults);
      localStorage.setItem('asistencia_schedules', JSON.stringify(defaults));
    }
  }, []);

  // Sync state back to workers list
  useEffect(() => {
    if (workers.length > 0 && selectedWorkerId === '') {
      setSelectedWorkerId(workers[0].id);
    }
  }, [workers, selectedWorkerId]);

  const handleUpdateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedWorker = workers.find(w => w.id === selectedWorkerId);
    if (!matchedWorker) return;

    const existIndex = schedules.findIndex(s => s.workerId === selectedWorkerId);
    let updatedSchedules = [...schedules];

    const targetSchedule: Schedule = {
      workerId: selectedWorkerId,
      workerName: matchedWorker.name,
      photoUrl: matchedWorker.photoUrl,
      shift: selectedShift,
      entryTime,
      exitTime,
      status: scheduleStatus
    };

    if (existIndex >= 0) {
      updatedSchedules[existIndex] = targetSchedule;
    } else {
      updatedSchedules.push(targetSchedule);
    }

    setSchedules(updatedSchedules);
    localStorage.setItem('asistencia_schedules', JSON.stringify(updatedSchedules));

    setNotification(`Horario de ${matchedWorker.name} actualizado con éxito.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSelectScheduleForEdit = (sched: Schedule) => {
    setSelectedWorkerId(sched.workerId);
    setSelectedShift(sched.shift);
    setEntryTime(sched.entryTime);
    setExitTime(sched.exitTime);
    setScheduleStatus(sched.status);
  };

  return (
    <div id="horarios-screen" className="max-w-md mx-auto w-full px-4 py-4 pb-24">
      {/* Dynamic confirmation notification toast */}
      {notification && (
        <div className="bg-[#121212] border border-success/30 p-3 rounded-xl mb-4 text-success text-xs flex gap-2 items-center">
          <Check className="w-4 h-4 shrink-0" />
          <span className="font-semibold text-success">{notification}</span>
        </div>
      )}

      {/* Main Container Header */}
      <div className="mb-6">
        <h2 className="text-sm font-black text-white tracking-tighter uppercase">
          Gestión de Horarios
        </h2>
        <p className="text-[10px] text-white/50 mt-1 uppercase tracking-widest font-bold leading-relaxed">
          Definición de turnos corporativos, ingresos y salidas autorizados.
        </p>
      </div>

      {/* Form configuration panel */}
      <form onSubmit={handleUpdateSchedule} className="bg-[#121212] border border-white/10 p-4 rounded-xl shadow-2xl mb-6 space-y-4">
        <div>
          <label className="block text-[8px] text-[#F0F0F0]/50 font-black uppercase tracking-widest mb-1.5">
            Empleado
          </label>
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {workers.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} (ID: {w.id})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[8px] text-[#F0F0F0]/50 font-black uppercase tracking-widest mb-1.5">
              Turno
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-dark-bg border border-white/10 text-white rounded-lg text-xs"
            >
              <option value="T1">T1 - Turno Mañana</option>
              <option value="T2">T2 - Turno Tarde</option>
              <option value="T3">T3 - Turno Nocturno</option>
            </select>
          </div>

          <div>
            <label className="block text-[8px] text-[#F0F0F0]/50 font-black uppercase tracking-widest mb-1.5">
              Estado
            </label>
            <select
              value={scheduleStatus}
              onChange={(e) => setScheduleStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-dark-bg border border-white/10 text-white rounded-lg text-xs"
            >
              <option value="OK">🟢 OK (Activo)</option>
              <option value="Inactivo">🔴 Inactivo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[8px] text-[#F0F0F0]/50 font-black uppercase tracking-widest mb-1.5">
              Hora Entrada
            </label>
            <input
              type="text"
              value={entryTime}
              placeholder="Ej. 08:00"
              required
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-[8px] text-[#F0F0F0]/50 font-black uppercase tracking-widest mb-1.5">
              Hora Salida
            </label>
            <input
              type="text"
              value={exitTime}
              placeholder="Ej. 17:00"
              required
              onChange={(e) => setExitTime(e.target.value)}
              className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-lg text-xs font-mono text-center text-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-primary hover:bg-[#1a00cc] text-white rounded-xl font-black uppercase tracking-widest transition-all text-[10px] cursor-pointer"
        >
          Actualizar Horario
        </button>
      </form>

      {/* Roster of active schedules list */}
      <section className="space-y-3">
        <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">
          Turnos Registrados
        </h3>

        <div className="space-y-2">
          {schedules.map((sched) => (
            <div
              key={sched.workerId}
              onClick={() => handleSelectScheduleForEdit(sched)}
              className="bg-[#121212] border border-white/10 p-3 rounded-xl flex items-center justify-between hover:border-primary/40 transition-all cursor-pointer shadow-md"
            >
              <div className="flex items-center gap-3">
                <Avatar photoUrl={sched.photoUrl} name={sched.workerName} className="w-10 h-10 border border-white/10" />
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wide">{sched.workerName}</h4>
                  <p className="text-[9px] text-success font-bold mt-0.5 uppercase tracking-wider">
                    Turno: {sched.shift} • {sched.status}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 bg-dark-bg px-2 py-1 rounded text-[10px] font-mono border border-white/5">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{sched.entryTime} - {sched.exitTime}</span>
                </div>
                <span className="text-[8px] text-white/40 uppercase font-black tracking-widest flex items-center gap-0.5">
                  <Edit2 className="w-2.5 h-2.5" /> Editar
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
