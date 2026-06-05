/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Fingerprint, Clock, BarChart3, ShieldCheck, ChevronDown, User, AlertCircle, RefreshCw, Layers, LogOut } from 'lucide-react';
import { ScreenType, Worker, AttendanceRecord } from './types';
import {
  getStoredWorkers,
  saveStoredWorkers,
  getStoredRecords,
  saveStoredRecords,
  getStoredCurrentUser,
  saveStoredCurrentUser,
  INITIAL_WORKERS,
  INITIAL_RECORDS,
  TODAY_DATE
} from './data';
import MarcacionScreen from './components/MarcacionScreen';
import RegistroExitosoScreen from './components/RegistroExitosoScreen';
import HistorialScreen from './components/HistorialScreen';
import ReportesScreen from './components/ReportesScreen';
import HorariosScreen from './components/HorariosScreen';
import Avatar from './components/Avatar';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'Empleado' | 'Administrador'>('Empleado');
  const [activeScreen, setActiveScreen] = useState<ScreenType>('marcacion');
  const [currentUser, setCurrentUser] = useState<Worker>(INITIAL_WORKERS[0]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [registrySuccessDetails, setRegistrySuccessDetails] = useState<{
    type: 'Entrada' | 'Salida';
    time: string;
    location: string;
  } | null>(null);

  // Profile switch dropdown state
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  
  // Custom toast notification structure
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warn' } | null>(null);

  // Switch role helper
  const handleRoleChange = (role: 'Empleado' | 'Administrador') => {
    // Force Empleado for normal workers
    if (currentUser.id === '74829412' && role === 'Administrador') {
      triggerToast('Acceso Denegado: Rol Administrador restringido.', 'warn');
      return;
    }
    setUserRole(role);
    if (role === 'Empleado') {
      setActiveScreen('marcacion');
    } else {
      setActiveScreen('reportes');
    }
    triggerToast(`Cambiado al Portal de ${role}`, 'info');
  };

  // Initialize data on mount
  useEffect(() => {
    const loadedWorkers = getStoredWorkers();
    const loadedRecords = getStoredRecords();
    const loadedCurrentUser = getStoredCurrentUser();
    const wasLoggedIn = localStorage.getItem('asistencia_logged_in') === 'true';

    setWorkers(loadedWorkers);
    setRecords(loadedRecords);
    setCurrentUser(loadedCurrentUser);
    setIsLoggedIn(wasLoggedIn);

    // Force role restrictions on mount
    const activeUser = loadedWorkers.find(w => w.id === loadedCurrentUser.id) || loadedCurrentUser;
    const role = activeUser.role || (activeUser.id === '74829412' ? 'Empleado' : 'Administrador');
    setUserRole(role);

    if (role === 'Empleado') {
      setActiveScreen('marcacion');
    } else {
      setActiveScreen('reportes');
    }
  }, []);

  // Helper to show custom micro-notification toast
  const triggerToast = (message: string, type: 'success' | 'info' | 'warn' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Change current simulation profile
  const handleUserSwitch = (worker: Worker) => {
    setCurrentUser(worker);
    saveStoredCurrentUser(worker);
    setShowProfileSwitcher(false);
    
    // Auto-assign and restrict role based on who is selected
    const role = worker.role || (worker.id === '74829412' ? 'Empleado' : 'Administrador');
    setUserRole(role);
    if (role === 'Empleado') {
      setActiveScreen('marcacion');
      triggerToast(`Sesión: ${worker.name} (Empleado)`, 'info');
    } else {
      setActiveScreen('reportes');
      triggerToast(`Sesión: ${worker.name} (Administrador)`, 'info');
    }
  };

  // Reset database entirely
  const handleResetDatabase = () => {
    localStorage.removeItem('asistencia_workers');
    localStorage.removeItem('asistencia_records');
    localStorage.removeItem('asistencia_current_user');
    localStorage.removeItem('asistencia_logged_in');
    
    setWorkers(INITIAL_WORKERS);
    setRecords(INITIAL_RECORDS);
    setCurrentUser(INITIAL_WORKERS[0]);
    setIsLoggedIn(false);
    saveStoredWorkers(INITIAL_WORKERS);
    saveStoredRecords(INITIAL_RECORDS);
    saveStoredCurrentUser(INITIAL_WORKERS[0]);
    
    triggerToast('Base de datos restablecida a valores por defecto.', 'warn');
  };

  const handleLoginSuccess = (user: Worker, role: 'Empleado' | 'Administrador') => {
    setCurrentUser(user);
    saveStoredCurrentUser(user);
    setUserRole(role);
    setIsLoggedIn(true);
    localStorage.setItem('asistencia_logged_in', 'true');
    
    if (role === 'Empleado') {
      setActiveScreen('marcacion');
    } else {
      setActiveScreen('reportes');
    }
    triggerToast(`¡Bienvenido, ${user.name}! Sesión iniciada.`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('asistencia_logged_in');
    triggerToast('Sesión cerrada correctamente.', 'info');
  };

  // Record a successful attendance submission
  const handleRegisterSuccess = (details: {
    type: 'Entrada' | 'Salida';
    time: string;
    location: string;
  }) => {
    setRegistrySuccessDetails(details);
    
    // Create actual attendance record
    const newRecordId = `rec-${Date.now()}`;
    const newRecord: AttendanceRecord = {
      id: newRecordId,
      workerId: currentUser.id,
      workerName: currentUser.name,
      date: TODAY_DATE,
      fullDate: new Date().toISOString().split('T')[0],
      entryTime: details.type === 'Entrada' ? details.time : '08:00 AM', // Simulated fallback or matched
      exitTime: details.type === 'Salida' ? details.time : '--:--',
      location: details.location,
      locationStatus: details.location.includes('Fuera') ? 'Fuera de Rango' : 'Dentro de Rango',
      biometricsStatus: 'Verificado', // Biometrics verified during scanner
      status: details.type === 'Salida' ? 'Completado' : 'Falta Salida'
    };

    // Update records list
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    saveStoredRecords(updatedRecords);

    // Update worker status inside the organizational roster
    const updatedWorkers = workers.map(w => {
      if (w.id === currentUser.id) {
        return {
          ...w,
          status: details.type === 'Salida' ? 'Presente' as const : 'Presente' as const, // Or keep active
          time: details.time,
          locationStatus: details.location.includes('Fuera') ? 'Fuera de Rango' as const : 'Dentro de Rango' as const,
          biometricsStatus: 'Verificado' as const
        };
      }
      return w;
    });
    setWorkers(updatedWorkers);
    saveStoredWorkers(updatedWorkers);

    // Redirect to Registry Success Screen
    setActiveScreen('exitoso');
    triggerToast(`¡Registro de ${details.type} completado!`, 'success');
  };

  // Administrative Simulating triggered
  const handleAddSimulatedRecord = (newRecord: AttendanceRecord, newWorker: Worker) => {
    const updatedRecords = [newRecord, ...records];
    setRecords(updatedRecords);
    saveStoredRecords(updatedRecords);

    // Check if worker already exists, else append
    const workerExists = workers.some(w => w.id === newWorker.id);
    let updatedWorkers = [];
    if (workerExists) {
      updatedWorkers = workers.map(w => w.id === newWorker.id ? newWorker : w);
    } else {
      updatedWorkers = [...workers, newWorker];
    }
    setWorkers(updatedWorkers);
    saveStoredWorkers(updatedWorkers);

    triggerToast(`Llegada registrada: ${newWorker.name}`, 'success');
  };

  // Administrative Deletion of single record
  const handleDeleteRecord = (recordId: string) => {
    const updated = records.filter(r => r.id !== recordId);
    setRecords(updated);
    saveStoredRecords(updated);
    triggerToast('Registro de asistencia eliminado con éxito.', 'warn');
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-dark-bg text-[#F0F0F0] min-h-screen font-sans flex flex-col justify-center relative max-w-md mx-auto shadow-2xl border-x border-white/10 overflow-hidden">
        {/* Top right epic decoration blur from Design HTML */}
        <div className="absolute top-[-10%] right-[-10%] w-87.5 h-87.5 bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none z-0"></div>
        {/* Toast feedback notifications */}
        {toast && (
          <div 
            id="toast-notification" 
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-80 px-4 py-3 rounded-xl shadow-lg border text-xs flex gap-2 items-center animate-[bounce_0.5s_1] ${
              toast.type === 'success' 
                ? 'bg-[#121212] border-success/30 text-success shadow-success/10' 
                : toast.type === 'warn'
                ? 'bg-[#121212] border-warning/30 text-warning shadow-warning/10'
                : 'bg-[#121212] border-primary/30 text-[#F0F0F0] shadow-primary/15'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{toast.message}</span>
          </div>
        )}
        <main className="grow flex items-center justify-center py-4 z-10 relative">
          <LoginScreen workers={workers.length > 0 ? workers : INITIAL_WORKERS} onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  return (
    <div className="bg-dark-bg text-[#F0F0F0] min-h-screen font-sans flex flex-col relative max-w-md mx-auto shadow-2xl border-x border-white/10 overflow-hidden">
      {/* Top right epic decoration blur from Design HTML */}
      <div className="absolute top-[-10%] right-[-10%] w-87.5 h-87.5 bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none z-0"></div>
      
      {/* Toast feedback notifications */}
      {toast && (
        <div 
          id="toast-notification" 
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-80 px-4 py-3 rounded-xl shadow-lg border text-xs flex gap-2 items-center animate-[bounce_0.5s_1] ${
            toast.type === 'success' 
              ? 'bg-[#121212] border-success/30 text-success shadow-success/10' 
              : toast.type === 'warn'
              ? 'bg-[#121212] border-warning/30 text-warning shadow-warning/10'
              : 'bg-[#121212] border-primary/30 text-[#F0F0F0] shadow-primary/15'
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Top Application Header bar */}
      <header className="bg-dark-bg/90 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center px-4 h-16 border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h1 className="text-xs font-black tracking-tighter text-[#F0F0F0] uppercase">
            AETHER<span className="text-primary">.</span>
            {activeScreen === 'marcacion' && 'CONTROL'}
            {activeScreen === 'exitoso' && 'VERIFICACIÓN'}
            {activeScreen === 'historial' && 'HISTORIAL'}
            {activeScreen === 'reportes' && 'ADMIN'}
            {activeScreen === 'horarios' && 'HORARIOS'}
          </h1>
        </div>

        {/* Dynamic avatar switch option */}
        <div className="relative z-40">
          <button 
            onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/5 transition-colors focus:outline-none"
            title="Cambiar perfil de simulación"
          >
            <Avatar 
              name={currentUser.name} 
              photoUrl={currentUser.photoUrl} 
              className="w-8 h-8 rounded-full border border-white/20"
            />
            <ChevronDown className="w-3 h-3 text-[#F0F0F0]/60" />
          </button>

          {/* User selection list menu drop */}
          {showProfileSwitcher && (
            <div id="profile-switcher-menu" className="absolute right-0 mt-2 w-56 bg-[#121212] border border-white/10 rounded-xl shadow-2xl z-50 py-1.5 animate-fadeIn">
              <div className="px-3 py-1.5 border-b border-white/10 text-[9px] uppercase font-bold tracking-widest text-[#F0F0F0]/40">
                Seleccionar Hub Perfil
              </div>
              {INITIAL_WORKERS.map((worker) => (
                <button
                  key={worker.id}
                  onClick={() => handleUserSwitch(worker)}
                  className={`w-full text-left px-3 py-2.5 text-xs flex items-center gap-2.5 transition-colors ${
                    currentUser.id === worker.id ? 'bg-primary/25 font-bold text-white border-l-2 border-primary' : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Avatar name={worker.name} photoUrl={worker.photoUrl} className="w-6 h-6 rounded-full border border-white/10" />
                  <div className="truncate">
                    <p className="leading-tight">{worker.name}</p>
                    <p className="text-[9px] text-[#F0F0F0]/40 font-normal leading-tight mt-0.5">ID: {worker.id}</p>
                  </div>
                </button>
              ))}
              <div className="border-t border-white/10 pt-1 mt-1 px-2 flex flex-col gap-1">
                <button 
                  onClick={() => {
                    handleResetDatabase();
                    setShowProfileSwitcher(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[9px] uppercase tracking-wider text-rose-450 hover:bg-rose-950/20 rounded-lg flex items-center gap-1 font-bold text-rose-400"
                >
                  <RefreshCw className="w-3 h-3" /> Reiniciar base de datos
                </button>
                <button 
                  onClick={() => {
                    handleLogout();
                    setShowProfileSwitcher(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-[9px] uppercase tracking-wider hover:bg-amber-950/20 rounded-lg flex items-center gap-1 font-bold text-amber-400"
                >
                  <LogOut className="w-3 h-3" /> Cerrar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </header>



      {/* Main Screen Router layout body */}
      <main className="grow py-4 z-10 relative">
        {activeScreen === 'marcacion' && (
          <MarcacionScreen 
            currentUser={currentUser}
            onRegisterSuccess={handleRegisterSuccess}
            records={records}
          />
        )}

        {activeScreen === 'exitoso' && (
          <RegistroExitosoScreen 
            details={registrySuccessDetails || { type: 'Entrada', time: '08:05 AM', location: 'Sede Central' }}
            onGoToHistory={() => setActiveScreen('historial')}
            onGoBackHome={() => setActiveScreen('marcacion')}
          />
        )}

        {activeScreen === 'historial' && (
          <HistorialScreen 
            currentUser={currentUser}
            records={records}
          />
        )}

        {activeScreen === 'reportes' && (
          <ReportesScreen 
            workers={workers}
            records={records}
            onAddSimulatedRecord={handleAddSimulatedRecord}
            onResetDatabase={handleResetDatabase}
            onDeleteRecord={handleDeleteRecord}
          />
        )}

        {activeScreen === 'horarios' && (
          <HorariosScreen 
            workers={workers}
          />
        )}
      </main>

      {/* Persistent dynamic bottom navigation tray */}
      <nav className="sticky bottom-0 w-full z-40 bg-[#0c0c0e]/95 backdrop-blur-md border-t border-white/10 flex justify-around items-center px-4 h-20 shadow-2xl shrink-0">
        {userRole === 'Empleado' ? (
          <>
            {/* Marcación checking view */}
            <button 
              onClick={() => {
                if (activeScreen === 'exitoso') setActiveScreen('marcacion');
                else setActiveScreen('marcacion');
              }}
              className={`flex flex-col items-center justify-center transition-all px-6 py-2 rounded-xl border border-transparent cursor-pointer ${
                activeScreen === 'marcacion' || activeScreen === 'exitoso'
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(34,0,255,0.4)] font-black' 
                  : 'text-white/40 hover:text-[#F0F0F0] hover:bg-white/5'
              }`}
              title="Registro Biométrico de Asistencia"
            >
              <Fingerprint className="w-4 h-4 mb-1" />
              <span className="text-[9px] uppercase tracking-widest font-black">Marcación</span>
            </button>

            {/* Historial timeline view */}
            <button 
              onClick={() => setActiveScreen('historial')}
              className={`flex flex-col items-center justify-center transition-all px-6 py-2 rounded-xl border border-transparent cursor-pointer ${
                activeScreen === 'historial' 
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(34,0,255,0.4)] font-black' 
                  : 'text-white/40 hover:text-[#F0F0F0] hover:bg-white/5'
              }`}
              title="Mis registros personales"
            >
              <Clock className="w-4 h-4 mb-1" />
              <span className="text-[9px] uppercase tracking-widest font-black">Historial</span>
            </button>
          </>
        ) : (
          <>
            {/* Unified 4-zone Administrative Panel */}
            <button 
              onClick={() => setActiveScreen('reportes')}
              className={`flex-1 flex flex-col items-center justify-center transition-all py-2 rounded-xl border border-transparent cursor-pointer ${
                activeScreen === 'reportes' || activeScreen === 'horarios'
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(34,0,255,0.4)] font-black' 
                  : 'text-white/40 hover:text-[#F0F0F0] hover:bg-white/5'
              }`}
              title="Panel de Control Administrador"
            >
              <BarChart3 className="w-4 h-4 mb-1" />
              <span className="text-[9px] uppercase tracking-widest font-black">Panel Admin</span>
            </button>
          </>
        )}
      </nav>

    </div>
  );
}
