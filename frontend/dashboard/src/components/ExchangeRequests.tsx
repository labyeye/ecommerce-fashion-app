import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface ExchangeItem {
  _id: string;
  order: any;
  customer: any;
  items: any[];
  reason: string;
  status: string;
  requestedAt: string;
  delhivery?: any;
}

const ExchangeRequests: React.FC = () => {
  const { token } = useAuth();
  const [requests, setRequests] = useState<ExchangeItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const resp = await fetch('https://backend.flauntbynishi.com/api/exchange/admin/all', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!resp.ok) throw new Error('Failed to fetch');
      const json = await resp.json();
      if (json.success) setRequests(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    if (!confirm('Approve this exchange request?')) return;
    try {
      const resp = await fetch(`https://backend.flauntbynishi.com/api/exchange/admin/approve/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!resp.ok) throw new Error('Approve failed');
      await fetchRequests();
      alert('Approved and Delhivery flow initiated');
    } catch (err: any) {
      alert('Error: ' + (err.message || err));
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    const reason = prompt('Reason for rejection (optional)') || '';
    try {
      const resp = await fetch(`https://backend.flauntbynishi.com/api/exchange/admin/reject/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (!resp.ok) throw new Error('Reject failed');
      await fetchRequests();
      alert('Exchange request rejected');
    } catch (err: any) {
      alert('Error: ' + (err.message || err));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Exchange Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          {requests.length === 0 ? (
            <p className="text-gray-600">No exchange requests found.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Customer</th>
                  <th>Order</th>
                  <th>Products</th>
                  <th>Reason</th>
                  <th>Requested At</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r._id} className="border-b">
                    <td className="py-2">
                      {r.customer?.firstName} {r.customer?.lastName}
                      <div className="text-xs text-gray-500">{r.customer?.email}</div>
                    </td>
                    <td>
                      {r.order?.orderNumber}
                      <div className="text-xs text-gray-500">Status: {r.order?.status}</div>
                    </td>
                    <td>
                      {r.items && r.items.length > 0 ? (
                        r.items.map((it: any, idx: number) => (
                          <div key={idx} className="text-sm">{it.product?.name || 'Product'} x{it.quantity}</div>
                        ))
                      ) : (
                        <div className="text-sm">-</div>
                      )}
                    </td>
                    <td>{r.reason}</td>
                    <td>{new Date(r.requestedAt).toLocaleString()}</td>
                    <td>
                      <div className="text-sm font-medium">{r.status}</div>
                      {r.delhivery?.forwardAwb && <div className="text-xs">FW: {r.delhivery.forwardAwb}</div>}
                      {r.delhivery?.reverseAwb && <div className="text-xs">REV: {r.delhivery.reverseAwb}</div>}
                    </td>
                    <td className="space-y-2">
                      {r.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(r._id)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Approve</button>
                          <button onClick={() => handleReject(r._id)} className="px-3 py-1 bg-red-500 text-white rounded text-sm ml-2">Reject</button>
                        </>
                      )}
                      {r.status !== 'pending' && (
                        <div className="text-xs text-gray-500">No actions</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ExchangeRequests;
