import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ChangePhone: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!token) return setMessage('Not authenticated');
    if (!phone || !password) return setMessage('Fill all fields');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3500/api/customer/change-phone', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setMessage('Phone updated');
      setTimeout(()=>navigate('/settings'),800);
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
          <h2 className="text-xl font-semibold mb-4">Change Phone</h2>
          {message && <div className="mb-4 text-sm text-red-700">{message}</div>}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm">New Phone</label>
              <input type="text" value={phone} onChange={(e)=>setPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm">Current Password (to confirm)</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" className="px-4 py-2 bg-[#95522C] text-white rounded" disabled={loading}>Save</button>
              <button type="button" className="px-4 py-2 border rounded" onClick={()=>navigate('/settings')}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePhone;
