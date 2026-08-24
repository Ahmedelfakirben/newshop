import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import ProductCard from '../components/ProductCard';
import { ShoppingCart, ArrowLeft, MessageCircle, Link2, Check } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<any>(null);

  useSEO({
    title: product ? product.name : 'Produit',
    description: product 
      ? `${product.description || ''}`.substring(0, 155) + (product.description?.length > 155 ? '...' : '') 
      : 'Détails du produit - Shopping by Lina',
    image: product?.image_url,
    type: 'product',
  });
  const [sizes, setSizes] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      window.scrollTo(0, 0);

      // Fetch Product
      const { data: productData } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (productData && (productData.base_price ?? 0) > 0) {
        setProduct(productData);

        // Fetch Sizes
        const { data: sizesData } = await supabase
          .from('product_sizes')
          .select('*')
          .eq('product_id', id)
          .gt('stock', 0);

        if (sizesData && sizesData.length > 0) {
          // Simplistic sorting for demonstration
          const sorted = sizesData.sort((a, b) => a.size_name.localeCompare(b.size_name));
          setSizes(sorted);
          setSelectedSize(sorted[0].size_name);
        } else {
          setSizes([]);
          setSelectedSize('');
        }

        // Fetch Gallery
        const { data: galleryData } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', id)
          .order('display_order', { ascending: true });

        // Include the main image in the gallery if not already there
        let fullGallery = [];
        if (productData.image_url) {
          fullGallery.push({ image_url: productData.image_url });
        }
        if (galleryData) {
          fullGallery = [...fullGallery, ...galleryData];
        }
        // Deduplicate
        fullGallery = fullGallery.filter((v, i, a) => a.findIndex(t => (t.image_url === v.image_url)) === i);
        setGallery(fullGallery);

        // Fetch Related
        const { data: relatedData } = await supabase
          .from('products')
          .select('*, product_sizes(*)')
          .eq('category_id', productData.category_id)
          .neq('id', id)
          .eq('available', true)
          .gt('base_price', 0)
          .limit(10);

        if (relatedData) {
          const availableRelated = relatedData.filter(p => {
            const hasPrice = (p.base_price ?? 0) > 0;
            if (!hasPrice) return false;

            if (p.product_sizes && p.product_sizes.length > 0) {
              return p.product_sizes.some((s: any) => s.stock > 0);
            }
            return (p.stock ?? 0) > 0;
          });
          setRelatedProducts(availableRelated.slice(0, 4));
        }
      } else {
        setProduct(null);
      }
      setLoading(false);
    }
    
    if (id) fetchData();
  }, [id]);

  useGSAP(() => {
    if (!loading && product) {
      // Split screen entrance animation
      const tl = gsap.timeline();
      tl.fromTo('.gallery-img', 
        { opacity: 0, y: 100 }, 
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out' }
      );
      tl.fromTo('.product-info-anim',
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
        "-=0.8"
      );
    }
  }, [loading, product]);

  const isPromo = product?.is_promo && product?.promo_price && product?.promo_price > 0 && product?.promo_price < product?.base_price;
  const effectiveBasePrice = isPromo ? product.promo_price : (product?.base_price ?? 0);
  const discountPct = isPromo ? Math.round(((product.base_price - product.promo_price) / product.base_price) * 100) : 0;

  const handleWhatsAppOrder = async () => {
    if (!product) return;
    const sizeObj = sizes.find(s => s.size_name === selectedSize);
    const sizeModifier = sizeObj?.price_modifier || 0;
    const unitPrice = effectiveBasePrice + sizeModifier;
    const finalPrice = unitPrice.toFixed(2);
    const sizeInfo = selectedSize ? ` (Taille : ${selectedSize})` : '';
    const promoInfo = isPromo ? ' [PROMO]' : '';

    let orderRefCode = '';
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            status: 'pending',
            payment_method: 'cash',
            notes: 'WEB_WHATSAPP',
            service_type: 'website',
            total: unitPrice,
          }
        ])
        .select()
        .single();

      if (!orderError && orderData) {
        orderRefCode = orderData.id.slice(0, 8).toUpperCase();
        await supabase.from('order_items').insert([
          {
            order_id: orderData.id,
            product_id: product.id,
            size_id: sizeObj?.id || null,
            quantity: 1,
            unit_price: unitPrice,
            subtotal: unitPrice,
            notes: selectedSize ? `Taille: ${selectedSize}` : ''
          }
        ]);
      }
    } catch (e) {
      console.error('Error creating pending web order:', e);
    }

    let message = `Bonjour ! J'aimerais passer la commande suivante :\n\n`;
    if (orderRefCode) {
      message += `📌 *RÉFÉRENCE COMMANDE : #WEB-${orderRefCode}*\n\n`;
    }
    message += `1. *${product.name}*${sizeInfo}${promoInfo}\n   Quantité : 1 x ${finalPrice} DH\n\n`;
    message += `*Total estimé : ${finalPrice} DH*\n\n`;
    message += `Je reste dans l'attente de confirmer les détails de livraison.\n\n`;
    message += `Lien produit : ${window.location.href}`;

    if (orderRefCode) {
      const orderUrl = `${window.location.origin}/order/WEB-${orderRefCode}`;
      message += `\n\n🔗 *Suivi de commande / Seguimiento :*\n${orderUrl}`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=212712130088&text=${encoded}`, '_blank');
  };

  const handleAddToCart = () => {
    if (!product) return;
    const sizeObj = sizes.find(s => s.size_name === selectedSize);
    addItem(product, sizeObj, 1);
    
    // In the future this will open the drawer
    alert("Ajouté au panier !");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>Produit non trouvé</p>
      </div>
    );
  }

  const maxStock = sizes.length > 0
    ? (sizes.find(s => s.size_name === selectedSize)?.stock ?? 0)
    : (product.stock ?? 0);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="max-w-[1800px] mx-auto px-4 md:px-12">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-400 hover:text-pink-500 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold tracking-widest uppercase text-xs">Retour</span>
        </button>

        {/* SPLIT SCREEN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 relative items-start">
          
          {/* LEFT: Scrollable Gallery */}
          <div className="w-full lg:w-[60%] flex flex-col gap-4 md:gap-8">
            {gallery.length > 0 ? (
              gallery.map((img, idx) => (
                <div key={idx} className="gallery-img w-full aspect-[4/5] bg-zinc-900 rounded-3xl overflow-hidden relative">
                  <img src={img.image_url} alt={`${product.name} - ${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              ))
            ) : (
              <div className="gallery-img w-full aspect-[4/5] bg-zinc-900 rounded-3xl flex items-center justify-center">
                <span className="text-zinc-600">Aucune image disponible</span>
              </div>
            )}
          </div>

          {/* RIGHT: Sticky Product Details */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-32 flex flex-col pt-10 lg:pt-0">
            <h1 className="product-info-anim text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
              {product.name}
            </h1>
            
            {isPromo ? (
              <div className="product-info-anim flex items-center gap-3 mb-8 flex-wrap">
                <span className="text-4xl md:text-5xl font-black text-rose-500">
                  {product.promo_price.toFixed(2)} DH
                </span>
                <span className="text-xl md:text-2xl text-gray-500 line-through font-semibold">
                  {product.base_price.toFixed(2)} DH
                </span>
                <span className="bg-rose-600/20 text-rose-400 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                  PROMO -{discountPct}%
                </span>
              </div>
            ) : (
              <div className="product-info-anim text-3xl font-bold text-pink-500 mb-8">
                {product.base_price.toFixed(2)} DH
              </div>
            )}

            {product.description && (
              <p className="product-info-anim text-gray-400 font-light text-lg mb-10 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selector */}
            {sizes.length > 0 && (
              <div className="product-info-anim mb-12">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-300">Tailles disponibles</span>
                  <span className="text-xs text-gray-500 underline cursor-pointer hover:text-white">Guide des tailles</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size.size_name)}
                      className={`py-4 rounded-xl font-bold transition-all border ${
                        selectedSize === size.size_name
                          ? 'border-pink-500 bg-pink-500/10 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {size.size_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

             <div className="product-info-anim flex items-center gap-4 mb-10">
               {maxStock > 0 ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                      {selectedSize 
                        ? `En Stock : ${maxStock} article(s) disponible(s) en taille ${selectedSize}`
                        : `En Stock : ${maxStock} article(s) disponible(s)`
                      }
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Épuisé</span>
                  </div>
                )}
             </div>

            {/* Call to Actions */}
             <div className="product-info-anim flex flex-col gap-4">
               <button
                 onClick={handleAddToCart}
                 disabled={maxStock === 0}
                 className="w-full bg-white text-black py-6 rounded-full font-black uppercase tracking-widest text-lg hover:bg-pink-500 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden cursor-pointer"
               >
                 <span className="relative z-10 flex items-center justify-center gap-3">
                   {maxStock > 0 ? 'Ajouter au Panier' : 'Épuisé'}
                   {maxStock > 0 && <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                 </span>
               </button>

               <button
                 onClick={handleWhatsAppOrder}
                 className="w-full border border-green-500/50 bg-green-500/10 text-green-400 py-4 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-green-500 hover:text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
               >
                 <MessageCircle className="w-5 h-5" />
                 Acheter via WhatsApp
               </button>
             </div>

             {/* Share Section */}
             <div className="product-info-anim mt-8 pt-6 border-t border-white/10">
               <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4 block">Partager ce produit</span>
               <div className="flex items-center gap-3">
                 {/* WhatsApp Share */}
                 <a
                   href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Regarde ce produit incroyable chez Shopping by Lina : *${product.name}*\n${window.location.href}`)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-green-500/10 hover:text-green-400 text-gray-400 flex items-center justify-center transition-all duration-300"
                   title="Partager sur WhatsApp"
                 >
                   <MessageCircle className="w-5 h-5" />
                 </a>

                 {/* Facebook Share */}
                 <a
                   href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-400 text-gray-400 flex items-center justify-center transition-all duration-300"
                   title="Partager sur Facebook"
                 >
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                   </svg>
                 </a>

                 {/* Twitter Share */}
                 <a
                   href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(`Regarde ce produit incroyable chez Shopping by Lina : *${product.name}*`)}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-sky-500/50 hover:bg-sky-500/10 hover:text-sky-400 text-gray-400 flex items-center justify-center transition-all duration-300"
                   title="Partager sur Twitter"
                 >
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                   </svg>
                 </a>

                 {/* Copy Link */}
                 <button
                   onClick={() => {
                     navigator.clipboard.writeText(window.location.href);
                     setCopied(true);
                     setTimeout(() => setCopied(false), 2000);
                   }}
                   className="w-12 h-12 rounded-full bg-white/5 border border-white/10 hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-pink-400 text-gray-400 flex items-center justify-center transition-all duration-300 relative group cursor-pointer"
                   title="Copier le lien"
                 >
                   {copied ? <Check className="w-5 h-5 text-green-400" /> : <Link2 className="w-5 h-5" />}
                   {copied && (
                     <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-green-500 text-black font-bold text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in uppercase tracking-wider z-20">
                       Copié !
                     </span>
                   )}
                 </button>
               </div>
             </div>
            
            {/* Trust Badges */}
            <div className="product-info-anim mt-12 pt-8 border-t border-white/10 grid grid-cols-2 gap-4 text-xs font-bold uppercase tracking-wider text-gray-500">
              <div className="flex items-center gap-2"><span className="text-pink-500">✓</span> Livraison partout au Maroc</div>
              <div className="flex items-center gap-2"><span className="text-pink-500">✓</span> Qualité Premium</div>
              <div className="flex items-center gap-2"><span className="text-pink-500">✓</span> Paiement à la livraison</div>
              <div className="flex items-center gap-2"><span className="text-pink-500">✓</span> Support 24/7</div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-white/10">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12 text-center">
              Complétez votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Outfit</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
