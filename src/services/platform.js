import { CATEGORIES, seedData } from '../data/seed.js';

export const ACTIVE_REGISTRATIONS = ['pending', 'approved'];
export const occupied = (eventId, registrations) => registrations.filter(r => r.eventId === eventId && ACTIVE_REGISTRATIONS.includes(r.status)).length;
export function eventStatus(event, registrations, now = Date.now()) {
  if (event.deleted) return 'deleted';
  if (event.status === 'draft') return 'draft';
  if (new Date(event.endTime).getTime() <= now) return 'finished';
  if (new Date(event.startTime).getTime() <= now) return 'ongoing';
  if (event.status === 'closed' || new Date(event.registrationDeadline).getTime() <= now) return 'closed';
  if (occupied(event.id, registrations) >= event.capacity) return 'full';
  return 'open';
}
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const id = () => crypto.randomUUID();
export async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2, '0')).join('');
}
export function validateEvent(values, activeCount = 0) {
  const errors = {};
  for (const [key, label] of Object.entries({ title: '活动标题', category: '活动分类', organizer: '主办方', location: '活动地点', description: '活动介绍', startTime: '开始时间', endTime: '结束时间', registrationDeadline: '报名截止时间' })) {
    if (!String(values[key] || '').trim()) errors[key] = `请填写${label}`;
  }
  if (values.title?.length > 80) errors.title = '标题不超过 80 个字';
  if (!CATEGORIES.includes(values.category)) errors.category = '请选择有效的活动分类';
  if (!Number.isInteger(Number(values.capacity)) || Number(values.capacity) < 1 || Number(values.capacity) > 100000) errors.capacity = '名额应为 1–100000 的整数';
  else if (Number(values.capacity) < activeCount) errors.capacity = `名额不能少于当前有效报名人数（${activeCount} 人）`;
  for (const key of ['startTime', 'endTime', 'registrationDeadline']) if (values[key] && !Number.isFinite(Date.parse(values[key]))) errors[key] = '请输入有效的日期时间';
  if (Date.parse(values.endTime) <= Date.parse(values.startTime)) errors.endTime = '结束时间必须晚于开始时间';
  if (Date.parse(values.registrationDeadline) > Date.parse(values.startTime)) errors.registrationDeadline = '报名截止时间不能晚于活动开始时间';
  return errors;
}

export function createPlatform(storage) {
  function read() {
    const data = { users: storage.get('users', []), events: storage.get('events', []), registrations: storage.get('registrations', []) };
    const valid = Array.isArray(data.users) && Array.isArray(data.events) && Array.isArray(data.registrations)
      && data.users.every(u => u && typeof u.id === 'string' && typeof u.username === 'string' && typeof u.realName === 'string' && ['admin', 'student'].includes(u.role))
      && data.events.every(e => e && typeof e.id === 'string' && typeof e.title === 'string' && CATEGORIES.includes(e.category) && Number.isInteger(e.capacity) && e.capacity > 0 && ['draft', 'open', 'closed'].includes(e.status) && ['startTime', 'endTime', 'registrationDeadline'].every(k => Number.isFinite(Date.parse(e[k]))))
      && data.registrations.every(r => r && typeof r.id === 'string' && ['pending', 'approved', 'rejected', 'cancelled'].includes(r.status) && Number.isFinite(Date.parse(r.applyTime)) && data.users.some(u => u.id === r.userId) && data.events.some(e => e.id === r.eventId));
    assert(valid, '本地数据结构异常，请恢复演示数据后重试。');
    return data;
  }
  function currentUser() {
    const session = storage.get('session');
    if (!session) return null;
    return read().users.find(u => u.id === session.id && u.status === 'active') || null;
  }
  function authorize(role) {
    const user = currentUser();
    assert(user, '请先登录后再操作');
    if (role) assert(user.role === role, '当前账号没有执行此操作的权限');
    return user;
  }
  async function initialize(force = false) {
    if (!force && storage.get('initialized')) { read(); return; }
    const data = seedData();
    const salt = id();
    const passwordHash = await hashPassword('123456', salt);
    data.users = data.users.map(u => ({ ...u, passwordHash, salt }));
    storage.commit({ ...data, initialized: 1, session: null });
  }
  return {
    read, currentUser, initialize,
    async login(username, password) {
      const user = read().users.find(u => u.username === username.trim());
      assert(user && user.status === 'active', '账号或密码错误，或账号已被停用');
      assert(await hashPassword(password, user.salt) === user.passwordHash, '账号或密码错误');
      storage.set('session', { id: user.id });
      return user;
    },
    async register(values) {
      const data = read();
      assert(/^[A-Za-z0-9_]{4,20}$/.test(values.username), '账号为 4–20 位字母、数字或下划线');
      assert(values.realName.trim().length >= 2 && values.realName.trim().length <= 20, '姓名长度应为 2–20 个字');
      assert(values.password.length >= 6 && values.password.length <= 64, '密码长度应为 6–64 位');
      assert(!data.users.some(u => u.username === values.username), '该账号已注册，请更换账号');
      const salt = id();
      const user = { id: id(), username: values.username, realName: values.realName.trim(), passwordHash: await hashPassword(values.password, salt), salt, phone: '', college: '', role: 'student', status: 'active', createdAt: new Date().toISOString() };
      storage.commit({ users: [...data.users, user], session: { id: user.id } });
      return user;
    },
    logout() { storage.remove('session'); },
    updateProfile(values) {
      const user = authorize();
      assert(values.realName.trim().length >= 2 && values.realName.length <= 20, '姓名长度应为 2–20 个字');
      assert(!values.phone || /^1[3-9]\d{9}$/.test(values.phone), '请输入正确的 11 位手机号码');
      assert((values.college || '').length <= 50, '学院名称不超过 50 个字');
      storage.set('users', read().users.map(u => u.id === user.id ? { ...u, realName: values.realName.trim(), phone: values.phone, college: values.college } : u));
    },
    saveEvent(values, eventId) {
      authorize('admin');
      const data = read();
      const old = data.events.find(e => e.id === eventId && !e.deleted);
      assert(!eventId || old, '活动不存在');
      const errors = validateEvent(values, eventId ? occupied(eventId, data.registrations) : 0);
      assert(!Object.keys(errors).length, Object.values(errors)[0]);
      assert(['draft', 'open', 'closed'].includes(values.status), '无效的发布状态');
      const event = { ...old, ...Object.fromEntries(['title', 'category', 'organizer', 'location', 'subtitle', 'description', 'notes', 'cover', 'status'].map(k => [k, values[k] || ''])), capacity: Number(values.capacity), startTime: new Date(values.startTime).toISOString(), endTime: new Date(values.endTime).toISOString(), registrationDeadline: new Date(values.registrationDeadline).toISOString(), id: old?.id || id(), createdAt: old?.createdAt || new Date().toISOString(), deleted: false };
      storage.set('events', old ? data.events.map(e => e.id === old.id ? event : e) : [...data.events, event]);
      return event;
    },
    setEventStatus(eventId, status) {
      authorize('admin');
      assert(['open', 'closed'].includes(status), '无效的发布状态');
      const data = read();
      assert(data.events.some(e => e.id === eventId && !e.deleted), '活动不存在');
      storage.set('events', data.events.map(e => e.id === eventId ? { ...e, status } : e));
    },
    deleteEvent(eventId) {
      authorize('admin');
      const data = read();
      assert(data.events.some(e => e.id === eventId && !e.deleted), '活动不存在');
      storage.set('events', data.events.map(e => e.id === eventId ? { ...e, deleted: true } : e));
    },
    apply(eventId) {
      const user = authorize('student');
      const data = read();
      const event = data.events.find(e => e.id === eventId && !e.deleted);
      assert(event, '活动不存在或已删除');
      assert(!data.registrations.some(r => r.eventId === eventId && r.userId === user.id && ACTIVE_REGISTRATIONS.includes(r.status)), '你已报名该活动，请在“我的报名”中查看进度');
      assert(eventStatus(event, data.registrations) === 'open', '当前活动不可报名，可能已满额、截止或下架');
      const registration = { id: id(), userId: user.id, eventId, status: 'pending', applyTime: new Date().toISOString(), reviewedAt: null, reviewerId: null, remark: '' };
      storage.set('registrations', [...data.registrations, registration]);
      return registration;
    },
    cancel(registrationId) {
      const user = authorize('student');
      const data = read();
      const registration = data.registrations.find(r => r.id === registrationId && r.userId === user.id);
      assert(registration && ACTIVE_REGISTRATIONS.includes(registration.status), '当前报名记录不可取消');
      const event = data.events.find(e => e.id === registration.eventId);
      assert(event && Date.now() < Date.parse(event.startTime), '活动已开始，无法取消报名');
      storage.set('registrations', data.registrations.map(r => r.id === registrationId ? { ...r, status: 'cancelled' } : r));
    },
    review(registrationId, status, remark = '') {
      const user = authorize('admin');
      const data = read();
      const registration = data.registrations.find(r => r.id === registrationId);
      assert(['approved', 'rejected'].includes(status), '无效的审核状态');
      assert(registration?.status === 'pending', '此报名已处理，请刷新后查看');
      const event = data.events.find(e => e.id === registration.eventId);
      assert(event && !event.deleted, '活动已删除，无法继续审核');
      assert(Date.now() < Date.parse(event.startTime), '活动已开始，无法继续审核');
      storage.set('registrations', data.registrations.map(r => r.id === registrationId ? { ...r, status, remark: remark.trim(), reviewedAt: new Date().toISOString(), reviewerId: user.id } : r));
    },
  };
}
