import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Truck, Award } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  useSEO({
    title: 'À Propos',
    description: 'En savoir plus sur Shopping by Lina, notre histoire, nos valeurs et notre engagement à vous fournir la meilleure qualité d\'articles de sport et de mode.',
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Hero Text
    tl.fromTo('.about-title',
      { y: 100, opacity: 0, rotateX: -20 },
      { y: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.1, ease: 'power4.out', transformOrigin: "bottom center" }
    );

    // Parallax background
    gsap.to('.about-bg', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      }
    });

    // Reveal Cards
    gsap.fromTo('.value-card',
      { y: 100, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.values-section',
          start: 'top 80%',
        }
      }
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-pink-500 selection:text-white">
      
      {/* Hero Section */}
      <section className="about-hero relative h-[70vh] flex flex-col justify-center items-center overflow-hidden">
        {/* Background Image with Parallax */}
        <div className="absolute inset-0 z-0">
          <div 
            className="about-bg absolute inset-[-20%] w-[140%] h-[140%] bg-cover bg-center opacity-85"
            style={{ backgroundImage: 'url(/images/categories-background.jpg)' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <h1 className="text-[12vw] md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">
            <div className="overflow-hidden"><span className="about-title block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Qui</span></div>
            <div className="overflow-hidden"><span className="about-title block text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Sommes-nous</span></div>
          </h1>
          <p className="about-title text-xl md:text-2xl text-gray-400 font-light max-w-2xl mx-auto">
            L'excellence de la mode urbaine et internationale, livrée directement à votre porte partout au Maroc.
          </p>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="values-section py-32 px-4 md:px-12 max-w-[1800px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="value-card bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-colors group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-widest mb-4">100% Authentique</h3>
            <p className="text-gray-400 leading-relaxed font-light text-lg">
              Nous ne vendons pas de répliques. Nous sommes fiers de proposer exclusivement des vêtements et des chaussures authentiques des plus grandes marques mondiales.
            </p>
          </div>

          <div className="value-card bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-colors group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-widest mb-4">Livraison Nationale</h3>
            <p className="text-gray-400 leading-relaxed font-light text-lg">
              Nous livrons dans tous les coins du Maroc. De Tanger à Dakhla, votre commande sera chez vous en un temps record.
            </p>
          </div>

          <div className="value-card bg-white/5 border border-white/10 p-10 rounded-3xl hover:bg-white/10 transition-colors group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-3xl font-black uppercase tracking-widest mb-4">Service Premium</h3>
            <p className="text-gray-400 leading-relaxed font-light text-lg">
              Service client personnalisé via WhatsApp. Nous vous conseillons sur les tailles, les styles et organisons votre livraison pour une expérience parfaite.
            </p>
          </div>

        </div>
      </section>

      {/* Marcas Section */}
      <section className="py-24 border-y border-white/10 bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[100px] bg-pink-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-16">Marques Partenaires</h2>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {['Nike', 'Adidas', 'Puma', 'Vans', 'New Balance', 'Jordan'].map((brand) => (
              <div key={brand} className="px-8 py-4 border border-white/10 rounded-full text-xl font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:border-pink-500 transition-all cursor-default">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outro CTA */}
      <section className="py-32 text-center px-4 relative z-10">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8">Prêt à transformer votre style ?</h2>
        <Link 
          to="/categories" 
          className="inline-block bg-white text-black px-12 py-6 rounded-full font-black text-xl uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 hover:bg-pink-500 hover:text-white hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition-all duration-300"
        >
          Explorer la collection
        </Link>
      </section>

    </div>
  );
}
