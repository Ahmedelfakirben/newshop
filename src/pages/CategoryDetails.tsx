import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);

  useSEO({
    title: currentCategory ? currentCategory.name : 'Catégorie',
    description: currentCategory 
      ? `Découvrez notre collection de ${currentCategory.name}. Des articles de sport et de mode tendance et de haute qualité au meilleur prix chez Shopping by Lina.` 
      : 'Explorez nos articles de sport et de mode par catégorie.',
  });
  const [products, setProducts] = useState<any[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [sizesOpen, setSizesOpen] = useState(window.innerWidth >= 1024);
  const [categoriesOpen, setCategoriesOpen] = useState(window.innerWidth >= 1024);

  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const itemsPerPage = 20;

  // 1. Fetch Categories (for the category switcher) and Products in this category
  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      setSelectedSize('all');
      setCurrentPage(1);
      window.scrollTo(0, 0);

      try {
        // Fetch current category info
        const { data: catData } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();

        if (catData) {
          setCurrentCategory(catData);
        }

        // Fetch all categories for quick switching
        const { data: allCats } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (allCats) {
          setCategories(allCats);
        }

        // Fetch products in this category
        // Fetch including product sizes so we can extract sizes and check stock
        const { data: prodData } = await supabase
          .from('products')
          .select('*, product_sizes(*)')
          .eq('category_id', id)
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

          // Extract unique sizes with stock > 0 for this category's products
          const sizesSet = new Set<string>();
          prodData.forEach(prod => {
            if (prod.product_sizes && prod.product_sizes.length > 0) {
              prod.product_sizes.forEach((s: any) => {
                if (s.stock > 0) {
                  sizesSet.add(s.size_name);
                }
              });
            }
          });
          // Sort sizes alphabetically or logically if they are numeric
          const sortedSizes = Array.from(sizesSet).sort((a, b) => {
            // Check if sizes are numbers (e.g. shoe sizes "38", "39")
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
        console.error("Error fetching category details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // 2. Filter logic: Filter products by selected size
  const filteredProducts = products.filter(product => {
    if (selectedSize === 'all') return true;
    if (product.product_sizes && product.product_sizes.length > 0) {
      return product.product_sizes.some((s: any) => s.size_name === selectedSize && s.stock > 0);
    }
    return false;
  });

  // 3. Pagination logic
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
    setCurrentPage(1); // Reset page on filter change
  };

  // 4. GSAP Entrance Animations
  useGSAP(() => {
    if (!loading && currentCategory) {
      const tl = gsap.timeline();
      
      // Header & Back Button Animation
      tl.fromTo('.cat-detail-header-anim', 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );

      // Filters Bar Animation
      tl.fromTo('.filter-bar-anim',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        "-=0.4"
      );
    }
  }, [loading, currentCategory]);

  // Stagger grid items on products update/page shift
  useGSAP(() => {
    if (!loading && paginatedProducts.length > 0 && gridRef.current) {
      gsap.fromTo(gridRef.current.children,
        { scale: 0.9, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out', overwrite: 'auto' }
      );
    }
  }, [currentPage, selectedSize, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-6">
        <p className="text-xl font-bold uppercase tracking-widest text-zinc-500">Catégorie non trouvée</p>
        <Link to="/categories" className="px-8 py-3 bg-pink-500 rounded-full text-white font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(236,72,153,0.5)]">
          Retour aux catégories
        </Link>
      </div>
    );
  }

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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-3xl bg-purple-600/15 blur-[120px] rounded-full pointer-events-none"></div>
          
          <h1 className="cat-detail-header-anim opacity-0 text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 relative z-10">
            Collection <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">{currentCategory.name}</span>
          </h1>
          <p className="cat-detail-header-anim opacity-0 text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-light relative z-10">
            Découvrez tous nos articles disponibles de {currentCategory.name.toLowerCase()} avec stock immédiat.
          </p>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-12">
        
        {/* Back Button & Breadcrumb */}
        <div className="cat-detail-header-anim opacity-0 flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center space-x-2 text-gray-400 hover:text-pink-500 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold tracking-widest uppercase text-xs">Collections</span>
          </button>

          <span className="text-xs text-gray-500 uppercase tracking-widest hidden sm:inline">
            Catégorie / <span className="text-pink-500 font-bold">{currentCategory.name}</span>
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
                  className="w-full flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
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
                className="w-full flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-gray-400 hover:text-white transition-colors"
              >
                <span>Catégories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${categoriesOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0 pointer-events-none'}`}>
                <div className="flex flex-col gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => navigate(`/categories/${cat.id}`)}
                      className={`text-left px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                        id === cat.id
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
              <div className="text-center py-32 bg-zinc-950/20 border border-white/5 rounded-3xl text-gray-500 font-black uppercase tracking-widest text-lg md:text-xl">
                Aucun article trouvé avec les filtres appliqués
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
