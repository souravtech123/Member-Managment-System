'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TEAMS = ["Tech", "PR", "Executive", "Research"];
const ROLES = ["Head", "General", "Volunteer"];
const SKILLS = ["Designing", "Coding", "Managing", "Researching", "Speaking"];

export default function MemberForm({ initialData = null, memberId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    team: initialData?.team || 'Tech',
    memberType: initialData?.memberType || 'General',
    contributionScore: initialData?.contributionScore || 0,
    skills: initialData?.skills || [],
  });

  const handleSkillChange = (skill) => {
    setFormData(prev => {
      const skills = prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = initialData ? `/api/members/${memberId}` : '/api/members';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/dashboard/members');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-slate-800/40 p-8 rounded-2xl border border-white/5 backdrop-blur-xl shadow-xl">
       {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">{error}</div>}
       <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <input 
                  required
                  type="text" 
                  className="glass-input" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Current Score</label>
                <input 
                  required
                  type="number" 
                  className="glass-input" 
                  value={formData.contributionScore}
                  onChange={(e) => setFormData({...formData, contributionScore: Number(e.target.value)})}
                  min="0"
                />
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Team</label>
                <select 
                  className="glass-input appearance-none"
                  value={formData.team}
                  onChange={(e) => setFormData({...formData, team: e.target.value})}
                  required
                >
                   {TEAMS.map(t => <option className="bg-slate-800 text-white" key={t} value={t}>{t}</option>)}
                </select>
             </div>
             
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Role</label>
                <select 
                  className="glass-input appearance-none"
                  value={formData.memberType}
                  onChange={(e) => setFormData({...formData, memberType: e.target.value})}
                  required
                >
                   {ROLES.map(r => <option className="bg-slate-800 text-white" key={r} value={r}>{r}</option>)}
                </select>
             </div>
          </div>
          
          <div className="space-y-3">
             <label className="text-sm font-medium text-slate-300">Skills</label>
             <div className="flex flex-wrap gap-2">
                 {SKILLS.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillChange(skill)}
                      className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                         formData.skills.includes(skill)
                         ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 font-medium'
                         : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 border border-slate-600'
                      }`}
                    >
                      {skill}
                    </button>
                 ))}
             </div>
          </div>
          
          <div className="pt-6 flex gap-4">
             <button disabled={loading} type="submit" className="btn-primary flex-1 py-3 text-lg">
                {loading ? 'Saving...' : (initialData ? 'Update Member' : 'Add Member')}
             </button>
             <button type="button" onClick={() => router.push('/dashboard/members')} className="btn-secondary flex-1 py-3 text-lg">
                Cancel
             </button>
          </div>
       </form>
    </div>
  );
}
