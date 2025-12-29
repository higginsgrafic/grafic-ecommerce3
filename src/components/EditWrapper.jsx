import React from 'react';
import { Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

export default function EditWrapper({
  children,
  editPath,
  section = 'section',
  className = ''
}) {
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();

  if (!isAdmin) {
    return children;
  }

  const handleEditClick = () => {
    navigate(editPath, { state: { editMode: true } });
  };

  return (
    <div className={`relative group ${className}`}>
      {children}
      <button
        onClick={handleEditClick}
        className="absolute top-4 right-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-700"
        title={`Editar ${section}`}
      >
        <Edit3 className="w-5 h-5" />
      </button>
    </div>
  );
}
