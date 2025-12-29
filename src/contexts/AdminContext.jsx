import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  // Carregar valors síncronament des de localStorage per evitar flashing
  const [isAdmin, setIsAdmin] = useState(() => {
    const adminKey = localStorage.getItem('adminKey');
    return adminKey === 'admin123';
  });

  const [editMode, setEditMode] = useState(false);

  const [bypassUnderConstruction, setBypassUnderConstruction] = useState(() => {
    const adminKey = localStorage.getItem('adminKey');
    const isValidAdmin = adminKey === 'admin123';

    if (isValidAdmin) {
      // Per defecte, activar bypass per als admins (poden desactivar-lo manualment si volen)
      const savedBypass = localStorage.getItem('bypassUnderConstruction');
      const bypass = savedBypass === null ? true : savedBypass === 'true';
      if (savedBypass === null) {
        localStorage.setItem('bypassUnderConstruction', 'true');
      }
      console.log('🔧 AdminContext initialized - Bypass:', bypass);
      return bypass;
    }
    return false;
  });

  // Netejar el bypass quan l'usuari deixa de ser admin
  useEffect(() => {
    if (!isAdmin) {
      localStorage.removeItem('bypassUnderConstruction');
      setBypassUnderConstruction(false);
    }
  }, [isAdmin]);

  const enableAdmin = (key) => {
    if (key === 'admin123') {
      localStorage.setItem('adminKey', key);
      setIsAdmin(true);
      // Activar automàticament el bypass per als admins
      localStorage.setItem('bypassUnderConstruction', 'true');
      setBypassUnderConstruction(true);
      console.log('✅ Admin activat - Bypass automàticament activat');
      return true;
    }
    return false;
  };

  const disableAdmin = () => {
    localStorage.removeItem('adminKey');
    localStorage.removeItem('bypassUnderConstruction');
    setIsAdmin(false);
    setEditMode(false);
    setBypassUnderConstruction(false);
  };

  const toggleEditMode = () => {
    setEditMode(prev => !prev);
  };

  const toggleBypassUnderConstruction = () => {
    // Només els administradors autenticats poden canviar el bypass
    if (!isAdmin) {
      console.warn('⚠️ Bypass Under Construction can only be toggled by admins');
      return;
    }
    setBypassUnderConstruction(prev => {
      const newValue = !prev;
      localStorage.setItem('bypassUnderConstruction', newValue.toString());
      console.log('🔄 Bypass Under Construction toggled:', newValue);
      return newValue;
    });
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      editMode,
      bypassUnderConstruction,
      setEditMode,
      toggleEditMode,
      toggleBypassUnderConstruction,
      enableAdmin,
      disableAdmin
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}
