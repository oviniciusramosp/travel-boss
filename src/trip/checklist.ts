import { appRequest, canEdit } from '../platform/request';
import { pickLocale, type Locale } from '../catalog';
import { iconButton, segmented } from '../ui/controls';
import { el } from '../ui/dom';
import { row } from '../ui/row';
import { compareTaskSchedule, type ChecklistEdit, type ChecklistItem } from './checklist-state';

export function tripChecklist(id: string, locale: Locale, onEditing: (open: boolean) => void) {
  const t = (en: string, pt: string) => pickLocale(locale, { en, 'pt-BR': pt });
  const panel = el('section', 'tb-checklist');
  const status = el('p', 'tb-doc-summary');
  status.setAttribute('role', 'status');
  const retry = el('button', 'tb-btn-outline', t('Retry', 'Tentar novamente'));
  retry.hidden = true;
  panel.append(status, retry);
  const url = `/api/checklists/${encodeURIComponent(id)}`;
  const forms: HTMLFieldSetElement[] = [];
  const rowItems = new WeakMap<HTMLElement, ChecklistItem>();
  const groups = new Map<string, { list: HTMLUListElement; count: HTMLElement; empty: HTMLElement; input: HTMLInputElement }>();
  function scheduleFields(form: HTMLFormElement, group: ChecklistItem['group'], item?: ChecklistItem) {
    const date = el('input', 'tb-checklist-input');
    const time = el('input', 'tb-checklist-input');
    const fields = el('div', 'tb-checklist-schedule');
    const toggle = iconButton({ icon: 'schedule', label: t('Date and time', 'Dia e horário'), size: 'sm' });
    const setExpanded = (expanded: boolean) => {
      fields.hidden = !expanded;
      toggle.setAttribute('aria-expanded', String(expanded));
    };
    if (group === 'tasks') {
      const text = form.querySelector<HTMLInputElement>('.tb-checklist-input')!;
      const wrapper = el('div', 'tb-checklist-entry');
      text.replaceWith(wrapper);
      wrapper.append(text, toggle);
      fields.id = `checklist-schedule-${crypto.randomUUID()}`;
      toggle.setAttribute('aria-controls', fields.id);
      setExpanded(Boolean(item?.date || item?.time));
      toggle.onclick = () => {
        setExpanded(fields.hidden);
        if (!fields.hidden) date.focus();
      };
      for (const [input, type, label] of [
        [date, 'date', t('Date (optional)', 'Dia (opcional)')],
        [time, 'time', t('Time (optional)', 'Horário (opcional)')],
      ] as const) {
        input.type = type;
        input.value = item?.[type] ?? '';
        if (type === 'date') { input.min = '0001-01-01'; input.max = '9999-12-31'; }
        const field = el('label', 'tb-checklist-field', label);
        field.append(input);
        fields.append(field);
      }
      form.append(fields);
    }
    return { values: () => ({ date: date.value || undefined, time: time.value || undefined }), clear: () => { date.value = ''; time.value = ''; setExpanded(false); } };
  }
  async function save(edit: ChecklistEdit, done: () => void) {
    const focus = document.activeElement as HTMLElement | null;
    status.textContent = t('Saving…', 'Salvando…');
    forms.forEach((form) => { form.disabled = true; });
    try {
      const response = await appRequest(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(edit) });
      if (!response.ok) throw new Error(String(response.status));
      forms.forEach((form) => { form.disabled = false; });
      focus?.focus();
      done();
      status.textContent = t('Saved', 'Salvo');
    } catch {
      status.textContent = t('Could not save. Your text is preserved; retry or reload if another tab changed this item.', 'Não foi possível salvar. Seu texto foi preservado; tente novamente ou recarregue se outra aba alterou este item.');
    } finally {
      forms.forEach((form) => { form.disabled = false; });
      if (document.activeElement === document.body && focus?.isConnected) focus.focus();
    }
  }
  function count(group: string) {
    const { list, count: label, empty } = groups.get(group)!;
    label.textContent = `${list.querySelectorAll('input:checked').length}/${list.children.length}`;
    empty.hidden = list.children.length > 0;
  }
  function addItem(initial: ChecklistItem) {
    let item = initial;
    const group = groups.get(item.group)!;
    const check = el('input');
    check.type = 'checkbox';
    check.checked = item.done;
    check.disabled = !canEdit;
    const remove = iconButton({ icon: 'delete', label: t('Delete item', 'Excluir item'), size: 'sm' });
    const line = row({ title: item.text, lead: check, actions: canEdit ? remove : undefined, onSelect: canEdit ? edit : undefined, tip: false });
    line.querySelector('.tb-row__time')?.remove();
    const main = line.querySelector<HTMLButtonElement>('.tb-row__main')!;
    function sync() {
      check.checked = item.done;
      check.setAttribute('aria-label', t('Complete: ', 'Concluir: ') + item.text);
      if (canEdit) {
        main.setAttribute('aria-label', t('Edit: ', 'Editar: ') + item.text);
        main.setAttribute('data-tip', t('Edit item', 'Editar item'));
      }
      main.querySelector('.tb-row__title')!.textContent = item.text;
      const schedule = [item.date ? new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${item.date}T00:00:00Z`)) : '', item.time ?? ''].filter(Boolean).join(' · ');
      let sub = main.querySelector<HTMLElement>('.tb-row__sub');
      if (schedule) {
        if (!sub) { sub = el('span', 'tb-row__sub'); main.append(sub); }
        sub.textContent = schedule;
      } else sub?.remove();
      line.classList.toggle('is-done', item.done);
      rowItems.set(line, item);
      if (item.group === 'tasks') {
        const focus = document.activeElement as HTMLElement | null;
        const restoreFocus = focus && group.list.contains(focus);
        const ordered = [...group.list.children] as HTMLElement[];
        ordered.sort((a, b) => compareTaskSchedule(rowItems.get(a)!, rowItems.get(b)!));
        ordered.forEach((entry, index) => {
          if (group.list.children[index] !== entry) group.list.insertBefore(entry, group.list.children[index] ?? null);
        });
        if (restoreFocus && document.activeElement !== focus) focus.focus();
      }
      count(item.group);
    }
    function edit() {
      if (panel.querySelector('[data-checklist-editor]')) return;
      onEditing(true);
      const form = el('form', 'tb-checklist-form');
      form.dataset.checklistEditor = 'true';
      const input = el('input', 'tb-checklist-input');
      input.value = item.text;
      input.maxLength = 500;
      input.required = true;
      input.setAttribute('aria-label', t('Item text', 'Texto do item'));
      const submit = el('button', 'tb-btn-outline', t('Save', 'Salvar'));
      const cancel = el('button', 'tb-btn-ghost', t('Cancel', 'Cancelar'));
      form.append(input);
      const schedule = scheduleFields(form, item.group, item);
      cancel.type = 'button';
      const close = () => { form.remove(); main.hidden = false; onEditing(false); main.focus(); };
      cancel.onclick = close;
      form.onkeydown = (event) => { if (event.key === 'Escape') { event.preventDefault(); close(); } };
      form.onsubmit = (event) => {
        event.preventDefault();
        if (!input.value.trim()) return;
        const after = { ...item, text: input.value.trim(), ...schedule.values() };
        void save({ before: item, after }, () => { item = after; sync(); close(); });
      };
      form.append(submit, cancel);
      main.hidden = true;
      main.after(form);
      input.focus();
    }
    check.onchange = () => {
      const after = { ...item, done: check.checked };
      check.checked = item.done;
      void save({ before: item, after }, () => { item = after; sync(); });
    };
    remove.onclick = () => void save({ before: item, after: null }, () => {
      line.remove(); count(item.group); onEditing(false); group.input.focus();
    });
    group.list.append(line);
    sync();
  }
  for (const [key, title] of [['tasks', t('Tasks', 'Tarefas')], ['packing', t('Packing', 'Malas')]] as const) {
    const card = el('fieldset', 'tb-checklist-card');
    card.disabled = true;
    forms.push(card);
    const heading = el('legend', '', title);
    const progress = el('span', 'tb-doc-summary');
    const list = el('ul', 'tb-list tb-list--places');
    const empty = el('p', 'tb-doc-summary', t('No items yet.', 'Nenhum item ainda.'));
    const form = el('form', 'tb-checklist-form');
    const input = el('input', 'tb-checklist-input');
    input.placeholder = key === 'tasks' ? t('New task', 'Nova tarefa') : t('Item to pack', 'Item para levar');
    input.setAttribute('aria-label', input.placeholder);
    input.maxLength = 500;
    input.required = true;
    form.addEventListener('focusin', () => onEditing(true));
    form.addEventListener('focusout', (event) => { if (!form.contains(event.relatedTarget as Node | null)) onEditing(false); });
    const add = el('button', 'tb-btn-outline', t('Add', 'Adicionar'));
    form.append(input);
    const schedule = scheduleFields(form, key);
    form.onsubmit = (event) => {
      event.preventDefault();
      if (!input.value.trim()) return;
      const after = { id: crypto.randomUUID(), group: key, text: input.value.trim(), done: false, ...schedule.values() };
      void save({ before: null, after }, () => { addItem(after); input.value = ''; schedule.clear(); input.focus(); });
    };
    form.append(add);
    card.append(heading, progress, list, empty);
    if (canEdit) card.append(form);
    panel.append(card);
    groups.set(key, { list, count: progress, empty, input });
  }
  async function load() {
    status.textContent = t('Loading…', 'Carregando…');
    try {
      const response = await appRequest(url);
      if (!response.ok) throw new Error();
      const items: ChecklistItem[] = await response.json();
      groups.forEach(({ list }) => list.replaceChildren());
      items.forEach(addItem);
      groups.forEach((_, key) => count(key));
      forms.forEach((form) => { form.disabled = false; });
      status.textContent = '';
      retry.hidden = true;
    } catch { status.textContent = t('Could not load checklist.', 'Não foi possível carregar a checklist.'); retry.hidden = false; }
  }
  retry.onclick = () => void load();
  void load();
  return panel;
}

export function tripTabs(article: HTMLElement, checklist: HTMLElement, selected: number, onSelect: (index: number) => void, locale: Locale) {
  const tabs = el('div', 'tb-locale tb-trip-tabs');
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', pickLocale(locale, { en: 'Trip', 'pt-BR': 'Roteiro' }));
  const panels = [article, checklist];
  const buttons = [pickLocale(locale, { en: 'Itinerary', 'pt-BR': 'Itinerário' }), 'Checklist'].map((label, index) => {
    const button = el('button', '', label);
    button.id = `trip-tab-${index}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', `trip-panel-${index}`);
    panels[index]!.id = `trip-panel-${index}`;
    panels[index]!.setAttribute('role', 'tabpanel');
    panels[index]!.setAttribute('aria-labelledby', button.id);
    button.onclick = () => { selected = index; onSelect(index); sync(); };
    tabs.append(button);
    return button;
  });
  function sync() {
    buttons.forEach((button, index) => { button.setAttribute('aria-selected', String(selected === index)); panels[index]!.hidden = selected !== index; });
    segmented(tabs);
  }
  sync();
  return tabs;
}
