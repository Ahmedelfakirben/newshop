import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, Phone, MapPin, MessageCircle, 
  ChevronDown, ChevronRight, Sparkles, Store, Compass, Info, Mail
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { items, toggleCart } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setCategoriesExpanded(false);
    }
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setCategoriesExpanded(false);
  }, [location.pathname]);

  // Fetch categories for navigation
  useEffect(() => {
    async function fetchMenuData() {
      try {
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (catData) setCategories(catData);
      } catch (err) {
        console.error('Error fetching navbar categories:', err);
      }
    }
    fetchMenuData();
  }, []);

  const handleMobileNav = (url: string) => {
    setMobileMenuOpen(false);
    navigate(url);
  };

  const navLinks = [
    { href: '/', label: 'Boutique', code: '01', icon: Store, isExpandable: false },
    { href: '/categories', label: 'Catégories', code: '02', icon: Compass, isExpandable: true },
    { href: '/about', label: 'Qui sommes-nous', code: '03', icon: Info, isExpandable: false },
    { href: '/contact', label: 'Contact', code: '04', icon: Mail, isExpandable: false },
  ];

  return (
    <>
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 transition-all duration-300">
        <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex justify-between items-center">
          
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
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Cart */}
            <button 
              onClick={toggleCart} 
              className="relative group p-2.5 bg-white/10 hover:bg-pink-500 rounded-full transition-all border border-white/10 cursor-pointer hover:scale-105 active:scale-95"
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
              className="md:hidden flex items-center p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white cursor-pointer transition-all active:scale-95 border border-white/10"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>
      </nav>

      {/* LUXURY MOBILE MENU DRAWER */}
      <div
        className={`fixed inset-0 bg-zinc-950/95 backdrop-blur-3xl z-[10000] transition-all duration-500 ease-out md:hidden overflow-y-auto ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Background Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-[70vw] h-[70vw] max-w-[320px] max-h-[320px] bg-pink-600/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-0 w-[70vw] h-[70vw] max-w-[320px] max-h-[320px] bg-purple-600/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Top Header Bar */}
        <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-black tracking-wider text-white">Shopping by Lina</p>
              <p className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.2em]">Boutique Mode & Sport</p>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-pink-500 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10 active:scale-90"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="flex flex-col min-h-[calc(100%-72px)] justify-between px-6 py-8 relative z-10 space-y-10">
          
          {/* Main Navigation List */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 px-2 mb-2">
              Navigation
            </p>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.href;

              if (link.isExpandable) {
                return (
                  <div key={link.href} className="space-y-2">
                    {/* Expandable Category Button Card */}
                    <div
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      className={`w-full p-4 rounded-2xl transition-all cursor-pointer border flex items-center justify-between group ${
                        categoriesExpanded
                          ? 'bg-gradient-to-r from-pink-500/15 to-purple-500/10 border-pink-500/40 shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                          : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          categoriesExpanded ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <span className="text-[10px] font-mono font-bold text-pink-400/80 tracking-widest block">
                            {link.code}
                          </span>
                          <span className="text-base font-black tracking-wide uppercase text-white">
                            {link.label}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {categories.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase tracking-wider">
                            {categories.length}
                          </span>
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${
                          categoriesExpanded ? 'rotate-180 bg-pink-500/20 text-pink-400' : 'text-gray-400'
                        }`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Expandable Categories Dropdown (1 per row) */}
                    <div
                      className={`transition-all duration-400 ease-out overflow-hidden ${
                        categoriesExpanded
                          ? 'max-h-[600px] opacity-100 pt-1 pb-2 space-y-2'
                          : 'max-h-0 opacity-0 pointer-events-none'
                      }`}
                    >
                      {/* View All Button */}
                      <button
                        onClick={() => handleMobileNav('/categories')}
                        className="w-full p-3.5 rounded-xl bg-gradient-to-r from-pink-500/20 via-purple-500/15 to-transparent border border-pink-500/30 hover:border-pink-500 text-pink-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                          Toutes les collections
                        </span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>

                      {/* Single Column Category List */}
                      {categories.length > 0 && (
                        <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-zinc-800">
                          {categories.map((cat) => (
                            <button
                              key={cat.id}
                              onClick={() => handleMobileNav(`/categories?category=${cat.id}`)}
                              className="w-full text-left px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-pink-500/40 hover:bg-pink-500/10 text-gray-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between group cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-pink-500/50 group-hover:bg-pink-400 transition-colors" />
                                <span>{cat.name}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-pink-400 group-hover:translate-x-0.5 transition-all" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={link.href}
                  onClick={() => handleMobileNav(link.href)}
                  className={`w-full p-4 rounded-2xl transition-all cursor-pointer border flex items-center justify-between group ${
                    isActive
                      ? 'bg-white/10 border-pink-500/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.15)]'
                      : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/15 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? 'bg-pink-500 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] font-mono font-bold text-pink-400/80 tracking-widest block">
                        {link.code}
                      </span>
                      <span className="text-base font-black tracking-wide uppercase">
                        {link.label}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>

          {/* Bottom Contact & Socials Card */}
          <div className="space-y-4 pt-6 border-t border-white/10">
            {/* Info Badges */}
            <div className="grid grid-cols-1 gap-2.5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-xs font-semibold leading-tight">Avenue aljoulane, Tétouan</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-gray-300">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-xs font-bold font-mono tracking-wider">0712130088</span>
              </div>
            </div>

            {/* WhatsApp & Instagram Quick Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <a
                href={`https://api.whatsapp.com/send?phone=212712130088&text=${encodeURIComponent("Bonjour ! J'aimerais obtenir plus d'informations.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 py-3 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={'https://www.instagram.com/shopping__by__lina/'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-pink-500/15 border border-pink-500/40 text-pink-400 py-3 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600 hover:text-white transition-all shadow-[0_0_15px_rgba(236,72,153,0.15)]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
