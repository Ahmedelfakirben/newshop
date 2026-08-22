import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Phone, MapPin, MessageCircle, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { items, toggleCart } = useCartStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const navigate = useNavigate();

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setCategoriesExpanded(false);
    }
  }, [mobileMenuOpen]);

  // Fetch categories and active sizes for mobile navigation dropdown
  useEffect(() => {
    async function fetchMenuData() {
      try {
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        if (catData) setCategories(catData);

        const { data: prodData } = await supabase
          .from('products')
          .select('product_sizes(size_name, stock)')
          .eq('available', true);

        if (prodData) {
          const sizesSet = new Set<string>();
          prodData.forEach((p: any) => {
            p.product_sizes?.forEach((s: any) => {
              if (s.stock > 0 && s.size_name) sizesSet.add(s.size_name);
            });
          });
          const sorted = Array.from(sizesSet).sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
          });
          setAvailableSizes(sorted);
        }
      } catch (err) {
        console.error('Error fetching navbar categories/sizes:', err);
      }
    }
    fetchMenuData();
  }, []);

  const handleMobileNav = (url: string) => {
    setMobileMenuOpen(false);
    navigate(url);
  };

  const navLinks = [
    { href: '/', label: 'BOUTIQUE', isExpandable: false },
    { href: '/categories', label: 'CATÉGORIES', isExpandable: true },
    { href: '/about', label: 'QUI SOMMES-NOUS', isExpandable: false },
    { href: '/contact', label: 'CONTACT', isExpandable: false },
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
            <span className="text-sm font-black tracking-wider text-white">Shopping by Lina</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2 p-2 bg-white/10 rounded-full text-white"
          >
            <X className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-col min-h-full pt-28 pb-12 px-6 sm:px-8">
          <div className="space-y-4 flex-grow">
            {navLinks.map((link) => {
              if (link.isExpandable) {
                return (
                  <div key={link.href} className="border-b border-white/10 pb-4">
                    <button
                      onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                      className="w-full flex items-center justify-between text-left text-3xl sm:text-4xl font-black text-white/70 hover:text-white transition-colors cursor-pointer py-2"
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`w-7 h-7 transition-transform duration-300 text-pink-400 ${
                          categoriesExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Expandable Dropdown with Categories & Sizes Filter */}
                    <div
                      className={`transition-all duration-500 overflow-hidden ${
                        categoriesExpanded
                          ? 'max-h-[850px] opacity-100 mt-4 space-y-5'
                          : 'max-h-0 opacity-0 mt-0 pointer-events-none'
                      }`}
                    >
                      {/* View All Button */}
                      <button
                        onClick={() => handleMobileNav('/categories')}
                        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-400 font-bold uppercase tracking-widest text-xs flex items-center justify-between hover:bg-pink-500 hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                      >
                        <span>✦ Voir toutes les collections</span>
                        <span>→</span>
                      </button>

                      {/* Categories List */}
                      {categories.length > 0 && (
                        <div className="space-y-2.5">
                          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                            Par Catégorie
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => handleMobileNav(`/categories?category=${cat.id}`)}
                                className="text-left px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 text-gray-300 hover:text-pink-300 text-xs font-bold uppercase tracking-wider transition-all truncate cursor-pointer"
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sizes Filter List */}
                      {availableSizes.length > 0 && (
                        <div className="space-y-2.5 pt-3 border-t border-white/10">
                          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
                            <SlidersHorizontal className="w-3 h-3 text-purple-400" />
                            <span>Filtrer par Taille</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                            <button
                              onClick={() => handleMobileNav('/categories?size=all')}
                              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Tout
                            </button>
                            {availableSizes.map((size) => (
                              <button
                                key={size}
                                onClick={() => handleMobileNav(`/categories?size=${encodeURIComponent(size)}`)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                {size}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block text-3xl sm:text-4xl font-black text-white/50 border-b border-white/10 pb-4 hover:text-white transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-8 space-y-8 border-t border-white/10 pt-8">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-4 text-gray-300">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-xs font-bold leading-tight">Avenue aljoulane, Tétouan</span>
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
