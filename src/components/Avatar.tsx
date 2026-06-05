/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface AvatarProps {
  photoUrl: string;
  name: string;
  className: string;
}

export default function Avatar({ photoUrl, name, className }: AvatarProps) {
  const [errorStatus, setErrorStatus] = useState(false);

  const getInitials = (fullName: string) => {
    if (!fullName) return 'EM';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const initials = getInitials(name);

  // Helper to resolve deterministic index colors for variety if we want
  const getAvatarGradient = (char: string) => {
    const code = char.charCodeAt(0) || 0;
    if (code % 3 === 0) {
      return 'from-[#2200FF] to-[#00FF41]/40 border-[#2200FF]/40 text-white shadow-[0_0_12px_rgba(34,0,255,0.3)]';
    } else if (code % 3 === 1) {
      return 'from-[#00FF41] to-[#2200FF]/40 border-[#000FF41]/40 text-white shadow-[0_0_12px_rgba(0,255,65,0.25)]';
    } else {
      return 'from-[#FFBF00] to-[#2200FF]/40 border-[#FFBF00]/30 text-white shadow-[0_0_12px_rgba(255,191,0,0.25)]';
    }
  };

  const gradientClass = getAvatarGradient(initials[0] || 'A');

  if (errorStatus || !photoUrl || photoUrl.includes('placeholder')) {
    return (
      <div className={`${className} bg-dark-bg border-2 flex items-center justify-center font-black relative overflow-hidden shrink-0 ${gradientClass}`}>
        <span className="relative z-10 select-none text-[0.8em] tracking-tight">{initials}</span>
        {/* Futuristic biometric pattern grid overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:4px_4px]"></div>
      </div>
    );
  }

  return (
    <div className={`${className} shrink-0 bg-dark-bg border border-white/10 rounded-full flex items-center justify-center overflow-hidden`}>
      <img
        src={photoUrl}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setErrorStatus(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
