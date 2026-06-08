import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function PageTransition() {
  const location = useLocation();
  const [display, setDisplay] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Skip on the home page so the main landing animation plays uninterrupted
    if (location.pathname === '/') {
      return;
    }

    // Trigger transition entry
    setDisplay(true);
    
    // Smooth fade in
    const animIn = setTimeout(() => {
      setActive(true);
    }, 20);

    // Smooth fade out start
    const animOut = setTimeout(() => {
      setActive(false);
    }, 800);

    // Unmount overlay after fade animation completes
    const unmount = setTimeout(() => {
      setDisplay(false);
    }, 1100);

    return () => {
      clearTimeout(animIn);
      clearTimeout(animOut);
      clearTimeout(unmount);
    };
  }, [location.pathname]);

  if (!display) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
        active ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex flex-col items-center relative">
        {/* Ambient background glow */}
        <div className="absolute w-64 h-64 bg-pink-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        {/* Circular Logo with Pulse & Scale Effect */}
        <div 
          className={`relative w-24 h-24 rounded-full overflow-hidden border-2 border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.3)] transition-all duration-700 ease-out mb-6 z-10 ${
            active ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        >
          <img
            src="/logo.jpg"
            alt="Shopping by Lina Logo"
            className="w-full h-full object-cover"
          />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>

        {/* Brand Text with slide-up fade */}
        <div 
          className={`text-white font-black tracking-[0.3em] uppercase text-lg sm:text-xl z-10 text-center transition-all duration-700 delay-100 ease-out ${
            active ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          SHOPPING <span className="text-pink-500">BY LINA</span>
        </div>
      </div>
    </div>
  );
}
