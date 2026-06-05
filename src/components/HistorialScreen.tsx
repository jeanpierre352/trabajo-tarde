/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle, Clock, MapPin, Home, HelpCircle, MessageSquare, Send, X, ShieldAlert } from 'lucide-react';
import { Worker, AttendanceRecord } from '../types';

interface HistorialScreenProps {
  currentUser: Worker;
  records: AttendanceRecord[];
}

export default function HistorialScreen({ currentUser, records }: HistorialScreenProps) {
  const [activeTab, setActiveTab] = useState<'semana' | 'mes' | 'personalizado'>('semana');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportMessage, setSupportMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: 'user' | 'agent'; text: string }>>([
    { sender: 'agent', text: 'Hola, soy tu Asistente de Soporte de Control de Asistencia. ¿Tienes algún problema con tu geolocalización, biometría o marcación de entrada/salida hoy?' }
  ]);

  // Filter records by currently logged-in worker
  const myRecords = records.filter(r => r.workerId === currentUser.id);

  // Filter based on active tab
  const getFilteredRecords = () => {
    switch (activeTab) {
      case 'semana':
        // Show is simulated
        return myRecords.slice(0, 4);
      case 'mes':
        // Add more mock records if they click monthly
        return [
          ...myRecords,
          {
            id: 'rec-prev-1',
            workerId: currentUser.id,
            workerName: currentUser.name,
            date: 'Lunes, 20 de Mayo',
            fullDate: '2026-05-20',
            entryTime: '08:00 AM',
            exitTime: '06:10 PM',
            location: 'En sitio - Sede Central',
            locationStatus: 'Dentro de Rango',
            biometricsStatus: 'Verificado',
            status: 'Completado'
          } as AttendanceRecord,
          {
            id: 'rec-prev-2',
            workerId: currentUser.id,
            workerName: currentUser.name,
            date: 'Viernes, 17 de Mayo',
            fullDate: '2026-05-17',
            entryTime: '08:14 AM',
            exitTime: '05:00 PM',
            location: 'Remoto - Teletrabajo',
            locationStatus: 'Dentro de Rango',
            biometricsStatus: 'Verificado',
            status: 'Completado'
          } as AttendanceRecord,
        ];
      case 'personalizado':
        return myRecords;
    }
  };

  const filtered = getFilteredRecords();

  // Dynamic values depending on user and tab selection
  const getStats = () => {
    if (activeTab === 'semana') {
      const attendances = filtered.filter(f => f.status === 'Completado').length;
      return {
        count: `${attendances} / 5`,
        hours: `${(attendances * 8.5).toFixed(1)}h`
      };
    } else if (activeTab === 'mes') {
      const attendances = filtered.length;
      return {
        count: `${attendances} / 20`,
        hours: `${(attendances * 8.2).toFixed(1)}h`
      };
    } else {
      return {
        count: '18 / 20',
        hours: '142.5h'
      };
    }
  };

  const stats = getStats();

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const userText = supportMessage;
    setChatLog(prev => [...prev, { sender: 'user', text: userText }]);
    setSupportMessage('');

    // Simulated Auto response
    setTimeout(() => {
      let replyText = 'Entendido. Un administrador del sistema revisará su marca de asistencia y actualizará la geolocalización de su perfil a la brevedad.';
      if (userText.toLowerCase().includes('fuera') || userText.toLowerCase().includes('rango')) {
        replyText = 'Si se encuentra fuera de rango, por favor asegúrese de estar conectado al Wi-Fi corporativo de la Oficina Central o póngase en contacto con su supervisor directo para autorizar una marca remota.';
      } else if (userText.toLowerCase().includes('fallo') || userText.toLowerCase().includes('biomet') || userText.toLowerCase().includes('rostro')) {
        replyText = 'Si su validación facial falla frecuentemente, intente pararse frente a fondo liso y retirar accesorios como gorras o anteojos de sol. También puede limpiar suavemente la cámara frontal de su dispositivo móvil.';
      }
      setChatLog(prev => [...prev, { sender: 'agent', text: replyText }]);
    }, 1000);
  };

  return (
    <div id="historial-screen" className="max-w-md mx-auto w-full px-4 py-4 pb-20">
      <h2 className="text-sm font-black text-[#F0F0F0] tracking-tighter uppercase mb-4">
        Historial de Asistencia
      </h2>

      {/* Tabs Filter Selectors */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        <button 
          onClick={() => setActiveTab('semana')}
          className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all text-center border ${
            activeTab === 'semana' 
              ? 'bg-[#2200FF] text-white border-[#2200FF] shadow-[0_0_15px_rgba(34,0,255,0.4)]' 
              : 'bg-[#121212] border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
          }`}
        >
          Esta semana
        </button>
        <button 
          onClick={() => setActiveTab('mes')}
          className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all text-center border ${
            activeTab === 'mes' 
              ? 'bg-[#2200FF] text-white border-[#2200FF] shadow-[0_0_15px_rgba(34,0,255,0.4)]' 
              : 'bg-[#121212] border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
          }`}
        >
          Este mes
        </button>
        <button 
          onClick={() => setActiveTab('personalizado')}
          className={`flex-1 min-w-[100px] px-3 py-2 rounded-xl text-[9px] uppercase tracking-widest font-black transition-all text-center border ${
            activeTab === 'personalizado' 
              ? 'bg-[#2200FF] text-white border-[#2200FF] shadow-[0_0_15px_rgba(34,0,255,0.4)]' 
              : 'bg-[#121212] border-white/10 text-white/50 hover:bg-white/5 hover:text-white'
          }`}
        >
          Personalizado
        </button>
      </div>

      {/* Stats Bento overview blocks */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Attendances Bento Cell */}
        <div className="bg-[#121212] rounded-xl p-4 flex flex-col justify-between h-32 border border-white/10 shadow-lg relative overflow-hidden">
          <CheckCircle className="w-5 h-5 text-[#00FF41] fill-[#00FF41]/10" />
          <div>
            <p className="text-[9px] text-[#00FF41] font-black tracking-widest uppercase opacity-90">Asistencias</p>
            <p className="text-xl font-black text-white font-mono mt-0.5">{stats.count}</p>
          </div>
        </div>

        {/* Total Hours Bento Cell */}
        <div className="bg-[#121212] rounded-xl p-4 flex flex-col justify-between h-32 border border-white/10 shadow-lg relative overflow-hidden">
          <Clock className="w-5 h-5 text-[#2200FF]" />
          <div>
            <p className="text-[9px] text-[#F0F0F0]/50 font-black tracking-widest uppercase opacity-90">Horas Totales</p>
            <p className="text-xl font-black text-[#2200FF] font-mono mt-0.5">{stats.hours}</p>
          </div>
        </div>
      </div>

      {/* Recents list group */}
      <section className="space-y-4">
        <h3 className="text-[9px] font-black text-white/40 uppercase tracking-widest px-1">
          Registros Recientes
        </h3>

        {filtered.length === 0 ? (
          <div className="bg-[#121212] border border-white/10 text-center py-8 rounded-xl text-white/40 text-[10px] uppercase font-black tracking-widest">
            No se encontraron marcas registradas en este período.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((record) => (
              <div 
                key={record.id}
                className="bg-[#121212] border border-white/10 hover:border-[#2200FF]/40 p-4 rounded-xl flex flex-col gap-3 hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-white tracking-wider">{record.date}</h4>
                    <div className="flex items-center gap-1.5 mt-1 text-white/60">
                      <MapPin className="w-3.5 h-3.5 text-[#2200FF]" />
                      <span className="text-[10px] font-semibold">{record.location}</span>
                    </div>
                  </div>
                  
                  <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    record.status === 'Completado'
                      ? 'bg-[#00FF41]/15 text-[#00FF41] border border-[#00FF41]/30'
                      : 'bg-[#FFBF00]/15 text-[#FFBF00] border border-[#FFBF00]/30'
                  }`}>
                    {record.status === 'Completado' ? 'Completado' : 'Falta Salida'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-white/5 text-[10px]">
                  <div>
                    <p className="text-[8px] text-[#F0F0F0]/55 font-black uppercase tracking-widest">Entrada</p>
                    <p className="text-xs font-black font-mono text-white mt-0.5">{record.entryTime}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-[#F0F0F0]/55 font-black uppercase tracking-widest">Salida</p>
                    <p className={`text-xs font-black font-mono mt-0.5 ${
                      record.exitTime === '--:--' ? 'text-white/20' : 'text-white'
                    }`}>{record.exitTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAB assistance button */}
      <button 
        onClick={() => setIsSupportOpen(true)}
        className="fixed bottom-24 right-5 w-12 h-12 bg-[#2200FF] text-white rounded-full shadow-[0_0_20px_rgba(34,0,255,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 hover:bg-[#1a00cc] cursor-pointer"
        title="Contactar soporte técnico corporativo"
      >
        <MessageSquare className="w-5 h-5 animate-pulse" />
      </button>

      {/* Slide-over support agent panel modal */}
      {isSupportOpen && (
        <div id="support-modal" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="bg-dark-bg border border-white/10 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[400px]">
            {/* Modal Header */}
            <div className="bg-[#121212] border-b border-white/10 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#00FF41]" />
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest leading-none text-white">Soporte Corporativo</h3>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/50 mt-1">Terminal Asistencia</p>
                </div>
              </div>
              <button 
                onClick={() => setIsSupportOpen(false)}
                className="p-1 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat list */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-dark-bg text-[11px] font-medium leading-relaxed">
              {chatLog.map((chat, i) => (
                <div 
                  key={i}
                  className={`max-w-[85%] p-3 rounded-lg ${
                    chat.sender === 'user' 
                      ? 'ml-auto bg-[#2200FF] border border-[#2200FF]/20 text-white rounded-tr-none' 
                      : 'bg-[#121212] border border-white/10 text-white/90 rounded-tl-none shadow-sm'
                  }`}
                >
                  {chat.text}
                </div>
              ))}
            </div>

            {/* Support Message form */}
            <form onSubmit={handleSendSupport} className="p-3 bg-[#121212] border-t border-white/10 flex gap-2">
              <input 
                type="text"
                placeholder="Escribe tu mensaje..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="flex-grow bg-dark-bg border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:ring-1 focus:ring-[#2200FF] focus:outline-none font-medium"
              />
              <button 
                type="submit"
                className="bg-[#2200FF] hover:bg-[#1a00cc] text-white p-2.5 rounded-lg transition-all flex-shrink-0 cursor-pointer"
                title="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
