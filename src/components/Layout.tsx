import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from './Navbar';
import CustomCursor from './CustomCursor';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import PageTransition from './PageTransition';

export default function Layout() {
  const lenisRef = useRef<Lenis | null>(null);
  const location = useLocation();

  // Initialize Lenis scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });
    
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Reset scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <CustomCursor />
      <PageTransition />
      <CartDrawer />
      <Navbar />
      
      <main className="flex-grow">
        <Outlet />
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
