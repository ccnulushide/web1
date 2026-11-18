import { createContext, useContext, useEffect, useState } from 'react';
import { createPlatform } from '../services/platform.js';
import { createStorage } from '../utils/storage.js';

const AppContext = createContext(null);
let platformInstance;
function getPlatform() {
  if (!platformInstance) platformInstance = createPlatform(createStorage(window.localStorage));
  return platformInstance;
}
export function AppProvider({ children }) {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [now, setNow] = useState(Date.now());
  const refresh = () => {
    try { const platform = getPlatform(); setData(platform.read()); setUser(platform.currentUser()); setError(''); setNow(Date.now()); }
    catch (e) { setError(e.message); }
  };
  useEffect(() => {
    getPlatform().initialize().then(refresh).catch(e => setError(e.message));
    const update = () => refresh();
    const timer = setInterval(() => setNow(Date.now()), 30000);
    window.addEventListener('storage', update);
    window.addEventListener('focus', update);
    return () => { clearInterval(timer); window.removeEventListener('storage', update); window.removeEventListener('focus', update); };
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(null), 4500); return () => clearTimeout(timer); }, [toast]);
  const notify = (message, type = 'success') => setToast({ message, type, key: Date.now() });
  async function mutate(method, args = [], message) {
    try { const result = await getPlatform()[method](...args); refresh(); if (message) notify(message); return result ?? true; }
    catch (e) { notify(e.message, 'error'); return false; }
  }
  const confirm = (options) => setDialog(options);
  const reset = async () => { await getPlatform().initialize(true); refresh(); notify('演示数据已恢复，账号已退出'); };
  return <AppContext.Provider value={{ data, user, now, refresh, notify, mutate, confirm }}>
    {error ? <div className="recovery"><span className="eyebrow">LOCAL STORAGE</span><h1>本地数据暂时无法读取</h1><p>{error}</p><p>恢复会重置本浏览器中的账号、活动和报名记录，请先确认没有需要保留的数据。</p><button className="button primary" onClick={() => confirm({ title: '恢复演示数据？', description: '这会覆盖本浏览器中已有的业务数据，且无法撤回。', danger: true, onConfirm: reset })}>恢复演示数据</button></div> : !data ? <div className="loading"><span className="spinner" /> 正在准备你的校园生活…</div> : children}
    {toast && <div className={`toast ${toast.type}`} role="status" key={toast.key}>{toast.type === 'error' ? '!' : '✓'}<span>{toast.message}</span><button onClick={() => setToast(null)} aria-label="关闭提示">×</button></div>}
    {dialog && <ConfirmDialog options={dialog} onClose={() => setDialog(null)} />}
  </AppContext.Provider>;
}
function ConfirmDialog({ options, onClose }) {
  const [busy, setBusy] = useState(false);
  const [remark, setRemark] = useState('');
  useEffect(() => {
    const previous = document.activeElement;
    const handler = (e) => { if (e.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', handler);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = old; previous?.focus(); };
  }, [busy, onClose]);
  return <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}><section className="modal" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" onKeyDown={e => {
    if (e.key === 'Tab') { const controls = [...e.currentTarget.querySelectorAll('button:not(:disabled), textarea')]; const first = controls[0]; const last = controls.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); } }
  }}><div className={`modal-symbol ${options.danger ? 'danger' : ''}`}>{options.danger ? '!' : '✓'}</div><h2 id="dialog-title">{options.title}</h2><p>{options.description}</p>{options.inputLabel && <label className="field"><span>{options.inputLabel}</span><textarea rows={3} maxLength={300} value={remark} onChange={e => setRemark(e.target.value)} placeholder="选填，帮助同学了解原因" /></label>}<div className="modal-actions"><button autoFocus className="button secondary" disabled={busy} onClick={onClose}>再想想</button><button className={`button ${options.danger ? 'danger' : 'primary'}`} disabled={busy} onClick={async () => { setBusy(true); try { await options.onConfirm(remark); onClose(); } catch { setBusy(false); } }}>{busy ? '处理中…' : options.confirmText || '确认操作'}</button></div></section></div>;
}
export const useApp = () => useContext(AppContext);
