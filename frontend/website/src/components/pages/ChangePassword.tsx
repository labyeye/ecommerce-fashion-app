import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ChangePassword: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) return setMessage('Not authenticated');
    if (!currentPassword || !newPassword) return setMessage('Fill all fields');
    if (newPassword !== confirmPassword) return setMessage('Passwords do not match');
    setLoading(true);
    try {
      const res = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/customer/change-password', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setMessage('Password changed successfully');
      setTimeout(() => navigate('/settings'), 800);
    } catch (err: any) {
      setMessage(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 bg-[#FFF2E1]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          {message && <div className="mb-4 text-sm text-red-700">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm">New Password</label>
              <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-[#95522C] text-white rounded" disabled={loading}>Save</button>
              <button type="button" className="px-4 py-2 border rounded" onClick={()=>navigate('/settings')}>Cancel</button>
            </div>
            <div className="mt-2 text-sm">
              <button type="button" className="text-[#914D26] underline" onClick={()=>navigate('/forgot-password')}>Forgot current password?</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
