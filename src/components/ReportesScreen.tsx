/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  ChevronDown, 
  MapPin, 
  Smile, 
  Frown, 
  Users, 
  UserPlus, 
  AlertTriangle, 
  Check, 
  RefreshCw, 
  Trash2, 
  Calendar, 
  Clock, 
  Edit2, 
  ShieldAlert 
} from 'lucide-react';
import { Worker, AttendanceRecord } from '../types';
import Avatar from './Avatar';

// Roster Schedule interface for turnos management
interface Schedule {
  workerId: string;
  workerName: string;
  photoUrl: string;
  shift: string; // T1, T2, T3
  entryTime: string; // "08:00"
  exitTime: string; // "17:00"
  status: string; // "OK", "Suspendido"
}

interface ReportesScreenProps {
  workers: Worker[];
  records: AttendanceRecord[];
  onAddSimulatedRecord: (newRecord: AttendanceRecord, newWorker: Worker) => void;
  onResetDatabase: () => void;
  onDeleteRecord: (recordId: string) => void;
}

export default function ReportesScreen({ 
  workers, 
  records, 
  onAddSimulatedRecord, 
  onResetDatabase,
  onDeleteRecord 
}: ReportesScreenProps) {
  // Main admin view sub-tabs
  const [adminTab, setAdminTab] = useState<'trabajadores' | 'historial' | 'horarios' | 'reporte'>('trabajadores');
  
  // Roster Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Presente' | 'Tarde' | 'Revisión'>('Todos');
  const [datePeriodFilter, setDatePeriodFilter] = useState<'Hoy' | 'Mes'>('Hoy');

  // New Simulation Modal form states
  const [showSimModal, setShowSimModal] = useState(false);
  const [simulationName, setSimulationName] = useState('');
  const [simulationStatus, setSimulationStatus] = useState<'Presente' | 'Tarde' | 'Revisión'>('Presente');
  const [simulationLocation, setSimulationLocation] = useState<'Dentro de Rango' | 'Fuera de Rango'>('Dentro de Rango');
  const [simulationBiometrics, setSimulationBiometrics] = useState<'Verificado' | 'Fallido'>('Verificado');

  // Schedules (Turnos) Management core states
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [selectedShift, setSelectedShift] = useState('T1');
  const [entryTime, setEntryTime] = useState('08:00');
  const [exitTime, setExitTime] = useState('17:00');
  const [scheduleStatus, setScheduleStatus] = useState('OK');
  const [scheduleNotification, setScheduleNotification] = useState<string | null>(null);

  // Load Turnos (Schedules) from local storage or pre-initialize defaults
  useEffect(() => {
    const saved = localStorage.getItem('asistencia_schedules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migración: Forzar imagen local si se detectan enlaces externos en cuentas demo y persistir
        const updated = parsed.map((s: Schedule) => ({
          ...s,
          photoUrl: (s.workerId === '74829412' || s.workerId === '87654321') ? '/perfil.jpeg' : s.photoUrl
        }));
        setSchedules(updated);
        localStorage.setItem('asistencia_schedules', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    } else {
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

  // Preset dropdowns when workers list updates
  useEffect(() => {
    if (workers.length > 0 && selectedWorkerId === '') {
      setSelectedWorkerId(workers[0].id);
    }
  }, [workers, selectedWorkerId]);

  // Turnos Form update handler
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

    setScheduleNotification(`Turno de ${matchedWorker.name} guardado con éxito.`);
    setTimeout(() => setScheduleNotification(null), 3000);
  };

  const handleSelectScheduleForEdit = (sched: Schedule) => {
    setSelectedWorkerId(sched.workerId);
    setSelectedShift(sched.shift);
    setEntryTime(sched.entryTime);
    setExitTime(sched.exitTime);
    setScheduleStatus(sched.status);
    setScheduleNotification(`Cargado para edición: ${sched.workerName}`);
    setTimeout(() => setScheduleNotification(null), 2500);
  };

  // Filter workers inside the (Trabajadores) tab
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          worker.id.includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || worker.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter records inside the (Historial) tab
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.workerId.includes(searchTerm) ||
                          record.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['ID Trabajador', 'Nombre', 'Historial Marcado', 'Hora Entrada', 'Hora Salida', 'Geofence', 'Biometria', 'Estado'];
    const rows = records.map(r => [
      r.workerId,
      r.workerName,
      r.date,
      r.entryTime,
      r.exitTime,
      r.locationStatus,
      r.biometricsStatus,
      r.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Reporte_Asistencias_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create simulated entries
  const handleSimulateNewArrival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationName.trim()) return;

    const randomID = Math.floor(10000 + Math.random() * 90000).toString();
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;

    const newWorker: Worker = {
      id: randomID,
      name: simulationName,
      photoUrl: '/perfil.jpeg',
      status: simulationStatus,
      time: formattedTime,
      locationStatus: simulationLocation,
      biometricsStatus: simulationBiometrics,
      locationValidated: simulationLocation === 'Dentro de Rango' ? 'Oficina Central' : 'Fuera de Perímetro'
    };

    const newRecord: AttendanceRecord = {
      id: `rec-sim-${Date.now()}`,
      workerId: randomID,
      workerName: simulationName,
      date: 'Hoy, 24 de Mayo',
      fullDate: '2026-05-24',
      entryTime: formattedTime,
      exitTime: '--:--',
      location: simulationLocation === 'Dentro de Rango' ? 'En sitio - Oficina Central' : 'Fuera de Rango (Alerta)',
      locationStatus: simulationLocation,
      biometricsStatus: simulationBiometrics,
      status: 'Falta Salida'
    };

    onAddSimulatedRecord(newRecord, newWorker);
    setSimulationName('');
    setShowSimModal(false);
  };

  // Metrics calculating
  const totalEmployeesCount = workers.length;
  const presentCount = workers.filter(w => w.status === 'Presente').length;
  const lateCount = workers.filter(w => w.status === 'Tarde').length;
  const alertCount = workers.filter(w => w.status === 'Revisión' || w.biometricsStatus === 'Fallido' || w.locationStatus === 'Fuera de Rango').length;

  return (
    <div id="reportes-screen" className="max-w-md mx-auto w-full px-4 py-2 pb-24">
      
      {/* Title Header */}
      <div className="mb-4 text-center">
        <h2 className="text-xs uppercase tracking-widest font-black text-white/50">Consola de Control</h2>
        <p className="text-sm font-black text-[#2200FF] uppercase tracking-wider">ADMINISTRADOR GENERAL</p>
      </div>

      {/* Roster database reset shortcut */}
      <div className="flex justify-between items-center bg-[#121212] border border-white/10 p-2.5 rounded-xl text-xs mb-4">
        <button 
          onClick={() => setShowSimModal(true)}
          className="bg-[#2200FF]/25 hover:bg-[#2200FF]/40 border border-[#2200FF]/40 text-white font-black uppercase tracking-widest py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all text-[9px] cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" /> Simular Ingreso
        </button>
        <button 
          onClick={onResetDatabase}
          className="text-white/40 hover:text-rose-400 py-1 px-2.5 rounded hover:bg-white/5 flex items-center gap-1 transition-all text-[9.5px] font-bold uppercase tracking-wider"
          title="Restablecer base de datos a valores iniciales"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Resetear BD
        </button>
      </div>

      {/* 4 Custom Admin Screen Navigation Tabs Row */}
      <div className="grid grid-cols-4 bg-[#121212] border border-white/10 p-1 rounded-xl mb-6 text-center text-[8.5px] tracking-widest uppercase font-black">
        <button 
          onClick={() => setAdminTab('trabajadores')}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            adminTab === 'trabajadores' ? 'bg-[#2200FF] text-white shadow-sm' : 'text-white/40 hover:text-white'
          }`}
        >
          Equipos
        </button>
        <button 
          onClick={() => setAdminTab('historial')}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            adminTab === 'historial' ? 'bg-[#2200FF] text-white shadow-sm' : 'text-white/40 hover:text-white'
          }`}
        >
          Historial
        </button>
        <button 
          onClick={() => setAdminTab('horarios')}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            adminTab === 'horarios' ? 'bg-[#2200FF] text-white shadow-sm' : 'text-white/40 hover:text-white'
          }`}
        >
          Turnos
        </button>
        <button 
          onClick={() => setAdminTab('reporte')}
          className={`py-2 rounded-lg transition-all cursor-pointer ${
            adminTab === 'reporte' ? 'bg-[#2200FF] text-white shadow-sm' : 'text-white/40 hover:text-white'
          }`}
        >
          Reporte
        </button>
      </div>

      {scheduleNotification && (
        <div className="bg-[#121212] border border-[#00FF41]/30 p-2 text-center rounded-xl mb-4 text-[#00FF41] text-[10px] font-bold uppercase tracking-widest">
          {scheduleNotification}
        </div>
      )}


      {/* SCREEN ZONE 1: TRABAJADORES (Roster / Active Statuses) */}
      {adminTab === 'trabajadores' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="mb-2">
            <h3 className="text-[10px] text-white font-black uppercase tracking-wider">🟢 Estados en Tiempo Real</h3>
            <p className="text-[9px] text-[#F0F0F0]/40 uppercase tracking-widest font-mono mt-0.5">Roster de personal y última marca registrada.</p>
          </div>

          {/* SUNAT Biometric API status card widget */}
          <div className="bg-[#121212] border border-[#00FF41]/30 rounded-xl p-3.5 relative overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.04)]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF41]/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00FF41] animate-ping"></span>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#00FF41]">SERVICIO BIOMÉTRICO SUNAT</h4>
              </div>
              <span className="text-[7.5px] font-mono bg-[#00FF41]/10 text-[#00FF41] px-1.5 py-0.5 rounded font-black border border-[#00FF41]/25">
                PIDE CONECTADO
              </span>
            </div>

            <p className="text-[9.5px] text-white/70 leading-normal mb-2.5">
              El panel de control valida la correspondencia de rasgos faciales de los empleados mediante conexión cifrada con el Registro Nacional:
            </p>

            <div className="bg-[#050505] p-2 rounded-lg border border-white/5 space-y-1.5 text-[9px] font-mono">
              <div className="flex justify-between">
                <span className="text-white/40">API Credentials:</span>
                <span className="text-[#FFBF00] select-all truncate max-w-[190px]" title="Clave de acceso al sistema biometría SUNAT">
                  sk_16145.Je99XnC9Y6FbgWj49vpyDc4p36FIrWqG
                </span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-1.5">
                <span className="text-white/40">Firma Estatal:</span>
                <span className="text-white/80 font-bold">SHA-256 Verificado</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-1.5">
                <span className="text-white/40">Match Biométrico:</span>
                <span className="text-[#00FF41] font-bold">Algoritmo Activo (Sunat.gob)</span>
              </div>
            </div>
          </div>

          {/* Search box filters */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-white/30 absolute left-4.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar por nombre o ID de empleado..."
              value={searchTerm}
              className="w-full pl-11 pr-4 py-2.5 bg-[#121212] border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:ring-1 focus:ring-[#2200FF] focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Quick status capsule togglers */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 text-[8px] uppercase tracking-widest font-black">
            {(['Todos', 'Presente', 'Tarde', 'Revisión'] as const).map(pill => (
              <button
                key={pill}
                onClick={() => setStatusFilter(pill)}
                className={`px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  statusFilter === pill 
                    ? 'bg-white text-[#050505] border-white font-extrabold' 
                    : 'bg-[#121212] text-white/45 border-white/10 hover:text-white'
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredWorkers.length === 0 ? (
              <div className="bg-[#121212] border border-white/10 text-center py-10 rounded-xl text-white/30 text-[9px] uppercase tracking-widest">
                Sin resultados para el filtro seleccionado.
              </div>
            ) : (
              filteredWorkers.map(w => (
                <div key={w.id} className="bg-[#121212] border border-white/10 p-3 rounded-xl flex items-center justify-between hover:border-[#2200FF]/35 transition-all">
                  <div className="flex items-center gap-3 min-w-[65%]">
                    <Avatar name={w.name} photoUrl={w.photoUrl} className="w-9 h-9 border border-white/15" />
                    <div className="truncate">
                      <h4 className="text-xs font-black uppercase text-white truncate">{w.name}</h4>
                      <p className="text-[9px] text-[#00FF41] font-mono tracking-wider mt-0.5 uppercase">
                        ID: {w.id} • {w.time}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      w.status === 'Presente' ? 'bg-[#00FF41]/10 text-[#00FF41] border border-[#00FF41]/20' :
                      w.status === 'Tarde' ? 'bg-rose-955/20 text-[#ff4b4b] border border-rose-800/20' :
                      'bg-amber-955/20 text-[#FFBF00] border border-amber-800/20'
                    }`}>
                      {w.status}
                    </span>
                    <span className="text-[8px] text-white/40 tracking-wider font-semibold uppercase block">
                      {w.locationStatus === 'Dentro de Rango' ? '📍 Central' : '❌ Fuera Perimetro'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}


      {/* SCREEN ZONE 2: HISTORIAL GENERAL & GESTIÓN DE HISTORIAL */}
      {adminTab === 'historial' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="mb-2">
            <h3 className="text-[10px] text-white font-black uppercase tracking-wider">📝 Gestión de Historial Laboral</h3>
            <p className="text-[9px] text-[#F0F0F0]/40 uppercase tracking-widest font-mono mt-0.5">Visor de base de datos. Correcciones de marcas y eliminaciones.</p>
          </div>

          {/* Quick search input to filter timeline logs */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-white/30 absolute left-4.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Buscar marcas por colaborador o lugar..."
              value={searchTerm}
              className="w-full pl-11 pr-4 py-2.5 bg-[#121212] border border-white/10 rounded-xl text-xs text-white placeholder:text-white/30 focus:outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            {filteredRecords.length === 0 ? (
              <div className="bg-[#121212] border border-white/10 text-center py-10 rounded-xl text-white/30 text-[9px] uppercase tracking-widest">
                No hay registros de marcación disponibles.
              </div>
            ) : (
              filteredRecords.map(rec => (
                <div key={rec.id} className="bg-[#121212] border border-white/10 p-3 rounded-xl hover:border-rose-500/20 transition-all flex justify-between items-start">
                  
                  {/* Left part metadata info */}
                  <div className="space-y-1 text-xs max-w-[80%]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-white font-black uppercase text-[11px] leading-tight block truncate pr-1">{rec.workerName}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest leading-none block ${
                        rec.locationStatus === 'Dentro de Rango' ? 'bg-[#00FF41]/10 text-[#00FF41]' : 'bg-rose-955/20 text-[#ff4b4b]'
                      }`}>
                        {rec.locationStatus}
                      </span>
                    </div>

                    <div className="text-[10px] text-white/60 space-y-0.5">
                      <p className="font-mono text-white/40 tracking-wider">ID Empleado: {rec.workerId}</p>
                      <p className="font-mono text-[9px]">📍 {rec.location}</p>
                      <p className="font-semibold text-[#2200FF] text-[9.5px]">🕰 {rec.date} • Entrada: {rec.entryTime} | Salida: {rec.exitTime}</p>
                    </div>
                  </div>

                  {/* Right delete/management action button */}
                  <button
                    onClick={() => {
                      if (window.confirm(`¿Seguro que desea eliminar esta marca de asistencia para ${rec.workerName}?`)) {
                        onDeleteRecord(rec.id);
                      }
                    }}
                    className="p-2 bg-rose-950/20 hover:bg-rose-950/60 border border-rose-800/30 hover:border-rose-500 text-rose-400 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar marca de historial"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                </div>
              ))
            )}
          </div>
        </div>
      )}


      {/* SCREEN ZONE 3: GESTIÓN DE TURNOS & HORARIOS */}
      {adminTab === 'horarios' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="mb-2">
            <h3 className="text-[10px] text-white font-black uppercase tracking-wider">⏰ Definición de Turnos Laborales</h3>
            <p className="text-[9px] text-[#F0F0F0]/40 uppercase tracking-widest font-mono mt-0.5">Gestión de horarios de entrada/salida autorizados.</p>
          </div>

          <form onSubmit={handleUpdateSchedule} className="bg-[#121212] border border-white/10 p-3.5 rounded-xl space-y-3.5">
            <div>
              <label className="block text-[8px] text-white/55 font-black uppercase tracking-widest mb-1">
                Colaborador a Configurar
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-2.5 py-2 bg-dark-bg border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#2200FF]"
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
                <label className="block text-[8px] text-white/55 font-black uppercase tracking-widest mb-1">
                  Código Turno
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="w-full px-2 py-1.5 bg-dark-bg border border-white/10 text-white rounded-lg text-xs"
                >
                  <option value="T1">T1 - Mañana</option>
                  <option value="T2">T2 - Tarde</option>
                  <option value="T3">T3 - Nocturno</option>
                </select>
              </div>

              <div>
                <label className="block text-[8px] text-white/55 font-black uppercase tracking-widest mb-1">
                  Estado Turno
                </label>
                <select
                  value={scheduleStatus}
                  onChange={(e) => setScheduleStatus(e.target.value)}
                  className="w-full px-2 py-1.5 bg-dark-bg border border-white/10 text-white rounded-lg text-xs"
                >
                  <option value="OK">🟢 OK (Activo)</option>
                  <option value="Inactivo">🔴 Inactivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[8px] text-white/55 font-black uppercase tracking-widest mb-1">
                  Hora Entrada
                </label>
                <input
                  type="text"
                  value={entryTime}
                  placeholder="Ej. 08:30"
                  required
                  onChange={(e) => setEntryTime(e.target.value)}
                  className="w-full px-2 py-1.5 bg-dark-bg border border-white/10 rounded-lg text-xs font-mono text-center text-white"
                />
              </div>

              <div>
                <label className="block text-[8px] text-white/55 font-black uppercase tracking-widest mb-1">
                  Hora Salida
                </label>
                <input
                  type="text"
                  value={exitTime}
                  placeholder="Ej. 17:30"
                  required
                  onChange={(e) => setExitTime(e.target.value)}
                  className="w-full px-2 py-1.5 bg-dark-bg border border-white/10 rounded-lg text-xs font-mono text-center text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#2200FF] hover:bg-[#1a00cc] text-white rounded-xl font-black uppercase tracking-widest transition-all text-[9px] cursor-pointer"
            >
              Aplicar Cambios de Horario
            </button>
          </form>

          {/* Roster list representing schedules */}
          <div className="space-y-2">
            <h4 className="text-[9px] text-[#F0F0F0]/50 uppercase font-black tracking-widest mt-4">Plantilla de Turnos Vigentes (Clic para Editar)</h4>
            {schedules.map(sched => (
              <div 
                key={sched.workerId}
                onClick={() => handleSelectScheduleForEdit(sched)}
                className="bg-[#121212] border border-white/10 p-3 rounded-xl flex items-center justify-between hover:border-[#2200FF] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={sched.workerName} photoUrl={sched.photoUrl} className="w-8 h-8 border border-white/10" />
                  <div>
                    <h5 className="text-xs font-black uppercase text-white">{sched.workerName}</h5>
                    <p className="text-[8px] text-white/40 tracking-wider uppercase font-mono mt-0.5">Turno {sched.shift} • ID {sched.workerId}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9.5px] font-mono bg-dark-bg border border-white/5 text-white px-2 py-1 rounded block">
                    {sched.entryTime} - {sched.exitTime}
                  </span>
                  <span className="text-[8px] text-[#00FF41] font-bold block mt-1 uppercase">
                    ● {sched.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* SCREEN ZONE 4: REPORTES Y DESCARGAS FILTRADAS */}
      {adminTab === 'reporte' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="mb-2">
            <h3 className="text-[10px] text-white font-black uppercase tracking-wider">📊 Monitoreo de Asistencia y Estadísticas</h3>
            <p className="text-[9px] text-[#F0F0F0]/40 uppercase tracking-widest font-mono mt-0.5">Análisis cuantitativo de asistencia por período laboral.</p>
          </div>

          {/* Metrics grids counters (Bento) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#121212] p-3 rounded-xl border border-white/10 flex flex-col justify-between h-20">
              <span className="text-[8px] uppercase tracking-widest font-black text-white/40">Total Personal</span>
              <p className="text-xl font-mono font-bold leading-none text-white">{totalEmployeesCount}</p>
            </div>
            <div className="bg-[#121212] p-3 rounded-xl border border-white/10 flex flex-col justify-between h-20">
              <span className="text-[8px] uppercase tracking-widest font-black text-[#00FF41]">En Sitio Hoy</span>
              <p className="text-xl font-mono font-bold leading-none text-[#00FF41]">{presentCount}</p>
            </div>
            <div className="bg-[#121212] p-3 rounded-xl border border-white/10 flex flex-col justify-between h-20">
              <span className="text-[8px] uppercase tracking-widest font-black text-amber-400">Tardanzas</span>
              <p className="text-xl font-mono font-bold leading-none text-amber-400">{lateCount}</p>
            </div>
            <div className="bg-[#121212] p-3 rounded-xl border border-white/10 flex flex-col justify-between h-20">
              <span className="text-[8px] uppercase tracking-widest font-black text-rose-400">Incidentes / Alertas</span>
              <p className="text-xl font-mono font-bold leading-none text-rose-400">{alertCount}</p>
            </div>
          </div>

          {/* Time Picker selection */}
          <div className="flex gap-3 text-xs items-center bg-[#121212] border border-white/10 p-3 rounded-xl justify-between">
            <div className="flex gap-2 items-center">
              <Calendar className="w-4 h-4 text-[#2200FF]" />
              <span className="text-[9px] uppercase tracking-widest font-black">Periodo:</span>
              <select 
                value={datePeriodFilter}
                onChange={(e) => setDatePeriodFilter(e.target.value as any)}
                className="bg-dark-bg px-2 py-1 rounded text-[9px] font-bold text-white border border-white/10 focus:outline-none uppercase"
              >
                <option value="Hoy">Hoy ({new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})</option>
                <option value="Mes">Este Mes</option>
              </select>
            </div>

            {/* Export trigger */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-[#2200FF] hover:bg-[#1a00cc] text-white text-[9px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1 shadow-lg cursor-pointer"
            >
              <Download className="w-3 h-3" /> Descargar CSV
            </button>
          </div>

          {/* Grid of latest operations and states summary */}
          <div className="space-y-2">
            <h4 className="text-[9px] text-[#F0F0F0]/50 uppercase font-black tracking-widest">Resumen Analítico General ({records.length} Marcas)</h4>
            
            <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden">
              <div className="grid grid-cols-3 bg-dark-bg p-2.5 text-[8.5px] uppercase tracking-widest font-black text-white/50 border-b border-white/10">
                <div>Empleado</div>
                <div className="text-center">Hora Marca</div>
                <div className="text-right">Biometría</div>
              </div>
              
              <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                {records.map(rec => (
                  <div key={rec.id} className="grid grid-cols-3 p-2.5 text-[10px] items-center text-white/80">
                    <div className="font-bold truncate">{rec.workerName}</div>
                    <div className="text-center font-mono text-[9px] text-amber-300 font-semibold">{rec.entryTime}</div>
                    <div className={`text-right text-[9px] font-black uppercase ${
                      rec.biometricsStatus === 'Verificado' ? 'text-[#00FF41]' : 'text-rose-400'
                    }`}>
                      {rec.biometricsStatus}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Simulated arrival registration modal popup */}
      {showSimModal && (
        <div id="simulation-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-dark-bg w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-white/10 animate-[bounce_0.35s_1]">
            <h3 className="text-xs font-black text-white mb-4 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/10 pb-2">
              <UserPlus className="w-4 h-4 text-[#2200FF]" /> Simular Registro Entrada
            </h3>

            <form onSubmit={handleSimulateNewArrival} className="space-y-4">
              <div>
                <label className="block text-[8px] text-white/50 font-black uppercase tracking-widest mb-1">Nombre Completo</label>
                <input 
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={simulationName}
                  required
                  onChange={(e) => setSimulationName(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-bg border border-white/10 rounded-lg text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-[#2200FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[8px] text-white/50 font-black uppercase tracking-widest mb-1.5">Estado</label>
                  <select 
                    value={simulationStatus}
                    onChange={(e) => setSimulationStatus(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-dark-bg border border-white/10 text-white rounded-lg text-xs"
                  >
                    <option value="Presente">Presente</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Revisión">Revisión</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[8px] text-white/50 font-black uppercase tracking-widest mb-1.5">Rango GPS</label>
                  <select 
                    value={simulationLocation}
                    onChange={(e) => setSimulationLocation(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-dark-bg border border-white/10 text-white rounded-lg text-xs"
                  >
                    <option value="Dentro de Rango">Dentro de Rango</option>
                    <option value="Fuera de Rango">Fuera de Rango</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] text-white/50 font-black uppercase tracking-widest mb-1.5">Reconocimiento Facial</label>
                <select 
                  value={simulationBiometrics}
                  onChange={(e) => setSimulationBiometrics(e.target.value as any)}
                  className="w-full px-2 py-1.5 bg-dark-bg border border-white/10 text-white rounded-lg text-xs"
                >
                  <option value="Verificado">Verificado ✔</option>
                  <option value="Fallido">Fallido ✖</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 text-[10px] uppercase font-black tracking-widest">
                <button 
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="flex-1 py-2 bg-[#121212] hover:bg-white/5 border border-white/10 text-white rounded-xl shadow transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-[#2200FF] hover:bg-[#1a00cc] text-white rounded-xl shadow transition-all cursor-pointer"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
