'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';

export default function MembersList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [team, setTeam] = useState('');
  const [memberType, setMemberType] = useState('');

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (search) qs.append('search', search);
      if (team) qs.append('team', team);
      if (memberType) qs.append('memberType', memberType);
      
      const res = await fetch(`/api/members?${qs.toString()}`);
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMembers();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, team, memberType]);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this member?')) {
      await fetch(`/api/members/${id}`, { method: 'DELETE' });
      fetchMembers();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
          Members Directory
        </h1>
        <Link href="/dashboard/members/add" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Member
        </Link>
      </div>

      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name..." 
            className="glass-input pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            className="glass-input w-40 appearance-none"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
          >
            <option value="">All Teams</option>
            <option value="Tech">Tech</option>
            <option value="PR">PR</option>
            <option value="Executive">Executive</option>
            <option value="Research">Research</option>
          </select>
          
          <select 
            className="glass-input w-40 appearance-none"
            value={memberType}
            onChange={(e) => setMemberType(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Head">Head</option>
            <option value="General">General</option>
            <option value="Volunteer">Volunteer</option>
          </select>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider border-b border-white/5">
                  <th className="p-4 rounded-tl-xl whitespace-nowrap">Rank</th>
                  <th className="p-4 whitespace-nowrap">Name</th>
                  <th className="p-4 whitespace-nowrap">Team</th>
                  <th className="p-4 whitespace-nowrap">Role</th>
                  <th className="p-4 whitespace-nowrap">Phone</th>
                  <th className="p-4 whitespace-nowrap">Score</th>
                  <th className="p-4 rounded-tr-xl whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-500">No members found matching your criteria.</td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold
                              ${member.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]' : 
                                member.rank === 2 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/30' : 
                                member.rank === 3 ? 'bg-orange-700/20 text-orange-400 border border-orange-700/30' : 
                                'bg-slate-800/50 text-slate-400'}`}>
                             {member.rank}
                           </span>
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-200">
                        {member.name}
                        {member.rank <= 3 && <TrophyIcon rank={member.rank} />}
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {member.team}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">{member.memberType}</td>
                      <td className="p-4 text-slate-300 font-mono text-sm">{member.phoneNumber || '-'}</td>
                      <td className="p-4 font-semibold text-emerald-400">{member.contributionScore}</td>
                      <td className="p-4 flex gap-2">
                        <Link href={`/dashboard/members/edit/${member._id}`} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(member._id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function TrophyIcon({ rank }) {
  if (rank > 3) return null;
  const colors = {
    1: 'text-yellow-400',
    2: 'text-slate-300',
    3: 'text-orange-400'
  };
  return <ShieldAlert size={14} className={`inline ml-2 ${colors[rank]}`} />;
}
