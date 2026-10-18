export let records =[];
const now =() => new Date().toISOString
const clean = (f) => ({ title: f.title, author: f.author, pages: +f.pages, tag: f.tag, dateAdded: f.dateAdded, isbn: f.isbn || '', notes: f.notes || '' });
export const find = (id) => records.find((r) => r.id === id);
export const nextId = () => 'book_' + String(Math.max(0, ...records.map((r) => +r.id.slice(5) || 0)) + 1).padStart(4, '0');
export function addRecord(f) {
const rec = { id: nextId(), ...clean(f), createdAt: now(), updatedAt: now() };
  records.push(rec);
  return rec;
}
export const updateRecord = (id, f) => Object.assign(find(id), clean({ ...find(id), ...f }), { updatedAt: now() });
export const deleteRecord = (id) => { records = records.filter((r) => r.id !== id); };
export const setRecords = (list) => { records = list; };
export const settings = { speed: 30, unit: 'hours', cap: 3500};
