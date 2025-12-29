import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/contexts/ToastContext';
import { useGridDebug } from '@/contexts/GridDebugContext';

function Checkout({ isOpen, onClose, items, totalPrice, onComplete }) {
  const { error } = useToast();
  const { getDebugStyle, isSectionEnabled } = useGridDebug();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Fake API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsProcessing(false);
      onComplete();

    } catch (err) {
      console.error('Checkout error:', err);
      setIsProcessing(false);
      error("Hi ha hagut un problema en processar la teva comanda. Si us plau, torna-ho a provar.");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
            style={isSectionEnabled('checkout') ? getDebugStyle('checkout', 'main') : {}}
          >
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                <h2 className="text-2xl font-bold transition-opacity" style={{ color: "#141414" }}>Caixa Segura</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4" style={{ color: "#141414" }}>Informació de Contacte</h3>
                  <div className="space-y-4">
                    <input type="email" name="email" placeholder="Correu electrònic" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold transition-opacity mb-4" style={{ color: "#141414" }}>Adreça d'Enviament</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" name="firstName" placeholder="Nom" value={formData.firstName} onChange={handleChange} required className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                    <input type="text" name="lastName" placeholder="Cognoms" value={formData.lastName} onChange={handleChange} required className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                    <input type="text" name="address" placeholder="Adreça" value={formData.address} onChange={handleChange} required className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                    <input type="text" name="city" placeholder="Ciutat" value={formData.city} onChange={handleChange} required className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                    <input type="text" name="postalCode" placeholder="Codi Postal" value={formData.postalCode} onChange={handleChange} required className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                    <input type="text" name="country" placeholder="País" value={formData.country} onChange={handleChange} required className="col-span-2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold transition-opacity mb-4 flex items-center gap-2" style={{ color: "#141414" }}><CreditCard className="h-5 w-5" /> Informació de Pagament</h3>
                  <div className="space-y-4">
                    <input type="text" name="cardNumber" placeholder="Número de Targeta" value={formData.cardNumber} onChange={handleChange} required maxLength="16" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="expiryDate" placeholder="MM/AA" value={formData.expiryDate} onChange={handleChange} required maxLength="5" className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                      <input type="text" name="cvv" placeholder="CVV" value={formData.cvv} onChange={handleChange} required maxLength="3" className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm"><span className="transition-opacity" style={{ color: "#141414", opacity: 0.7 }}>Subtotal</span><span className="font-medium">{totalPrice.toFixed(2)}€</span></div>
                    <div className="flex justify-between text-sm"><span className="transition-opacity" style={{ color: "#141414", opacity: 0.7 }}>Enviament</span><span className="font-medium">Gratuït</span></div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span>{totalPrice.toFixed(2)}€</span></div>
                  </div>

                  <Button type="submit" disabled={isProcessing} className="w-full bg-gray-900 hover:bg-gray-800 text-white py-6 text-lg">
                    {isProcessing ? (<span className="flex items-center gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>Processant...</span>) : (`Paga ${totalPrice.toFixed(2)}€`)}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default Checkout;
