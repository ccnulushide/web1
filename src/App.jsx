import { useEffect } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext.jsx';
import { StudentLayout, AdminLayout } from './layouts/Layouts.jsx';
import { Home, Events, EventDetail, MyEvents, Profile } from './pages/student/StudentPages.jsx';
import { AuthPage } from './pages/auth/AuthPage.jsx';
import { Dashboard, AdminEvents, EventEditor, Registrations, UsersPage, Statistics } from './pages/admin/AdminPages.jsx';

function Guard({ role }) {
  const { user } = useApp();
  const location = useLocation();
  if (!user) return <Navigate replace to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} />;
  if (role && user.role !== role) return <div className="recovery"><span className="eyebrow">403 / ACCESS DENIED</span><h1>当前账号没有访问权限</h1><p>{role === 'admin' ? '管理工作台仅对管理员开放。' : '请使用学生账号查看和管理个人报名。'}</p><Link className="button primary" to={user.role === 'admin' ? '/admin' : '/'}>返回我的首页</Link><Link className="button secondary" to="/login">切换账号</Link></div>;
  return <Outlet />;
}
export function NotFound() { return <div className="recovery"><span className="eyebrow">404 / NOT FOUND</span><h1>这一页，暂时走丢了</h1><p>页面可能已移动，或者活动已被删除。去发现其他精彩吧。</p><Link to="/events" className="button primary">前往活动广场</Link></div>; }
export default function App() {
  const location = useLocation();
  useEffect(() => { window.scrollTo(0, 0); document.title = `${location.pathname.startsWith('/admin') ? '管理工作台' : '校园汇'} · 校园活动发布与报名管理平台`; }, [location.pathname]);
  return <Routes><Route element={<StudentLayout />}><Route index element={<Home />} /><Route path="events" element={<Events />} /><Route path="events/:id" element={<EventDetail />} /><Route element={<Guard role="student" />}><Route path="my-events" element={<MyEvents />} /></Route><Route element={<Guard />}><Route path="profile" element={<Profile />} /></Route></Route><Route path="login" element={<AuthPage />} /><Route path="register" element={<AuthPage register />} /><Route element={<Guard role="admin" />}><Route path="admin" element={<AdminLayout />}><Route index element={<Dashboard />} /><Route path="events" element={<AdminEvents />} /><Route path="events/create" element={<EventEditor />} /><Route path="events/:id/edit" element={<EventEditor />} /><Route path="registrations" element={<Registrations />} /><Route path="users" element={<UsersPage />} /><Route path="statistics" element={<Statistics />} /></Route></Route><Route path="*" element={<NotFound />} /></Routes>;
}
