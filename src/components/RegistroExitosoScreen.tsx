/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, Shield, Calendar, Clock, MapPin, ArrowRight, Home, Check } from 'lucide-react';

interface RegistroExitosoScreenProps {
  details: {
    type: 'Entrada' | 'Salida';
    time: string;
    location: string;
  };
  onGoToHistory: () => void;
  onGoBackHome: () => void;
}

export default function RegistroExitosoScreen({ details, onGoToHistory, onGoBackHome }: RegistroExitosoScreenProps) {
  // Let's scroll to the top when this screen loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div id="registro-exitoso-screen" className="flex flex-col items-center justify-center max-w-md mx-auto w-full px-4 py-6 relative overflow-hidden">
      {/* Decorative mesh background overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle,#00FF41_1px,transparent_1px)] bg-size-[20px_20px] opacity-5 -z-10 w-full h-full"></div>
      
      {/* Main Container */}
      <div className="w-full flex flex-col items-center text-center">
        {/* Animated Check Container */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-success rounded-full opacity-10 animate-[ping_2s_infinite]"></div>
          <div className="w-24 h-24 rounded-full bg-[#121212] flex items-center justify-center relative z-10 border-4 border-success/40 shadow-[0_0_20px_rgba(0,255,65,0.25)]">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
        </div>

        {/* Messaging headings */}
        <h2 className="text-xl font-black text-[#F0F0F0] tracking-tighter uppercase mb-2">
          ¡REGISTRO CONFIRMADO!
        </h2>
        <p className="text-white/50 text-xs max-w-75 mb-6 uppercase tracking-wider font-semibold">
          Identidad autenticada correctamente mediante vectores biométricos.
        </p>

        {/* Details Card (Asymmetric UI Panel layout) */}
        <div className="w-full bg-[#121212] rounded-xl border border-white/10 p-5 shadow-sm text-left relative overflow-hidden mb-6">
          <div className="absolute top-4 right-4">
            <Shield className="w-14 h-14 text-success/10 fill-success/5 rotate-12" />
          </div>

          <div className="space-y-4 relative z-10">
            {/* Record Type Row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center border border-white/10">
                <Check className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] text-[#F0F0F0]/50 font-bold uppercase tracking-widest">Tipo de Registro</p>
                <p className="text-xs font-black text-white uppercase tracking-wider mt-0.5">{details.type}</p>
              </div>
            </div>

            {/* Simulated Time Row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center border border-white/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] text-[#F0F0F0]/50 font-bold uppercase tracking-widest">Hora Marcada</p>
                <p className="text-xs font-black font-mono text-white tracking-wider mt-0.5">{details.time}</p>
              </div>
            </div>

            {/* Location Row */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-dark-bg flex items-center justify-center border border-white/10">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[9px] text-[#F0F0F0]/50 font-bold uppercase tracking-widest">Ubicación</p>
                <p className="text-xs font-black text-white uppercase tracking-wider truncate max-w-55 mt-0.5">{details.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informative advice chip */}
        <div className="w-full bg-primary/5 border border-primary/20 p-3.5 rounded-lg mb-8">
          <p className="text-[10px] text-white/70 text-center leading-relaxed font-semibold uppercase tracking-wide">
            Sincronización segura completa. Has ingresado con éxito. Verifica la entrada en <strong className="text-white">Mi Historial</strong>.
          </p>
        </div>

        {/* Action Controls */}
        <div className="w-full flex flex-col gap-3">
          <button 
            onClick={onGoToHistory}
            className="w-full h-12 bg-primary hover:bg-[#1a00cc] text-white rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 shadow-xl border border-primary/30 active:scale-95 transition-all cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Ver Historial</span>
          </button>

          <button 
            onClick={onGoBackHome}
            className="w-full h-12 bg-[#121212] hover:bg-white/5 text-[#F0F0F0] rounded-xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
