import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ShoppingBag, ScanBarcode, ArrowLeft, Clock, CheckCircle2, XCircle, Tag, MessageCircle, Share2, Sparkles } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
  products?: {
    id: string;
    name: string;
    barcode?: string;
    base_price?: number;
    is_promo?: boolean;
    promo_price?: number;
    image_url?: string;
  } | any;
  product_sizes?: {
    id: string;
    size_name: string;
    barcode?: string;
  } | any;
}

interface OrderDetail {
  id: string;
  order_number?: number;
  total: number;
  created_at: string;
  status: string;
  notes?: string;
  service_type?: string;
  payment_status?: string;
  payment_method?: string;
  order_items: OrderItem[];
}

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const cleanSearch = id.trim().replace(/^#?WEB-/i, '');

    try {
      // Query order by UUID prefix, full UUID, or order_number
      let query = supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total,
          created_at,
          status,
          notes,
          service_type,
          payment_status,
          payment_method,
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            notes,
            product_id,
            size_id,
            products (
              id,
              name,
              barcode,
              base_price,
              is_promo,
              promo_price,
              image_url
            ),
            product_sizes (
              id,
              size_name,
              barcode
            )
          )
        `);

      const isNumeric = !isNaN(Number(cleanSearch)) && cleanSearch.trim() !== '';
      const isFullUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSearch);
      const isHexPrefix = /^[0-9a-f]{8}$/i.test(cleanSearch);

      if (isFullUuid) {
        query = query.eq('id', cleanSearch);
      } else if (isHexPrefix) {
        const lower = cleanSearch.toLowerCase();
        const minUuid = `${lower}-0000-0000-0000-000000000000`;
        const maxUuid = `${lower}-ffff-ffff-ffff-ffffffffffff`;
        if (isNumeric) {
          query = query.or(`order_number.eq.${cleanSearch},and(id.gte.${minUuid},id.lte.${maxUuid})`);
        } else {
          query = query.gte('id', minUuid).lte('id', maxUuid);
        }
      } else if (isNumeric) {
        query = query.eq('order_number', Number(cleanSearch));
      } else {
        query = query.eq('id', cleanSearch);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) throw error;
      setOrder(data as unknown as OrderDetail);
    } catch (err) {
      console.error('Error loading order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number) => {
    return `${Number(amount).toFixed(2)} DH`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Commande #${order?.id.slice(0, 8).toUpperCase()}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex flex-col items-center justify-center bg-black text-white">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm font-medium animate-pulse">
          Chargement de votre commande...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 flex flex-col items-center justify-center bg-black text-white text-center">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-400 opacity-60" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2 text-white">Commande introuvable</h1>
        <p className="text-gray-400 text-sm max-w-md mb-8">
          Nous n'avons pas pu trouver la commande correspondant au code "{id}". Veuillez vérifier votre référence.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  const refCode = `#WEB-${order.id.slice(0, 8).toUpperCase()}`;
  const orderDate = new Date(order.created_at).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  const totalItems = order.order_items ? order.order_items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const isCompleted = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-gray-950 via-black to-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Navigation back link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour au magasin
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 rounded-xl border border-emerald-500/30 transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Lien copié !' : 'Partager'}
          </button>
        </div>

        {/* Card Main Container */}
        <div className="bg-gray-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Header Banner */}
          <div className="p-6 md:p-8 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-gray-900 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-black text-lg text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-xl border border-emerald-500/30 flex items-center gap-2 shadow-inner">
                    <Tag className="w-4 h-4" />
                    {refCode}
                  </span>

                  {/* Status Badge */}
                  {isCompleted ? (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Commande Validée
                    </span>
                  ) : isCancelled ? (
                    <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider">
                      <XCircle className="w-3.5 h-3.5" />
                      Commande Annulée
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      En attente de confirmation
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 font-medium">
                  Passée le <span className="text-gray-200 font-semibold">{orderDate}</span>
                </p>
              </div>

              <div className="text-left md:text-right bg-white/5 md:bg-transparent p-3 md:p-0 rounded-2xl border border-white/5 md:border-none">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total de la commande</span>
                <span className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Articles Section */}
          <div className="p-6 md:p-8">
            <h2 className="text-sm font-extrabold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              Articles commandés ({totalItems})
            </h2>

            <div className="space-y-3">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item) => {
                  const rawProduct = item.products;
                  const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
                  const rawSize = item.product_sizes;
                  const size = Array.isArray(rawSize) ? rawSize[0] : rawSize;
                  const barcode = size?.barcode || product?.barcode || 'Non spécifié';
                  const isPromo = product?.is_promo && product?.promo_price && product?.promo_price > 0 && product?.promo_price < (product?.base_price || 0);

                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-white/5 hover:bg-white/[0.08] border border-white/10 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Product details */}
                      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        {product?.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-xl border border-white/10 flex-shrink-0 bg-gray-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0">
                            N/A
                          </div>
                        )}

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-base truncate">
                              {product?.name || 'Produit'}
                            </span>
                            {size?.size_name ? (
                              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-black px-2.5 py-0.5 rounded-lg">
                                Taille: {size.size_name}
                              </span>
                            ) : (
                              <span className="bg-white/10 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded-lg">
                                Taille unique
                              </span>
                            )}
                          </div>

                          {/* Barcode & Promo */}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="flex items-center gap-1.5 font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                              <ScanBarcode className="w-3.5 h-3.5 text-emerald-400" />
                              {barcode}
                            </span>

                            {isPromo && (
                              <span className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3 h-3" />
                                PROMOTION
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price breakdown */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/10">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Prix Unitaire</span>
                          <span className="text-sm font-extrabold text-gray-200">
                            {formatPrice(item.unit_price)}
                          </span>
                        </div>

                        <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-center">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Qté</span>
                          <span className="text-sm font-black text-emerald-400">x{item.quantity}</span>
                        </div>

                        <div className="text-right min-w-[90px]">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block">Sous-total</span>
                          <span className="text-base font-black text-white">
                            {formatPrice(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-400 italic bg-white/5 rounded-2xl border border-white/10">
                  Aucun article trouvé pour cette commande.
                </div>
              )}
            </div>
          </div>

          {/* Footer Contact */}
          <div className="p-6 md:p-8 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-white mb-0.5">Besoin d'aide avec votre commande ?</p>
              <p className="text-xs text-gray-400">Contactez-nous sur WhatsApp en citant le code {refCode}</p>
            </div>

            <a
              href={`https://api.whatsapp.com/send?phone=212712130088&text=${encodeURIComponent(`Bonjour, j'ai une question concernant ma commande ${refCode}`)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle className="w-4 h-4" />
              Contactez-nous sur WhatsApp
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
