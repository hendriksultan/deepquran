const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
function load(file, mocks = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => mocks[name] ?? require(name), fetch: (...args) => global.fetch(...args) });
  return exports;
}
async function run() {
  const quran = load('src/services/quran.ts');
  const surah = { nomor: 1, nama: 'الفاتحة', namaLatin: 'Al-Fatihah', arti: 'Pembukaan', jumlahAyat: 1 };
  let request;
  global.fetch = async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ code: 200, data: [surah] }) }; };
  const signal = new AbortController().signal;
  assert.equal((await quran.fetchQuran('', signal))[0].nomor, 1);
  assert.equal(request.url, 'https://equran.id/api/v2/surat');
  assert.equal(request.options.signal, signal);
  assert.equal(request.options.headers.Authorization, undefined, 'Laravel token must never be sent to public Quran service');
  global.fetch = async () => ({ ok: true, json: async () => ({ code: 200, data: { ...surah, ayat: [] } }) });
  await assert.rejects(() => quran.fetchQuran('/1', signal), /belum lengkap/);
  global.fetch = async () => ({ ok: false });
  await assert.rejects(() => quran.fetchQuran('', signal), /belum dapat dimuat/);
  global.fetch = async () => { throw new Error('aborted'); };
  await assert.rejects(() => quran.fetchQuran('', signal), /aborted/);
  for (const os of ['android', 'web']) {
    const memory = new Map();
    const window = { localStorage: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) } };
    const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/learning-storage.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    vm.runInNewContext(source, { exports, window, require: name => name === 'react-native' ? { Platform: { OS: os } } : { getItemAsync: async key => memory.get(key) ?? null, setItemAsync: async (key, value) => memory.set(key, value) } });
    await exports.writePreference(1, 'study', ['arab-benda']);
    assert.equal(JSON.stringify(await exports.readPreference(1, 'study')), '["arab-benda"]');
    assert.equal(await exports.readPreference(2, 'study'), null, `${os}: participant progress must be isolated`);
    const restored = {};
    vm.runInNewContext(source, { exports: restored, window, require: name => name === 'react-native' ? { Platform: { OS: os } } : { getItemAsync: async key => memory.get(key) ?? null, setItemAsync: async (key, value) => memory.set(key, value) } });
    assert.equal(JSON.stringify(await restored.readPreference(1, 'study')), '["arab-benda"]', `${os}: fresh module must restore saved progress`);
    await restored.writePreference(1, 'study-program', 'arab');
    assert.equal(await exports.readPreference(1, 'study-program'), 'arab');
    await Promise.all([restored.mergeStudyCompletion(1, ['iqro-huruf']), restored.mergeStudyCompletion(1, ['tahsin-harakat'])]);
    const merged = await exports.readPreference(1, 'study');
    assert.equal(merged.length, 3);
    assert(merged.includes('arab-benda') && merged.includes('iqro-huruf') && merged.includes('tahsin-harakat'));
    memory.set('deepquran.1.study', 'broken JSON');
    assert.equal(await exports.readPreference(1, 'study'), null);
  }
  const failingStorage = {};
  const storageSource = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../src/services/learning-storage.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(storageSource, { exports: failingStorage, require: name => name === 'react-native' ? { Platform: { OS: 'android' } } : { getItemAsync: async () => null, setItemAsync: async () => {} } });
  await assert.rejects(() => failingStorage.writePreference(1, 'study', ['arab-benda']), /diverifikasi/, 'A silently discarded write must not report success');
  const { studyPrograms } = load('src/data/self-study.ts');
  const ids = new Set();
  for (const program of studyPrograms) for (const lesson of program.lessons) {
    assert(!ids.has(lesson.id)); ids.add(lesson.id);
    assert(lesson.answer >= 0 && lesson.answer < lesson.options.length);
    assert(lesson.examples.length > 0 && lesson.feedback);
  }
  const memory = new Map();
  const storage = load('src/services/learning-storage.ts', {
    'react-native': { Platform: { OS: 'android' } },
    'expo-secure-store': { getItemAsync: async key => memory.get(key) ?? null, setItemAsync: async (key, value) => memory.set(key, value) },
  });
  let remote = ['arab-benda']; let bookmark = null; let fail = false;
  const api = {
    get: async url => {
      if (fail) throw new Error('offline');
      return { data: { data: url === '/learning/progress' ? { completed: remote, student_program: 'bahasa' } : bookmark } };
    },
    post: async (url, body) => {
      if (fail) throw new Error('offline');
      if (url === '/learning/progress') remote = Array.from(new Set([...remote, ...body.lesson_ids]));
      else bookmark = body;
    },
  };
  const sync = load('src/services/learning-sync.ts', { './api': { api }, '../data/self-study': { studyPrograms }, './learning-storage': storage });
  await storage.mergeStudyCompletion(1, ['iqro-huruf']);
  const result = await sync.syncStudyProgress(1);
  assert.equal(result.studentProgram, 'bahasa');
  assert.deepEqual(Array.from(result.completed).sort(), ['arab-benda', 'iqro-huruf']);
  assert.deepEqual(remote.sort(), ['arab-benda', 'iqro-huruf']);
  fail = true;
  await storage.mergeStudyCompletion(1, ['tahsin-harakat']);
  await assert.rejects(() => sync.syncStudyProgress(1), /offline/);
  assert((await storage.readPreference(1, 'study')).includes('tahsin-harakat'), 'Offline sync must preserve new local progress');
  const pendingMark = { surah: 1, verse: 3, name: 'Al-Fatihah' };
  await assert.rejects(() => sync.saveServerBookmark(1, pendingMark), /offline/);
  assert.equal((await storage.readPreference(1, 'reading-pending')).verse, 3);
  fail = false;
  await sync.syncStudyProgress(1);
  assert(remote.includes('tahsin-harakat'), 'Retry must upload pending progress');
  const restoredMark = await sync.syncReadingBookmark(1);
  assert.equal(restoredMark.verse, 3);
  assert.equal(bookmark.ayat_nomor, 3);
  assert.equal(await storage.readPreference(1, 'reading-pending'), null);
  bookmark = { surat_nomor: 2, ayat_nomor: 10 };
  assert.equal((await sync.syncReadingBookmark(2)).verse, 10, 'A second device/account can restore server bookmark');
  assert.equal((await storage.readPreference(1, 'reading')).verse, 3, 'Bookmark caches remain isolated');
  console.log('PASS: Quran request isolation, native/web persistence, concurrent progress merging, account isolation, offline sync and bookmark retry, lesson catalog.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
