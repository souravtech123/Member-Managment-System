'use client';
import { useState, useEffect } from 'react';
import { BarChart, Users, Calendar, AlertTriangle, Download } from 'lucide-react';

export default function ReportsPage() {
  const [reportData, setReportData] = useState([]);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await fetch('/api/attendance/report');
      const data = await res.json();
      if (data.success) {
        setReportData(data.report);
        setTotalMeetings(data.totalMeetings);
      }
    } catch (error) {
      console.error('Failed to fetch report', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Unique ID,Name,Attended,Total Meetings,Percentage'];
    const csvRows = reportData.map(r => 
      `${r.uniqueId},${r.name},${r.attended},${r.total},${r.percentage}%`
    );
    const csvContent = [headers, ...csvRows].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const lowAttendance = reportData.filter(r => r.percentage < 50);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Attendance Report
          </h1>
          <p className="text-slate-400 mt-1">Analytics and low attendance warnings</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <Download size={18} className="mr-2" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 border border-slate-700/50 flex items-center space-x-4">
          <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400">
            <Calendar size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Meetings</p>
            <h3 className="text-2xl font-bold text-white">{totalMeetings}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 border border-slate-700/50 flex items-center space-x-4">
          <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400">
            <Users size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Participants</p>
            <h3 className="text-2xl font-bold text-white">{reportData.length}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 border border-slate-700/50 flex items-center space-x-4">
          <div className="bg-red-500/20 p-4 rounded-xl text-red-400">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Low Attendance (&lt;50%)</p>
            <h3 className="text-2xl font-bold text-white">{lowAttendance.length}</h3>
          </div>
        </div>
      </div>

      {lowAttendance.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start space-x-3">
          <AlertTriangle className="text-red-400 mt-0.5" size={20} />
          <div>
            <h4 className="text-red-400 font-medium">Action Required: Low Attendance Participants</h4>
            <p className="text-red-400/80 text-sm mt-1">
              {lowAttendance.map(p => p.name).join(', ')} have below 50% attendance rate.
            </p>
          </div>
        </div>
      )}

      <div className="glass-panel p-6 border border-slate-700/50">
        <h2 className="text-xl font-semibold mb-6 text-white flex items-center">
          <BarChart size={20} className="mr-2 text-blue-400" />
          Participant Attendance Records
        </h2>

        {loading ? (
          <div className="py-10 text-center text-slate-400">Loading comprehensive report...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm">
                  <th className="pb-3 px-4 font-medium">Unique ID</th>
                  <th className="pb-3 px-4 font-medium">Name</th>
                  <th className="pb-3 px-4 font-medium text-center">Attended / Total</th>
                  <th className="pb-3 px-4 font-medium text-right">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((record) => (
                  <tr key={record.uniqueId} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 text-slate-300">
                      <span className="bg-slate-800 px-2 py-1 rounded text-xs border border-slate-700">{record.uniqueId}</span>
                    </td>
                    <td className="py-4 px-4 text-white font-medium">{record.name}</td>
                    <td className="py-4 px-4 text-center text-slate-400">
                      {record.attended} / {record.total}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        record.percentage >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        record.percentage >= 50 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {record.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
                {reportData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500">
                      No report data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
