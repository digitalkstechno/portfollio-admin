import { useState, useEffect } from 'react';
import { useAdminData } from '../../hooks/useAdminData';
import Sidebar from '../../components/admin/Sidebar';
import Dashboard from '../../components/admin/Dashboard';
import PinSettings from '../../components/admin/PinSettings';
import WebsiteManager from '../../components/admin/WebsiteManager';
import MobileAppManager from '../../components/admin/MobileAppManager';
import SoftwareManager from '../../components/admin/SoftwareManager';
import DigitalCardManager from '../../components/admin/DigitalCardManager';
import MarketingClientManager from '../../components/admin/MarketingClientManager';
import Toast from '../../components/admin/Toast';
import api from '../../lib/axios';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const { data, saveData } = useAdminData();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAuthenticated) {
      timer = setTimeout(() => {
        setIsAuthenticated(false);
        showToast('Session expired', 'error');
      }, 30 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: result } = await api.post('/auth/admin/login', { email, password });
      localStorage.setItem('admin_token', result.token || 'authenticated');
      setIsAuthenticated(true);
      setEmail('');
      setPassword('');
      showToast('Login successful', 'success');
    } catch (error: any) {
      showToast('Invalid credentials', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setActiveSection('dashboard');
    showToast('Logged out successfully', 'success');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeIn">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-b from-gray-900 to-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl shadow-lg">🔐</div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
            <p className="text-gray-500 mt-2">Sign in to manage your portfolio</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-300"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white py-3 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} onLogout={handleLogout} />
      <main className="flex-1 p-8 lg:ml-0 overflow-auto animate-fadeIn">
        {activeSection === 'dashboard' && <Dashboard data={data} />}
        {activeSection === 'pin' && <PinSettings data={data} onSave={saveData} onNotify={showToast} />}
        {activeSection === 'websites' && <WebsiteManager data={data} onSave={saveData} onNotify={showToast} />}
        {activeSection === 'mobileApps' && <MobileAppManager data={data} onSave={saveData} onNotify={showToast} />}
        {activeSection === 'software' && <SoftwareManager data={data} onSave={saveData} onNotify={showToast} />}
        {activeSection === 'digitalCards' && <DigitalCardManager data={data} onSave={saveData} onNotify={showToast} />}
        {activeSection === 'marketingClients' && <MarketingClientManager data={data} onSave={saveData} onNotify={showToast} />}
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
