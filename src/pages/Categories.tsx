import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, ChevronDown, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams();

  useSEO({
    title: 'Catégories & Collections',
    description: 'Explorez toutes nos catégories de vêtements de sport et de mode. Filtrez par taille et catégorie pour trouver votre style idéal chez Shopping by Lina.',
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  
  // Filter state
  const paramCategory = searchParams.get('category') || 'all';
  const paramSize = searchParams.get('size') || 'all';
  
  const [selectedCategory, setSelectedCategory] = useState<string>(paramCategory);
  const [selectedSize, setSelectedSize] = useState<string>(paramSize);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [sizesOpen, setSizesOpen] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 20;

  // Sync state with URL params if they change
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const sz = searchParams.get('size') || 'all';
    setSelectedCategory(cat);
    setSelectedSize(sz);
    setCurrentPage(1);
  }, [searchParams]);

  // Fetch Categories & All Available Products
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      window.scrollTo(0, 0);

      try {
        // 1. Fetch Categories
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (catData) setCategories(catData);

        // 2. Fetch all products with product_sizes
        const { data: prodData } = await supabase
          .from('products')
          .select('*, product_sizes(*)')
          .eq('available', true)
          .order('created_at', { ascending: false });

        if (prodData) {
          const availableProducts = prodData.filter(product => {
            if (product.product_sizes && product.product_sizes.length > 0) {
              return product.product_sizes.some((s: any) => s.stock > 0);
            }
            return (product.stock ?? 0) > 0;
          });
          setProducts(availableProducts);

          // Extract unique sizes with stock > 0 across all products
          const sizesSet = new Set<string>();
          prodData.forEach(prod => {
            if (prod.product_sizes && prod.product_sizes.length > 0) {
              prod.product_sizes.forEach((s: any) => {
                if (s.stock > 0 && s.size_name) {
                  sizesSet.add(s.size_name);
                }
              });
            }
          });

          // Sort sizes (numeric or alphabetical)
          const sortedSizes = Array.from(sizesSet).sort((a, b) => {
            const numA = parseFloat(a);
            const numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            return a.localeCompare(b);
          });
          setAvailableSizes(sortedSizes);
        }
      } catch (error) {
        console.error("Error fetching categories catalog:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filter products by category & size
  const filteredProducts = products.filter(product => {
    // Category filter
    if (selectedCategory !== 'all' && product.category_id !== selectedCategory) {
      return false;
    }
    // Size filter
    if (selectedSize !== 'all') {
      if (product.product_sizes && product.product_sizes.length > 0) {
        return product.product_sizes.some((s: any) => s.size_name === selectedSize && s.stock > 0);
      }
      return false;
    }
    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    
    // Smooth scroll back to grid view top
    const gridElement = document.getElementById('products-grid-top');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (size === 'all') {
      newParams.delete('size');
    } else {
      newParams.set('size', size);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', catId);
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize('all');
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
  };

  // GSAP Entrance Animations for Header & Filters
  useGSAP(() => {
    if (!loading) {
      const tl = gsap.timeline();
      
      tl.fromTo('.cat-header-anim', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );

      tl.fromTo('.filter-bar-anim',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        "-=0.4"
      );
    }
  }, [loading]);

  // Stagger grid items on page/filter changes
  useGSAP(() => {
    if (!loading && paginatedProducts.length > 0 && gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', overwrite: 'auto' }
      );
    }
  }, [currentPage, selectedSize, selectedCategory, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  // Selected category object for display
  const currentCategoryObj = categories.find(c => c.id === selectedCategory);

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
          
          <h1 className="cat-header-anim opacity-0 text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 relative z-10">
            Nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Collections</span>
          </h1>
          <p className="cat-header-anim opacity-0 text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-light relative z-10">
            Explorez l'ensemble de nos articles disponibles avec stock immédiat et filtres par taille.
          </p>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-12">

        {/* Active Filter Badges & Summary */}
        <div className="cat-header-anim opacity-0 flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Filtre actif :
            </span>
            {selectedCategory !== 'all' && currentCategoryObj && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 text-xs font-bold uppercase tracking-wider">
                Catégorie: {currentCategoryObj.name}
                <button 
                  onClick={() => handleCategorySelect('all')} 
                  className="hover:text-white ml-1 text-sm font-black cursor-pointer"
                  title="Supprimer le filtre de catégorie"
                >
                  ×
                </button>
              </span>
            )}
            {selectedSize !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-400 text-xs font-bold uppercase tracking-wider">
                Taille: {selectedSize}
                <button 
                  onClick={() => handleSizeSelect('all')} 
                  className="hover:text-white ml-1 text-sm font-black cursor-pointer"
                  title="Supprimer le filtre de taille"
                >
                  ×
                </button>
              </span>
            )}
            {(selectedCategory !== 'all' || selectedSize !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors underline underline-offset-4 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Réinitialiser
              </button>
            )}
          </div>

          <span className="text-xs text-gray-500 uppercase tracking-widest hidden sm:inline">
            Total : <span className="text-pink-500 font-bold">{filteredProducts.length} articles</span>
          </span>
        </div>

        {/* Filters and Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12" id="products-grid-top">
          
          {/* SIDEBAR: Category Selector & Size Filters */}
          <div className="lg:col-span-3 filter-bar-anim opacity-0 space-y-8 bg-zinc-950 border border-white/5 rounded-3xl p-6 md:p-8">
            
            {/* Dynamic Sizes Filter */}
            {availableSizes.length > 0 && (
              <div className="border-b border-white/5 pb-6">
                <button
                  onClick={() => setSizesOpen(!sizesOpen)}
                  className="w-full flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filtrer par taille</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${sizesOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`transition-all duration-300 overflow-hidden ${sizesOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2">
                    <button
                      onClick={() => handleSizeSelect('all')}
                      className={`py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all border text-center cursor-pointer ${
                        selectedSize === 'all'
                          ? 'border-pink-500 bg-pink-500/10 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      Tout
                    </button>
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`py-3.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all border text-center cursor-pointer ${
                          selectedSize === size
                            ? 'border-pink-500 bg-pink-500/10 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Category Switcher */}
            <div>
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="w-full flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <span>Catégories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${categoriesOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
                <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                  <button
                    onClick={() => handleCategorySelect('all')}
                    className={`text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'border-pink-500/30 bg-pink-500/10 text-pink-400'
                        : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'border-pink-500/30 bg-pink-500/10 text-pink-400'
                          : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Results Summary */}
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500 uppercase tracking-widest font-bold">
              <span>Articles :</span>
              <span className="text-white">{filteredProducts.length}</span>
            </div>

          </div>

          {/* MAIN GRID: Products displaying paginated results */}
          <div className="lg:col-span-9 space-y-12">
            {paginatedProducts.length === 0 ? (
              <div className="text-center py-32 bg-zinc-950/20 border border-white/5 rounded-3xl text-gray-500 font-black uppercase tracking-widest text-lg md:text-xl space-y-4">
                <p>Aucun article trouvé avec les filtres appliqués</p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-pink-500/20 border border-pink-500/40 text-pink-400 hover:bg-pink-500 hover:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
                >
                  Voir tous les articles
                </button>
              </div>
            ) : (
              <>
                <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {paginatedProducts.map((product) => (
                    <div key={product.id} className="w-full">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-6">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-400 transition-all cursor-pointer"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-12 h-12 rounded-xl font-bold transition-all border text-sm flex items-center justify-center cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-pink-500 border-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-gray-400 transition-all cursor-pointer"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
