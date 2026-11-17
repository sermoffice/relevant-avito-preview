const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Открыть меню' : 'Закрыть меню');
  mobileNav.hidden = isOpen;
});
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
}
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 961px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
function activateTab(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let target;
    if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
    if (event.key === 'Home') target = tabs[0];
    if (event.key === 'End') target = tabs[tabs.length - 1];
    if (target) { event.preventDefault(); activateTab(target, true); }
  });
});

const dialog = document.querySelector('#brief-dialog');
const form = document.querySelector('#brief-form');
const serviceField = document.querySelector('#service-field');
const result = document.querySelector('#brief-result');
const preview = document.querySelector('#brief-preview');
const copyStatus = document.querySelector('#copy-status');
let opener;
document.querySelectorAll('[data-brief]').forEach(button => {
  button.addEventListener('click', () => {
    opener = button;
    serviceField.value = button.dataset.brief;
    form.hidden = false;
    result.hidden = true;
    copyStatus.textContent = '';
    closeMenu();
    dialog.showModal();
    document.body.classList.add('modal-open');
    dialog.scrollTop = 0;
  });
});
dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (opener) opener.focus(); });
form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const body = [
    'Здравствуйте, команда Relevant!',
    '',
    'Интересует: ' + data.get('service'),
    'Имя: ' + data.get('name').trim(),
    'Контакт для связи: ' + data.get('contact').trim(),
    data.get('company').trim() ? 'Компания / профиль: ' + data.get('company').trim() : '',
    '',
    data.get('task').trim() ? 'Задача:\n' + data.get('task').trim() : 'Хочу обсудить возможности продвижения бизнеса на Авито.'
  ].filter((line, index, lines) => line || (index > 0 && lines[index - 1])).join('\n');
  preview.textContent = body;
  document.querySelector('#mailto-result').href = 'mailto:info@relevant.ru?subject=' + encodeURIComponent('Авито — ' + data.get('service')) + '&body=' + encodeURIComponent(body);
  form.hidden = true;
  result.hidden = false;
  dialog.scrollTop = 0;
  document.querySelector('#mailto-result').focus();
});
document.querySelector('#edit-brief').addEventListener('click', () => { result.hidden = true; form.hidden = false; serviceField.focus(); });
document.querySelector('#copy-brief').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(preview.textContent);
    copyStatus.textContent = 'Текст скопирован. Отправьте его на info@relevant.ru.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(preview);
    const selection = window.getSelection();
    selection.removeAllRanges(); selection.addRange(range);
    copyStatus.textContent = 'Выделили текст обращения. Скопируйте его и отправьте на info@relevant.ru.';
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelector('.hero-video').pause();

const captureDialog = document.querySelector('#capture-dialog');
const captureFull = document.querySelector('#capture-full');
const captureTitle = document.querySelector('#capture-title');
const captureDownload = document.querySelector('#capture-download');
const captureSource = document.querySelector('#capture-source');
let captureOpener;
document.querySelectorAll('[data-capture]').forEach(button => {
  button.addEventListener('click', () => {
    captureOpener = button;
    captureFull.src = button.dataset.capture;
    captureFull.alt = button.dataset.caption;
    captureTitle.textContent = button.dataset.caption;
    captureDownload.href = button.dataset.capture;
    captureDownload.download = button.dataset.capture.split('/').pop();
    captureSource.hidden = !button.dataset.source;
    if (button.dataset.source) {
      captureSource.href = button.dataset.source;
      captureSource.textContent = 'Источник: ' + button.dataset.sourceLabel;
    } else {
      captureSource.removeAttribute('href');
      captureSource.textContent = '';
    }
    captureDialog.showModal();
    document.body.classList.add('modal-open');
    captureDialog.scrollTop = 0;
  });
});
captureDialog.querySelector('.capture-close').addEventListener('click', () => captureDialog.close());
captureDialog.addEventListener('click', event => {
  if (event.target === captureDialog) {
    const rect = captureDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) captureDialog.close();
  }
});
captureDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (captureOpener) captureOpener.focus();
});
