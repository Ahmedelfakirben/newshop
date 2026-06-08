import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    if (!cursor || !follower) return;

    // Set initial position out of screen
    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0 });
    gsap.set(follower, { xPercent: -50, yPercent: -50, opacity: 0 });

    let ctx = gsap.context(() => {
      const xToCursor = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
      const yToCursor = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });
      
      const xToFollower = gsap.quickTo(follower, "x", { duration: 0.5, ease: "power3" });
      const yToFollower = gsap.quickTo(follower, "y", { duration: 0.5, ease: "power3" });

      const onMouseMove = (e: MouseEvent) => {
        // Fade in on first move
        gsap.to([cursor, follower], { opacity: 1, duration: 0.5, overwrite: "auto" });
        
        xToCursor(e.clientX);
        yToCursor(e.clientY);
        xToFollower(e.clientX);
        yToFollower(e.clientY);
      };

      const onMouseEnter = () => {
        gsap.to(follower, { scale: 1.5, backgroundColor: "rgba(168, 85, 247, 0.1)", borderColor: "rgba(168, 85, 247, 0.8)", duration: 0.3 });
        gsap.to(cursor, { scale: 0, duration: 0.3 });
      };

      const onMouseLeave = () => {
        gsap.to(follower, { scale: 1, backgroundColor: "transparent", borderColor: "rgba(236, 72, 153, 0.5)", duration: 0.3 });
        gsap.to(cursor, { scale: 1, duration: 0.3 });
      };

      window.addEventListener('mousemove', onMouseMove);

      // Add hover effect to interactive elements
      const interactiveElements = document.querySelectorAll('a, button, input, select, .interactive');
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
      });

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        interactiveElements.forEach(el => {
          el.removeEventListener('mouseenter', onMouseEnter);
          el.removeEventListener('mouseleave', onMouseLeave);
        });
      };
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 w-2 h-2 bg-pink-500 rounded-full pointer-events-none z-[10000] mix-blend-difference hidden md:block"
      />
      <div 
        ref={followerRef} 
        className="fixed top-0 left-0 w-8 h-8 border border-pink-500/50 rounded-full pointer-events-none z-[9999] transition-colors hidden md:block"
      />
    </>
  );
}
