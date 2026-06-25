// Spanish relative-time formatting. Pure + tiny so it runs anywhere.

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (sec < 60) return "hace un momento";
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `hace ${day} d`;
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
  });
}

export function fullDate(iso: string): string {
  return new Date(iso).toLocaleString("es-VE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
