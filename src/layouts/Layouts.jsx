import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, CalendarDays, ChevronRight, ClipboardList, LayoutDashboard, LogOut, Menu, Plus, Settings2, ShieldCheck, UserRound, Users, X } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { Brand } from '../components/UI.jsx';
import { formatDate } from '../utils/dateUtils.js';

export function StudentLayout() {
  const { user, mutate } = useApp();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => setMenu(false), [location.pathname]);
  return <><header className="site-header"><div className="container header-inner"><Brand /><nav className={`student-nav ${menu ? 'is-open' : ''}`} aria-label="主导航"><NavLink end to="/">首页</NavLink><NavLink to="/events">活动广场</NavLink><NavLink to="/my-events">我的报名</NavLink><NavLink to="/profile">个人中心</NavLink></nav><div className="header-actions">{user ? <><Link className="user-chip" to={user.role === 'admin' ? '/admin' : '/profile'}><span className="avatar small">{user.realName.slice(0, 1)}</span><span>{user.realName}</span></Link>{user.role === 'admin' && <Link className="button small secondary admin-entry" to="/admin">管理后台<ArrowRight size={14} /></Link>}<button className="icon-button logout-button" aria-label="退出登录" title="退出登录" onClick={async () => { await mutate('logout', [], '已退出登录'); navigate('/'); }}><LogOut size={18} /></button></> : <Link className="button primary small" to="/login">登录 / 注册<ArrowRight size={15} /></Link>}<button className="icon-button mobile-menu" onClick={() => setMenu(!menu)} aria-label="展开导航" aria-expanded={menu}>{menu ? <X /> : <Menu />}</button></div></div></header><main className="student-main"><Outlet /></main><footer className="site-footer"><div className="container footer-inner"><div><Brand /><p>在这里，遇见热爱，也遇见更好的自己。</p></div><div className="footer-links"><Link to="/events">发现活动</Link><Link to="/my-events">我的报名</Link><Link to="/login?role=admin">管理员入口</Link></div><div className="footer-note"><span>校园活动发布与报名管理平台</span><small>© {new Date().getFullYear()} 校园汇 · CEMS</small><small>课程演示版 · 数据仅保存在当前浏览器</small></div></div></footer></>;
}
const adminNav = [
  ['/admin', '数据总览', LayoutDashboard], ['/admin/events', '活动管理', CalendarDays], ['/admin/registrations', '报名管理', ClipboardList], ['/admin/users', '用户管理', Users], ['/admin/statistics', '数据统计', BarChart3],
];
export function AdminLayout() {
  const { user, data, mutate } = useApp();
  const [menu, setMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => setMenu(false), [location.pathname]);
  const title = adminNav.filter(([path]) => location.pathname === path || path !== '/admin' && location.pathname.startsWith(path)).at(-1)?.[1] || '管理工作台';
  const pending = data.registrations.filter(r => r.status === 'pending' && data.events.some(e => e.id === r.eventId && !e.deleted && Date.parse(e.startTime) > Date.now())).length;
  return <div className="admin-app"><aside className={`admin-sidebar ${menu ? 'is-open' : ''}`}><div className="sidebar-brand"><Brand admin /><button className="icon-button mobile-menu" onClick={() => setMenu(false)} aria-label="收起菜单"><X size={20} /></button></div><span className="sidebar-label">WORKSPACE / 工作空间</span><nav aria-label="管理导航">{adminNav.map(([path, label, Icon]) => <NavLink key={path} to={path} end={path === '/admin'}><Icon size={19} />{label}{path.endsWith('registrations') && pending > 0 && <span className="nav-count">{pending}</span>}</NavLink>)}</nav><div className="sidebar-bottom"><div className="sidebar-help"><span><ShieldCheck size={20} /></span><strong>让每份热爱有序发生</strong><p>在这里，连接活动与同学。</p><Link to="/">查看学生端<ArrowRight size={15} /></Link></div><button onClick={async () => { await mutate('logout', [], '已退出管理账号'); navigate('/login'); }}><LogOut size={18} />退出登录</button></div></aside>{menu && <div className="sidebar-overlay" onClick={() => setMenu(false)} />}<div className="admin-workspace"><header className="admin-topbar"><div><button className="icon-button mobile-menu" onClick={() => setMenu(true)} aria-label="展开管理菜单"><Menu size={21} /></button><span>管理工作台</span><ChevronRight size={14} /><strong>{title}</strong></div><div><span className="admin-date">{formatDate(new Date(), { year: 'numeric', weekday: 'long' })}</span><span className="avatar small">{user.realName.slice(0, 1)}</span><span className="admin-name">{user.realName}<small>管理员</small></span></div></header><main className="admin-content"><Outlet /></main><footer className="admin-footer">校园汇 CEMS <span>课程演示环境 · 数据保存在当前浏览器</span></footer></div></div>;
}
