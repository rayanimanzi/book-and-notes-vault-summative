import { highlight, escapeHTML }from './search.js';
import { computeStats, capStatus} from './stats.js';
import { toMinutes, formatTime} from './units.js';
import { $, $$, announce, renderRecords, renderDashboard } from './ui.js';

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

export function renderDashboard(records, { speed, unit, cap}) {
    const s = computeStats(records), time = (p) => formatTime(toMinutes(p, speed), unit);
    const set = (id, text) => { $(`#${id}`). textContent = text; };
    set('stat-count', s.count);
    set('stat-authors' , `${s.authors} authors`);
    set('stat-pages', s.pages);
    set('stat-time' , `about ${time(s.pages)} of reading`);
    set('stat-top' , s.topTag || '-');
    set('stat-top-sub', s.topTag ? `${time(s.monthPages)}`);
    set('stat-month', s.monthPages);
    set('stat-month-time', `about ${time(s.monthPages)}`);
    const max = Math.max(1, ...s.last7.map((d) => d.pages));
    $('#trend-chart').innerHTML = s.last7.map((d) => `<li class="bar-item"><span class="bar-value" aria-hidden="true">${d.pages || ''}</span><span class="bar" style="--h:${(d.pages / max) * 100}%"></span><span class="bar-label">${d.day}<span class="sr-only"> ${d.date}: ${d.pages} pages</span></span></li>`).join('');
        const state = capStatus(s.monthPages, cap), msg = $('#cap-message');
    $('#cap-fill').style.width = `${cap ? Math.min(100, (s.monthPages / cap) * 100) : 0}%`;
    $('#cap-fill').dataset.state = msg.dataset.state= state;
    msg.setAttribute('aria-live' , state === 'over' ? 'assertive' : 'polite');
    msg.textContent = state === 'none' ? 'No monthly budget set.' : state === 'over' ? `Over budget by ${s.monthPages - cap} pages!` : `${cap - s.monthPages} pages left of your ${cap}-page budget.`;

}