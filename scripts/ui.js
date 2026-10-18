import { highlight, escapeHTML } from './search.js';

export const $ = (s, root = document) => root.querySelector(s);
export const $$ = (s, root = document) => [...root.querySelectorAll(s)];

export function announce(msg,level ='polite') {
    $(`#live-${level}`).textContent ='';
    setTimeout(() => {$(`#live-${level}`).textContent = msg; }, 50);
}

const COLS = [['Added', 'dateAdded'], ['Title', 'title'], ['Author', 'author'], ['Pages', 'pages'], ['Tag', 'tag']];

function row(r, re, editing) {
  const btn = (action, text, cls = '') => `<button type="button" class="btn btn-sm ${cls}" data-action="${action}" aria-label="${text} ${escapeHTML(r.title)}">${text}</button>`;
  const cells = COLS.map(([label, k]) => `<td data-label="${label}"><div>${editing
    ? `<input name="${k}" class="inline-input" aria-label="${label}" value="${escapeHTML(r[k])}">`
    : highlight(r[k], re) + (k === 'title' ? `<span class="meta">${highlight([r.isbn, r.notes].filter(Boolean).join(' · '), re)}</span>` : '')}</div></td>`);
  const actions = editing
    ? btn('save', 'Save', 'btn-primary') + btn('cancel', 'Cancel') + '<p id="edit-errors" class="field-error row-errors"></p>'
: btn('edit', 'Edit') + btn('delete', 'Delete', 'btn-danger');
  return `<tr data-id="${r.id}" class="${editing ? 'editing' : ''}">${cells.join('')}<td class="actions">${actions}</td></tr>`;
}

export function renderRecords(list,re,editing, total) {

   $('#records-body').innerHTML = list.map((r) => row(r, re, r.id === editing)).join('');
  $('#empty-state').hidden = total > 0;
   $('.table-wrap').hidden = total === 0;
  $('#results-status').textContent = total ? `${list.length} of ${total} books shown.` : '';
  
}