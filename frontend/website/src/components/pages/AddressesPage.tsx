import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Address {
  id: string;
  label?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

const LOCAL_KEY = 'addresses';

const AddressesPage: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<Address>({ id: '', label: '', firstName: '', lastName: '', phone: '', email: '', street: '', city: '', state: '', zipCode: '', country: 'India' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      try {
        setAddresses(JSON.parse(raw));
      } catch (e) {
        setAddresses([]);
      }
    }
  }, []);

  const persist = (items: Address[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
    setAddresses(items);
  };

  const startAdd = () => {
    setEditing(null);
    setForm({ id: Date.now().toString(), label: '', firstName: '', lastName: '', phone: '', email: '', street: '', city: '', state: '', zipCode: '', country: 'India' });
  };

  const startEdit = (a: Address) => {
    setEditing(a);
    setForm(a);
  };

  const handleDelete = (id: string) => {
    const filtered = addresses.filter(a => a.id !== id);
    persist(filtered);
  };

  const handleSave = () => {
    setSaving(true);
    try {
      let updated: Address[] = [];
      if (editing) {
        updated = addresses.map(a => a.id === form.id ? form : a);
      } else {
        updated = [...addresses, form];
      }
      persist(updated);
      setEditing(null);
      setForm({ id: '', label: '', firstName: '', lastName: '', phone: '', email: '', street: '', city: '', state: '', zipCode: '', country: 'India' });
    } finally {
      setSaving(false);
    }
  };

  const saveToProfile = async (address: Address) => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch('https://ecommerce-fashion-app-som7.vercel.app/api/customer/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save to profile');
      alert('Address saved to your profile (main address)');
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    }
  };

  return (
    <div className="min-h-screen bg-fashion-cream/50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Addresses</h1>
          <div className="space-x-2">
            <button onClick={startAdd} className="px-4 py-2 bg-fashion-accent-brown text-white rounded">Add New</button>
            <button onClick={() => navigate('/checkout')} className="px-4 py-2 border rounded">Back to Checkout</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            {addresses.length === 0 && (
              <div className="p-6 bg-white rounded shadow">No addresses yet. Click Add New to create one.</div>
            )}
            {addresses.map(addr => (
              <div key={addr.id} className="p-4 bg-white rounded shadow mb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{addr.label || `${addr.firstName || ''} ${addr.lastName || ''}`}</div>
                    <div className="text-sm text-gray-600">{addr.street}</div>
                    <div className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.zipCode}</div>
                    <div className="text-sm text-gray-600">{addr.country}</div>
                    <div className="text-sm text-gray-600">{addr.phone}</div>
                  </div>
                  <div className="space-y-2 text-right">
                    <button onClick={() => startEdit(addr)} className="text-sm px-3 py-1 border rounded">Edit</button>
                    <button onClick={() => handleDelete(addr.id)} className="text-sm px-3 py-1 border rounded">Delete</button>
                    <button onClick={() => saveToProfile(addr)} className="text-sm px-3 py-1 bg-fashion-accent-brown text-white rounded">Save to Profile</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-white p-6 rounded shadow">
              <h3 className="font-semibold mb-3">{editing ? 'Edit Address' : 'Add Address'}</h3>
              <div className="space-y-2">
                <input className="w-full p-2 border" placeholder="Label (Home, Office)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                <div className="grid grid-cols-2 gap-2">
                  <input className="p-2 border" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  <input className="p-2 border" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <input className="w-full p-2 border" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="w-full p-2 border" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input className="w-full p-2 border" placeholder="Street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                <div className="grid grid-cols-3 gap-2">
                  <input className="p-2 border" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  <input className="p-2 border" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                  <input className="p-2 border" placeholder="ZIP code" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
                </div>
                <input className="w-full p-2 border" placeholder="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                <div className="flex items-center justify-end space-x-2 mt-3">
                  <button onClick={() => { setEditing(null); setForm({ id: '', label: '', firstName: '', lastName: '', phone: '', email: '', street: '', city: '', state: '', zipCode: '', country: 'India' }); }} className="px-4 py-2 border rounded">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-fashion-accent-brown text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressesPage;
