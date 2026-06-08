import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, MapPin, MessageCircle } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export default function Navbar() {
  const { items, toggleCart } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: '/', label: 'BOUTIQUE' },
    { href: '/categories', label: 'CATÉGORIES' },
    { href: '/about', label: 'QUI SOMMES-NOUS' },
    { href: '/contact', label: 'CONTACT' },
  ];

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300">
        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex justify-between items-center">
          
          {/* Brand / Logo */}
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-pink-500 transition-all">
              <img
                src="/logo.jpg"
                alt="Shopping by Lina Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-lg font-black tracking-wider text-white group-hover:text-pink-400 transition-colors">
                Shopping by Lina
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8 bg-white/5 px-8 py-2 rounded-full border border-white/5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-300 hover:text-white hover:scale-110 transition-all"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* Cart */}
            <button 
              onClick={toggleCart} 
              className="relative group p-2 bg-white/10 hover:bg-pink-500 rounded-full transition-colors border border-white/10"
            >
              <ShoppingCart className="w-5 h-5 text-white" strokeWidth={2} />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)] border border-white/20">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center p-2 bg-white/10 rounded-full text-white"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu (Full Screen Overlay) */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-2xl z-[10000] transition-all duration-500 ease-in-out md:hidden overflow-y-auto ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-[10002]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-pink-500/50">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-black tracking-wider text-white">LINA STORE</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 p-2 bg-white/10 rounded-full text-white"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col min-h-full pt-32 pb-12 px-8">
          <div className="space-y-6 flex-grow">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block text-4xl font-black text-white/50 border-b border-white/10 pb-6 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-12 space-y-10 border-t border-white/10 pt-10">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-xs font-bold leading-tight">📍Avenue aljoulane, Tétouan</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-sm font-bold">0712130088</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <a
                href={`https://api.whatsapp.com/send?phone=212712130088&text=${encodeURIComponent("Bonjour ! J'aimerais obtenir plus d'informations.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-green-500/20 border border-green-500/50 text-green-400 py-3.5 rounded-2xl font-bold active:scale-95 transition-all"
              >
                <MessageCircle className="w-5 h-5 text-green-400" strokeWidth={1.75} />
                <span className="text-sm">WhatsApp</span>
              </a>
              <a
                href={'https://www.instagram.com/shopping__by__lina/'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-pink-500/20 border border-pink-500/50 text-pink-400 py-3.5 rounded-2xl font-bold active:scale-95 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-pink-400"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="text-sm">Instagram</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
