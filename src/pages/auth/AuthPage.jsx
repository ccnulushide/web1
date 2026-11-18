import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, GraduationCap, LockKeyhole, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { Brand, Field } from '../../components/UI.jsx';

export function AuthPage({ register = false }) {
  const { mutate } = useApp();
  const [params] = useSearchParams();
  const [values, setValues] = useState({ username: '', password: '', realName: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const next = params.get('next');
  function change(key, value) { setValues(v => ({ ...v, [key]: value })); setErrors(e => ({ ...e, [key]: '', form: '' })); }
  async function submit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!values.username.trim()) nextErrors.username = '请输入账号';
    if (!values.password) nextErrors.password = '请输入密码';
    if (register) {
      if (!/^[A-Za-z0-9_]{4,20}$/.test(values.username)) nextErrors.username = '使用 4–20 位字母、数字或下划线';
      if (values.realName.trim().length < 2 || values.realName.trim().length > 20) nextErrors.realName = '请输入 2–20 个字的真实姓名';
      if (values.password.length < 6 || values.password.length > 64) nextErrors.password = '密码长度为 6–64 位';
      if (values.confirmPassword !== values.password) nextErrors.confirmPassword = '两次输入的密码不一致';
    }
    setErrors(nextErrors); if (Object.keys(nextErrors).length) return;
    setBusy(true);
    const result = await mutate(register ? 'register' : 'login', register ? [values] : [values.username, values.password], register ? '注册成功，欢迎加入校园汇' : '登录成功，欢迎回来');
    if (result) {
      // Only navigate to an internal route; never follow a user-supplied external redirect.
      const safeNext = next?.startsWith('/') && !next.startsWith('//') && !next.startsWith('/login') && !next.startsWith('/register');
      const permittedNext = safeNext && (result.role === 'admin' || !next.startsWith('/admin')) && (result.role === 'student' || !next.startsWith('/my-events'));
      navigate(permittedNext ? next : result.role === 'admin' ? '/admin' : '/', { replace: true });
    } else { setErrors({ form: register ? '注册未完成，请检查输入信息或上方提示。' : '登录失败，请检查账号和密码。' }); }
    setBusy(false);
  }
  const alternate = `${register ? '/login' : '/register'}${next ? `?next=${encodeURIComponent(next)}` : ''}`;
  return <div className="auth-page"><div className="auth-story"><Brand /><div className="auth-story-copy"><span className="hero-kicker">MORE THAN A CAMPUS</span><h1>你的热爱，<br />在这里<span>有回响。</span></h1><p>一场讲座，一次相遇，一段全新的旅程。<br />让每一份好奇，都找到出发的理由。</p><div className="auth-art"><div className="auth-art-orbit" /><GraduationCap size={100} strokeWidth={1} /><span className="auth-float float-one"><MusicNote />发现精彩</span><span className="auth-float float-two"><Users size={20} />连接同频</span><span className="auth-float float-three"><Sparkles size={20} />遇见可能</span></div></div><small className="auth-story-footer">CAMPUS CONNECT · 每一次参与，都算数</small></div><div className="auth-form-side"><Link className="back-link" to="/"><ArrowLeft size={16} />返回首页</Link><div className="auth-form-wrap"><span className="eyebrow">{register ? 'START YOUR JOURNEY' : 'WELCOME BACK'}</span><h2>{register ? '开启你的校园旅程' : '欢迎回到校园汇'}</h2><p className="auth-subtitle">{register ? '创建学生账号，发现属于你的校园精彩。' : '登录账号，让下一份热爱如期发生。'}</p><form onSubmit={submit} noValidate><Field label="账号 / 学号" required error={errors.username}><input autoComplete="username" value={values.username} maxLength={20} onChange={e => change('username', e.target.value)} placeholder={register ? '设置你的账号 / 学号' : '请输入账号 / 学号'} /></Field>{register && <Field label="真实姓名" required error={errors.realName}><input autoComplete="name" value={values.realName} maxLength={20} onChange={e => change('realName', e.target.value)} placeholder="请输入你的姓名" /></Field>}<Field label="密码" required error={errors.password}><div className="password-input"><input type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} value={values.password} maxLength={64} onChange={e => change('password', e.target.value)} placeholder={register ? '设置至少 6 位密码' : '请输入密码'} /><button type="button" aria-label={showPassword ? '隐藏密码' : '显示密码'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>{register && <Field label="确认密码" required error={errors.confirmPassword}><input type="password" autoComplete="new-password" maxLength={64} value={values.confirmPassword} onChange={e => change('confirmPassword', e.target.value)} placeholder="再次输入密码" /></Field>}{errors.form && <p className="form-error" role="alert">{errors.form}</p>}<button className="button primary full-width auth-submit" disabled={busy}>{busy ? '请稍候…' : register ? '注册并开始探索' : '登录'}{!busy && <ArrowRight size={18} />}</button></form><p className="auth-switch">{register ? '已经有账号？' : '还没有账号？'}<Link to={alternate}>{register ? '立即登录' : '注册学生账号'}<ArrowRight size={13} /></Link></p>{!register && <section className="demo-accounts"><div><ShieldCheck size={16} /><strong>快速体验</strong><span>演示密码均为 123456</span></div><button onClick={() => { setValues({ ...values, username: '20260001', password: '123456' }); setErrors({}); }}><span><GraduationCap size={18} />学生账号</span><code>20260001</code><ArrowRight size={15} /></button><button onClick={() => { setValues({ ...values, username: 'admin', password: '123456' }); setErrors({}); }}><span><ShieldCheck size={18} />管理员</span><code>admin</code><ArrowRight size={15} /></button><small>另一个学生账号：20260002 / 123456</small></section>}<p className="auth-local-note"><LockKeyhole size={13} />课程演示原型 · 仅本地存储，请使用演示信息</p></div></div></div>;
}
function MusicNote() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18V5l12-2v13M9 8l12-2" /><ellipse cx="5" cy="18" rx="4" ry="3" /><ellipse cx="17" cy="16" rx="4" ry="3" /></svg>; }
