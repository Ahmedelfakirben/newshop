import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSEO } from '../hooks/useSEO';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  useSEO({
    title: 'Accueil',
    description: 'Shopping by Lina - Boutique de Sport & Mode en ligne. Découvrez notre large sélection de vêtements, chaussures et accessoires de sport de haute qualité.',
  });

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaderFinished, setLoaderFinished] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const heroTextRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const horizontalSectionRef = useRef<HTMLDivElement>(null);
  const categoriesSectionRef = useRef<HTMLElement>(null);

  // Supabase Fetching
  useEffect(() => {
    async function fetchData() {
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, product_sizes(*)')
          .eq('available', true)
          .order('created_at', { ascending: false })
          .limit(100),
        supabase.from('categories').select('*').order('name')
      ]);

      if (prodRes.data) {
        const availableProducts = prodRes.data.filter(product => {
          if (product.product_sizes && product.product_sizes.length > 0) {
            return product.product_sizes.some((s: any) => s.stock > 0);
          }
          return (product.stock ?? 0) > 0;
        });
        setProducts(availableProducts.slice(0, 10)); // Take top 10 available
      }
      
      if (catRes.data) {
        setCategories(catRes.data);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  // Preloader & Hero Animations
  useGSAP(() => {
    if (!loading && products.length > 0) {
      const tl = gsap.timeline({
        onComplete: () => setLoaderFinished(true)
      });

      // 1. Logo/Text Intro (Option 1 hybrid)
      tl.fromTo('.loader-logo', 
        { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.5, ease: 'power3.out' }
      )
      .to('.loader-logo', { opacity: 0, scale: 1.1, duration: 0.5, ease: 'power2.in', delay: 0.5 });

      // 2. Flash Sequence (Option 2 hybrid: 10 images)
      const flashImages = gsap.utils.toArray('.flash-image');
      
      if (flashImages.length > 0) {
        flashImages.forEach((img: any) => {
          // Speed up slightly to make the 10 flashes feel like a fast burst
          tl.fromTo(img, 
            { opacity: 0, scale: 0.8, filter: 'brightness(2) contrast(1.5)' },
            { opacity: 1, scale: 1.1, filter: 'brightness(1) contrast(1)', duration: 0.08, ease: 'power2.in' }
          ).to(img, { opacity: 0, scale: 1.4, duration: 0.08, ease: 'power2.out' });
        });
      }

      // 3. The Final Explosion Flash
      tl.to('.loader-overlay', { backgroundColor: 'white', duration: 0.1 })
        .to('.loader-overlay', { opacity: 0, duration: 0.8, ease: 'power2.inOut', display: 'none' }, "+=0.1");

      // 4. Hero text explosion (synchronized right after the flash clears)
      tl.fromTo('.hero-title-word',
        { y: 150, opacity: 0, rotateX: -80, filter: 'blur(10px)', scale: 0.9 },
        { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', scale: 1, duration: 1.2, stagger: 0.1, ease: 'back.out(1.2)', transformOrigin: "left bottom" },
        "-=0.6" // start slightly before the white flash fully fades
      );

    }
  }, [loading, products]);

  // Continuous Marquee animation (Independent)
  useGSAP(() => {
    gsap.to('.marquee-inner', {
      xPercent: -50,
      ease: "none",
      duration: 10,
      repeat: -1
    });
  }, { scope: containerRef });

  // Horizontal Scroll for Products
  useGSAP(() => {
    if (loaderFinished && !loading && products.length > 0 && scrollWrapperRef.current && horizontalSectionRef.current) {
      
      const getScrollAmount = () => {
        if (!scrollWrapperRef.current) return 0;
        const scrollWidth = scrollWrapperRef.current.scrollWidth;
        return Math.max(0, scrollWidth - window.innerWidth);
      };

      gsap.to(scrollWrapperRef.current, {
        x: () => -getScrollAmount(),
        ease: "none",
        scrollTrigger: {
          trigger: horizontalSectionRef.current,
          start: "top top",
          end: () => `+=${getScrollAmount()}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        }
      });
    }
  }, [loading, products, loaderFinished]);

  // Intersection Observer for reveal animations (Features + Outro + Categories) — reversible
  useEffect(() => {
    if (!loaderFinished) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        
        if (entry.isIntersecting) {
          // ENTERING viewport → animate in
          if (el.classList.contains('features-section')) {
            gsap.fromTo('.feature-item',
              { y: 60, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: 'power3.out' }
            );
          }
          if (el.classList.contains('outro-section')) {
            gsap.fromTo('.outro-content',
              { scale: 0.85, opacity: 0, y: 40 },
              { scale: 1, opacity: 1, y: 0, duration: 1, ease: 'back.out(1.5)' }
            );
          }
          if (el.classList.contains('categories-anim')) {
            gsap.fromTo('.category-card',
              { y: 80, opacity: 0, scale: 0.9 },
              { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(1.2)' }
            );
          }
        } else {
          // LEAVING viewport → reset to hidden so they can replay
          if (el.classList.contains('features-section')) {
            gsap.set('.feature-item', { y: 60, opacity: 0 });
          }
          if (el.classList.contains('outro-section')) {
            gsap.set('.outro-content', { scale: 0.85, opacity: 0, y: 40 });
          }
          if (el.classList.contains('categories-anim')) {
            gsap.set('.category-card', { y: 80, opacity: 0, scale: 0.9 });
          }
        }
      });
    }, { threshold: 0.3 });

    // Observe the target sections (don't unobserve so they can re-trigger)
    document.querySelectorAll('.features-section, .outro-section, .categories-anim').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loaderFinished]);

  // Footer Curtain Effect — reversible
  useEffect(() => {
    if (!loaderFinished) return;

    const footerEl = document.querySelector('#site-footer');
    if (!footerEl) return;

    let curtainTimeout: ReturnType<typeof setTimeout>;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const curtain = document.querySelector('.footer-curtain') as HTMLElement;
        const curtainLogo = document.querySelector('.curtain-logo') as HTMLElement;
        if (!curtain || !curtainLogo) return;

        if (entry.isIntersecting) {
          // Show curtain after a short delay
          curtainTimeout = setTimeout(() => {
            curtain.style.transform = 'translateY(0%)';
            curtainLogo.style.opacity = '1';
            curtainLogo.style.transform = 'scale(1)';
            curtainLogo.style.filter = 'blur(0px)';
          }, 800);
        } else {
          // Reverse the curtain instantly when leaving
          clearTimeout(curtainTimeout);
          curtain.style.transform = 'translateY(100%)';
          curtainLogo.style.opacity = '0';
          curtainLogo.style.transform = 'scale(0.8)';
          curtainLogo.style.filter = 'blur(8px)';
        }
      });
    }, { threshold: 0.6 });

    observer.observe(footerEl);
    return () => {
      clearTimeout(curtainTimeout);
      observer.disconnect();
    };
  }, [loaderFinished]);

  return (
    <div ref={containerRef} className="bg-black text-white selection:bg-pink-500 selection:text-white">
      
      {/* 0. FLASH LOADER OVERLAY */}
      {!loaderFinished && (
        <div className="loader-overlay fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
          
          {/* Logo / Text Intro */}
          <div className="loader-logo absolute z-10 text-white font-black tracking-[0.4em] uppercase text-2xl md:text-5xl opacity-0 text-center">
            SHOPPING <span className="text-pink-500">BY LINA</span>
          </div>

          {products.slice(0, 10).map((product, i) => (
            <img 
              key={`flash-${i}`} 
              src={product.image_url} 
              className="flash-image absolute w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] object-contain opacity-0 pointer-events-none" 
              alt="Flash loader"
            />
          ))}
          {/* Fallback spinner if products are still loading */}
          {loading && (
            <div className="absolute animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
          )}
        </div>
      )}

      {/* 1. HERO SECTION (Massive Typography & Full Background) */}
      <section className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden pt-20">
        
        {/* Background Parallax Layer */}
        <div className="absolute inset-0 z-0">
          <div 
            className="hero-image-inner absolute inset-0 w-full h-full bg-no-repeat bg-cover md:bg-[length:100%_100%] bg-left md:bg-[center_30%]"
            style={{ backgroundImage: 'url(/images/A444D8D1-E599-4010-9682-C3E8167BA6FF.PNG)' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-black/20"></div> {/* Extra darkness for text readability */}
        </div>

        {/* Text Container aligned firmly to the left on desktop */}
        <div className="relative z-10 w-full px-4 md:px-16 lg:px-32 flex flex-col items-center md:items-start text-center md:text-left mt-16 md:mt-0 md:mb-12">
          
          <div ref={heroTextRef} className="w-full max-w-[50rem] flex flex-col items-center md:items-start">
            <span className="hero-title-word text-white text-xl md:text-3xl tracking-[0.3em] font-semibold uppercase mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
              LES MEILLEURS
            </span>
            <h1 className="text-[12vw] md:text-[7rem] lg:text-[8rem] leading-[0.85] font-black uppercase tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]" style={{ perspective: '1000px' }}>
              <div className="overflow-hidden"><div className="hero-title-word origin-bottom">ARTICLES</div></div>
              <div className="overflow-hidden"><div className="hero-title-word origin-bottom text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.4)]">SPORT</div></div>
            </h1>
            <div className="overflow-hidden"><div className="hero-title-word font-serif italic text-white text-6xl md:text-8xl leading-none mt-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]">
              pour Filles
            </div></div>
            
            <p className="hero-title-word mt-8 max-w-xl text-gray-300 text-lg md:text-xl font-light drop-shadow-md">
              Style | Qualité | Performance
            </p>
            
            <button
              onClick={() => horizontalSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="hero-title-word mt-12 bg-white text-black px-12 py-5 rounded-full font-black text-lg hover:bg-pink-500 hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 duration-300 uppercase tracking-widest"
            >
              Découvrir la collection
            </button>
          </div>
        </div>
      </section>

      {/* 2. INFINITE MARQUEE (Premium & Elegant Style) */}
      <section className="py-8 bg-zinc-950 border-y border-white/5 overflow-hidden relative z-20">
        <div ref={marqueeRef} className="flex whitespace-nowrap opacity-60">
          <div className="marquee-inner flex items-center text-white font-light tracking-[0.2em] uppercase text-2xl md:text-3xl">
            <span className="px-12">NIKE</span>
            <span className="text-pink-500 text-sm">✦</span>
            <span className="px-12">ADIDAS</span>
            <span className="text-pink-500 text-sm">✦</span>
            <span className="px-12">PUMA</span>
            <span className="text-pink-500 text-sm">✦</span>
            <span className="px-12 font-bold tracking-[0.3em]">SHOPPING BY LINA</span>
            <span className="text-pink-500 text-sm">✦</span>
            <span className="px-12">NEW BALANCE</span>
            <span className="text-pink-500 text-sm">✦</span>
            
            {/* Duplicate for infinite effect */}
            <span className="px-12">NIKE</span>
            <span className="text-pink-500 text-sm">✦</span>
            <span className="px-12">ADIDAS</span>
            <span className="text-pink-500 text-sm">✦</span>
            <span className="px-12">PUMA</span>
            <span className="text-pink-500 text-sm">✦</span>
            <span className="px-12 font-bold tracking-[0.3em]">SHOPPING BY LINA</span>
            <span className="text-pink-500 text-sm">✦</span>
            <span className="px-12">NEW BALANCE</span>
            <span className="text-pink-500 text-sm">✦</span>
          </div>
        </div>
      </section>

      {/* 3. HORIZONTAL SCROLL GALLERY (GSAP PIN) */}
      <section ref={horizontalSectionRef} className="h-screen w-full bg-black relative flex items-center overflow-hidden">
        
        {/* Section Title floating above */}
        <div className="absolute top-20 left-4 md:left-12 z-10">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-white/90">
            Nouvelles <span className="text-purple-500">Arrivées</span>
          </h2>
          <p className="text-gray-400 font-light mt-2">Faites défiler pour explorer le catalogue horizontal</p>
        </div>

        {loading ? (
          <div className="w-full h-full flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="w-full h-full flex justify-center items-center">
            <p className="text-gray-500 font-light text-xl">Aucune nouvelle arrivée disponible pour le moment.</p>
          </div>
        ) : (
          <div ref={scrollWrapperRef} className="flex gap-8 px-4 md:px-12 pt-32 pb-20 w-max pr-[20vw]">
            {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="w-[85vw] md:w-[400px] h-[60vh] shrink-0 block cursor-none">
                  <div className="w-full h-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 group relative flex flex-col justify-end p-6 hover:bg-white/10 transition-colors">
                    {/* Floating Image inside card */}
                    {product.image_url && (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out"
                      />
                    )}
                    {/* Glassmorphic Info Card overlay */}
                    <div className="relative z-10 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-1">{product.name}</h3>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-pink-400 font-black text-2xl">{(product.base_price ?? 0).toFixed(2)} DH</p>
                          {(product.product_sizes && product.product_sizes.length > 0
                            ? product.product_sizes.some((s: any) => s.stock > 0)
                            : (product.stock ?? 0) > 0) ? (
                            <p className="text-xs text-green-400 font-bold uppercase tracking-widest mt-1">Disponible</p>
                          ) : (
                            <p className="text-xs text-red-500 font-bold uppercase tracking-widest mt-1">Épuisé</p>
                          )}
                        </div>
                        <div className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase text-xs tracking-wider group-hover:bg-pink-500 group-hover:text-white transition-colors duration-300">
                          Voir détails
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
            ))}
            
          </div>
        )}
      </section>

      {/* 3.5 CATEGORIES SECTION */}
      <section ref={categoriesSectionRef} className="categories-anim py-32 relative border-t border-white/5 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-50"
            style={{ backgroundImage: 'url(/images/bottom-bg.png)' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-zinc-950"></div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-3xl bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        <div className="max-w-[1800px] mx-auto px-4 md:px-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-white">
                Collections
              </h2>
              <p className="text-gray-400 font-light mt-4 text-xl tracking-wide max-w-lg">
                Trouvez votre style en parcourant nos catégories les plus populaires.
              </p>
            </div>
            <Link to="/categories" className="text-pink-500 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors flex items-center gap-2 group">
              Voir tout le catalogue
              <span className="group-hover:translate-x-2 transition-transform">→</span>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
            {categories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/categories/${cat.id}`} 
                className="category-card group relative px-8 py-4 rounded-full overflow-hidden bg-white/5 border border-white/10 hover:border-pink-500 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(236,72,153,0.2)]"
              >
                {/* Hover Background Tint */}
                <div className="absolute inset-0 bg-pink-500 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 ease-out z-0"></div>
                
                <span className="relative z-10 text-white font-bold uppercase tracking-widest text-xs md:text-sm group-hover:text-black transition-colors duration-300 delay-100">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3.8 FEATURES SECTION */}
      <section className="features-section py-24 bg-black relative border-t border-white/5 z-20">
        <div className="max-w-[1800px] mx-auto px-4 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            
            {/* Feature 1 */}
            <div className="feature-item flex flex-col items-center text-center group" style={{ opacity: 0, transform: 'translateY(60px)' }}>
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-pink-500/20 group-hover:border-pink-500/50 transition-colors duration-500 hover:scale-110 transform">
                <ShieldCheck className="w-10 h-10 text-white group-hover:text-pink-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-4">100% Authentique</h3>
              <p className="text-gray-400 font-light leading-relaxed max-w-sm">
                Nous ne vendons que des marques authentiques et originales. La qualité est notre priorité absolue.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-item flex flex-col items-center text-center group" style={{ opacity: 0, transform: 'translateY(60px)' }}>
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-purple-500/20 group-hover:border-purple-500/50 transition-colors duration-500 hover:scale-110 transform">
                <Truck className="w-10 h-10 text-white group-hover:text-purple-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Livraison Partout</h3>
              <p className="text-gray-400 font-light leading-relaxed max-w-sm">
                Où que vous soyez au Maroc, nous vous livrons à domicile dans les plus brefs délais.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-item flex flex-col items-center text-center group" style={{ opacity: 0, transform: 'translateY(60px)' }}>
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-green-500/20 group-hover:border-green-500/50 transition-colors duration-500 hover:scale-110 transform">
                <MessageCircle className="w-10 h-10 text-white group-hover:text-green-500 transition-colors" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-widest text-white mb-4">Service Premium</h3>
              <p className="text-gray-400 font-light leading-relaxed max-w-sm">
                Un accompagnement personnalisé via WhatsApp pour répondre à toutes vos envies mode.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. FOOTER / OUTRO */}
      <section className="outro-section min-h-[60vh] flex flex-col items-center justify-end pb-16 relative border-t border-white/5 overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center md:bg-top opacity-60"
            style={{ backgroundImage: 'url(/images/categories-background.jpg)' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        </div>
        
        {/* Content pushed to the bottom */}
        <div className="outro-content relative flex flex-col items-center z-10 mt-auto" style={{ opacity: 0, transform: 'scale(0.85) translateY(40px)' }}>
          <p className="text-white text-sm md:text-base font-bold tracking-[0.3em] uppercase mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Prêt à sublimer votre style ?</p>
          <Link to="/categories" className="px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full font-black uppercase tracking-widest text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.8)]">
            Acheter la collection complète
          </Link>
        </div>
      </section>

    </div>
  );
}
