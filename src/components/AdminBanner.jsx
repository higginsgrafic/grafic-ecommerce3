import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChevronLeft, ChevronRight, LogOut, Lock, Eye, EyeOff, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/contexts/AdminContext';
import { useToast } from '@/contexts/ToastContext';

export default function AdminBanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, disableAdmin, bypassUnderConstruction, toggleBypassUnderConstruction } = useAdmin();
  const { info, error } = useToast();

  const handleLogout = () => {
    disableAdmin();
    window.location.href = '/';
  };

  const downloadRouteTxt = () => {
    const pathname = location.pathname;
    const fullUrl = `${window.location.origin}${location.pathname}${location.search || ''}${location.hash || ''}`;
    try {
      const content = `pathname: ${pathname}\nurl: ${fullUrl}\n`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);

      // File names cannot contain '/' on macOS (it's the path separator). To preserve the
      // visual structure of routes, we replace it with the fullwidth slash '／'.
      const safeName = (pathname || '/')
        .replace(/^\//, '')
        .replace(/\//g, '／')
        .replace(/[^a-zA-Z0-9._\-／]+/g, '-');
      const filename = safeName ? `${safeName}.txt` : 'route.txt';

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
      info(`Ruta descarregada (${filename})`);
    } catch (err) {
      error('No s\'ha pogut descarregar la ruta');
    }
  };

  return (
    <div className="bg-red-600 h-[40px] w-full flex items-center relative">
      {/* Left: Navigation Arrows */}
      <div className="flex items-center gap-1.5 pl-4">
        {/* Back Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-8 w-8 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          aria-label="Anar enrere"
        >
          <ChevronLeft className="h-5 w-5 text-white" />
          <span className="sr-only">Enrere</span>
        </Button>

        {/* Logo GRÀFIC */}
        <Link to="/" className="block transition-transform hover:scale-105 active:scale-95" title="GRÀFIC - Inici">
          <img
            src="/custom_logos/brand/marca-grafic-logo.svg"
            alt="GRAFC"
            className="h-[17.5px] w-auto brightness-0 invert"
          />
        </Link>

        {/* Forward Arrow */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(1)}
          className="h-8 w-8 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
          aria-label="Anar endavant"
        >
          <ChevronRight className="h-5 w-5 text-white" />
          <span className="sr-only">Endavant</span>
        </Button>
      </div>

      {/* Center: Administració - absolutely centered */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBypassUnderConstruction}
            className={`h-8 w-8 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 transition-all ${
              bypassUnderConstruction ? 'text-white' : 'text-white/50'
            }`}
            title={bypassUnderConstruction ? 'Bypass "En Construcció" activat (clica per desactivar)' : 'Bypass "En Construcció" desactivat (clica per activar)'}
          >
            {bypassUnderConstruction ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        )}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:bg-red-700 transition-all px-3 py-1.5 rounded group"
        >
          <LayoutDashboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Administració</span>
        </Link>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={downloadRouteTxt}
            className="h-7 w-7 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            aria-label="Descarregar ruta"
            title="Descarregar ruta"
          >
            <Download className="h-4 w-4 text-white" />
          </Button>
          <span className="text-xs text-white/70 font-mono">
            {location.pathname}
          </span>
        </div>
      </div>

      {/* Right: Admin Controls */}
      <div className="absolute right-4 flex items-center gap-2">
        {isAdmin ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 gap-1.5"
            title="Tancar sessió"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-xs">Sortir</span>
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin-login')}
            className="h-8 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 gap-1.5"
            title="Entrar com a administrador"
          >
            <Lock className="w-4 h-4" />
            <span className="text-xs">Admin</span>
          </Button>
        )}
      </div>

    </div>
  );
}
