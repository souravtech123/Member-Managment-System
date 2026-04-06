'use client';
import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Users, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);
  const [memberCount, setMemberCount] = useState(0);
  const [formData, setFormData] = useState({ title: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchMeetings();
    fetchMemberCount();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch('/api/meetings');
      const data = await res.json();
      if (data.success) setMeetings(data.meetings);
    } catch (error) {
      console.error('Failed to fetch meetings', error);
    }
  };

  const fetchMemberCount = async () => {
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      // /api/members returns a plain array
      const list = Array.isArray(data) ? data : data.members || [];
      setMemberCount(list.length);
    } catch (error) {
      console.error('Failed to fetch members', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Meeting created successfully!', type: 'success' });
        setFormData({ title: '', date: '' });
        fetchMeetings();
      } else {
        setMessage({ text: data.error || 'Failed to create meeting', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting and all its attendance records?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: 'Meeting deleted.', type: 'success' });
        fetchMeetings();
      } else {
        setMessage({ text: data.error || 'Failed to delete', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Error deleting meeting', type: 'error' });
    } finally {
      setDeletingId(null);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Meetings
          </h1>
          <p className="text-slate-400 mt-1">Manage schedules and events</p>
        </div>
        <div className="glass-panel px-4 py-2 flex items-center gap-2 text-sm text-slate-300 border border-slate-700/50">
          <Users size={16} className="text-blue-400" />
          <span>{memberCount} Members in system</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 lg:col-span-1 border border-slate-700/50 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-white flex items-center">
            <Plus size={20} className="mr-2 text-emerald-400" />
            Create Meeting
          </h2>
          {message.text && (
            <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Meeting Title</label>
              <input
                type="text"
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Weekly Sync"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-white font-medium py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Meeting'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-white flex items-center mb-4">
            <Calendar size={20} className="mr-2 text-blue-400" />
            Upcoming & Past Meetings
          </h2>

          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <div key={meeting._id} className="glass-panel p-5 border border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-blue-500/30">
                <div>
                  <h3 className="text-lg font-medium text-white">{meeting.title}</h3>
                  <div className="flex items-center text-slate-400 text-sm mt-1">
                    <Clock size={14} className="mr-1" />
                    {new Date(meeting.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <Users size={12} />
                    <span>{memberCount} members eligible for attendance</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/attendance?meetingId=${meeting._id}`}
                    className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap"
                  >
                    Mark / View Attendance
                  </Link>
                  <button
                    onClick={() => handleDelete(meeting._id)}
                    disabled={deletingId === meeting._id}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors disabled:opacity-50"
                    title="Delete Meeting"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {meetings.length === 0 && (
              <div className="glass-panel p-8 text-center text-slate-400 border border-slate-700/50">
                No meetings found. Create one to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

