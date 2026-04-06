import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-72 p-4 max-w-7xl">
        {children}
      </main>
    </div>
  );
}
