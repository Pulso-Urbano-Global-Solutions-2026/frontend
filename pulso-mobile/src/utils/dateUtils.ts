const MS = { minute: 60_000, hour: 3_600_000, day: 86_400_000 };

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const formatDayLabel = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const formatRelative = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  if (diff < MS.minute) return 'agora';
  if (diff < MS.hour) return `há ${Math.floor(diff / MS.minute)} min`;
  if (diff < MS.day) return `há ${Math.floor(diff / MS.hour)} h`;
  const dias = Math.floor(diff / MS.day);
  return `há ${dias} ${dias === 1 ? 'dia' : 'dias'}`;
};
