export function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', ...options }).format(new Date(value));
}
export const dateTime = (value) => formatDate(value, { year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
export const timeRange = (event) => `${dateTime(event.startTime)} – ${formatDate(event.endTime, { hour: '2-digit', minute: '2-digit', hour12: false })}`;
export function toInputDate(value) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
