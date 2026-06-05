/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, User, Key, ArrowRight, CornerDownRight, Check, ShieldCheck } from 'lucide-react';
import { Worker } from '../types';
import { INITIAL_WORKERS } from '../data';

interface LoginScreenProps {
  workers: Worker[];
  onLoginSuccess: (user: Worker, role: 'Empleado' | 'Administrador') => void;
}

export default function LoginScreen({ workers, onLoginSuccess }: LoginScreenProps) {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Merge database workers with INITIAL_WORKERS to handle fallback or stale localStorage structures gracefully
  const validIds = INITIAL_WORKERS.map(iw => iw.id);
  const activeWorkersList = workers.filter(w => validIds.includes(w.id));
  INITIAL_WORKERS.forEach(iw => {
    const exists = activeWorkersList.find(w => w.id === iw.id);
    if (!exists) {
      activeWorkersList.push({ ...iw, photoUrl: '/perfil.jpeg' });
    } else {
      // Overwrite/sync credentials against stale stored profiles
      exists.dni = iw.dni;
      exists.password = iw.password;
      exists.role = iw.role;
      exists.name = iw.name;
      exists.photoUrl = '/perfil.jpeg';
    }
  });

  // Helper list of demo users for quick validation
  const demoUsers = activeWorkersList.map(w => ({
    name: w.name,
    dni: w.dni || '',
    password: w.password || '',
    role: w.role || 'Empleado',
    photoUrl: '/perfil.jpeg'
  }));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (dni.length !== 8) {
      setErrorMsg('El DNI debe tener exactamente 8 dígitos.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor, ingrese su contraseña.');
      return;
    }

    setIsLoading(true);

    // Simulate database lookup delay
    setTimeout(() => {
      const foundUser = activeWorkersList.find(w => w.dni === dni);

      if (!foundUser) {
        setIsLoading(false);
        setErrorMsg('El DNI ingresado no está registrado en el sistema.');
        return;
      }

      if (foundUser.password !== password) {
        setIsLoading(false);
        setErrorMsg('Contraseña incorrecta. Inténtelo nuevamente.');
        return;
      }

      // Successful login
      setIsLoading(false);
      onLoginSuccess(foundUser, foundUser.role || 'Empleado');
    }, 1200);
  };

  const handleQuickFill = (demoDni: string, demoPass: string) => {
    setDni(demoDni);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  return (
    <div id="login-container" className="flex flex-col gap-6 px-5 py-4 max-w-sm mx-auto w-full animate-fadeIn min-h-[80vh] justify-center">
      
      {/* Branding and Title */}
      <div className="text-center flex flex-col items-center gap-2.5">
        <div className="w-16 h-16 rounded-2xl bg-[#2200FF]/10 border border-[#2200FF]/30 flex items-center justify-center shadow-[0_0_20px_rgba(34,0,255,0.15)] animate-pulse">
          <ShieldCheck className="w-9 h-9 text-[#2200FF]" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-widest text-white uppercase">
            AETHER<span className="text-[#2200FF]">.</span>SECURITY
          </h2>
          <p className="text-[10px] text-white/50 tracking-wide uppercase mt-1">
            Sistema de Acceso Biométrico y Reniec
          </p>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleLogin} className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
        {/* Card Background subtle light */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2200FF] rounded-full blur-[60px] opacity-10 pointer-events-none"></div>

        <h3 className="text-[10px] font-black tracking-widest uppercase text-white/60 border-b border-white/5 pb-2">
          Iniciar Sesión
        </h3>

        {/* DNI Input */}
        <div className="space-y-1.5">
          <label className="block text-[8.5px] uppercase tracking-wider text-white/45 font-black">
            N° Documento Nacional de Identidad (DNI)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/30">
              <User className="w-4 h-4" />
            </span>
            <input 
              type="text" 
              maxLength={8}
              value={dni}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setDni(val);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Ingrese su DNI de 8 dígitos"
              disabled={isLoading}
            className="w-full bg-dark-bg border border-white/10 rounded-xl pl-10 pr-3.5 py-3 text-xs font-mono font-bold text-white tracking-widest focus:border-[#2200FF] focus:ring-1 focus:ring-[#2200FF] focus:outline-none placeholder-white/20"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <label className="block text-[8.5px] uppercase tracking-wider text-white/45 font-black">
            Contraseña Corporativa
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/30">
              <Lock className="w-4 h-4" />
            </span>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Ingrese su contraseña"
              disabled={isLoading}
            className="w-full bg-dark-bg border border-white/10 rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:border-[#2200FF] focus:ring-1 focus:ring-[#2200FF] focus:outline-none placeholder-white/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/30 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Feedback message display */}
        {errorMsg && (
          <div className="text-[9px] uppercase font-bold text-rose-455 bg-rose-950/25 border border-rose-900/30 p-2.5 rounded-xl text-rose-400 flex items-start gap-1 w-full animate-fadeIn">
            <span className="font-extrabold flex-shrink-0">⚠️ ERROR:</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-[#2200FF] hover:bg-[#1a00cc] disabled:bg-[#1a1a24] disabled:text-white/25 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#2200FF]/15 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Cheat Sheet Sandbox credentials widget */}
      <div className="bg-[#121212]/70 border border-white/5 rounded-2xl p-4.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-[#FFBF00]" />
            <span className="text-[9px] uppercase tracking-widest font-black text-white/60">
              Cuentas Demo Habilitadas
            </span>
          </div>
          <span className="text-[7.5px] font-mono px-1.5 py-0.5 rounded bg-[#00FF41]/10 text-[#00FF41] font-black uppercase">
            Autocompletar
          </span>
        </div>

        <p className="text-[9px] text-white/40 leading-normal">
          Para facilitar las pruebas de roles de Empleados y Administradores, presione cualquier tarjeta para ingresar los datos:
        </p>

        <div className="grid grid-cols-1 gap-2">
          {demoUsers.map((user) => {
            const isAdmin = user.role === 'Administrador';
            const isActive = dni === user.dni && password === user.password;
            
            return (
              <button
                key={user.dni}
                type="button"
                onClick={() => handleQuickFill(user.dni, user.password)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all text-[11px] flex items-center justify-between group ${
                  isActive 
                    ? 'bg-[#2200FF]/10 border-[#2200FF]/40 text-white' 
                    : 'bg-dark-bg/40 border-white/5 text-white/70 hover:bg-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <img 
                    src={user.photoUrl} 
                    alt={user.name} 
                    className="w-5 h-5 rounded-full object-cover border border-white/10 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="font-bold truncate text-[10px] text-white leading-tight">{user.name}</p>
                    <p className="text-[8.5px] font-mono text-white/40 leading-none mt-1">
                      DNI: <span className="text-white/75">{user.dni}</span> | Clave: <span className="text-white/75">{user.password}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className={`text-[7px] font-black uppercase px-1 py-0.5 rounded ${
                    isAdmin 
                      ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30' 
                      : 'bg-blue-950/40 text-blue-400 border border-blue-900/30'
                  }`}>
                    {isAdmin ? 'Admin' : 'Empleado'}
                  </span>
                  
                  {isActive && (
                    <span className="p-0.5 bg-[#00FF41]/10 rounded-full">
                      <Check className="w-3 h-3 text-[#00FF41]" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
