(() => {
  const field = document.querySelector('#date');
  const widget = document.querySelector('.date-widget');
  const trigger = document.querySelector('#date-trigger');
  const display = document.querySelector('#date-display');
  const panel = document.querySelector('#date-calendar');
  const monthLabel = document.querySelector('#calendar-month');
  const days = document.querySelector('#calendar-days');
  const previous = document.querySelector('#calendar-previous');
  const localKey = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  const parse = value => new Date(value + 'T12:00:00');
  const minimum = () => parse(field.min || localKey(new Date()));
  let viewed = new Date(minimum().getFullYear(), minimum().getMonth(), 1, 12);
  let focusDate = minimum();
  field.hidden = true;
  trigger.hidden = false;
  document.querySelector('label[for="date"]').htmlFor = 'date-trigger';

  function updateDisplay() {
    display.textContent = field.value ? parse(field.value).toLocaleDateString('pt-PT') : 'Escolhe uma data';
    trigger.classList.toggle('has-date', Boolean(field.value));
    trigger.setAttribute('aria-label', field.value ? 'Data pretendida: ' + parse(field.value).toLocaleDateString('pt-PT', { dateStyle: 'full' }) : 'Escolher data pretendida (opcional)');
  }
  function close(restoreFocus = false) {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }
  function select(date) {
    field.value = date ? localKey(date) : '';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    updateDisplay();
    close(true);
  }
  function render(focus = false) {
    monthLabel.textContent = viewed.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
    previous.disabled = viewed.getFullYear() === minimum().getFullYear() && viewed.getMonth() === minimum().getMonth();
    days.replaceChildren();
    const offset = (viewed.getDay() + 6) % 7;
    const count = new Date(viewed.getFullYear(), viewed.getMonth() + 1, 0).getDate();
    for (let index = 0; index < offset; index++) {
      const blank = document.createElement('span');
      blank.setAttribute('aria-hidden', 'true');
      days.append(blank);
    }
    for (let day = 1; day <= count; day++) {
      const date = new Date(viewed.getFullYear(), viewed.getMonth(), day, 12);
      const key = localKey(date);
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = day;
      button.dataset.date = key;
      button.setAttribute('aria-label', date.toLocaleDateString('pt-PT', { dateStyle: 'full' }));
      button.disabled = key < localKey(minimum());
      button.tabIndex = !button.disabled && key === localKey(focusDate) ? 0 : -1;
      if (key === localKey(new Date())) { button.classList.add('is-today'); button.setAttribute('aria-current', 'date'); }
      if (key === field.value) { button.classList.add('is-selected'); button.setAttribute('aria-pressed', 'true'); }
      button.addEventListener('click', () => select(date));
      days.append(button);
    }
    if (!days.querySelector('[tabindex="0"]')) {
      const first = days.querySelector('button:not(:disabled)');
      if (first) first.tabIndex = 0;
    }
    if (focus) days.querySelector('[tabindex="0"]')?.focus({ preventScroll: true });
  }
  trigger.addEventListener('click', () => {
    if (!panel.hidden) return close();
    const now = new Date();
    field.min = localKey(now);
    focusDate = field.value && field.value >= field.min ? parse(field.value) : minimum();
    viewed = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1, 12);
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    render(true);
    panel.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });
  function changeMonth(amount) {
    const next = new Date(viewed.getFullYear(), viewed.getMonth() + amount, 1, 12);
    if (next < new Date(minimum().getFullYear(), minimum().getMonth(), 1, 12)) return;
    viewed = next;
    focusDate = viewed < minimum() ? minimum() : new Date(viewed);
    render();
  }
  previous.addEventListener('click', () => changeMonth(-1));
  document.querySelector('#calendar-next').addEventListener('click', () => changeMonth(1));
  document.querySelector('#calendar-today').addEventListener('click', () => select(minimum()));
  document.querySelector('#calendar-clear').addEventListener('click', () => select(null));
  days.addEventListener('keydown', event => {
    const current = event.target.dataset.date;
    if (!current) return;
    const date = parse(current);
    const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in offsets) date.setDate(date.getDate() + offsets[event.key]);
    else if (event.key === 'Home') date.setDate(date.getDate() - (date.getDay() + 6) % 7);
    else if (event.key === 'End') date.setDate(date.getDate() + 6 - (date.getDay() + 6) % 7);
    else if (event.key === 'PageUp' || event.key === 'PageDown') {
      const day = date.getDate();
      date.setDate(1);
      date.setMonth(date.getMonth() + (event.key === 'PageUp' ? -1 : 1));
      date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
    } else return;
    event.preventDefault();
    focusDate = date < minimum() ? minimum() : date;
    viewed = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1, 12);
    render(true);
  });
  widget.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); event.stopPropagation(); close(true); }
  });
  document.addEventListener('pointerdown', event => { if (!widget.contains(event.target)) close(); });
  widget.addEventListener('focusout', () => setTimeout(() => { if (!widget.contains(document.activeElement)) close(); }, 0));
  field.form.addEventListener('reset', () => setTimeout(() => { updateDisplay(); close(); }, 0));
  updateDisplay();
})();
