import { useState, useEffect } from "react";
import api from "../../lib/axios";
import toast from "react-hot-toast";
import { Pencil, Trash2, Plus, X, Mail, Lock, User } from "lucide-react";

export interface Website {
  id: string;
  title: string;
  link: string;
  image?: string;
  description: string;
  language: string;
  credentials?: Array<{
    role: string;
    email: string;
    password: string;
  }>;
}

export default function WebsiteManager() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [credentials, setCredentials] = useState<Array<{ role: string; email: string; password: string }>>([]);

  const [form, setForm] = useState({
    title: "",
    link: "",
    description: "",
    language: "",
  });

  const fetchWebsites = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/projects");
      let projectsArray: any[] = Array.isArray(data) ? data : data?.data || [];
      setWebsites(projectsArray.map((p: any) => ({ ...p, id: p._id || p.id })));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load websites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
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
    if (!form.title.trim() || !form.link.trim() || !form.description.trim() || !form.language.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("link", form.link.trim());
      formData.append("description", form.description.trim());
      formData.append("language", form.language.trim());
      if (imageFile) formData.append("image", imageFile);
      
      // Send credentials as individual fields
      credentials.forEach((cred, index) => {
        if (cred.role && cred.email && cred.password) {
          formData.append(`credentials[${index}][role]`, cred.role);
          formData.append(`credentials[${index}][email]`, cred.email);
          formData.append(`credentials[${index}][password]`, cred.password);
        }
      });

      if (editingId) {
        await api.put(`/projects/${editingId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Website updated");
      } else {
        await api.post("/projects", formData, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Website added");
      }

      resetForm();
      await fetchWebsites();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save website");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this website?")) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Website deleted");
      await fetchWebsites();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete");
    }
  };

  const handleEdit = (website: Website) => {
    setForm({ title: website.title, link: website.link, description: website.description, language: website.language });
    setCredentials(website.credentials || []);
    setEditingId(website.id);
    setShowModal(true);
  };

  const resetForm = () => {
    setForm({ title: "", link: "", description: "", language: "" });
    setCredentials([]);
    setImageFile(null);
    setEditingId(null);
    setShowModal(false);
  };

  const filtered = websites.filter((w) => w.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Website Manager</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-b from-gray-900 to-gray-800 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300">
          <Plus size={18} /> Add Website
        </button>
      </div>

      <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md border px-4 py-2.5 rounded-lg mb-6 focus:ring-2 focus:ring-gray-800 transition-all duration-300" />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Title</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Link</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-700">Credentials</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((website) => (
                <tr key={website.id} className="border-t hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium">{website.title}</td>
                  <td className="px-6 py-4 text-sm text-blue-600">{website.link}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{website.credentials?.length || 0} credentials</td>
                  <td className="px-6 py-4 text-right flex gap-4 justify-end">
                    <button onClick={() => handleEdit(website)} className="text-indigo-600 hover:text-indigo-800"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(website.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
              <h3 className="text-xl font-bold">{editingId ? "Edit" : "Add"} Website</h3>
              <button onClick={resetForm} className="text-gray-600 hover:text-gray-900"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <input type="text" placeholder="Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-gray-800 transition-all duration-300" required />
              <input type="url" placeholder="URL *" value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="w-full border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-gray-800 transition-all duration-300" required />
              <textarea placeholder="Description *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-gray-800 transition-all duration-300" required />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Language *" value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="w-full border px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-gray-800 transition-all duration-300" required />
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-100 file:text-gray-700" />
              </div>

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

              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white py-2.5 rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-medium">Save</button>
                <button type="button" onClick={resetForm} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg transition-all duration-300 font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
