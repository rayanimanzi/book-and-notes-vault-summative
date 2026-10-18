import * as store from './state.js';
import { FIELDS, validateRecord, validateField } from './validators.js';
import { compileRegex, matches, sortRecords, extractIsbn } from './search.js';
import { $, $$, announce, renderRecords, renderDashboard } from './ui.js';
import { load, save, validateImport } from './storage.js';
import { convert } from './units.js';

const form = $('#record-form'), status = $('#form-status');
const view = { key: 'dateAdded', dir: 'desc', re: null, editing: null };
const today = () => new Date().toLocaleDateString('en-CA');
const readForm = () => Object.fromEntries(FIELDS.map((k) => [k, form.elements[k].value]));
const focusRow = (id, action) => ($(`tr[data-id="${id}"] [data-action="${action}"]`) || $('#search-input')).focus();

function render() {
  const list = sortRecords(store.records.filter((r) => matches(r, view.re)), view.key, view.dir);
  renderRecords(list, view.re, view.editing, store.records.length);
  $$('th[data-col]').forEach((th) => (th.dataset.col === view.key ? th.setAttribute('aria-sort', view.dir + 'ending') : th.removeAttribute('aria-sort')));
  $('#sort-select').value = `${view.key}:${view.dir}`;
  renderDashboard(store.records, store.settings);
  save('vault:books', store.records);
  save('vault:settings', store.settings);
  }

  function showPage() {
  const page = location.hash.slice(1) || 'dashboard';
  if (!$(`#${page}.page`)) return;
  $$('.page').forEach((s) => { s.hidden = s.id !== page; });
  $$('[data-route]').forEach((a) => (a.dataset.route === page ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
  $('.nav-toggle').setAttribute('aria-expanded', 'false');
  $('#primary-nav').classList.remove('open');
  if (location.hash) $(`#${page}-title`).focus();
}

function showError(input, msg = '') {
  $(`#${input.id}-error`).textContent = msg;
  input.setAttribute('aria-invalid', !!msg);
}
const checkField = (el) => FIELDS.includes(el.name) && showError(el, validateField(el.name, el.value));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const { valid, errors } = validateRecord(readForm());
  FIELDS.forEach((k) => showError(form.elements[k], errors[k]));
  status.textContent = valid ? `Saved "${store.addRecord(readForm()).title}".` : `Please fix ${Object.keys(errors).length} error(s).`;
  status.dataset.state = valid ? 'ok' : 'error';
 if (!valid) return form.elements[Object.keys(errors)[0]].focus();
  form.reset();
  render();
});

form.addEventListener('focusout', (e) => e.target.value && !e.relatedTarget?.closest('.form-actions') && checkField(e.target));
form.addEventListener('input', (e) => e.target.getAttribute('aria-invalid') === 'true' && checkField(e.target));
form.addEventListener('reset', () => setTimeout(() => { FIELDS.forEach((k) => showError(form.elements[k])); form.elements.dateAdded.value = today(); }));


$('#f-isbn').addEventListener('paste', (e) => {
  const isbn = extractIsbn(e.clipboardData.getData('text'));
  if (!isbn) return;
  e.preventDefault();
  e.target.value = isbn;
  announce(`ISBN ${isbn} extracted.`);
});

function search() {
  const { re, error } = compileRegex($('#search-input').value, $('#search-case').checked ? 'i' : '');
  view.re = re;
  $('#search-error').textContent = error ? `Invalid pattern: ${error}` : '';
  render();
}
$('#search-form').addEventListener('input', search);
$('#search-input').addEventListener('keydown', (e) => e.key === 'Escape' && ((e.target.value = ''), search()));

function setSort(key, dir) {
  Object.assign(view, { key, dir });
  render();
  announce(`Sorted by ${key}, ${dir}ending.`);
}
$('#sort-select').addEventListener('change', (e) => setSort(...e.target.value.split(':')));
$$('.sort-btn').forEach((b) => b.addEventListener('click', () => setSort(b.dataset.sort, view.key === b.dataset.sort && view.dir === 'asc' ? 'desc' : 'asc')));

function stopEdit(id, msg) {
  view.editing = null;
  render();
  focusRow(id, 'edit');
  announce(msg);
}

function saveEdit(row) {
  const edited = Object.fromEntries($$('input', row).map((i) => [i.name, i.value]));
  const { valid, errors } = validateRecord({ ...store.find(row.dataset.id), ...edited });
  if (!valid) return announce(($('#edit-errors').textContent = Object.values(errors).join(' ')), 'assertive');
  store.updateRecord(row.dataset.id, edited);
  stopEdit(row.dataset.id, 'Book updated.');
}
function remove(id) {
  const dlg = $('#confirm-dialog'), title = store.find(id).title;
  $('#confirm-text').textContent = `Delete "${title}"? This cannot be undone.`;
  dlg.returnValue = '';
  dlg.showModal();
  dlg.onclose = () => {
    if (dlg.returnValue !== 'confirm') return focusRow(id, 'delete');
    store.deleteRecord(id);
    render();
    $('#search-input').focus();
    announce(`Deleted "${title}".`);
  };
}
$('#records-body').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const row = btn.closest('tr'), id = row.dataset.id;
  ({
    edit: () => { view.editing = id; render(); $('tr.editing input').focus(); },
    cancel: () => stopEdit(id, 'Edit cancelled.'),
    save: () => saveEdit(row),
    delete: () => remove(id),
  })[btn.dataset.action]();
});
$('#records-body').addEventListener('keydown', (e) => {
  const row = e.target.closest('tr.editing');
  if (!row || e.target.tagName !== 'INPUT' || !['Enter', 'Escape'].includes(e.key)) return;
  e.preventDefault();
  e.key === 'Enter' ? saveEdit(row) : stopEdit(row.dataset.id, 'Edit cancelled.');
});

$('#cap-form').addEventListener('submit', () => {
  const input = $('#s-cap'), bad = !/^\d+$/.test(input.value.trim());
  showError(input, bad ? 'Enter a whole number (0 = no budget).' : '');
  if (bad) return;
  store.settings.cap = +input.value;
  render();
  announce($('#cap-message').textContent, $('#cap-message').dataset.state === 'over' ? 'assertive' : 'polite');
});
$('#units-form').addEventListener('submit', () => {
  const bad = !/^[1-9]\d*$/.test($('#s-speed').value);
  showError($('#s-speed'), bad ? 'Enter a whole number above 0.' : '');
  if (!bad) { Object.assign(store.settings, { speed: +$('#s-speed').value, unit: $('#s-unit').value }); render(); convertUnits(); }
});
function convertUnits() {
  const v = $('#c-amount').value, to = $('#c-to').value;
  $('#c-result').textContent = /^\d+(\.\d+)?$/.test(v) ? `= ${+convert(v, $('#c-from').value, to, store.settings.speed).toFixed(2)} ${to}` : 'Enter a number.';
}
$('#converter-form').addEventListener('input', convertUnits);
const dataStatus = (msg) => announce(($('#data-status').textContent = msg));
const loadSeed = () => fetch('seed.json').then((res) => res.json()).then((list) => { store.setRecords(list); render(); });

$('#export-btn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(store.records, null, 2)]));
  a.download = 'vault-export.json';
  a.click();
});

$('#import-file').addEventListener('change', async (e) => {
  let data, errors;
  try { data = JSON.parse(await e.target.files[0].text()); errors = validateImport(data); } catch { errors = ['the file is not valid JSON.']; }
  e.target.value = '';
  if (errors.length) return dataStatus('Import rejected: ' + errors.slice(0, 3).join(' '));
  store.setRecords(data);
  render();
  dataStatus(`Imported ${data.length} books.`);
});
$('#seed-btn').addEventListener('click', loadSeed);
$('#clear-btn').addEventListener('click', () => confirm('Delete all books?') && (store.setRecords([]), render()));

$('.nav-toggle').addEventListener('click', (e) => {
  const open = e.currentTarget.getAttribute('aria-expanded') !== 'true';
  e.currentTarget.setAttribute('aria-expanded', open);
  $('#primary-nav').classList.toggle('open', open);
});
$('.skip-link').addEventListener('click', (e) => { e.preventDefault(); $('#main').focus(); });
$$('.page form').forEach((f) => f.addEventListener('submit', (e) => e.preventDefault()));
window.addEventListener('hashchange', showPage

form.elements.dateAdded.value = today();
Object.assign(store.settings, load('vault:settings'));
['speed', 'unit', 'cap'].forEach((k) => { $(`#s-${k}`).value = store.settings[k]; });

showPage();
convertUnits();
load('vault:books') ? (store.setRecords(load('vault:books')), render()) : loadSeed();