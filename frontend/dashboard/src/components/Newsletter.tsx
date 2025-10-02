import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Newsletter: React.FC = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
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
    </div>
  );
};

export default Newsletter;
