import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  base_price: number;
  image_url: string;
  category_id?: string;
  stock: number;
  created_at: string;
  is_promo?: boolean;
  promo_price?: number | null;
  product_sizes?: { size_name: string; stock: number }[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const isNew = new Date(product.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  const isPromo = product.is_promo && product.promo_price && product.promo_price > 0 && product.promo_price < product.base_price;
  const effectivePrice = isPromo ? product.promo_price! : (product.base_price ?? 0);
  const discountPercent = isPromo ? Math.round(((product.base_price - product.promo_price!) / product.base_price) * 100) : 0;

  return (
    <Link to={`/product/${product.id}`}>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-[0_20px_45px_rgba(236,72,153,0.12)] transition-all duration-500 overflow-hidden border border-purple-100/60 hover:border-purple-300/80 transform hover:-translate-y-1.5 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-purple-50 flex-shrink-0">
          {product.image_url ? (
            <div className="w-full h-full relative">
              <img
                src={product.image_url}
                alt={product.name}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center text-gray-300 bg-gray-50';
                    fallback.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag opacity-20"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ShoppingCart className="w-16 h-16" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-10">
            {isPromo ? (
              <span className="bg-rose-600 text-white px-2.5 py-1 rounded-full text-[11px] font-black shadow-lg uppercase tracking-wider">
                PROMO -{discountPercent}%
              </span>
            ) : <span />}

            {isNew && (
              <span className="bg-gradient-fashion text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                NOUVEAU
              </span>
            )}
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
              <div className="bg-white text-purple-600 px-4 py-2 rounded-full font-semibold flex items-center space-x-2 shadow-lg">
                <ShoppingCart className="w-4 h-4" />
                <span>Ajouter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3 md:p-5 flex flex-col flex-grow">
          <div className="mb-1 md:mb-2">
            <h3 className="font-bold text-sm md:text-base text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Available Sizes Row */}
          <div className="flex flex-wrap gap-1 mb-4 h-6 overflow-hidden">
            {product.product_sizes && product.product_sizes.length > 0 ? (
              product.product_sizes
                .filter(s => s.stock > 0)
                .map((size, idx) => (
                  <span key={idx} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
                    {size.size_name}
                  </span>
                ))
            ) : (
              <span className="text-[10px] text-gray-400 italic">Taille unique</span>
            )}
          </div>

          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              {isPromo ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-lg md:text-xl font-black text-rose-600">
                      {effectivePrice.toFixed(2)} DH
                    </span>
                    <span className="text-xs text-gray-400 line-through font-semibold">
                      {product.base_price.toFixed(2)} DH
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-lg md:text-xl font-black text-gradient-fashion">
                  {(product.base_price ?? 0).toFixed(2)} DH
                </div>
              )}
              {(product.product_sizes && product.product_sizes.length > 0
                ? product.product_sizes.some((s) => s.stock > 0)
                : (product.stock ?? 0) > 0) ? (
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">
                    Disponible
                  </span>
                </div>
              ) : (
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-tighter">
                  Épuisé
                </span>
              )}
            </div>

            <div className="bg-purple-50 p-2 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
              <ShoppingCart className="w-5 h-5 text-purple-600 group-hover:text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
