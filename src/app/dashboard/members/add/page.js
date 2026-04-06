import MemberForm from '@/components/MemberForm';

export default function AddMemberPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400 mb-8">
        Add New Member
      </h1>
      <MemberForm />
    </div>
  );
}
