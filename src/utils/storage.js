export const KEYS = { users: 'cems_users', events: 'cems_events', registrations: 'cems_registrations', session: 'cems_current_user', initialized: 'cems_initialized' };

export class StorageError extends Error {}
export function createStorage(target) {
  return {
    get(key, fallback = null) {
      const raw = target.getItem(KEYS[key] || key);
      if (raw === null) return fallback;
      try { return JSON.parse(raw); } catch { throw new StorageError('本地数据无法读取，请在恢复页面重置演示数据。'); }
    },
    set(key, value) {
      try { target.setItem(KEYS[key] || key, JSON.stringify(value)); } catch { throw new StorageError('无法保存数据，请检查浏览器存储空间及隐私设置。'); }
    },
    remove(key) { target.removeItem(KEYS[key] || key); },
    // Commit a whole operation or restore the previous values if the browser refuses a write.
    commit(values) {
      const previous = Object.keys(values).map(key => [KEYS[key] || key, target.getItem(KEYS[key] || key)]);
      try { for (const [key, value] of Object.entries(values)) this.set(key, value); }
      catch (error) {
        for (const [key, raw] of previous) { try { raw === null ? target.removeItem(key) : target.setItem(key, raw); } catch { /* The original write error is shown to the user. */ } }
        throw error;
      }
    },
  };
}
