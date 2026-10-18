import { validateField} from './validators.js';

export function compileRegex(input, flags = 'i') {
    try { return { re: input ? new RegExp(input, flags) : null };}

    catch (e) { return { re: null, error: e.message.split(': ') .pop() };}

}

export const escapeHTML = (s) => String(S).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const highlight = (text, re) => escapeHTML(re ? String(text).replace(new RegExp(re.source, re.flags + 'g'), (m) => m && `\u0001${m}\u0002`) : text) .replace(/\u0001/g, '<mark>').replace(/\u0002/g, '</mark>');

export const matches = (r, re) => !re || [r.title, r.author, r.tag, r.dateAdded, r.pages, r.isbn, r.notes].some((f) => re.test(String(f)));

export const extractIsbn = (text) => (text.match(/(?<![\d-])(?:97[89]-?)?(?:\d-?){9}[\dX](?![\d-])/g) || []).find((s) => !validateField('isbn', s));

export const sortRecords = (list, key, dir) => [...list].sort((a, b) => (key === 'pages' ? a.pages - b.pages : a[key].localeCompare(b[key])) * (dir === 'asc' ? 1 : -1));

