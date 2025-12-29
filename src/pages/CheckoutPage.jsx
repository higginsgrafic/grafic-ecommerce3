import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Elements } from '@stripe/react-stripe-js';
import { Lock, CreditCard, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentForm from '@/components/PaymentForm';
import { getStripe } from '@/api/stripe';
import { validateEmail, validateRequired, validatePostalCode, validateForm } from '@/utils/validation';
import { trackBeginCheckout, trackPurchase } from '@/utils/analytics';
import { useToast } from '@/contexts/ToastContext';
import Breadcrumbs from '@/components/Breadcrumbs';

// Verificar si Stripe està configurat
const isStripeConfigured = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY &&
                           import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY !== 'pk_test_DEMO_KEY';

const CheckoutPage = ({ cartItems, onClearCart }) => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Espanya'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [useStripePayment] = useState(!!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const stripePromise = isStripeConfigured ? getStripe() : null;

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 5.95;
  const total = subtotal + shipping;

  // Track begin checkout
  useEffect(() => {
    if (cartItems.length > 0) {
      trackBeginCheckout(cartItems, total);
    }
  }, []); // Only on mount

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulari
    const rules = {
      email: [
        { validate: validateRequired, message: 'El correu és obligatori' },
        { validate: validateEmail, message: 'Format de correu invàlid' }
      ],
      firstName: [
        { validate: validateRequired, message: 'El nom és obligatori' }
      ],
      lastName: [
        { validate: validateRequired, message: 'Els cognoms són obligatoris' }
      ],
      address: [
        { validate: validateRequired, message: "L'adreça és obligatòria" }
      ],
      city: [
        { validate: validateRequired, message: 'La ciutat és obligatòria' }
      ],
      postalCode: [
        { validate: validateRequired, message: 'El codi postal és obligatori' },
        { validate: validatePostalCode, message: 'Codi postal invàlid (format: 08001)' }
      ]
    };

    const errors = validateForm(formData, rules);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showError('Si us plau, corregeix els errors del formulari');
      return;
    }

    setFormErrors({});
    setIsProcessing(true);

    try {
      // Simulem una crida API
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIsProcessing(false);

      // Generar ID de comanda
      const orderId = 'GRF-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase();

      // Track purchase
      trackPurchase(orderId, cartItems, total, shipping, 0);

      // Clear cart
      if (onClearCart) {
        onClearCart();
      }

      // Redirigir a pàgina de confirmació
      success('Comanda confirmada');
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      setIsProcessing(false);
      showError('Error processant la comanda');
    }
  };

  // Si el cistell està buit, redirigir
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] bg-gray-50 py-12 flex items-center justify-center">
        <Helmet>
          <title>Checkout | GRAFC</title>
        </Helmet>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16 bg-white rounded-lg shadow-sm max-w-md p-12"
        >
          <div className="mb-6">
            <img
              src="/custom_logos/icons/basket-empty.svg"
              alt="Cistell buit"
              className="h-24 w-24 mx-auto opacity-20"
            />
          </div>
          <h2 className="text-2xl font-medium mb-4" style={{ color: '#141414' }}>El cistell està buit</h2>
          <p className="text-gray-500 mb-8">Afegeix productes abans de continuar al checkout.</p>
          <Link to="/">
            <Button className="rounded-sm" style={{ backgroundColor: '#141414', color: '#FFFFFF' }}>
              Tornar a la Botiga
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[129px] lg:pt-[145px] pb-8 md:pb-12">
      <Helmet>
        <title>Checkout | GRAFC</title>
        <meta name="description" content="Completa la teva comanda de manera segura." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6 sm:mb-8">
          <Breadcrumbs items={[
            { label: 'Cistell', link: '/cart' },
            { label: 'Checkout' }
          ]} />
        </div>

        {/* Capçalera amb botó tornar */}
        <div className="mb-6 sm:mb-8">
          <Link to="/cart" className="inline-flex items-center text-xs sm:text-sm mb-3 sm:mb-4 hover:underline" style={{ color: '#141414', opacity: 0.6 }}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Tornar al cistell
          </Link>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-oswald uppercase" style={{ color: '#141414' }}>
            Checkout Segur
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm" style={{ color: '#141414', opacity: 0.6 }}>
            Completa la teva comanda de manera segura
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Columna Esquerra: Formulari Checkout */}
          <div className="lg:col-span-2 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <h2 className="text-base sm:text-lg font-bold font-oswald uppercase" style={{ color: '#141414' }}>
                  Informació de Compra
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Contacte */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm uppercase mb-2 sm:mb-3" style={{ color: '#141414' }}>Contacte</h3>
                  <input
                    type="email"
                    name="email"
                    placeholder="Correu electrònic"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    style={{ color: '#141414' }}
                  />
                </div>

                {/* Enviament */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm uppercase mb-2 sm:mb-3" style={{ color: '#141414' }}>Adreça d'Enviament</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Nom"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      style={{ color: '#141414' }}
                    />
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Cognoms"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      style={{ color: '#141414' }}
                    />
                    <input
                      type="text"
                      name="address"
                      placeholder="Adreça"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="col-span-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      style={{ color: '#141414' }}
                    />
                    <input
                      type="text"
                      name="city"
                      placeholder="Ciutat"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      style={{ color: '#141414' }}
                    />
                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Codi Postal"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      style={{ color: '#141414' }}
                    />
                    <input
                      type="text"
                      name="country"
                      placeholder="País"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="col-span-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                      style={{ color: '#141414' }}
                    />
                  </div>
                </div>

                {/* Pagament */}
                <div>
                  <h3 className="font-bold text-xs sm:text-sm uppercase mb-2 sm:mb-3 flex items-center gap-2" style={{ color: '#141414' }}>
                    <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Informació de Pagament
                  </h3>

                  {isStripeConfigured ? (
                    <Elements stripe={stripePromise}>
                      <PaymentForm
                        amount={total}
                        billingDetails={formData}
                        onSuccess={(paymentIntent) => {
                          const orderId = 'GRF-2024-' + Math.random().toString(36).substr(2, 9).toUpperCase();
                          trackPurchase(orderId, cartItems, total, shipping, 0);
                          if (onClearCart) onClearCart();
                          success('Pagament processat');
                          navigate(`/order-confirmation/${orderId}`);
                        }}
                      />
                    </Elements>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                        <p className="text-xs sm:text-sm text-yellow-800">
                          ⚠️ Stripe no està configurat. Utilitzant mode demo.
                        </p>
                      </div>
                      <input
                        type="text"
                        name="cardNumber"
                        placeholder="Número de Targeta"
                        value={formData.cardNumber || ''}
                        onChange={handleChange}
                        maxLength="16"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        style={{ color: '#141414' }}
                      />
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <input
                          type="text"
                          name="expiryDate"
                          placeholder="MM/AA"
                          value={formData.expiryDate || ''}
                          onChange={handleChange}
                          maxLength="5"
                          className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          style={{ color: '#141414' }}
                        />
                        <input
                          type="text"
                          name="cvv"
                          placeholder="CVV"
                          value={formData.cvv || ''}
                          onChange={handleChange}
                          maxLength="3"
                          className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                          style={{ color: '#141414' }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Botó de pagament - només a mòbil i si NO hi ha Stripe */}
                {!isStripeConfigured && (
                  <div className="lg:hidden pt-4">
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full h-12 text-sm font-oswald uppercase tracking-wider rounded-sm"
                      style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processant...
                        </span>
                      ) : (
                        `Pagar ${total.toFixed(2).replace('.', ',')} €`
                      )}
                    </Button>
                    <p className="text-xs text-center mt-3" style={{ color: '#141414', opacity: 0.5 }}>
                      Les teves dades estan protegides amb encriptació SSL
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Columna Dreta: Resum de la Comanda */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg font-bold font-oswald uppercase mb-6" style={{ color: '#141414' }}>
                  Resum de la Comanda
                </h2>

                {/* Productes */}
                <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate" style={{ color: '#141414' }}>{item.name}</h4>
                        <p className="text-xs mt-1" style={{ color: '#141414', opacity: 0.6 }}>
                          Talla: {item.size} · Qty: {item.quantity}
                        </p>
                        <p className="text-sm font-medium mt-1" style={{ color: '#141414' }}>
                          {(item.price * item.quantity).toFixed(2).replace('.', ',')} €
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 mb-6 pb-6 border-b">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#141414', opacity: 0.6 }}>Subtotal</span>
                    <span style={{ color: '#141414' }}>{subtotal.toFixed(2).replace('.', ',')} €</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#141414', opacity: 0.6 }}>Enviament</span>
                    <span style={{ color: '#141414' }}>{shipping === 0 ? 'Gratuït' : `${shipping.toFixed(2).replace('.', ',')} €`}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-oswald text-xl font-normal" style={{ color: '#141414' }}>Total</span>
                    <span className="font-oswald text-xl font-normal" style={{ color: '#141414' }}>{total.toFixed(2).replace('.', ',')} €</span>
                  </div>
                </div>

                {/* Botó de pagament - només a desktop i si NO hi ha Stripe */}
                {!isStripeConfigured && (
                  <div className="hidden lg:block">
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      disabled={isProcessing}
                      className="w-full h-12 text-sm font-oswald uppercase tracking-wider rounded-sm"
                      style={{ backgroundColor: '#141414', color: '#FFFFFF' }}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processant...
                        </span>
                      ) : (
                        `Pagar ${total.toFixed(2).replace('.', ',')} €`
                      )}
                    </Button>
                    <p className="text-xs text-center mt-3" style={{ color: '#141414', opacity: 0.5 }}>
                      Les teves dades estan protegides amb encriptació SSL
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
