import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Categories() {
  useSEO({
    title: 'Catégories',
    description: 'Explorez toutes nos catégories de vêtements de sport et de mode. Découvrez une large sélection d\'articles adaptés à tous vos besoins.',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        // Fetch Categories
        const { data: catData } = await supabase.from('categories').select('*').order('name');
        
        // Fetch all products
        const { data: prodData } = await supabase
          .from('products')
          .select('*, product_sizes(*)')
          .eq('available', true)
          .order('created_at', { ascending: false });

        if (catData) setCategories(catData);
        if (prodData) {
          const availableProducts = prodData.filter(product => {
            if (product.product_sizes && product.product_sizes.length > 0) {
              return product.product_sizes.some((s: any) => s.stock > 0);
            }
            return (product.stock ?? 0) > 0;
          });
          setProducts(availableProducts);
        }
      } catch (error) {
        console.error("Error fetching categories catalog:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // GSAP Entrance Animations for Header
  useGSAP(() => {
    if (!loading) {
      const tl = gsap.timeline();

      // Header Animation
      tl.fromTo('.cat-header-anim', 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power4.out' }
      );
    }
  }, [loading]);

  // Observer for category sections reveal (reversible/one-time stagger entrance when visible)
  useEffect(() => {
    if (loading || categories.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-category-id');
          if (sectionId) {
            gsap.fromTo(`.section-${sectionId} .cat-section-header`,
              { x: -30, opacity: 0 },
              { x: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
            );
            gsap.fromTo(`.section-${sectionId} .product-card-anim`,
              { y: 30, opacity: 0, scale: 0.95 },
              { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out', overwrite: 'auto' }
            );
            // Once animated, unobserve to avoid repeated triggers on scrolling
            observer.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.08 });

    const sections = document.querySelectorAll('.category-section');
    sections.forEach(sec => observer.observe(sec));

    return () => observer.disconnect();
  }, [loading, categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  // Filter out categories that don't have any products
  const categoriesWithProducts = categories.filter(cat => 
    products.some(p => p.category_id === cat.id)
  );

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white pb-24 selection:bg-pink-500 selection:text-white">
      
      {/* Header with Background Image */}
      <div className="relative pt-40 pb-24 mb-16 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center opacity-85"
            style={{ backgroundImage: 'url(/images/bottom-bg.png)' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-[1800px] mx-auto px-4 md:px-12">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-3xl bg-pink-600/15 blur-[120px] rounded-full pointer-events-none"></div>
          
          <h1 className="cat-header-anim text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 relative z-10">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Collections</span>
          </h1>
          <p className="cat-header-anim text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-light relative z-10">
            Explorez notre sélection rigoureuse de vêtements et chaussures de sport des plus grandes marques.
          </p>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-12">

        {/* Categories Sections */}
        {categoriesWithProducts.length === 0 ? (
          <div className="text-center py-32 text-gray-500 font-black uppercase tracking-widest text-2xl">
            Aucun produit ou catégorie trouvé
          </div>
        ) : (
          <div className="space-y-24">
            {categoriesWithProducts.map((cat) => {
              // Group and take up to 5 products for this category
              const catProducts = products.filter(p => p.category_id === cat.id).slice(0, 5);
              return (
                <section 
                  key={cat.id} 
                  data-category-id={cat.id}
                  className={`category-section section-${cat.id} relative z-10`}
                >
                  {/* Section Header */}
                  <div className="cat-section-header flex justify-between items-end mb-8 pb-4 border-b border-white/10 opacity-0">
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full"></span>
                      <h2 className="text-2xl md:text-4xl font-black tracking-tighter uppercase text-white">
                        {cat.name}
                      </h2>
                    </div>
                    
                    <Link 
                      to={`/categories/${cat.id}`}
                      className="text-pink-500 font-bold uppercase tracking-widest text-xs md:text-sm hover:text-white transition-colors flex items-center gap-2 group cursor-pointer"
                    >
                      Voir tout
                      <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                    </Link>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                    {catProducts.map((product) => (
                      <div key={product.id} className="product-card-anim opacity-0 w-full">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
