import { useState } from 'react';
import { AdminData } from '../../types/admin';
import api from '../../lib/axios';

interface PinSettingsProps {
  data: AdminData;
  onSave: (newData: AdminData) => void;
  onNotify: (message: string, type: 'success' | 'error') => void;
}

export default function PinSettings({ data, onSave, onNotify }: PinSettingsProps) {
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      onNotify('PIN must be 4 digits', 'error');
      return;
    }
    if (newPin !== confirmPin) {
      onNotify('PINs do not match', 'error');
      return;
    }
    
    try {
      const { data: result } = await api.post('/auth/login', { pin: newPin });
      console.log('PIN update response:', result);
      onSave({ ...data, pin: newPin });
      onNotify('PIN updated successfully', 'success');
      setNewPin('');
      setConfirmPin('');
    } catch (error: any) {
      console.error('PIN update error:', error.response?.data || error.message);
      onNotify(error.response?.data?.message || 'Error updating PIN', 'error');
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">PIN Settings</h2>
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md border border-gray-100">
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-600 mb-1 font-medium">Current PIN</p>
          <p className="text-2xl font-bold text-gray-800">{data.pin || '****'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New PIN (4 digits)</label>
            <input type="password" maxLength={4} value={newPin} onChange={(e) => setNewPin(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-300" required />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm PIN</label>
            <input type="password" maxLength={4} value={confirmPin} onChange={(e) => setConfirmPin(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all duration-300" required />
          </div>
          <button type="submit" className="w-full bg-gradient-to-b from-gray-900 to-gray-800 text-white py-3 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Update PIN
          </button>
        </form>
      </div>
    </div>
  );
}
