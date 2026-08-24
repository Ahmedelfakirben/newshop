import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Set initial position centered
    gsap.set([cursor, follower], { xPercent: -50, yPercent: -50, opacity: 0 });

    // Quick setters: 0ms duration for instant dot movement, 0.12s snappy duration for follower ring
    const xToCursor = gsap.quickTo(cursor, "x", { duration: 0 });
    const yToCursor = gsap.quickTo(cursor, "y", { duration: 0 });
    
    const xToFollower = gsap.quickTo(follower, "x", { duration: 0.12, ease: "power2.out" });
    const yToFollower = gsap.quickTo(follower, "y", { duration: 0.12, ease: "power2.out" });

    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) {
        gsap.to([cursor, follower], { opacity: 1, duration: 0.15 });
        isVisible = true;
      }
      
      xToCursor(e.clientX);
      yToCursor(e.clientY);
      xToFollower(e.clientX);
      yToFollower(e.clientY);
    };

    const onMouseLeave = () => {
      gsap.to([cursor, follower], { opacity: 0, duration: 0.15 });
      isVisible = false;
    };

    // Event delegation for dynamic interactive elements (buttons, links, drawer items)
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('a, button, input, select, [role="button"], .interactive')) {
        gsap.to(follower, {
          scale: 1.5,
          backgroundColor: "rgba(236, 72, 153, 0.2)",
          borderColor: "rgba(236, 72, 153, 1)",
          duration: 0.15,
          ease: "power2.out"
        });
        gsap.to(cursor, { scale: 0.5, duration: 0.15 });
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('a, button, input, select, [role="button"], .interactive')) {
        gsap.to(follower, {
          scale: 1,
          backgroundColor: "transparent",
          borderColor: "rgba(236, 72, 153, 0.6)",
          duration: 0.15,
          ease: "power2.out"
        });
        gsap.to(cursor, { scale: 1, duration: 0.15 });
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseover', onMouseOver, { passive: true });
    document.addEventListener('mouseout', onMouseOut, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <>
      {/* Central dot (instant 0ms tracking) */}
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-pink-500 rounded-full pointer-events-none z-[999999] shadow-[0_0_10px_rgba(236,72,153,0.9)] hidden md:block"
      />
      {/* Follower ring (snappy 0.12s fluid tracking) */}
      <div 
        ref={followerRef} 
        className="fixed top-0 left-0 w-8 h-8 border-2 border-pink-500/60 rounded-full pointer-events-none z-[999998] shadow-[0_0_12px_rgba(236,72,153,0.3)] hidden md:block"
      />
    </>
  );
}
