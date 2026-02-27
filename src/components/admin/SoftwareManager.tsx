import { useState, useEffect } from 'react';
import { AdminData, Software } from '../../types/admin';
import api from '../../lib/axios';
import { Plus, Trash2, Pencil, X } from 'lucide-react';
import Table, { Column } from './ui/Table';

interface SoftwareManagerProps {
  data: AdminData;
  onSave: (newData: AdminData) => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export default function SoftwareManager({ data, onSave, onNotify }: SoftwareManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [credentials, setCredentials] = useState<Array<{ role: string; email: string; password: string }>>([]);
  const [form, setForm] = useState<Partial<Software>>({ title: '', description: '', link: '', image: '' });

  useEffect(() => {
    fetchSoftware();
  }, []);

  const addCredential = () => {
    setCredentials([...credentials, { role: "", email: "", password: "" }]);
  };

  const removeCredential = (index: number) => {
    setCredentials(credentials.filter((_, i) => i !== index));
  };

  const updateCredential = (index: number, field: string, value: string) => {
    const updated = [...credentials];
    updated[index] = { ...updated[index], [field]: value };
    setCredentials(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ( !form.title?.trim() || !form.description?.trim() || !form.link?.trim()) {
      onNotify('Please fill all required fields', 'error');
      return;
    }
    
    try {
      const formData = new FormData();
      
      formData.append('title', form.title!.trim());
      formData.append('description', form.description!.trim());
      formData.append('link', form.link!.trim());
      if (imageFile) formData.append('image', imageFile);
      
      // Send credentials as individual fields
      credentials.forEach((cred, index) => {
        if (cred.role && cred.email && cred.password) {
          formData.append(`credentials[${index}][role]`, cred.role);
          formData.append(`credentials[${index}][email]`, cred.email);
          formData.append(`credentials[${index}][password]`, cred.password);
        }
      });

      if (editingId) {
        await api.put(`/software/${editingId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        onNotify('Software updated', 'success');
      } else {
        await api.post('/software', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        onNotify('Software added', 'success');
      }
      fetchSoftware();
      resetForm();
    } catch (error: any) {
      onNotify(error.response?.data?.message || 'Error saving software', 'error');
    }
  };

  const fetchSoftware = async () => {
    try {
      const { data: result } = await api.get('/software');
      const softwareArray = Array.isArray(result) ? result : result?.data || [];
      const normalized = softwareArray.map((s: any) => ({ ...s, id: s._id || s.id }));
      onSave({ ...data, software: normalized });
    } catch (error) {
      console.error('Error fetching software:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this software?')) {
      try {
        await api.delete(`/software/${id}`);
        onNotify('Software deleted', 'success');
        fetchSoftware();
      } catch (error: any) {
        onNotify(error.response?.data?.message || 'Error deleting software', 'error');
      }
    }
  };

  const handleEdit = (software: Software) => {
    setForm(software);
    setCredentials(software.credentials || []);
    setEditingId(software.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({  title: '', description: '', link: '', image: '' });
    setCredentials([]);
    setImageFile(null);
    setEditingId(null);
    setShowModal(false);
  };

  const filtered = Array.isArray(data.software) ? data.software.filter(s => s.title.toLowerCase().includes(search.toLowerCase())) : [];

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Software</h2>
        <button onClick={() => setShowModal(true)} className="bg-gradient-to-b from-gray-900 to-gray-800 text-white px-6 py-3 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-lg flex items-center gap-2">
          <Plus size={18} /> Add Software
        </button>
      </div>
      <input type="text" placeholder="Search software..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-6 focus:ring-2 focus:ring-gray-800 transition-all duration-300" />
      <Table<Software>
        columns={[
          { key: "title", header: "Title", accessor: (s) => s.title } as Column<Software>,
          { key: "creds", header: "Credentials", accessor: (s) => (s.credentials?.length || 0) + " credentials" } as Column<Software>,
          { key: "actions", header: "Actions", render: (s) => (
            <div className="flex gap-4">
              <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:text-indigo-800 font-medium transition"><Pencil size={16} /></button>
              <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 font-medium transition"><Trash2 size={16} /></button>
            </div>
          ) } as Column<Software>,
        ]}
        data={filtered}
        isLoading={false}
        emptyMessage="No software found"
        pageSize={10}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{editingId ? 'Edit' : 'Add'} Software</h3>
              <button onClick={resetForm} className="text-gray-600 hover:text-gray-900"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="text" placeholder="Title *" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 transition-all duration-300" required />
              <textarea placeholder="Description *" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 transition-all duration-300" rows={3} required />
              <input type="url" placeholder="Link *" value={form.link} onChange={(e) => setForm({...form, link: e.target.value})} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 transition-all duration-300" required />
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl transition-all duration-300" />
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold">Credentials (Optional)</h4>
                  <button type="button" onClick={addCredential} className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 transition">
                    <Plus size={16} /> Add
                  </button>
                </div>
                {credentials.map((cred, index) => (
                  <div key={index} className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-lg">
                    <input type="text" placeholder="Role *" value={cred.role} onChange={e => updateCredential(index, 'role', e.target.value)} className="border px-3 py-2 rounded focus:ring-2 focus:ring-gray-800" />
                    <input type="email" placeholder="Email *" value={cred.email} onChange={e => updateCredential(index, 'email', e.target.value)} autoComplete="off" className="border px-3 py-2 rounded focus:ring-2 focus:ring-gray-800" />
                    <div className="flex gap-2">
                      <input type="password" placeholder="Password *" value={cred.password} onChange={e => updateCredential(index, 'password', e.target.value)} autoComplete="new-password" className="flex-1 border px-3 py-2 rounded focus:ring-2 focus:ring-gray-800" />
                      <button type="button" onClick={() => removeCredential(index)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white py-3 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-lg">Save</button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-xl transition-all duration-300 font-semibold">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
