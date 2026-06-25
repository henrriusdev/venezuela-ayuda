export default function Loading() {
  return (
    <div className="flex flex-1 items-center justify-center py-24 text-slate-500">
      <span
        aria-hidden
        className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
      />
      Cargando…
    </div>
  );
}
