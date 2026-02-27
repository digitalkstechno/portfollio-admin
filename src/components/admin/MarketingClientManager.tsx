import { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';
import { AdminData, MarketingClient } from '../../types/admin';
import Table, { Column } from './ui/Table';

interface MarketingClientManagerProps {
  data: AdminData;
  onSave: (newData: AdminData) => void;
}

export default function MarketingClientManager({ data, onSave }: MarketingClientManagerProps) {
  const [clients, setClients] = useState<MarketingClient[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState<Partial<MarketingClient>>({
    title: '',
    description: '',
    link: '',
    image: '',
  });

  // Normalize client data (handles both id and _id)
  const normalizeClient = (client: any): MarketingClient => ({
    id: client._id || client.id || '',
    title: client.title || '',
    description: client.description || '',
    link: client.link || '',
    image: client.image || '',
  });

  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data: response } = await api.get('/marketing-clients');
      let clientList: any[] = [];

      if (Array.isArray(response)) {
        clientList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        clientList = response.data;
      } else if (response?.marketingClients && Array.isArray(response.marketingClients)) {
        clientList = response.marketingClients;
      }

      const normalized = clientList.map(normalizeClient).filter(c => c.id);
      setClients(normalized);
      onSave({ ...data, marketingClients: normalized });
    } catch (err: any) {
      console.error('Fetch marketing clients failed:', err);
      toast.error('Failed to load marketing clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title?.trim() || !form.description?.trim() || !form.link?.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('link', form.link.trim());
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await api.put(`/marketing-clients/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Marketing client updated successfully');
      } else {
        await api.post('/marketing-clients', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Marketing client added successfully');
      }

      resetForm();
      await fetchClients();
    } catch (err: any) {
      console.error('Save client error:', err);
      const msg = err?.response?.data?.message || 'Failed to save marketing client';
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this marketing client?')) return;

    try {
      await api.delete(`/marketing-clients/${id}`);
      toast.success('Marketing client deleted successfully');
      await fetchClients();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to delete marketing client';
      toast.error(msg);
    }
  };

  const handleEdit = (client: MarketingClient) => {
    setForm({
      title: client.title,
      description: client.description,
      link: client.link,
      image: client.image,
    });
    setEditingId(client.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ title: '', description: '', link: '', image: '' });
    setImageFile(null);
    setEditingId(null);
    setShowModal(false);
  };

  const filtered = clients.filter(client =>
    client.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Marketing Clients</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-b from-gray-900 to-gray-800 text-white px-5 py-2.5 rounded-lg shadow-sm transition"
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
      </div>

      {/* Table / Loading */}
      <Table<MarketingClient>
        columns={[
          { key: 'title', header: 'Title', accessor: (c) => c.title, className: 'font-medium' } as Column<MarketingClient>,
          { key: 'desc', header: 'Description', accessor: (c) => <span className="text-gray-600">{c.description}</span> } as Column<MarketingClient>,
          { key: 'link', header: 'Link', accessor: (c) => <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all">{c.link}</a> } as Column<MarketingClient>,
          { key: 'actions', header: 'Actions', className: 'text-right', render: (c) => (
            <div className="flex gap-4 justify-end">
              <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                <Trash2 size={16} />
              </button>
            </div>
          ) } as Column<MarketingClient>,
        ]}
        data={filtered}
        isLoading={loading}
        emptyMessage="No marketing clients found"
        pageSize={10}
      />

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
                {editingId ? 'Edit Marketing Client' : 'Add Marketing Client'}
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
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Description *</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Website / Profile Link *</label>
                <input
                  type="url"
                  value={form.link || ''}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1">Client Logo / Image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
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
