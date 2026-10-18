const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const PAGES = [ 'dashboard', 'records', 'settings', 'about'];

function showPage() {
    const hash = location.hash.slice(1);
    if (hash && !PAGES.includes(hash)) return;
    const page = hash || 'dashboard';
    $$('.page').forEach((s) => {s.hidden = s.id !== page; });
    $$('[data-route]').forEach((a) => {
        if (a.dataset.route === page) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');

    });
    $('.nav-toggle').setAttribute('aria-expanded', 'false');
    $('#primary-nav').classlist.remove('open');
    if (hash) $('#${page}-title').focus();
}

$('.nav-toggle').addEventListener('click', (e) =>{
    const open - e.currentTarget.getAttribbute('aria-expanded') !== 'true';
    e.currentTarget.setAttribute('aria-expanded', String(open));
    $('#primary-nav').classlist.toggle('open', open);

});
$('.skip-link').addEventListener('click', (e) => { e.preventDefault(); $('#main').focus();});
$$('form').forEach((f) => f.addEventListener('submit',(e) => e.preventDefault()));
window.addEventListener('hashchange', showPage);
showPage();