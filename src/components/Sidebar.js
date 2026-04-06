'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserPlus, LogOut, Calendar, CheckSquare, BarChart } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Members List', href: '/dashboard/members', icon: <Users size={20} /> },
    { name: 'Add Member', href: '/dashboard/members/add', icon: <UserPlus size={20} /> },
    { name: 'Meetings', href: '/dashboard/meetings', icon: <Calendar size={20} /> },
    { name: 'Attendance', href: '/dashboard/attendance', icon: <CheckSquare size={20} /> },
    { name: 'Reports', href: '/dashboard/reports', icon: <BarChart size={20} /> },
  ];

  return (
    <div className="w-64 glass-panel h-[calc(100vh-2rem)] flex flex-col m-4 fixed">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          Xavier Tech Byte
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manager Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}