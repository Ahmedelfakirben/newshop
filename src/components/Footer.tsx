import { useEffect, useState } from 'react';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [instaImages, setInstaImages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchInstaFeed() {
      const { data } = await supabase
        .from('products')
        .select('image_url')
        .eq('available', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data && data.length > 0) {
        setInstaImages(data.map(p => p.image_url));
      }
    }
    fetchInstaFeed();
  }, []);

  const displayImages = instaImages.length > 0 
    ? [...instaImages, ...instaImages].slice(0, 8) 
    : [...Array(8)].map(() => '/logo.jpg');

  return (
    <footer id="site-footer" className="relative bg-zinc-950 pt-24 pb-12 border-t border-white/10 z-50">
      
      {/* Decorative Blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-[1800px] mx-auto px-4 md:px-12 z-10">
        
        {/* Instagram Marquee */}
        <div className="mb-24">
          <div className="flex items-center gap-4 mb-8">
            <InstagramIcon className="w-8 h-8 text-pink-500" />
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-white">
              Suivez-nous sur <a href="https://www.instagram.com/shopping__by__lina/" target="_blank" rel="noreferrer" className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-80">Instagram</a>
            </h3>
          </div>
          
          {/* Simple CSS Marquee for Instagram Feed Mockup */}
          <div className="relative w-full overflow-hidden flex bg-white/5 rounded-3xl border border-white/10 py-4">
            <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap items-center">
              {displayImages.map((img, i) => (
                <a href="https://www.instagram.com/shopping__by__lina/" target="_blank" rel="noreferrer" key={i} className="w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden mx-2 shrink-0 relative group border border-white/10">
                  <img src={img} alt={`Instagram post ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <InstagramIcon className="w-8 h-8 text-white" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16 relative">
          
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
            <Link to="/" className="group flex items-center justify-center md:justify-start gap-4">
              <div id="footer-logo" className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-pink-500 transition-all z-50 relative bg-black origin-center">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-3xl font-black tracking-tighter text-white group-hover:text-pink-400 transition-colors">
                  SHOPPING
                </span>
                <span className="text-xs uppercase tracking-[0.3em] text-pink-500">
                  by Lina
                </span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-sm mx-auto md:mx-0 font-light">
              Vente de marques 100% authentiques. Votre destination mode pour une élégance intemporelle et des tendances raffinées à Tétouan.
            </p>
          </div>

          {/* Links Col */}
          <div className="md:col-span-3 text-center md:text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Explorer</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-pink-500 transition-colors uppercase tracking-wider text-sm font-bold">Accueil</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-pink-500 transition-colors uppercase tracking-wider text-sm font-bold">Catégories</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-pink-500 transition-colors uppercase tracking-wider text-sm font-bold">Qui sommes-nous</Link></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Contact</h4>
            <ul className="w-full flex flex-col items-center md:items-start space-y-6">
              <li className="flex flex-col items-center md:flex-row md:items-start gap-3 md:gap-4 text-gray-400 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-500/20 group-hover:text-pink-500 transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-center md:items-start pt-1 md:pt-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-white">Adresse</span>
                  <span className="text-sm font-light">Avenue aljoulane, Tétouan</span>
                </div>
              </li>
              <li className="flex flex-col items-center md:flex-row md:items-start gap-3 md:gap-4 text-gray-400 group cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-green-500/20 group-hover:text-green-500 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-center md:items-start pt-1 md:pt-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-white">WhatsApp</span>
                  <span className="text-sm font-light">0712130088</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
            © {currentYear} Shopping by Lina. Tous droits réservés.
          </p>
          
          {/* Quick WhatsApp Floating effect replica in footer */}
          <a
            href={`https://api.whatsapp.com/send?phone=212712130088`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-green-500 hover:text-black transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Discuter
          </a>
        </div>
      </div>

      {/* CURTAIN OVERLAY — starts hidden below, slides up */}
      <div 
        className="footer-curtain fixed inset-0 z-[9998] bg-black flex flex-col items-center justify-center pointer-events-none"
        style={{ transform: 'translateY(100%)', transition: 'transform 1.5s cubic-bezier(0.65, 0, 0.35, 1)' }}
      >
        <div 
          className="curtain-logo flex flex-col items-center gap-6"
          style={{ opacity: 0, transform: 'scale(0.8)', filter: 'blur(8px)', transition: 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.8s' }}
        >
          <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/30 shadow-[0_0_60px_rgba(236,72,153,0.4)]">
            <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <p className="text-white text-4xl md:text-6xl font-black tracking-tighter">
              SHOPPING <span className="text-pink-500">BY LINA</span>
            </p>
            <p className="text-white/40 text-sm tracking-[0.5em] uppercase mt-3 font-light">
              Merci de votre visite
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </footer>
  );
}
