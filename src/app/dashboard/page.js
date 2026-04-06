'use client';

import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { Users, Award, Target, TrendingUp, Trophy } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
     <div className="space-y-6 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
          Dashboard Overview
        </h1>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Users className="text-blue-400" />} title="Total Members" value={data?.totalMembers || 0} />
            <StatCard icon={<Award className="text-emerald-400" />} title="Best Team" value={data?.bestTeam?.name || 'N/A'} subValue={data?.bestTeam ? `Avg: ${data.bestTeam.avgScore.toFixed(1)}` : null} />
            <StatCard icon={<TrendingUp className="text-yellow-400" />} title="Most Valuable" value={data?.mostValuable?.name || 'N/A'} subValue={data?.mostValuable ? `Score: ${data.mostValuable.contributionScore}` : null} />
            <StatCard icon={<Trophy className="text-purple-400" />} title="Member of the Month" value={data?.memberOfTheMonth?.name || 'N/A'} subValue={data?.memberOfTheMonth ? `Score: ${data.memberOfTheMonth.contributionScore}` : null} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-300">Team vs Average Contribution</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data?.teamDistribution || []}>
                            <XAxis dataKey="_id" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                            <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4 text-slate-300">Skills Distribution</h3>
                <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data?.skillsDistribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label={{fill: '#f8fafc', fontSize: 12}}>
                                {data?.skillsDistribution?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
        
        {/* Performers Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4 text-emerald-400 flex items-center gap-2"><Trophy size={18}/> Top 5 Performers</h3>
                <div className="space-y-3">
                    {data?.topMembers?.map((m, i) => (
                        <div key={m._id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <span className="font-medium text-slate-200">{i+1}. {m.name} <span className="text-xs text-slate-400 ml-2">({m.team})</span></span>
                            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-sm font-semibold">{m.contributionScore} pts</span>
                        </div>
                    ))}
                    {(!data?.topMembers || data.topMembers.length === 0) && <p className="text-slate-500 text-sm">No members yet.</p>}
                </div>
            </div>
            
            <div className="glass-panel p-6">
                <h3 className="text-lg font-semibold mb-4 text-red-400 flex items-center gap-2"><Target size={18}/> Needs Attention (Low Performers)</h3>
                <div className="space-y-3">
                    {data?.lowPerformers?.map((m, i) => (
                        <div key={m._id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <span className="font-medium text-slate-200">{m.name} <span className="text-xs text-slate-400 ml-2">({m.team})</span></span>
                            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-sm font-semibold">{m.contributionScore} pts</span>
                        </div>
                    ))}
                     {(!data?.lowPerformers || data.lowPerformers.length === 0) && <p className="text-slate-500 text-sm">No members yet.</p>}
                </div>
            </div>
        </div>
     </div>
  );
}

function StatCard({ icon, title, value, subValue }) {
  return (
    <div className="glass-panel p-6 flex flex-col justify-between hover:translate-y-[-2px] transition-transform duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-slate-800/80 rounded-xl shadow-inner border border-slate-700/50">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-400 font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-slate-100 mt-1">{value}</h4>
        {subValue && <p className="text-sm text-blue-400 mt-1 font-medium">{subValue}</p>}
      </div>
    </div>
  );
}
