const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

// One process owns this file. Each transaction is serialized and atomically renamed.
async function openStorage(filename) {
  await fs.mkdir(path.dirname(filename), { recursive: true });
  let state;
  try { state = JSON.parse(await fs.readFile(filename, 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw new Error(`Database tidak dapat dibaca: ${error.message}`, { cause: error });
    state = { version: 1, users: {} };
  }
  if (state.version !== 1 || !state.users || typeof state.users !== 'object') throw new Error('Format database tidak valid.');
  let queue = Promise.resolve();
  return {
    read: () => structuredClone(state),
    transaction(operation) {
      const task = queue.then(async () => {
        const next = structuredClone(state);
        const result = await operation(next);
        const temporary = `${filename}.${randomUUID()}.tmp`;
        try {
          await fs.writeFile(temporary, JSON.stringify(next), { mode: 0o600 });
          await fs.rename(temporary, filename);
        } catch (error) { await fs.rm(temporary, { force: true }); throw error; }
        state = next;
        return result;
      });
      queue = task.catch(() => {});
      return task;
    },
  };
}
module.exports = { openStorage };
