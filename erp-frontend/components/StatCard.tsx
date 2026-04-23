interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  color: string;
  icon: React.ReactNode;
}

export default function StatCard({ title, value, subtitle, color, icon }: Props) {
  return (
    <div className={`rounded-2xl p-6 text-white shadow-lg ${color} flex items-center gap-4`}>
      <div className="bg-white/20 rounded-xl p-3">{icon}</div>
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
        {subtitle && <p className="text-xs text-white/70 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
