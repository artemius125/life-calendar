
  const DEFAULT_BIRTH = new Date(2001, 4, 12); // месяцы: 0=янв … 4=май … 11=дек
  const DEFAULT_LIFESPAN = 71;                  // ожидаемая продолжительность жизни (лет)
  const STORAGE_KEY = 'lifeCalendarConfig';
  const CALCULATOR_STORAGE_KEY = 'lifeCalendarCalculatorConfig';
  const CALCULATOR_SEEN_KEY = 'lifeCalendarCalculatorSeen';

  const WEEKS = 52;
  const MS_WEEK = 7 * 24 * 60 * 60 * 1000;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const MIN_LIFESPAN = 1;
  const MAX_LIFESPAN = 130;

  const refs = {
    counterLabel: document.getElementById('counterLabel'),
    cDays: document.getElementById('cDays'),
    cH: document.getElementById('cH'),
    cM: document.getElementById('cM'),
    cS: document.getElementById('cS'),
    sDays: document.getElementById('sDays'),
    sWeeks: document.getElementById('sWeeks'),
    sMonths: document.getElementById('sMonths'),
    sYears: document.getElementById('sYears'),
    iY: document.getElementById('iY'),
    iM: document.getElementById('iM'),
    iD: document.getElementById('iD'),
    iBdMain: document.getElementById('iBdMain'),
    iBdSub: document.getElementById('iBdSub'),
    iEndMain: document.getElementById('iEndMain'),
    iEndSub: document.getElementById('iEndSub'),
    progressFill: document.getElementById('progressFill'),
    progressLabel: document.getElementById('progressLabel'),
    birthLabel: document.getElementById('birthLabel'),
    endLabel: document.getElementById('endLabel'),
    colLabels: document.getElementById('colLabels'),
    grid: document.getElementById('grid'),
    footer: document.getElementById('footer'),
    tooltip: document.getElementById('tooltip'),
    backBtn: document.getElementById('backBtn'),
    settingsForm: document.getElementById('settingsForm'),
    birthInput: document.getElementById('birthInput'),
    settingsMessage: document.getElementById('settingsMessage'),
    resetSettingsBtn: document.getElementById('resetSettingsBtn'),
    toggleCalculatorBtn: document.getElementById('toggleCalculatorBtn'),
    calculatorPanel: document.getElementById('settingsForm'),
    calcCountryInput: document.getElementById('calcCountryInput'),
    calcSexInput: document.getElementById('calcSexInput'),
    calcHeightInput: document.getElementById('calcHeightInput'),
    calcWeightInput: document.getElementById('calcWeightInput'),
    calcFamilyLongevityInput: document.getElementById('calcFamilyLongevityInput'),
    calcConditionHeartInput: document.getElementById('calcConditionHeartInput'),
    calcConditionCancerRemissionInput: document.getElementById('calcConditionCancerRemissionInput'),
    calcConditionCancerActiveInput: document.getElementById('calcConditionCancerActiveInput'),
    calcFactorsGrid: document.getElementById('calcFactorsGrid'),
    calcResult: document.getElementById('calcResult')
  };

  let state = loadConfig();
  let calculatorState = loadCalculatorConfig();
  let calculatorResult = computeCalculatorResult(calculatorState);
  let weekCells = [];
  let currentCell = null;
  let lastCurrentCellDateKey = '';

  function fmtDate(d, opts) {
    return d.toLocaleDateString('ru-RU', opts || { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function dateToInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseInputDate(value) {
    if (!value) return null;
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day) ||
      Number.isNaN(parsed.getTime()) ||
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return null;
    }
    return parsed;
  }

  function ensureValidBirth(inputBirth) {
    const today = startOfDay(new Date());
    const safeBirth = Number.isNaN(inputBirth?.getTime?.()) ? new Date(DEFAULT_BIRTH) : new Date(inputBirth);
    return safeBirth > today ? today : safeBirth;
  }

  function normalizeConfig(raw) {
    const birthRaw = raw?.birth instanceof Date ? raw.birth : (parseInputDate(raw?.birth || '') || DEFAULT_BIRTH);
    const birth = ensureValidBirth(birthRaw);

    const life = Number(raw?.lifespan);
    const lifespan = Number.isFinite(life) ? Math.round(life) : DEFAULT_LIFESPAN;

    return {
      birth,
      lifespan: clamp(lifespan, MIN_LIFESPAN, MAX_LIFESPAN)
    };
  }

  function loadConfig() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return normalizeConfig(parsed);
    } catch (_) {
      return normalizeConfig({});
    }
  }

  function saveConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      birth: dateToInputValue(config.birth),
      lifespan: config.lifespan
    }));
  }



  function getBMIModifier(bmi) {
    if (!Number.isFinite(bmi) || bmi <= 0) return 0;
    if (bmi < 18.5) return -4;
    if (bmi < 25) return 0;
    if (bmi < 30) return -1;
    if (bmi < 35) return -3;
    return -8;
  }

  function normalizeCalculatorConfig(raw) {
    const factors = {};
    for (const factor of FACTOR_ORDER) {
      factors[factor] = typeof raw?.factors?.[factor] === 'string' ? raw.factors[factor] : '';
    }
    const conditions = Array.isArray(raw?.conditions) ? raw.conditions.filter((v) => CONDITION_MODIFIERS[v] !== undefined) : [];
    return {
      country: typeof raw?.country === 'string' && LIFE_EXPECTANCY_DATA[raw.country] ? raw.country : 'RUS',
      sex: raw?.sex === 'female' ? 'female' : 'male',
      height: Number.isFinite(Number(raw?.height)) ? Number(raw.height) : 0,
      weight: Number.isFinite(Number(raw?.weight)) ? Number(raw.weight) : 0,
      familyLongevity: Boolean(raw?.familyLongevity),
      conditions,
      factors
    };
  }

  function loadCalculatorConfig() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CALCULATOR_STORAGE_KEY) || 'null');
      return normalizeCalculatorConfig(parsed);
    } catch (_) {
      return normalizeCalculatorConfig({});
    }
  }

  function saveCalculatorConfig(config) {
    localStorage.setItem(CALCULATOR_STORAGE_KEY, JSON.stringify(config));
  }



  function getCountryBaseline(country, sex) {
    const entry = LIFE_EXPECTANCY_DATA[country];
    if (entry) return sex === 'female' ? entry.female : entry.male;
    return sex === 'female' ? 79 : 73;
  }

  function computeCalculatorResult(config) {
    const baseline = getCountryBaseline(config.country, config.sex);
    const impacts = [];

    for (const factor of FACTOR_ORDER) {
      const value = config.factors[factor];
      if (!value) continue;
      const mod = MODIFIERS[factor]?.[value];
      if (Number.isFinite(mod) && mod !== 0) {
        impacts.push({ factor, modifier: mod });
      }
    }

    if (config.height > 0 && config.weight > 0) {
      const bmi = config.weight / ((config.height / 100) * (config.height / 100));
      const bmiModifier = getBMIModifier(bmi);
      if (bmiModifier !== 0) impacts.push({ factor: 'bmi', modifier: bmiModifier });
    }

    if (config.familyLongevity) {
      impacts.push({ factor: 'familyLongevity', modifier: 2.5 });
    }

    if (config.conditions.includes('active_cancer')) {
      impacts.push({ factor: 'conditions', modifier: CONDITION_MODIFIERS.active_cancer });
    } else if (config.conditions.length > 0) {
      const condMod = config.conditions.reduce((sum, item) => sum + (CONDITION_MODIFIERS[item] || 0), 0);
      if (condMod !== 0) impacts.push({ factor: 'conditions', modifier: condMod });
    }

    const totalImpact = impacts.reduce((sum, item) => sum + item.modifier, 0);
    const cappedImpact = clamp(totalImpact, -25, 25);
    const estimated = Math.round((baseline + cappedImpact) * 10) / 10;

    return { baseline, impacts, totalImpact, cappedImpact, estimated };
  }

  function exactAge(fromDate, toDate) {
    let y = toDate.getFullYear() - fromDate.getFullYear();
    let m = toDate.getMonth() - fromDate.getMonth();
    let d = toDate.getDate() - fromDate.getDate();
    if (d < 0) { m--; d += new Date(toDate.getFullYear(), toDate.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y: Math.max(0, y), m: Math.max(0, m), d: Math.max(0, d) };
  }

  function daysToNextBirthday(birth, today) {
    const dayToday = startOfDay(today);
    const next = new Date(dayToday.getFullYear(), birth.getMonth(), birth.getDate());
    if (next < dayToday) next.setFullYear(dayToday.getFullYear() + 1);
    return Math.round((next - dayToday) / DAY_MS);
  }

  function getEndDate(config) {
    const endDate = new Date(config.birth);
    endDate.setFullYear(config.birth.getFullYear() + config.lifespan);
    return endDate;
  }

  function computeStats(now, config) {
    const endDate = getEndDate(config);
    const livedMs = Math.max(0, now - config.birth);
    const totalMs = Math.max(1, endDate - config.birth);
    const progress = clamp(livedMs / totalMs, 0, 1);
    const livedDays = Math.floor(livedMs / DAY_MS);
    const livedWeeks = Math.floor(livedMs / MS_WEEK);

    const age = exactAge(config.birth, now);
    const bdDays = daysToNextBirthday(config.birth, now);
    const nextBD = new Date(startOfDay(now).getFullYear(), config.birth.getMonth(), config.birth.getDate());
    if (nextBD < startOfDay(now)) nextBD.setFullYear(now.getFullYear() + 1);

    const endDiff = endDate - now;
    const endDelta = endDiff > 0 ? exactAge(now, endDate) : { y: 0, m: 0, d: 0 };

    return {
      endDate,
      livedDays,
      livedWeeks,
      livedMonths: age.y * 12 + age.m,
      age,
      bdDays,
      nextBD,
      endDiff,
      endDelta,
      progressPct: (progress * 100).toFixed(1)
    };
  }

  function renderLiveCounter(now) {
    const total = Math.max(0, Math.floor((now - state.birth) / 1000));
    refs.cDays.textContent = Math.floor(total / 86400).toLocaleString('ru');
    refs.cH.textContent = pad(Math.floor(total / 3600) % 24);
    refs.cM.textContent = pad(Math.floor(total / 60) % 60);
    refs.cS.textContent = pad(total % 60);
  }

  function renderStats(stats) {
    refs.sDays.textContent = stats.livedDays.toLocaleString('ru');
    refs.sWeeks.textContent = stats.livedWeeks.toLocaleString('ru');
    refs.sMonths.textContent = stats.livedMonths.toLocaleString('ru');
    refs.sYears.textContent = stats.age.y.toLocaleString('ru');
    refs.iY.textContent = stats.age.y;
    refs.iM.textContent = stats.age.m;
    refs.iD.textContent = stats.age.d;

    refs.iBdMain.classList.remove('soon', 'done');
    if (stats.bdDays === 0) {
      refs.iBdMain.textContent = 'Сегодня!';
      refs.iBdMain.classList.add('done');
    } else {
      refs.iBdMain.textContent = `через ${stats.bdDays} ${stats.bdDays === 1 ? 'день' : stats.bdDays < 5 ? 'дня' : 'дней'}`;
      if (stats.bdDays <= 30) refs.iBdMain.classList.add('soon');
    }
    refs.iBdSub.textContent = fmtDate(stats.nextBD, { day: 'numeric', month: 'long' });

    refs.iEndMain.textContent = stats.endDiff > 0
      ? `через ${stats.endDelta.y} л ${stats.endDelta.m} мес`
      : 'Срок наступил';
    refs.iEndSub.textContent = fmtDate(stats.endDate, { day: 'numeric', month: 'long', year: 'numeric' });

    refs.progressFill.style.width = `${stats.progressPct}%`;
    refs.progressLabel.textContent = `${stats.progressPct}% прожито`;
    refs.birthLabel.textContent = fmtDate(state.birth, { day: 'numeric', month: 'short', year: 'numeric' });
    refs.endLabel.textContent = fmtDate(stats.endDate, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function showSettingsMessage(text, isError) {
    refs.settingsMessage.textContent = text;
    refs.settingsMessage.classList.toggle('error', Boolean(isError));
  }

  function countryDisplayName(iso3, entry) {
    try {
      const regionNames = new Intl.DisplayNames(['ru'], { type: 'region' });
      const iso2 = iso3.slice(0, 2);
      const localized = regionNames.of(iso2);
      return localized && localized !== iso2 ? localized : entry.name;
    } catch (_) {
      return entry.name;
    }
  }

  function populateCountrySelect() {
    const countries = Object.entries(LIFE_EXPECTANCY_DATA)
      .map(([code, entry]) => ({ code, name: countryDisplayName(code, entry) }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    refs.calcCountryInput.innerHTML = countries
      .map((item) => `<option value="${item.code}">${item.name}</option>`)
      .join('');
  }

  function buildCalculatorFactorFields() {
    refs.calcFactorsGrid.innerHTML = FACTOR_ORDER.map((factor) => {
      const cfg = FACTOR_OPTIONS[factor];
      const optionsHtml = [`<option value="">— выберите —</option>`]
        .concat(cfg.options.map(([value, label]) => `<option value="${value}">${label}</option>`))
        .join('');
      return `
        <div class="calculator-field">
          <label for="calcFactor_${factor}">${cfg.label}</label>
          <select class="settings-input calc-factor" id="calcFactor_${factor}" data-factor="${factor}">
            ${optionsHtml}
          </select>
          <small>${cfg.source} · <a href="${cfg.doi}" target="_blank" rel="noopener noreferrer">DOI</a></small>
        </div>
      `;
    }).join('');
  }

  function renderCalculatorInputs() {
    refs.calcCountryInput.value = calculatorState.country;
    refs.calcSexInput.value = calculatorState.sex;
    refs.calcHeightInput.value = calculatorState.height || '';
    refs.calcWeightInput.value = calculatorState.weight || '';
    refs.calcFamilyLongevityInput.checked = calculatorState.familyLongevity;
    refs.calcConditionHeartInput.checked = calculatorState.conditions.includes('heart_disease');
    refs.calcConditionCancerRemissionInput.checked = calculatorState.conditions.includes('cancer_remission');
    refs.calcConditionCancerActiveInput.checked = calculatorState.conditions.includes('active_cancer');
    for (const factor of FACTOR_ORDER) {
      const el = document.getElementById(`calcFactor_${factor}`);
      if (el) el.value = calculatorState.factors[factor] || '';
    }
  }

  function readCalculatorInputs() {
    calculatorState.country = refs.calcCountryInput.value || 'RUS';
    calculatorState.sex = refs.calcSexInput.value === 'female' ? 'female' : 'male';
    calculatorState.height = Number(refs.calcHeightInput.value) || 0;
    calculatorState.weight = Number(refs.calcWeightInput.value) || 0;
    calculatorState.familyLongevity = refs.calcFamilyLongevityInput.checked;
    calculatorState.conditions = [
      refs.calcConditionHeartInput.checked ? 'heart_disease' : '',
      refs.calcConditionCancerRemissionInput.checked ? 'cancer_remission' : '',
      refs.calcConditionCancerActiveInput.checked ? 'active_cancer' : ''
    ].filter(Boolean);

    for (const factor of FACTOR_ORDER) {
      const el = document.getElementById(`calcFactor_${factor}`);
      calculatorState.factors[factor] = el ? el.value : '';
    }
  }

  function renderCalculatorResult() {
    const impactClass = calculatorResult.cappedImpact >= 0 ? '#276749' : '#a92727';
    const entry = LIFE_EXPECTANCY_DATA[calculatorState.country];
    const countryText = entry ? entry.name : 'World average';
    const sign = calculatorResult.cappedImpact > 0 ? '+' : '';
    refs.calcResult.innerHTML = `
      <div><strong>Страна:</strong> ${countryText}</div>
      <div><strong>База (World Bank):</strong> ${calculatorResult.baseline.toFixed(1)} лет</div>
      <div><strong>Влияние факторов:</strong> <span style="color:${impactClass}">${sign}${calculatorResult.cappedImpact.toFixed(1)} лет</span> (ограничение ±25)</div>
      <div><strong>Расчетный срок жизни:</strong> ${calculatorResult.estimated.toFixed(1)} лет</div>
    `;
  }

  function setCalculatorOpen(isOpen) {
    refs.calculatorPanel.hidden = !isOpen;
    refs.toggleCalculatorBtn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) dismissHint();
  }

  function dismissHint() { document.getElementById('firstVisitHint').hidden = true; }

  function initCalculatorVisibility() {
    setCalculatorOpen(false);
    try {
      if (localStorage.getItem(CALCULATOR_SEEN_KEY) !== '1') {
        document.getElementById('firstVisitHint').hidden = false;
        localStorage.setItem(CALCULATOR_SEEN_KEY, '1');
        setTimeout(dismissHint, 8000);
      }
    } catch (_) { /* The calendar also works without browser storage. */ }
  }

  function showTipAt(html, x, y) {
    refs.tooltip.innerHTML = html;
    refs.tooltip.classList.add('show');
    const tipX = x + 14;
    const tipY = y - 40;
    refs.tooltip.style.left = (tipX + refs.tooltip.offsetWidth > innerWidth ? x - refs.tooltip.offsetWidth - 14 : tipX) + 'px';
    refs.tooltip.style.top = (tipY < 0 ? y + 14 : tipY) + 'px';
  }

  function showTipForElement(el, html) {
    const rect = el.getBoundingClientRect();
    showTipAt(html, rect.left + rect.width / 2, rect.top);
  }

  function moveTip(e) {
    if (!refs.tooltip.classList.contains('show')) return;
    showTipAt(refs.tooltip.innerHTML, e.clientX, e.clientY);
  }

  function hideTip() {
    refs.tooltip.classList.remove('show');
  }

  function weekTipHtml(item, isCurrent) {
    return `
      <span style="color:var(--muted);font-size:0.62rem">Возраст ${item.year} лет · неделя ${item.week}</span><br>
      ${fmtDate(item.start)} — ${fmtDate(item.end)}
      ${isCurrent ? '<br><span style="color:var(--gold)">← сейчас</span>' : ''}
    `;
  }

  function weekAriaLabel(item, isCurrent) {
    return `Возраст ${item.year} лет, неделя ${item.week}: ${fmtDate(item.start)} — ${fmtDate(item.end)}${isCurrent ? ', текущая неделя' : ''}`;
  }

  function updateWeekStates(now) {
    currentCell = null;
    for (const item of weekCells) {
      const isCurrent = item.start <= now && item.end >= now;
      const isPast = item.end < now && !isCurrent;

      item.el.classList.remove('past', 'future', 'current');
      item.el.style.background = '';

      if (isCurrent) {
        item.el.classList.add('current');
        currentCell = item.el;
      } else if (isPast) {
        item.el.classList.add('past');
        item.el.style.background = item.pastColor;
      } else {
        item.el.classList.add('future');
      }

      const tip = weekTipHtml(item, isCurrent);
      item.tipHtml = tip;
      item.el.setAttribute('aria-label', weekAriaLabel(item, isCurrent));
    }
  }

  function buildColumnLabels() {
    refs.colLabels.innerHTML = '';
    for (let w = 0; w < WEEKS; w++) {
      const el = document.createElement('div');
      el.className = 'col-label';
      el.textContent = (w === 0 || (w + 1) % 10 === 0) ? (w + 1) : '';
      refs.colLabels.appendChild(el);
    }
  }

  function buildGrid(config) {
    refs.grid.replaceChildren();
    const fragment = document.createDocumentFragment();
    weekCells = [];

    for (let yr = 0; yr < config.lifespan; yr++) {
      const row = document.createElement('div');
      row.className = 'year-row' + (yr > 0 && yr % 10 === 0 ? ' decade-gap' : '');


      const lbl = document.createElement('div');
      lbl.className = 'row-label' + (yr % 10 === 0 ? ' decade' : '');
      lbl.textContent = yr % 10 === 0 ? yr : '';

      row.appendChild(lbl);

      const yearStart = new Date(config.birth);
      yearStart.setFullYear(config.birth.getFullYear() + yr);
      const pastColor = 'var(--accent)';

      for (let w = 0; w < WEEKS; w++) {
        const ws = new Date(yearStart);
        ws.setDate(yearStart.getDate() + w * 7);
        const we = new Date(ws);
        we.setDate(ws.getDate() + 6);
        if (w === WEEKS - 1) {
          we.setTime(yearStart.getTime());
          we.setFullYear(yearStart.getFullYear() + 1);
          we.setDate(we.getDate() - 1);
        }
        we.setHours(23, 59, 59, 999);

        const cell = document.createElement('div');
        cell.className = 'week';
        cell.tabIndex = 0;
        cell.setAttribute('role', 'img');

        const item = {
          el: cell,
          year: yr,
          week: w + 1,
          start: ws,
          end: we,
          pastColor,
          tipHtml: ''
        };
        weekCells.push(item);

        cell.dataset.index = weekCells.length - 1;

        row.appendChild(cell);
      }

      fragment.appendChild(row);
    }

    refs.grid.appendChild(fragment);
    document.documentElement.style.setProperty('--print-row', `${Math.min(2.3, (218 - Math.floor((config.lifespan - 1) / 10) * 1.4) / config.lifespan - 0.45)}mm`);

  }

  function checkScroll() {
    if (!currentCell) {
      refs.backBtn.classList.remove('visible');
      return;
    }
    const { top, bottom } = currentCell.getBoundingClientRect();
    refs.backBtn.classList.toggle('visible', !(top >= 80 && bottom <= innerHeight - 40));
  }

  function maybeScrollToCurrentCell() {
    if (!currentCell) return;
    setTimeout(() => {
      currentCell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, Math.min(state.lifespan * 11 + 500, 1500));
  }

  function renderDateBoundUI() {
    refs.counterLabel.textContent =
      `прожито с ${fmtDate(state.birth, { day: 'numeric', month: 'long', year: 'numeric' })}`;
    refs.birthInput.value = dateToInputValue(state.birth);
  }

  function refreshData(forceWeekRecalc) {
    const now = new Date();
    renderLiveCounter(now);
    renderStats(computeStats(now, state));

    const currentDateKey = dateToInputValue(now);
    if (forceWeekRecalc || currentDateKey !== lastCurrentCellDateKey) {
      updateWeekStates(now);
      lastCurrentCellDateKey = currentDateKey;
    }
    checkScroll();
  }

  function rerenderAll(options) {
    const shouldScroll = Boolean(options?.scrollToCurrent);
    renderDateBoundUI();
    buildGrid(state);
    refreshData(true);
    if (shouldScroll) maybeScrollToCurrentCell();
  }

  function applyFormConfig() {
    const birth = parseInputDate(refs.birthInput.value);
    if (!refs.settingsForm.reportValidity()) return;
    if (!birth || birth > startOfDay(new Date())) {
      showSettingsMessage('Укажите дату рождения не позднее сегодняшнего дня.', true);
      return;
    }
    readCalculatorInputs();
    calculatorResult = computeCalculatorResult(calculatorState);
    const next = normalizeConfig({ birth, lifespan: Math.round(calculatorResult.estimated) });
    const gridChanged = next.birth.getTime() !== state.birth.getTime() || next.lifespan !== state.lifespan;
    state = next;
    let saved = true;
    try { saveConfig(state); saveCalculatorConfig(calculatorState); } catch (_) { saved = false; }
    renderCalculatorResult();
    if (gridChanged) rerenderAll();
    else refreshData(true);
    updateSummary();
    setCalculatorOpen(false);
    showSettingsMessage(saved ? 'Расчёт обновлён. Данные сохранены в этом браузере.' : 'Расчёт обновлён. Браузер не разрешил сохранить данные.', false);
  }

  function resetConfigToDefaults() {
    const appliedCalculator = calculatorState;
    calculatorState = normalizeCalculatorConfig({});
    renderCalculatorInputs();
    calculatorState = appliedCalculator;
    refs.birthInput.value = dateToInputValue(DEFAULT_BIRTH);
    showSettingsMessage('Поля сброшены. Нажмите «Рассчитать», чтобы применить.', false);
  }

  function updateSummary() {
    const summary = `Дата рождения: ${fmtDate(state.birth)} · Горизонт: ${state.lifespan} лет`;
    document.getElementById('printSummary').textContent = summary;
    refs.footer.textContent = summary;
  }

  refs.settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFormConfig();
  });
  refs.resetSettingsBtn.addEventListener('click', resetConfigToDefaults);
  refs.toggleCalculatorBtn.addEventListener('click', () => setCalculatorOpen(refs.calculatorPanel.hidden));
  document.getElementById('dismissHint').addEventListener('click', dismissHint);
  document.getElementById('printBtn').addEventListener('click', () => window.print());
  refs.grid.addEventListener('pointerover', (event) => {
    const cell = event.target.closest('.week');
    if (cell) showTipAt(weekCells[cell.dataset.index].tipHtml, event.clientX, event.clientY);
  });
  refs.grid.addEventListener('pointermove', (event) => { if (event.target.closest('.week')) moveTip(event); });
  refs.grid.addEventListener('pointerout', hideTip);
  refs.grid.addEventListener('focusin', (event) => {
    const cell = event.target.closest('.week');
    if (cell) showTipForElement(cell, weekCells[cell.dataset.index].tipHtml);
  });
  refs.grid.addEventListener('focusout', hideTip);
  refs.grid.addEventListener('keydown', (event) => { if (event.key === 'Escape') hideTip(); });

  refs.backBtn.addEventListener('click', () => currentCell?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  window.addEventListener('scroll', checkScroll, { passive: true });
  window.addEventListener('focus', () => refreshData(true));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshData(true);
  });

  populateCountrySelect();
  buildCalculatorFactorFields();
  renderCalculatorInputs();
  refs.birthInput.max = dateToInputValue(new Date());
  renderCalculatorResult();
  initCalculatorVisibility();

  buildColumnLabels();
  rerenderAll();
  updateSummary();
  setInterval(() => renderLiveCounter(new Date()), 1000);
  setInterval(() => refreshData(false), 60 * 1000);
