'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckSquare, Save, Check, X, Users } from 'lucide-react';

function AttendanceContent() {
  const searchParams = useSearchParams();
  const meetingIdParam = searchParams.get('meetingId');

  const [meetings, setMeetings] = useState([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState(meetingIdParam || '');
  const [members, setMembers] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // On mount: fetch meetings + members in parallel, then load attendance
  useEffect(() => {
    async function init() {
      try {
        // Fetch both in parallel
        const [meetingRes, memberRes] = await Promise.all([
          fetch('/api/meetings'),
          fetch('/api/members'),
        ]);
        const meetingData = await meetingRes.json();
        const memberData = await memberRes.json();

        const fetchedMeetings = meetingData.success ? meetingData.meetings : [];
        // /api/members returns a plain array, not { success, members }
        const fetchedMembers = Array.isArray(memberData)
          ? memberData
          : memberData.members || [];

        setMeetings(fetchedMeetings);
        setMembers(fetchedMembers);

        // Determine which meeting to show
        const targetId =
          meetingIdParam ||
          (fetchedMeetings.length > 0 ? fetchedMeetings[0]._id : '');

        if (targetId) {
          setSelectedMeetingId(targetId);
          // Load attendance immediately — members are already available here
          await loadAttendanceWithMembers(targetId, fetchedMembers);
        }
      } catch (err) {
        console.error('Init error', err);
      }
    }
    init();
  }, []);

  // Called when user manually changes the meeting dropdown
  const handleMeetingChange = async (mId) => {
    setSelectedMeetingId(mId);
    await loadAttendanceWithMembers(mId, members);
  };

  // Core function — takes explicit members array to avoid stale closure issues
  const loadAttendanceWithMembers = async (mId, memberList) => {
    if (!mId || memberList.length === 0) return;
    setLoading(true);
    try {
      // Default everyone to Absent
      const defaultMap = {};
      memberList.forEach((m) => {
        defaultMap[m._id] = 'Absent';
      });

      // Overlay saved records
      const attRes = await fetch(`/api/attendance?meetingId=${mId}`);
      const attData = await attRes.json();

      if (attData.success) {
        attData.attendance.forEach((record) => {
          const id =
            typeof record.memberId === 'object'
              ? record.memberId._id
              : record.memberId;
          defaultMap[id] = record.status;
        });
      }

      setAttendanceState(defaultMap);
    } catch (error) {
      console.error('Error loading attendance', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (memberId, status) => {
    setAttendanceState((prev) => ({ ...prev, [memberId]: status }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    const attendanceData = Object.keys(attendanceState).map((mId) => ({
      memberId: mId,
      status: attendanceState[mId],
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: selectedMeetingId, attendanceData }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Attendance saved successfully!', type: 'success' });
      } else {
        setMessage({ text: data.error || 'Failed to save', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Error saving attendance', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const presentCount = Object.values(attendanceState).filter((s) => s === 'Present').length;
  const absentCount = Object.values(attendanceState).filter((s) => s === 'Absent').length;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Attendance
          </h1>
          <p className="text-slate-400 mt-1">Mark present/absent for meetings</p>
        </div>
        {selectedMeetingId && members.length > 0 && (
          <div className="flex gap-3">
            <div className="glass-panel px-4 py-2 text-sm border border-emerald-500/30 text-emerald-400">
              ✓ Present: {presentCount}
            </div>
            <div className="glass-panel px-4 py-2 text-sm border border-red-500/30 text-red-400">
              ✗ Absent: {absentCount}
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 border border-slate-700/50">
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <div className="w-full sm:w-1/2">
            <label className="block text-sm text-slate-400 mb-2">Select Meeting</label>
            <select
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              value={selectedMeetingId}
              onChange={(e) => handleMeetingChange(e.target.value)}
            >
              <option value="" disabled>-- Select a Meeting --</option>
              {meetings.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.title} ({new Date(m.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !selectedMeetingId || members.length === 0}
            className="w-full sm:w-auto mt-4 sm:mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        {message.text && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-slate-400 flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            Loading members...
          </div>
        ) : !selectedMeetingId ? (
          <div className="py-10 text-center text-slate-400">
            Please select a meeting to mark attendance.
          </div>
        ) : members.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            No members found. Add members from the Members section first.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-700/50 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/50 text-slate-300 text-sm">
                  <th className="py-4 px-6 font-medium">#</th>
                  <th className="py-4 px-6 font-medium">Member Name</th>
                  <th className="py-4 px-6 font-medium">Team</th>
                  <th className="py-4 px-6 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => (
                  <tr key={m._id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-slate-500 text-sm">{idx + 1}</td>
                    <td className="py-4 px-6 text-white font-medium">{m.name}</td>
                    <td className="py-4 px-6">
                      <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full">
                        {m.team}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleToggle(m._id, 'Present')}
                          className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-all ${
                            attendanceState[m._id] === 'Present'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                          }`}
                        >
                          <Check size={16} className="mr-1" /> Present
                        </button>
                        <button
                          onClick={() => handleToggle(m._id, 'Absent')}
                          className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-all ${
                            attendanceState[m._id] === 'Absent'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                          }`}
                        >
                          <X size={16} className="mr-1" /> Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense fallback={<div className="text-slate-400 p-8">Loading...</div>}>
      <AttendanceContent />
    </Suspense>
  );
}
