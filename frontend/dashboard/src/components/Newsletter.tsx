import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Newsletter: React.FC = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/newsletters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ title, subject, bannerUrl, message })
      });

      const data = await res.json();
      if (res.ok) {
        setResult(`Sent to ${data.data.recipientsCount} recipients`);
      } else {
        setResult(data.message || 'Error sending newsletter');
      }
    } catch (err: any) {
      setResult(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/newsletters', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.data || []);
      }
    } catch (err) {
      // ignore history fetch errors for now
      console.error('Failed to fetch newsletter history', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-ds-100 rounded-xl shadow-sm border border-ds-200">
  <h2 className="text-xl font-semibold mb-4">Compose Newsletter</h2>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Banner URL (optional)</label>
          <input value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Message (HTML allowed)</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={8} className="mt-1 block w-full border rounded px-3 py-2" />
        </div>
        <div className="flex items-center gap-3">
          <button disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Sending...' : 'Send to all customers'}</button>
          <button type="button" onClick={() => { setTitle(''); setSubject(''); setBannerUrl(''); setMessage(''); setResult(null); }} className="px-4 py-2 border rounded">Reset</button>
        </div>
        {result && <div className="mt-2 text-sm">{result}</div>}
      </form>
      {/* Newsletter History */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Newsletter History</h3>
        {history.length === 0 ? (
          <div className="text-sm text-gray-600">No newsletters sent yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Subject</th>
                  <th className="px-3 py-2 text-left">Recipients</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((n) => (
                  <tr key={n._id}>
                    <td className="px-3 py-2">{n.sentAt ? new Date(n.sentAt).toLocaleString() : '-'}</td>
                    <td className="px-3 py-2">{n.title}</td>
                    <td className="px-3 py-2">{n.subject}</td>
                    <td className="px-3 py-2">{n.recipientsCount ?? '-'}</td>
                    <td className="px-3 py-2">{n.sentAt ? 'Sent' : 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
