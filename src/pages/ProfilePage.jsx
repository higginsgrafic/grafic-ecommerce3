import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, Settings, Heart, LogOut, Edit2, Mail, Phone } from 'lucide-react';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useProductContext } from '@/contexts/ProductContext';

function ProfilePage() {
  const { wishlistItems, clearWishlist } = useProductContext();
  const [activeTab, setActiveTab] = useState('info');

  // Dades d'usuari simulades (en producció vindrien d'autenticació)
  const [userInfo, setUserInfo] = useState({
    name: 'Nom Cognom',
    email: 'usuari@exemple.com',
    phone: '+34 600 000 000',
    avatar: null
  });

  const [isEditing, setIsEditing] = useState(false);

  // Comandes simulades
  const orders = [
    {
      id: 'ORD-001',
      date: '15/11/2024',
      total: 47.00,
      status: 'Entregat',
      items: 3
    },
    {
      id: 'ORD-002',
      date: '28/10/2024',
      total: 31.00,
      status: 'Entregat',
      items: 2
    },
    {
      id: 'ORD-003',
      date: '12/10/2024',
      total: 62.00,
      status: 'En trànsit',
      items: 4
    }
  ];

  // Adreces simulades
  const addresses = [
    {
      id: 1,
      type: 'Casa',
      name: 'Nom Cognom',
      street: 'Carrer Principal, 123',
      city: '08001 Barcelona',
      country: 'Espanya',
      isDefault: true
    },
    {
      id: 2,
      type: 'Feina',
      name: 'Nom Cognom',
      street: 'Avinguda Diagonal, 456',
      city: '08013 Barcelona',
      country: 'Espanya',
      isDefault: false
    }
  ];

  const tabs = [
    { id: 'info', label: 'Informació Personal', icon: User },
    { id: 'orders', label: 'Les Meves Comandes', icon: Package },
    { id: 'addresses', label: 'Adreces', icon: MapPin },
    { id: 'wishlist', label: 'Favorits', icon: Heart },
    { id: 'settings', label: 'Preferències', icon: Settings }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Entregat':
        return 'text-green-600 bg-green-50';
      case 'En trànsit':
        return 'text-blue-600 bg-blue-50';
      case 'Procesant':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  useEffect(() => {
    if (isEditing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditing]);

  return (
    <>
      <Helmet>
        <title>El Meu Perfil | GRÀFIC</title>
        <meta name="description" content="Gestiona el teu perfil, comandes i preferències a GRÀFIC" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 pt-[129px] lg:pt-[145px] pb-6 sm:pb-8 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          {/* Breadcrumbs */}
          <div className="mb-6 sm:mb-8">
            <Breadcrumbs items={[
              { label: 'El Meu Perfil' }
            ]} />
          </div>

          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 sm:h-10 sm:w-10 text-gray-500" />
                </div>
                <div>
                  <h1 className="font-oswald text-2xl sm:text-3xl font-bold uppercase">
                    {userInfo.name}
                  </h1>
                  <p className="text-gray-600 font-roboto">{userInfo.email}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <LogOut className="h-5 w-5" />
                <span className="font-roboto text-sm">Tancar sessió</span>
              </button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-x-auto">
            <div className="flex border-b border-gray-200 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-roboto font-medium transition-colors border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-600 hover:text-black'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            {/* Informació Personal */}
            {activeTab === 'info' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-oswald text-2xl font-bold uppercase">Informació Personal</h2>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    {isEditing ? 'Cancel·lar' : 'Editar'}
                  </button>
                </div>

                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="block text-sm font-roboto font-semibold text-gray-700 mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={userInfo.name}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md font-roboto focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-semibold text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-2" />
                      Correu electrònic
                    </label>
                    <input
                      type="email"
                      value={userInfo.email}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md font-roboto focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-roboto font-semibold text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Telèfon
                    </label>
                    <input
                      type="tel"
                      value={userInfo.phone}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md font-roboto focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50"
                    />
                  </div>

                  {isEditing && (
                    <button className="bg-black text-white px-6 py-3 font-oswald font-bold uppercase hover:bg-gray-800 transition-colors">
                      Guardar canvis
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Comandes */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="font-oswald text-2xl font-bold uppercase mb-6">Les Meves Comandes</h2>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-oswald font-bold text-lg">Comanda #{order.id}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-roboto font-semibold ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 font-roboto">
                            {order.date} · {order.items} {order.items === 1 ? 'producte' : 'productes'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-oswald text-xl font-bold">{order.total.toFixed(2)} €</p>
                          <Link
                            to={`/order/${order.id}`}
                            className="text-sm underline hover:no-underline font-roboto"
                          >
                            Veure detalls
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Adreces */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-oswald text-2xl font-bold uppercase">Les Meves Adreces</h2>
                  <button className="bg-black text-white px-4 py-2 font-oswald text-sm font-bold uppercase hover:bg-gray-800 transition-colors">
                    Afegir adreça
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-6 relative">
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 bg-black text-white px-2 py-1 text-xs font-roboto font-semibold rounded">
                          Per defecte
                        </span>
                      )}
                      <h3 className="font-oswald font-bold text-lg mb-2">{address.type}</h3>
                      <p className="font-roboto text-gray-700">{address.name}</p>
                      <p className="font-roboto text-gray-600 text-sm">{address.street}</p>
                      <p className="font-roboto text-gray-600 text-sm">{address.city}</p>
                      <p className="font-roboto text-gray-600 text-sm">{address.country}</p>
                      <div className="flex gap-3 mt-4">
                        <button className="text-sm underline hover:no-underline font-roboto">
                          Editar
                        </button>
                        <button className="text-sm text-red-600 underline hover:no-underline font-roboto">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorits */}
            {activeTab === 'wishlist' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-oswald text-2xl font-bold uppercase">Els Meus Favorits</h2>
                  <Link
                    to="/wishlist"
                    className="text-sm underline hover:no-underline font-roboto"
                  >
                    Veure tots els favorits
                  </Link>
                </div>
                <p className="text-gray-600 font-roboto">
                  Tens {wishlistItems.length} {wishlistItems.length === 1 ? 'producte favorit' : 'productes favorits'}
                </p>
              </div>
            )}

            {/* Preferències */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="font-oswald text-2xl font-bold uppercase mb-6">Preferències</h2>
                <div className="space-y-6 max-w-2xl">
                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <h3 className="font-roboto font-semibold">Notificacions per correu</h3>
                      <p className="text-sm text-gray-600 font-roboto">Rebre actualitzacions sobre comandes i ofertes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-gray-200">
                    <div>
                      <h3 className="font-roboto font-semibold">Newsletter</h3>
                      <p className="text-sm text-gray-600 font-roboto">Rebre novetats i ofertes exclusives</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="font-roboto font-semibold">Idioma</h3>
                      <p className="text-sm text-gray-600 font-roboto">Català</p>
                    </div>
                    <button className="text-sm underline hover:no-underline font-roboto">
                      Canviar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;
