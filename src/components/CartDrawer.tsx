import { useCartStore } from '../store/cartStore';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();

  const total = items.reduce(
    (sum, item) => sum + (item.product.base_price || 0) * item.quantity,
    0
  );

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    let message = `Bonjour ! J'aimerais passer la commande suivante :\n\n`;
    
    items.forEach((item, index) => {
      const sizeInfo = item.size ? ` (Taille : ${item.size.size_name})` : '';
      message += `${index + 1}. *${item.product.name}*${sizeInfo}\n`;
      message += `   Quantité : ${item.quantity} x ${item.product.base_price} DH\n`;
    });

    message += `\n*Total estimé : ${total.toFixed(2)} DH*\n\n`;
    message += `Je reste dans l'attente de confirmer les détails de livraison.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=212712130088&text=${encoded}`, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] transition-opacity duration-500 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-zinc-950 border-l border-white/10 z-[10001] transform transition-transform duration-500 ease-in-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3 text-white">
            <ShoppingBag className="w-6 h-6" />
            <h2 className="text-xl font-black uppercase tracking-widest">Votre Panier</h2>
          </div>
          <button 
            onClick={closeCart}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <ShoppingBag className="w-16 h-16 text-gray-600" />
              <p className="text-gray-400 font-bold uppercase tracking-widest">Le panier est vide</p>
              <button onClick={closeCart} className="text-pink-500 underline text-sm">Continuer mes achats</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.product.id}-${item.size?.id}`} className="flex gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 relative group">
                <Link to={`/product/${item.product.id}`} onClick={closeCart} className="w-24 h-24 bg-zinc-900 rounded-xl overflow-hidden shrink-0">
                  {item.product.image_url ? (
                    <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 flex flex-col justify-between">
                  <div className="pr-8">
                    <h3 className="text-white font-bold text-sm line-clamp-1">{item.product.name}</h3>
                    <p className="text-pink-500 font-black mt-1">{item.product.base_price.toFixed(2)} DH</p>
                    {item.size && (
                      <span className="inline-block mt-2 text-[10px] font-bold bg-white/10 text-gray-300 px-2 py-0.5 rounded uppercase">
                        {item.size.size_name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center bg-black rounded-lg border border-white/10">
                      <button 
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50"
                        onClick={() => updateQuantity(item.product.id, item.size?.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                      <button 
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-50"
                        onClick={() => updateQuantity(item.product.id, item.size?.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.size?.stock || item.product.stock || 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => removeItem(item.product.id, item.size?.id)}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer (Total & Checkout) */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-zinc-950">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 uppercase tracking-widest text-sm font-bold">Total estimé</span>
              <span className="text-3xl font-black text-white">{total.toFixed(2)} <span className="text-pink-500 text-xl">DH</span></span>
            </div>
            <button
              onClick={handleWhatsAppCheckout}
              className="w-full bg-green-500 text-black py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-green-400 transition-colors flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              <MessageCircle className="w-6 h-6" />
              Commander via WhatsApp
            </button>
            <p className="text-center text-xs text-gray-600 mt-4 uppercase tracking-widest font-bold">
              Le paiement s'effectue à la livraison (Cash on Delivery)
            </p>
          </div>
        )}
      </div>
    </>
  );
}
