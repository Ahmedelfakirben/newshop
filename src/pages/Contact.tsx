import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapPin, MessageCircle } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Contact() {
  useSEO({
    title: 'Contact',
    description: 'Contactez Shopping by Lina. Nous sommes à votre disposition pour toute question, conseil ou assistance sur nos collections de vêtements et articles de sport.',
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    tl.fromTo('.contact-title',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power4.out' }
    );

    tl.fromTo('.contact-card',
      { scale: 0.9, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'back.out(1.2)' },
      "-=0.5"
    );

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-pink-500 selection:text-white pt-32 pb-24 relative overflow-hidden">
      
      {/* Background Blurs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-pink-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6">
            <span className="contact-title inline-block">Discutons</span>
          </h1>
          <p className="contact-title text-gray-400 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Nous sommes là pour vous aider à trouver votre style parfait. Contactez-nous pour des conseils, des questions sur votre commande ou des collaborations.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* WhatsApp Card */}
          <a href="https://api.whatsapp.com/send?phone=212712130088" target="_blank" rel="noreferrer" className="contact-card group bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center hover:bg-green-500/10 hover:border-green-500/30 transition-all cursor-pointer">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all">
              <MessageCircle className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-2 text-white">WhatsApp</h3>
            <p className="text-green-400 font-bold mb-4">0712130088</p>
            <p className="text-gray-400 text-sm">Réponse rapide. Le meilleur moyen de nous consulter pour le stock et les tailles.</p>
          </a>

          {/* Instagram Card */}
          <a href="https://www.instagram.com/shopping__by__lina/" target="_blank" rel="noreferrer" className="contact-card group bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center hover:bg-pink-500/10 hover:border-pink-500/30 transition-all cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all">
              <InstagramIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-2 text-white">Instagram</h3>
            <p className="text-pink-400 font-bold mb-4">@shopping__by__lina</p>
            <p className="text-gray-400 text-sm">Suivez-nous pour être informé des nouveaux lancements (New Drops) avant tout le monde.</p>
          </a>

          {/* Location Card */}
          <div className="contact-card group bg-white/5 border border-white/10 rounded-3xl p-10 flex flex-col items-center text-center hover:bg-blue-500/10 hover:border-blue-500/30 transition-all cursor-default lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-widest mb-2 text-white">Localisation</h3>
            <p className="text-blue-400 font-bold mb-4">Avenue aljoulane</p>
            <p className="text-gray-400 text-sm">Tétouan, Maroc. Nous livrons dans tout le pays.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
