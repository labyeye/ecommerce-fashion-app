import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Calendar, 
  User, 
  MessageSquare, 
  Eye, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Download,
  Search
} from 'lucide-react';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'resolved';
  submissionDate: string;
  userAgent: string;
  ipAddress: string;
}

const ContactSubmissions: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // get dashboard auth token via hook (must be at component top)
  const auth = useAuth();
  const contextToken = auth?.token || null;
  // API base - use Vite env var if provided, otherwise default to localhost:3500
  const API_BASE = import.meta.env.VITE_API_BASE || 'https://backend.flauntbynishi.com/api';

  const statusColors = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    read: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    replied: 'bg-green-100 text-green-800 border-green-200',
    resolved: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  const statusIcons = {
    new: <AlertCircle className="w-4 h-4" />,
    read: <Eye className="w-4 h-4" />,
    replied: <CheckCircle className="w-4 h-4" />,
    resolved: <XCircle className="w-4 h-4" />
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, statusFilter, searchTerm]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      // Prefer token from AuthContext (dashboard_token). Fall back to legacy keys if present.
      const token = contextToken || localStorage.getItem('dashboard_token') || localStorage.getItem('adminToken');

      if (!token) {
        setError('Admin authentication required');
        return;
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${API_BASE}/contact/submissions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      // backend returns { success: true, data: { submissions, pagination, stats } }
      const submissionsFromRes = data?.data?.submissions || data.submissions || [];
      const totalFromRes =
        data?.data?.pagination?.totalRecords || data.total || submissionsFromRes.length || 0;

      // Normalize submissions to ensure a consistent `submissionDate` field
      const normalized = submissionsFromRes.map((s: any) => ({
        ...s,
        submissionDate: s.submissionDate || s.createdAt || s.created_at || null,
      }));

      setSubmissions(normalized);
      setTotalPages(Math.max(1, Math.ceil(totalFromRes / 10)));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, newStatus: string) => {
    try {
      const token = contextToken || localStorage.getItem('dashboard_token') || localStorage.getItem('adminToken');

      if (!token) {
        setError('Admin authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/contact/submissions/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Refresh the submissions list
      fetchSubmissions();
      
      // Update selected submission if it's open
      if (selectedSubmission && selectedSubmission._id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus as any });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const token = contextToken || localStorage.getItem('dashboard_token') || localStorage.getItem('adminToken');

      if (!token) {
        setError('Admin authentication required');
        return;
      }

      const response = await fetch(`${API_BASE}/contact/submissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }

      // Refresh the submissions list
      fetchSubmissions();
      
      // Close modal if deleted submission was selected
      if (selectedSubmission && selectedSubmission._id === id) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete submission');
    }
  };

  const exportSubmissions = async () => {
    try {
      const token = contextToken || localStorage.getItem('dashboard_token') || localStorage.getItem('adminToken');

      if (!token) {
        setError('Admin authentication required');
        return;
      }

      const queryParams = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
        export: 'true'
      });

      const response = await fetch(`${API_BASE}/contact/submissions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export submissions');
      }

      const data = await response.json();

      // support both response shapes
      const exportSubsRaw = data?.data?.submissions || data.submissions || [];
      const exportSubs = exportSubsRaw.map((s: any) => ({
        ...s,
        submissionDate: s.submissionDate || s.createdAt || s.created_at || null,
      }));

      // Create CSV content
      const csvHeader = 'Name,Email,Subject,Message,Status,Submission Date,IP Address\n';
      const csvContent = exportSubs.map((sub: ContactSubmission) => 
        `"${sub.name}","${sub.email}","${sub.subject}","${sub.message.replace(/"/g, '""')}","${sub.status}","${new Date(sub.submissionDate).toISOString()}","${sub.ipAddress}"`
      ).join('\n');
      
      // Download CSV
      const blob = new Blob([csvHeader + csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contact_submissions_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export submissions');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && submissions.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading contact submissions...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="w-8 h-8 mr-3 text-blue-600" />
                Contact Submissions
              </h1>
              <p className="text-gray-600 mt-1">Manage customer inquiries and feedback</p>
            </div>
            <button
              onClick={exportSubmissions}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Submissions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject & Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No contact submissions found</p>
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => (
                  <tr key={submission._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-8 h-8 bg-gray-100 rounded-full p-1 text-gray-600" />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{submission.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {submission.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {submission.subject}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {submission.message}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[submission.status]}`}>
                        {statusIcons[submission.status]}
                        <span className="capitalize">{submission.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(submission.submissionDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedSubmission(submission)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSubmission(submission._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <div className="text-sm text-gray-900">{selectedSubmission.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="text-sm text-gray-900">{selectedSubmission.email}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <div className="text-sm text-gray-900">{selectedSubmission.subject}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedSubmission.message}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={selectedSubmission.status}
                    onChange={(e) => updateSubmissionStatus(selectedSubmission._id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date</label>
                  <div className="text-sm text-gray-900">{formatDate(selectedSubmission.submissionDate)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <div className="text-sm text-gray-600">{selectedSubmission.ipAddress}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Agent</label>
                  <div className="text-sm text-gray-600 truncate" title={selectedSubmission.userAgent}>
                    {selectedSubmission.userAgent}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactSubmissions;