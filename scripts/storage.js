import { validateRecord } from './validator.js';
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
export const load = (key) => {try { return JSON.parse(localStorage.getItem(key));} catch { return null; } };
export const save =(key, value)  => {try {localStorage.setItem(key, JSON.stringify(value)); } catch {} };

export function  validateImport(data) {
    if (! Array.isArray(data) || !data.length) return ['File must contain a list of books.'];
    const ids = new Set();
    return data.flatMap((r,i) => {
        if (!r || ['title', 'author', 'tag', 'dateAdded', 'isbn', 'notes'].some((k) => typeof (r[k] ?? '') !== 'string')) return [`Book ${i + 1}: invalid fields.`];
        const errs = Object.entries(validateRecord({ ...r, pages: String(r.pages) }).errors).map(([k,m]) => `${k}: ${m}`);
    if (!/^book_\d+$/.test(r.id) || ids.has(r.id)) errs.push('bad or duplicate id.');
    if (!Number.isInteger(r.pages)) errs.push('pages must be a whole number.');
    if (!ISO.test(r.createdAt) || !ISO.test(r.updatedAt)) errs.push('bad timestamps.');
    ids.add(r.id);
    return errs.map((e) => `Book ${ i + 1}: ${e}`);  
    

    });
}