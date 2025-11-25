'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/contexts/AdminContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { contentManager, ContactSubmission } from '@/lib/content-manager';
import { FiMail, FiPhone, FiClock, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContactSubmissions() {
  const { isAdmin, isLoading } = useAdmin();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    const allSubmissions = await contentManager.getContactSubmissions();
    // Sort by date, newest first
    allSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setSubmissions(allSubmissions);
  };

  const handleStatusChange = async (id: string, status: ContactSubmission['status']) => {
    try {
      await contentManager.updateContactSubmissionStatus(id, status);
      await loadSubmissions();
      toast.success('Status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      try {
        await contentManager.deleteContactSubmission(id);
        await loadSubmissions();
        setSelectedSubmission(null);
        toast.success('Submission deleted');
      } catch (error) {
        toast.error('Failed to delete submission');
      }
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    if (statusFilter === 'all') return true;
    return submission.status === statusFilter;
  });

  const getStatusColor = (status: ContactSubmission['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="text-gray-600 mt-2">Review and manage customer inquiries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total</p>
                <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              </div>
              <FiMail className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">New</p>
                <p className="text-2xl font-bold text-blue-600">
                  {submissions.filter(s => s.status === 'new').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FiMail className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Read</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {submissions.filter(s => s.status === 'read').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <FiClock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Replied</p>
                <p className="text-2xl font-bold text-green-600">
                  {submissions.filter(s => s.status === 'replied').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <FiCheck className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-2">
            {(['all', 'new', 'read', 'replied'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center">
              <FiMail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No contact submissions found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{submission.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <FiMail className="w-4 h-4" />
                          {submission.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <FiPhone className="w-4 h-4" />
                          {submission.phone}
                        </div>
                      </div>
                      <p className="text-gray-700 line-clamp-2">{submission.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(submission.createdAt).toLocaleString()}
                        {submission.service && ` • Interested in: ${submission.service}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Contact Submission</h2>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg text-gray-900">{selectedSubmission.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <a href={`mailto:${selectedSubmission.email}`} className="text-lg text-pink-600 hover:text-pink-700 block">
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <a href={`tel:${selectedSubmission.phone}`} className="text-lg text-pink-600 hover:text-pink-700 block">
                      {selectedSubmission.phone}
                    </a>
                  </div>
                </div>

                {selectedSubmission.service && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service Interest</label>
                    <p className="text-lg text-gray-900">{selectedSubmission.service}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Message</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Received</label>
                  <p className="text-gray-900">{new Date(selectedSubmission.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 block mb-2">Status</label>
                  <div className="flex gap-2">
                    {(['new', 'read', 'replied'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedSubmission.id, status)}
                        className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                          selectedSubmission.status === status
                            ? getStatusColor(status)
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50 flex justify-between">
                <button
                  onClick={() => handleDelete(selectedSubmission.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
