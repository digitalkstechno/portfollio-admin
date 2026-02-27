import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../lib/axios";
import Table, { Column } from "./ui/Table";

type FigmaItem = {
  id: string;
  title?: string | null;
  link: string;
  image?: string | null;
  type?: "application" | "web" | "saas-dashboard";
};

export default function FigmaManager() {
  const [items, setItems] = useState<FigmaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState<Partial<FigmaItem>>({
    title: "",
    link: "",
    type: "application",
  });

  const normalize = (obj: any): FigmaItem => ({
    id: obj._id || obj.id,
    title: obj.title ?? null,
    link: obj.link,
    image: obj.image ?? null,
    type: obj.type ?? "application",
  });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/figma-designs");
      const list: any[] = Array.isArray(data) ? data : data?.data || [];
      setItems(list.map(normalize));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load Figma designs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setForm({ title: "", link: "", type: "application" });
    setImageFile(null);
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.link?.trim()) {
      toast.error("Link is required");
      return;
    }
    try {
      const fd = new FormData();
      if (form.title) fd.append("title", form.title.trim());
      fd.append("link", form.link.trim());
      if (imageFile) fd.append("image", imageFile);
      if (form.type) fd.append("type", form.type);
      if (editingId) {
        await api.put(`/figma-designs/${editingId}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Figma item updated");
      } else {
        await api.post("/figma-designs", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Figma item added");
      }
      resetForm();
      await fetchItems();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save");
    }
  };

  const handleEdit = (it: FigmaItem) => {
    setForm({ title: it.title || "", link: it.link, type: it.type || "application" });
    setEditingId(it.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/figma-designs/${id}`);
      toast.success("Figma item deleted");
      await fetchItems();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete");
    }
  };

  const filtered = items.filter((i) =>
    (i.title || i.link).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Figma Designs</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-b from-gray-900 to-gray-800 text-white px-5 py-2.5 rounded-lg shadow-sm transition"
        >
          <Plus size={18} /> Add Design
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or link..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
      </div>

      <Table<FigmaItem>
        columns={[
          { key: "title", header: "Title", accessor: (i) => i.title || "Untitled", className: "font-medium" } as Column<FigmaItem>,
          { key: "type", header: "Type", accessor: (i) => (i.type || "application").replace("saas-dashboard","SaaS Dashboard") } as Column<FigmaItem>,
          { key: "link", header: "Link", accessor: (i) => <a href={i.link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all">{i.link}</a> } as Column<FigmaItem>,
          { key: "actions", header: "Actions", className: "text-right", render: (i) => (
            <div className="flex gap-4 justify-end">
              <button onClick={() => handleEdit(i)} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <Pencil size={16} />
              </button>
              <button onClick={() => handleDelete(i.id)} className="text-red-600 hover:text-red-800 flex items-center gap-1">
                <Trash2 size={16} />
              </button>
            </div>
          ) } as Column<FigmaItem>,
        ]}
        data={filtered}
        isLoading={loading}
        emptyMessage="No Figma designs found"
        pageSize={10}
      />

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
                {editingId ? "Edit Figma" : "Add Figma"}
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
                <label className="block text-sm text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Figma Link *
                </label>
                <input
                  type="url"
                  value={form.link || ""}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  required
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as "application" | "web" | "saas-dashboard" })
                  }
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                >
                  <option value="application">Application</option>
                  <option value="web">Web</option>
                  <option value="saas-dashboard">SaaS Dashboard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Preview Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImageFile(e.target.files?.[0] || null)
                  }
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
