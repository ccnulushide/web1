import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../src/utils/storage.js';
import { createPlatform, eventStatus, occupied, validateEvent } from '../src/services/platform.js';

async function setup() {
  const map = new Map();
  const storage = createStorage({ getItem: k => map.get(k) ?? null, setItem: (k, v) => map.set(k, v), removeItem: k => map.delete(k) });
  const app = createPlatform(storage);
  await app.initialize();
  return { app, storage, map };
}
test('演示账号可登录，密码不以明文存储；学生无法执行管理操作', async () => {
  const { app } = await setup();
  assert.ok(app.read().users.every(u => !('password' in u) && u.passwordHash.length === 64));
  await assert.rejects(app.login('admin', 'wrong'), /密码/);
  await app.login('20260001', '123456');
  assert.equal(app.currentUser().role, 'student');
  assert.throws(() => app.deleteEvent('e-ai'), /权限/);
  app.logout();
  assert.throws(() => app.apply('e-ai'), /登录/);
});
test('报名、重复拦截、审核、取消与再次报名形成闭环，并保持数据', async () => {
  const { app, storage } = await setup();
  const original = occupied('e-ai', app.read().registrations);
  await app.login('20260001', '123456');
  const record = app.apply('e-ai');
  assert.equal(record.status, 'pending');
  assert.equal(occupied('e-ai', app.read().registrations), original + 1);
  assert.throws(() => app.apply('e-ai'), /已报名/);
  const reloaded = createPlatform(storage);
  assert.equal(reloaded.currentUser().username, '20260001');
  assert.ok(reloaded.read().registrations.some(r => r.id === record.id));
  await app.login('admin', '123456');
  app.review(record.id, 'approved');
  assert.equal(app.read().registrations.find(r => r.id === record.id).reviewerId, 'u-admin');
  assert.throws(() => app.review(record.id, 'rejected'), /已处理/);
  await app.login('20260001', '123456');
  app.cancel(record.id);
  assert.equal(occupied('e-ai', app.read().registrations), original);
  assert.equal(app.apply('e-ai').status, 'pending');
});
test('满额、截止、草稿、已下架与已结束活动不能报名', async () => {
  const { app, storage } = await setup();
  await app.login('20260004', '123456');
  for (const eventId of ['e-lecture', 'e-green', 'e-reading', 'e-design']) assert.throws(() => app.apply(eventId), /不可报名/);
  const events = app.read().events;
  storage.set('events', events.map(e => e.id === 'e-photo' ? { ...e, registrationDeadline: new Date(Date.now() - 1000).toISOString() } : e));
  assert.equal(eventStatus(app.read().events.find(e => e.id === 'e-photo'), app.read().registrations), 'closed');
  assert.throws(() => app.apply('e-photo'), /不可报名/);
});
test('拒绝释放名额，不能代其他学生取消报名，活动开始后不可取消', async () => {
  const { app } = await setup();
  await app.login('admin', '123456');
  const count = occupied('e-ai', app.read().registrations);
  app.review('r-0', 'rejected', '请补充资料');
  assert.equal(occupied('e-ai', app.read().registrations), count - 1);
  assert.equal(app.read().registrations.find(r => r.id === 'r-0').remark, '请补充资料');
  await app.login('20260001', '123456');
  assert.throws(() => app.cancel('r-1'), /不可取消/);
  const old = app.read().registrations.find(r => r.userId === 'u-student' && r.eventId === 'e-reading');
  assert.throws(() => app.cancel(old.id), /已开始/);
});
test('管理员创建编辑、上下架和逻辑删除，历史记录保留', async () => {
  const { app } = await setup();
  await app.login('admin', '123456');
  const base = app.read().events[0];
  const created = app.saveEvent({ ...base, title: '测试发布活动' });
  assert.notEqual(created.id, base.id);
  app.setEventStatus(created.id, 'closed');
  assert.equal(app.read().events.find(e => e.id === created.id).status, 'closed');
  app.setEventStatus(created.id, 'open');
  app.saveEvent({ ...created, title: '修改后的活动' }, created.id);
  assert.equal(app.read().events.find(e => e.id === created.id).title, '修改后的活动');
  assert.throws(() => app.saveEvent({ ...base, capacity: 1 }, base.id), /少于/);
  const records = app.read().registrations.length;
  app.deleteEvent('e-ai');
  assert.equal(app.read().registrations.length, records);
  assert.equal(eventStatus(app.read().events[0], app.read().registrations), 'deleted');
  assert.throws(() => app.review('r-0', 'approved'), /删除/);
});
test('字段校验覆盖容量及时间关系', () => {
  const errors = validateEvent({ title: '', category: 'bad', capacity: 1.5, startTime: '2030-01-02', endTime: '2030-01-01', registrationDeadline: '2030-01-03' });
  for (const field of ['title', 'category', 'organizer', 'location', 'description', 'capacity', 'endTime', 'registrationDeadline']) assert.ok(errors[field], field);
});
test('学生注册账号唯一、仅允许学生角色；个人资料可持久化', async () => {
  const { app } = await setup();
  const values = { username: '20269999', realName: '测试同学', password: 'test123456', role: 'admin' };
  const user = await app.register(values);
  assert.equal(user.role, 'student');
  await assert.rejects(app.register(values), /已注册/);
  assert.throws(() => app.updateProfile({ realName: '测试同学', phone: '123', college: '测试学院' }), /手机/);
  app.updateProfile({ realName: '新名字', phone: '13800000000', college: '测试学院' });
  assert.equal(app.currentUser().realName, '新名字');
});
test('初始化幂等，数据损坏时明确报错，恢复重置会话', async () => {
  const { app, storage, map } = await setup();
  await app.login('20260001', '123456');
  const record = app.apply('e-ai');
  await app.initialize();
  assert.ok(app.read().registrations.some(r => r.id === record.id));
  map.set('cems_events', '{broken');
  assert.throws(() => app.read(), /无法读取/);
  await app.initialize(true);
  assert.equal(app.currentUser(), null);
  storage.set('events', [null]);
  assert.throws(() => app.read(), /结构异常/);
});
test('存储写入失败时回滚多键操作', () => {
  const map = new Map([['cems_users', '[1]'], ['cems_events', '[2]']]);
  let fail = true;
  const storage = createStorage({ getItem: k => map.get(k) ?? null, removeItem: k => map.delete(k), setItem: (k, v) => { if (k === 'cems_events' && fail) { fail = false; throw Error('quota'); } map.set(k, v); } });
  assert.throws(() => storage.commit({ users: [3], events: [4] }), /无法保存/);
  assert.deepEqual(storage.get('users'), [1]);
  assert.deepEqual(storage.get('events'), [2]);
});
