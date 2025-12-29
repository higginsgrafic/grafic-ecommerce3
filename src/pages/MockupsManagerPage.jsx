import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockupsAPI } from '../api/mockups';
import { useToast } from '../components/ui/use-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, Search, Filter, Upload, Download } from 'lucide-react';

export default function MockupsManagerPage() {
  const [mockups, setMockups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    collection: '',
    design_name: '',
    base_color: '',
    drawing_color: '',
    product_type: '',
    is_active: undefined
  });
  const [collections, setCollections] = useState([]);
  const [designs, setDesigns] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMockups();
    loadCollections();
  }, []);

  useEffect(() => {
    loadMockups();
  }, [filters]);

  useEffect(() => {
    if (filters.collection) {
      loadDesigns(filters.collection);
    }
  }, [filters.collection]);

  async function loadMockups() {
    try {
      setLoading(true);
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== undefined)
      );
      const data = await mockupsAPI.getAll(cleanFilters);
      setMockups(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No s\'han pogut carregar els mockups',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadCollections() {
    try {
      const data = await mockupsAPI.getCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  }

  async function loadDesigns(collection) {
    try {
      const data = await mockupsAPI.getDesignNames(collection);
      setDesigns(data);
    } catch (error) {
      console.error('Error loading designs:', error);
    }
  }

  async function handleToggleActive(id) {
    try {
      await mockupsAPI.toggleActive(id);
      toast({
        title: 'Actualitzat',
        description: 'Estat del mockup actualitzat'
      });
      loadMockups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleDelete(id) {
    if (!confirm('Segur que vols eliminar aquest mockup?')) return;

    try {
      await mockupsAPI.delete(id);
      toast({
        title: 'Eliminat',
        description: 'Mockup eliminat correctament'
      });
      loadMockups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  function startEdit(mockup) {
    setEditingId(mockup.id);
    setEditForm(mockup);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    try {
      await mockupsAPI.update(editingId, editForm);
      toast({
        title: 'Guardat',
        description: 'Mockup actualitzat correctament'
      });
      cancelEdit();
      loadMockups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  async function handleAdd(e) {
    e.preventDefault();
    try {
      await mockupsAPI.create(editForm);
      toast({
        title: 'Afegit',
        description: 'Mockup afegit correctament'
      });
      setShowAddForm(false);
      setEditForm({});
      loadMockups();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  }

  function exportToCSV() {
    const headers = ['collection', 'subcategory', 'sub_subcategory', 'design_name', 'drawing_color', 'base_color', 'product_type', 'file_path', 'variant_id', 'display_order', 'is_active'];
    const rows = mockups.map(m => [
      m.collection,
      m.subcategory || '',
      m.sub_subcategory || '',
      m.design_name,
      m.drawing_color,
      m.base_color,
      m.product_type,
      m.file_path,
      m.variant_id || '',
      m.display_order,
      m.is_active
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mockups-export.csv';
    a.click();
  }

  if (loading && mockups.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregant mockups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestió de Mockups</h1>
            <p className="mt-2 text-gray-600">Gestiona les imatges de previsualització dels productes</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/admin"
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Tornar
            </Link>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Afegir Mockup
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold">Filtres</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Col·lecció</label>
              <select
                value={filters.collection}
                onChange={e => setFilters({ ...filters, collection: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Totes</option>
                {collections.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Disseny</label>
              <select
                value={filters.design_name}
                onChange={e => setFilters({ ...filters, design_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!filters.collection}
              >
                <option value="">Tots</option>
                {designs.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color base</label>
              <input
                type="text"
                value={filters.base_color}
                onChange={e => setFilters({ ...filters, base_color: e.target.value })}
                placeholder="white, black..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color dibuix</label>
              <input
                type="text"
                value={filters.drawing_color}
                onChange={e => setFilters({ ...filters, drawing_color: e.target.value })}
                placeholder="black, white..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipus producte</label>
              <input
                type="text"
                value={filters.product_type}
                onChange={e => setFilters({ ...filters, product_type: e.target.value })}
                placeholder="tshirt, mug..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estat</label>
              <select
                value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                onChange={e => setFilters({
                  ...filters,
                  is_active: e.target.value === '' ? undefined : e.target.value === 'true'
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tots</option>
                <option value="true">Actius</option>
                <option value="false">Inactius</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {mockups.length} mockup{mockups.length !== 1 ? 's' : ''} trobat{mockups.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setFilters({
                collection: '',
                design_name: '',
                base_color: '',
                drawing_color: '',
                product_type: '',
                is_active: undefined
              })}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Esborrar filtres
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Afegir Mockup</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Col·lecció *</label>
                <input
                  type="text"
                  required
                  value={editForm.collection || ''}
                  onChange={e => setEditForm({ ...editForm, collection: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom disseny *</label>
                <input
                  type="text"
                  required
                  value={editForm.design_name || ''}
                  onChange={e => setEditForm({ ...editForm, design_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color dibuix *</label>
                <input
                  type="text"
                  required
                  value={editForm.drawing_color || ''}
                  onChange={e => setEditForm({ ...editForm, drawing_color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color base *</label>
                <input
                  type="text"
                  required
                  value={editForm.base_color || ''}
                  onChange={e => setEditForm({ ...editForm, base_color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipus producte *</label>
                <input
                  type="text"
                  required
                  value={editForm.product_type || 'tshirt'}
                  onChange={e => setEditForm({ ...editForm, product_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ruta fitxer *</label>
                <input
                  type="text"
                  required
                  value={editForm.file_path || ''}
                  onChange={e => setEditForm({ ...editForm, file_path: e.target.value })}
                  placeholder="/mockups/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategoria</label>
                <input
                  type="text"
                  value={editForm.subcategory || ''}
                  onChange={e => setEditForm({ ...editForm, subcategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-subcategoria</label>
                <input
                  type="text"
                  value={editForm.sub_subcategory || ''}
                  onChange={e => setEditForm({ ...editForm, sub_subcategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setEditForm({}); }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel·lar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Afegir
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Previsualització
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Col·lecció
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disseny
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colors
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ordre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estat
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockups.map(mockup => (
                  <tr key={mockup.id} className={!mockup.is_active ? 'opacity-50' : ''}>
                    {editingId === mockup.id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={editForm.file_path}
                            alt="Preview"
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.collection}
                            onChange={e => setEditForm({ ...editForm, collection: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.design_name}
                            onChange={e => setEditForm({ ...editForm, design_name: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.drawing_color}
                            onChange={e => setEditForm({ ...editForm, drawing_color: e.target.value })}
                            placeholder="Dibuix"
                            className="w-full px-2 py-1 border rounded text-sm mb-1"
                          />
                          <input
                            type="text"
                            value={editForm.base_color}
                            onChange={e => setEditForm({ ...editForm, base_color: e.target.value })}
                            placeholder="Base"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={editForm.product_type}
                            onChange={e => setEditForm({ ...editForm, product_type: e.target.value })}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={editForm.display_order || 0}
                            onChange={e => setEditForm({ ...editForm, display_order: parseInt(e.target.value) })}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mockup.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {mockup.is_active ? 'Actiu' : 'Inactiu'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={saveEdit}
                            className="text-green-600 hover:text-green-900 mr-3"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel·lar
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <img
                            src={mockup.file_path}
                            alt={mockup.design_name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{mockup.collection}</div>
                          {mockup.subcategory && (
                            <div className="text-xs text-gray-500">{mockup.subcategory}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{mockup.design_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">🎨 {mockup.drawing_color}</div>
                          <div className="text-sm text-gray-500">📦 {mockup.base_color}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{mockup.product_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {mockup.display_order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mockup.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {mockup.is_active ? 'Actiu' : 'Inactiu'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleToggleActive(mockup.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            title={mockup.is_active ? 'Desactivar' : 'Activar'}
                          >
                            {mockup.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => startEdit(mockup)}
                            className="text-yellow-600 hover:text-yellow-900 mr-3"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(mockup.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {mockups.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No s'han trobat mockups amb aquests filtres</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Com importar mockups:</h3>
          <code className="block bg-white p-3 rounded text-sm mb-2">
            node scripts/import-mockups.js --csv mockups.csv
          </code>
          <code className="block bg-white p-3 rounded text-sm">
            node scripts/import-mockups.js --scan ./public/mockups
          </code>
        </div>
      </div>
    </div>
  );
}
