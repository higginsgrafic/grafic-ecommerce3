import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Lock, Eye, EyeOff } from 'lucide-react';
import SEO from '@/components/SEO';

export default function AdminLoginPage() {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const { enableAdmin, isAdmin } = useAdmin();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (enableAdmin(key)) {
      navigate('/admin');
    } else {
      setError('Clau incorrecta');
      setKey('');
    }
  };

  return (
    <>
      <SEO title="Login Admin" />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
              Accés Administrador
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Introdueix la clau per accedir al panell d'administració
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
                  Clau d'accés
                </label>
                <div className="relative">
                  <input
                    id="key"
                    type={showKey ? 'text' : 'password'}
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                    placeholder="Introdueix la clau"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Entrar
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tornar a l'inici
              </button>
            </div>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Clau per defecte: <code className="bg-gray-200 px-2 py-1 rounded">admin123</code>
          </div>
        </div>
      </div>
    </>
  );
}
