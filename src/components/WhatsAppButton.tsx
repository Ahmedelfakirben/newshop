import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  const handleWhatsApp = () => {
    const message = "Bonjour ! J'aimerais obtenir plus d'informations.";
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?phone=212712130088&text=${encodedMessage}`, '_blank');
  };

  return (
    <button
      onClick={handleWhatsApp}
      className="fixed bottom-6 right-6 z-[9900] group flex items-center justify-center w-14 h-14 bg-green-500 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] hover:scale-110 active:scale-95 transition-all duration-300"
      aria-label="Contacter par WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-20 group-hover:opacity-40"></div>
      <MessageCircle className="w-7 h-7 text-black relative z-10" />
    </button>
  );
}
