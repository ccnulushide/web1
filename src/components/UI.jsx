import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowRight, CalendarDays, Clock3, GraduationCap, MapPin, Search, Users, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { eventStatus, occupied } from '../services/platform.js';
import { formatDate } from '../utils/dateUtils.js';

export const STATUS = {
  open: ['报名中', 'green'], full: ['名额已满', 'orange'], closed: ['已截止 / 下架', 'gray'], ongoing: ['进行中', 'blue'], finished: ['已结束', 'gray'], draft: ['草稿', 'gray'], deleted: ['已删除', 'gray'],
  pending: ['待审核', 'orange'], approved: ['已通过', 'green'], rejected: ['未通过', 'red'], cancelled: ['已取消', 'gray'], active: ['正常', 'green'], disabled: ['已停用', 'red'],
};
export function Badge({ status }) { const [label, color] = STATUS[status] || [status, 'gray']; return <span className={`badge ${color}`}><i />{label}</span>; }
export function Brand({ admin = false }) { return <Link className="brand" to={admin ? '/admin' : '/'}><span className="brand-mark"><GraduationCap size={25} strokeWidth={1.8} /></span><span>校园汇<small>{admin ? '管理工作台' : 'CAMPUS CONNECT'}</small></span></Link>; }
export function Empty({ title = '暂时还没有内容', description = '换个条件试试，下一份精彩也许就在这里。', action }) { return <div className="empty"><div className="empty-icon"><Search size={30} strokeWidth={1.4} /></div><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function SectionTitle({ eyebrow, title, description, to, linkText = '查看全部活动' }) { return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2>{description && <p>{description}</p>}</div>{to && <Link className="text-link" to={to}>{linkText}<ArrowRight size={17} /></Link>}</div>; }
export function SearchInput({ value, onChange, placeholder = '搜索活动名称、主办方或感兴趣的内容…', label = '搜索活动' }) { return <div className="search-input"><Search size={19} /><input type="search" aria-label={label} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />{value && <button onClick={() => onChange('')} aria-label="清空搜索">×</button>}</div>; }
export function Pagination({ page, total, pageSize, onChange }) { const pages = Math.ceil(total / pageSize); if (pages <= 1) return null; return <div className="pagination"><span>共 {total} 条 · 第 {page} / {pages} 页</span><div><button className="icon-button" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="上一页"><ArrowLeft size={17} /></button>{Array.from({ length: pages }, (_, i) => i + 1).filter(i => i === 1 || i === pages || Math.abs(i - page) <= 1).map((n, i, arr) => <span key={n}>{i > 0 && n - arr[i - 1] > 1 && <span className="page-dots">…</span>}<button className={`page-number ${n === page ? 'selected' : ''}`} onClick={() => onChange(n)} aria-label={`第 ${n} 页`} aria-current={n === page ? 'page' : undefined}>{n}</button></span>)}<button className="icon-button" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="下一页"><ArrowRight size={17} /></button></div></div>; }

export function Poster({ event, large = false }) {
  const cover = ['ai', 'music', 'volunteer', 'innovation', 'photo', 'sport', 'reading', 'space'].includes(event.cover) ? event.cover : 'ai';
  const copy = { ai: ['BEYOND', 'THE FUTURE', 'AI × NEW POSSIBILITIES'], music: ['LIVE IN', 'THE MOMENT', 'CAMPUS MUSIC FESTIVAL'], volunteer: ['SMALL ACTS.', 'BIG IMPACT.', 'LET KINDNESS GROW'], innovation: ['MAKE', 'IT HAPPEN.', 'IDEAS START HERE'], photo: ['CAPTURE', 'THE LIGHT', 'A WALK TO REMEMBER'], sport: ['KEEP', 'MOVING.', 'RUN WITH YOUR PASSION'], reading: ['ONE MORE', 'CHAPTER.', 'A WORLD BETWEEN PAGES'], space: ['INTO THE', 'UNIVERSE', 'LOOK UP. THINK BIG.'] }[cover];
  return <div className={`poster poster-${cover} ${large ? 'poster-large' : ''}`} aria-hidden="true"><div className="poster-grain" /><span className="poster-top">CAMPUS / {event.category}</span><div className="poster-copy"><strong>{copy[0]}<br />{copy[1]}</strong><small>{copy[2]}</small></div><div className="poster-art"><span /><span /><span /><span /></div><span className="poster-bottom">{formatDate(event.startTime, { month: '2-digit', day: '2-digit' }).replace('/', '.')}<ArrowDown size={15} /></span></div>;
}
export function EventCard({ event }) {
  const { data, now } = useApp();
  const count = occupied(event.id, data.registrations);
  const state = eventStatus(event, data.registrations, now);
  return <Link className="event-card" to={`/events/${event.id}`}><div className="card-poster"><Poster event={event} /><span className="poster-category">{event.category}</span></div><div className="event-card-body"><div className="card-date"><CalendarDays size={14} />{formatDate(event.startTime, { weekday: 'short' })}<Badge status={state} /></div><h3>{event.title}</h3><p className="card-subtitle">{event.subtitle || event.organizer}</p><div className="card-location"><MapPin size={14} /><span>{event.location}</span></div><div className="card-bottom"><span><Users size={14} /> {count} / {event.capacity} 人</span><span className="card-arrow"><ArrowRight size={18} /></span></div></div></Link>;
}
export function Metric({ label, value, icon: Icon = Users, note, to, color = 'blue' }) { const content = <><div className="metric-label">{label}<span className={`metric-icon ${color}`}><Icon size={20} /></span></div><strong>{value}<small>{label.includes('人') ? '人' : ''}</small></strong>{note && <p>{note}</p>}</>; return to ? <Link to={to} className="metric">{content}</Link> : <div className="metric">{content}</div>; }
export function Field({ label, error, hint, required, children }) { return <label className={`field ${error ? 'field-error' : ''}`}><span>{label}{required && <em> *</em>}</span>{children}{error ? <small className="error-text" role="alert">{error}</small> : hint && <small>{hint}</small>}</label>; }
export function Chart({ option, height = 300, label }) {
  const ref = useRef(null);
  useEffect(() => {
    let chart;
    let disposed = false;
    let observer;
    import('./chartEngine.js').then(echarts => {
      if (disposed || !ref.current) return;
      chart = echarts.init(ref.current);
      chart.setOption({ ...option, textStyle: { fontFamily: 'Inter, Microsoft YaHei, sans-serif', color: '#6d7890', ...option.textStyle } });
      observer = new ResizeObserver(() => chart?.resize());
      observer.observe(ref.current);
    });
    return () => { disposed = true; observer?.disconnect(); chart?.dispose(); };
  }, [option]);
  return <div ref={ref} style={{ height, width: '100%' }} role="img" aria-label={label} />;
}
export function BackLink({ to = '/events', children = '返回活动广场' }) { return <Link className="back-link" to={to}><ArrowLeft size={16} />{children}</Link>; }
export function PageIntro({ eyebrow, title, description, children }) { return <div className="page-intro"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</div>; }
