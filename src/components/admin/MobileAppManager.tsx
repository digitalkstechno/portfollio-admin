import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { AdminData, MobileApp } from '../../types/admin';

interface MobileAppManagerProps {
  data: AdminData;
  onSave: (newData: AdminData) => void;
}

export default function MobileAppManager({ data, onSave }: MobileAppManagerProps) {
  const [apps, setApps] = useState<MobileApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState<Partial<MobileApp>>({
    title: '',
    androidLink: '',
    iosLink: '',
    description: '',
    language: '',
    software: '',
    image: '',
  });

  // Normalize app (handles id / _id)
  const normalizeApp = (app: any): MobileApp => ({
    id: app._id || app.id || '',
    title: app.title || '',
    androidLink: app.androidLink || app.android_link || '',
    iosLink: app.iosLink || app.ios_link || '',
    description: app.description || '',
    language: app.language || '',
    software: app.software || '',
    image: app.image || '',
  });

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get('/mobile-apps');
      let appList: any[] = Array.isArray(response) ? response : response.data || response.apps || [];

      const normalized = appList.map(normalizeApp).filter(a => a.id);
      setApps(normalized);
      onSave({ ...data, mobileApps: normalized });
    } catch (err: any) {
      console.error('Fetch mobile apps failed:', err);
      toast.error('Failed to load mobile apps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title?.trim() || !form.androidLink?.trim() || !form.iosLink?.trim() ||
        !form.description?.trim() || !form.language?.trim() || !form.software?.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('androidLink', form.androidLink.trim());
      formData.append('iosLink', form.iosLink.trim());
      formData.append('description', form.description.trim());
      formData.append('language', form.language.trim());
      formData.append('software', form.software.trim());
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await api.put(`/mobile-apps/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Mobile app updated successfully');
      } else {
        await api.post('/mobile-apps', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Mobile app added successfully');
      }

      resetForm();
      await fetchApps(); // refresh list
    } catch (error: any) {
      console.error('Save error:', error);
      const msg = error?.response?.data?.message || 'Failed to save mobile app';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this mobile app?')) return;

    try {
      await api.delete(`/mobile-apps/${id}`);
      toast.success('Mobile app deleted successfully');
      await fetchApps();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to delete';
      toast.error(msg);
    }
  };

  const handleEdit = (app: MobileApp) => {
    setForm({
      title: app.title,
      androidLink: app.androidLink,
      iosLink: app.iosLink,
      description: app.description,
      language: app.language,
      software: app.software,
      image: app.image,
    });
    setEditingId(app.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({
      title: '',
      androidLink: '',
      iosLink: '',
      description: '',
      language: '',
      software: '',
      image: '',
    });
    setImageFile(null);
    setEditingId(null);
    setShowModal(false);
  };

  const filtered = apps.filter(app =>
    app.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Mobile Apps</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-b from-gray-900 to-gray-800 text-white px-5 py-2.5 rounded-lg shadow-sm transition"
        >
          <Plus size={18} /> Add App
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table / Loading */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading apps...</div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-200">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Title</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Language</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Software</th>
                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-500">
                    No apps found
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr key={app.id} className="border-t hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium">{app.title}</td>
                    <td className="px-6 py-4">{app.language}</td>
                    <td className="px-6 py-4">{app.software}</td>
                    <td className="px-6 py-4 text-right flex gap-4 justify-end">
                      <button
                        onClick={() => handleEdit(app)}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Pencil size={16} /> 
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 size={16} /> 
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingId ? 'Edit Mobile App' : 'Add Mobile App'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Android Link *</label>
                <input
                  type="url"
                  value={form.androidLink || ''}
                  onChange={(e) => setForm({ ...form, androidLink: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">iOS Link *</label>
                <input
                  type="url"
                  value={form.iosLink || ''}
                  onChange={(e) => setForm({ ...form, iosLink: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Description *</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Language *</label>
                  <input
                    type="text"
                    value={form.language || ''}
                    onChange={(e) => setForm({ ...form, language: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Software *</label>
                  <input
                    type="text"
                    value={form.software || ''}
                    onChange={(e) => setForm({ ...form, software: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">App Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg font-medium transition"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}