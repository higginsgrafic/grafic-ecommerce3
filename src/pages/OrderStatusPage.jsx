import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, CheckCircle, Truck, MapPin, Mail } from 'lucide-react';
import SEO from '@/components/SEO';

function OrderStatusPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setOrderData(null);

    // Simulació de cerca de comanda
    setTimeout(() => {
      // Exemple de dades simulades
      if (orderNumber && email) {
        setOrderData({
          orderNumber: orderNumber,
          date: '2024-12-04',
          status: 'in_transit',
          items: 2,
          total: '31.00€',
          trackingNumber: 'GFC' + orderNumber.slice(-6).toUpperCase(),
          estimatedDelivery: '2024-12-08'
        });
      } else {
        setError('Si us plau, omple tots els camps.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const statusSteps = [
    { id: 'confirmed', label: 'Confirmada', icon: CheckCircle, completed: true },
    { id: 'processing', label: 'En Producció', icon: Package, completed: true },
    { id: 'in_transit', label: 'En Trànsit', icon: Truck, completed: orderData?.status === 'in_transit' || orderData?.status === 'delivered' },
    { id: 'delivered', label: 'Entregada', icon: MapPin, completed: orderData?.status === 'delivered' }
  ];

  return (
    <>
      <SEO
        title="Estat de la Comanda | GRÀFIC"
        description="Rastreja la teva comanda de GRÀFIC en temps real. Introdueix el teu número de comanda i email per veure l'estat actual: producció, enviament i lliurament previst."
        keywords="seguiment comanda gràfic, rastrejar comanda, estat comanda, tracking"
        type="website"
        url="/status"
      />

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-gray-900 text-white pt-[129px] lg:pt-[145px] pb-16 lg:pb-24">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <Package className="w-16 h-16 mx-auto mb-6" />
              <h1 className="font-oswald text-[36pt] lg:text-[48pt] font-bold uppercase mb-4">
                Estat de la Comanda
              </h1>
              <p className="font-roboto text-[14pt] text-gray-300">
                Rastreja la teva comanda en temps real
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-50 rounded-2xl p-8 lg:p-12 mb-12"
          >
            <h2 className="font-oswald text-[24pt] font-bold mb-6 text-center" style={{ color: '#141414' }}>
              Introdueix les Dades de la Teva Comanda
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="orderNumber" className="block font-roboto text-[12pt] font-medium text-gray-700 mb-2">
                  Número de Comanda *
                </label>
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="GFC-123456"
                  className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto text-[14pt]"
                  required
                />
                <p className="font-roboto text-[11pt] text-gray-500 mt-2">
                  El trobaràs a l'email de confirmació de la comanda
                </p>
              </div>

              <div>
                <label htmlFor="email" className="block font-roboto text-[12pt] font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="el-teu-email@exemple.com"
                  className="w-full px-6 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent font-roboto text-[14pt]"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-roboto text-[13pt] text-red-800">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white px-8 py-4 rounded-lg font-roboto text-[14pt] font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cercant...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Rastrejar Comanda
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Order Status Display */}
          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Order Info */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                <h3 className="font-oswald text-[20pt] font-bold mb-6" style={{ color: '#141414' }}>
                  Informació de la Comanda
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-roboto text-[11pt] text-gray-500 mb-1">Número de Comanda</p>
                    <p className="font-roboto text-[14pt] font-bold" style={{ color: '#141414' }}>
                      {orderData.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="font-roboto text-[11pt] text-gray-500 mb-1">Data de la Comanda</p>
                    <p className="font-roboto text-[14pt] font-bold" style={{ color: '#141414' }}>
                      {new Date(orderData.date).toLocaleDateString('ca-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="font-roboto text-[11pt] text-gray-500 mb-1">Número de Seguiment</p>
                    <p className="font-roboto text-[14pt] font-bold" style={{ color: '#141414' }}>
                      {orderData.trackingNumber}
                    </p>
                  </div>
                  <div>
                    <p className="font-roboto text-[11pt] text-gray-500 mb-1">Lliurament Estimat</p>
                    <p className="font-roboto text-[14pt] font-bold text-green-600">
                      {new Date(orderData.estimatedDelivery).toLocaleDateString('ca-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                <h3 className="font-oswald text-[20pt] font-bold mb-8" style={{ color: '#141414' }}>
                  Estat del Seguiment
                </h3>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-green-600 transition-all duration-500"
                      style={{
                        width: `${(statusSteps.filter(s => s.completed).length - 1) / (statusSteps.length - 1) * 100}%`
                      }}
                    />
                  </div>

                  {/* Steps */}
                  <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statusSteps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className="flex flex-col items-center">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                              step.completed
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <p className={`font-roboto text-[12pt] text-center ${
                            step.completed ? 'font-medium text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-oswald text-[16pt] font-bold mb-2 text-blue-900">
                      Necessites Ajuda?
                    </h4>
                    <p className="font-roboto text-[13pt] text-blue-800 leading-relaxed">
                      Si tens alguna pregunta sobre la teva comanda, contacta amb el nostre servei d'atenció al client
                      a <a href="mailto:orders@grafic.cat" className="underline font-medium">orders@grafic.cat</a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

export default OrderStatusPage;
