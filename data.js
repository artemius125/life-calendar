  const LIFE_EXPECTANCY_DATA = {
    RUS: { name: 'Russian Federation', male: 68.0, female: 78.7 },
    UKR: { name: 'Ukraine', male: 66.9, female: 80.2 },
    BLR: { name: 'Belarus', male: 69.5, female: 79.1 },
    KAZ: { name: 'Kazakhstan', male: 70.1, female: 78.4 },
    USA: { name: 'United States', male: 75.8, female: 81.1 },
    CAN: { name: 'Canada', male: 79.5, female: 83.9 },
    MEX: { name: 'Mexico', male: 72.2, female: 77.8 },
    GBR: { name: 'United Kingdom', male: 79.4, female: 83.2 },
    DEU: { name: 'Germany', male: 78.2, female: 83.0 },
    FRA: { name: 'France', male: 80.1, female: 85.9 },
    ESP: { name: 'Spain', male: 81.2, female: 86.7 },
    ITA: { name: 'Italy', male: 81.7, female: 85.8 },
    NLD: { name: 'Netherlands', male: 80.5, female: 83.4 },
    SWE: { name: 'Sweden', male: 81.7, female: 85.0 },
    NOR: { name: 'Norway', male: 81.6, female: 84.7 },
    FIN: { name: 'Finland', male: 79.1, female: 84.4 },
    POL: { name: 'Poland', male: 74.8, female: 82.4 },
    CZE: { name: 'Czechia', male: 77.0, female: 82.9 },
    SVK: { name: 'Slovak Republic', male: 74.7, female: 81.5 },
    ROU: { name: 'Romania', male: 72.9, female: 80.5 },
    BGR: { name: 'Bulgaria', male: 72.0, female: 79.6 },
    TUR: { name: 'Turkiye', male: 74.5, female: 79.9 },
    GRC: { name: 'Greece', male: 79.0, female: 84.2 },
    ISR: { name: 'Israel', male: 81.0, female: 85.5 },
    JPN: { name: 'Japan', male: 81.1, female: 87.1 },
    KOR: { name: 'Korea, Rep.', male: 80.6, female: 86.4 },
    CHN: { name: 'China', male: 75.2, female: 80.9 },
    IND: { name: 'India', male: 70.5, female: 73.6 },
    IDN: { name: 'Indonesia', male: 69.0, female: 73.3 },
    THA: { name: 'Thailand', male: 72.2, female: 80.9 },
    VNM: { name: 'Viet Nam', male: 69.9, female: 79.3 },
    PHL: { name: 'Philippines', male: 66.9, female: 72.8 },
    BRA: { name: 'Brazil', male: 72.8, female: 79.0 },
    ARG: { name: 'Argentina', male: 74.8, female: 79.9 },
    CHL: { name: 'Chile', male: 79.2, female: 83.1 },
    COL: { name: 'Colombia', male: 75.0, female: 80.5 },
    PER: { name: 'Peru', male: 75.4, female: 80.1 },
    AUS: { name: 'Australia', male: 81.1, female: 85.1 },
    NZL: { name: 'New Zealand', male: 81.2, female: 84.9 },
    ZAF: { name: 'South Africa', male: 62.6, female: 69.6 },
    EGY: { name: 'Egypt, Arab Rep.', male: 69.5, female: 73.8 },
    SAU: { name: 'Saudi Arabia', male: 77.1, female: 81.2 },
    ARE: { name: 'United Arab Emirates', male: 82.0, female: 84.2 }
  };

  const FACTOR_OPTIONS = {
    smoking: {
      label: 'Курение',
      source: 'Jha P. et al., NEJM 2013',
      doi: 'https://doi.org/10.1056/NEJMsa1211128',
      options: [
        ['never', 'Никогда'],
        ['quit_before_35', 'Бросил до 35'],
        ['quit_35_54', 'Бросил в 35-54'],
        ['quit_55plus', 'Бросил в 55+'],
        ['current', 'Курю сейчас']
      ]
    },
    alcohol: {
      label: 'Алкоголь',
      source: 'GBD 2016 Alcohol Collaborators, Lancet 2018',
      doi: 'https://doi.org/10.1038/s41598-022-11427-x',
      options: [['none', 'Не пью'], ['moderate', 'Умеренно'], ['heavy', 'Тяжелое употребление']]
    },
    activity: {
      label: 'Физическая активность',
      source: 'Arem H. et al., JAMA Internal Med 2015',
      doi: 'https://doi.org/10.1371/journal.pmed.1001335',
      options: [['sedentary', 'Сидячий'], ['light', 'Легкая'], ['moderate', 'Умеренная'], ['active', 'Активный (150+ мин/нед)']]
    },
    sleep: {
      label: 'Сон',
      source: 'Cappuccio F. et al., Sleep 2010',
      doi: 'https://doi.org/10.1093/sleep/33.5.585',
      options: [['lt6', '<6 часов'], ['6_7', '6-7 часов'], ['7_8', '7-8 часов'], ['9plus', '9+ часов']]
    },
    diet: {
      label: 'Диета',
      source: 'Sofi F. et al., BMJ 2008',
      doi: 'https://doi.org/10.1371/journal.pmed.1003889',
      options: [['poor', 'Плохая'], ['average', 'Средняя'], ['good', 'Хорошая'], ['excellent', 'Средиземноморская']]
    },
    social: {
      label: 'Социальные связи',
      source: 'Holt-Lunstad J. et al., PLoS Med 2010',
      doi: 'https://doi.org/10.1371/journal.pmed.1000316',
      options: [['isolated', 'Изолирован'], ['some', 'Есть связи'], ['strong', 'Сильная сеть']]
    },
    stress: {
      label: 'Стресс',
      source: 'Kivimaki M. et al., BMJ 2012',
      doi: 'https://doi.org/10.1038/s41398-021-01735-7',
      options: [['low', 'Низкий'], ['moderate', 'Умеренный'], ['high', 'Высокий'], ['severe', 'Хронический']]
    },
    education: {
      label: 'Образование',
      source: 'Hummer R. & Hernandez E., Demography 2013',
      doi: 'https://doi.org/10.1016/S2468-2667(23)00306-7',
      options: [['less_hs', 'Ниже среднего'], ['hs', 'Среднее'], ['college', 'Колледж'], ['bachelor', 'Бакалавр'], ['graduate', 'Магистр+']]
    },
    maritalStatus: {
      label: 'Семейное положение',
      source: 'Roelfs D. et al., Soc Sci Med 2011',
      doi: 'https://doi.org/10.1093/aje/kwr111',
      options: [['married', 'В браке'], ['cohabiting', 'Сожительство'], ['divorced', 'В разводе'], ['widowed', 'Вдовец/вдова'], ['single', 'Не в браке']]
    },
    hypertension: {
      label: 'Давление',
      source: 'Lewington S. et al., Lancet 2002',
      doi: 'https://doi.org/10.1016/S0140-6736(02)11911-8',
      options: [['normal', 'Нормальное'], ['elevated', 'Повышенное'], ['stage1', 'Стадия 1'], ['stage2', 'Стадия 2'], ['unknown', 'Не знаю']]
    },
    depression: {
      label: 'Депрессия',
      source: 'Cuijpers P. et al., Arch Gen Psychiatry 2014',
      doi: 'https://doi.org/10.1176/appi.ajp.2013.13030325',
      options: [['none', 'Нет'], ['mild', 'Легкая'], ['moderate', 'Умеренная'], ['severe', 'Тяжелая']]
    },
    sittingHours: {
      label: 'Сидячий образ жизни',
      source: 'Chau J. et al., Int J Behav Nutr 2013',
      doi: 'https://doi.org/10.1371/journal.pone.0080000',
      options: [['lt4', '<4 ч/день'], ['4_6', '4-6 ч/день'], ['7_9', '7-9 ч/день'], ['10plus', '10+ ч/день']]
    },
    optimism: {
      label: 'Оптимизм',
      source: 'Lee L. et al., PNAS 2019',
      doi: 'https://doi.org/10.1073/pnas.1900712116',
      options: [['very', 'Высокий'], ['somewhat', 'Скорее высокий'], ['neutral', 'Нейтральный'], ['pessimistic', 'Пессимистичный']]
    },
    purpose: {
      label: 'Цель в жизни',
      source: 'Alimujiang A. et al., JAMA Network Open 2019',
      doi: 'https://doi.org/10.1177/0956797614531799',
      options: [['strong', 'Сильное чувство'], ['moderate', 'Умеренное'], ['uncertain', 'Неуверенное'], ['none', 'Нет']]
    },
    coffee: {
      label: 'Кофе',
      source: 'Loftfield E. et al., JAMA Internal Med 2018',
      doi: 'https://doi.org/10.1056/NEJMoa1112010',
      options: [['0', 'Не пью'], ['1_2', '1-2 чашки/день'], ['3_4', '3-4 чашки/день'], ['5plus', '5+ чашек/день']]
    },
    airPollution: {
      label: 'Загрязнение воздуха',
      source: 'Lelieveld J. et al., Cardiovascular Research 2020',
      doi: 'https://doi.org/10.1073/pnas.1616784114',
      options: [['clean', 'Чистый'], ['moderate', 'Умеренный'], ['polluted', 'Загрязненный'], ['heavy', 'Сильно загрязненный']]
    },
    diabetes: {
      label: 'Диабет',
      source: 'Emerging Risk Factors Collab., NEJM 2011',
      doi: 'https://doi.org/10.1016/S2213-8587(22)00252-2',
      options: [['no', 'Нет'], ['type2_under40', 'Тип 2, до 40'], ['type2_40_50', 'Тип 2, 40-50'], ['type2_over50', 'Тип 2, после 50']]
    }
  };

  const FACTOR_ORDER = Object.keys(FACTOR_OPTIONS);
  const MODIFIERS = {
    smoking: { never: 0, quit_before_35: -1, quit_35_54: -4, quit_55plus: -7, current: -11 },
    alcohol: { none: 0, moderate: 0, heavy: -7 },
    activity: { sedentary: -3, light: 0, moderate: 2, active: 4 },
    sleep: { lt6: -1, '6_7': 0, '7_8': 0, '9plus': -2 },
    diet: { poor: -4, average: 0, good: 3, excellent: 6 },
    social: { isolated: -5, some: 0, strong: 2 },
    stress: { low: 1, moderate: 0, high: -1.5, severe: -2.5 },
    education: { less_hs: -4, hs: -2, college: 0, bachelor: 1.5, graduate: 2.5 },
    maritalStatus: { married: 2.5, cohabiting: 1, divorced: -1, widowed: -1, single: -2 },
    hypertension: { normal: 1, elevated: 0, stage1: -1.5, stage2: -3, unknown: -1 },
    depression: { none: 0, mild: -1, moderate: -3, severe: -6 },
    sittingHours: { lt4: 1, '4_6': 0, '7_9': -1, '10plus': -2 },
    optimism: { very: 2, somewhat: 1, neutral: 0, pessimistic: -1.5 },
    purpose: { strong: 2, moderate: 1, uncertain: 0, none: -1.5 },
    coffee: { '0': 0, '1_2': 1, '3_4': 0.5, '5plus': 0 },
    airPollution: { clean: 0.5, moderate: 0, polluted: -1, heavy: -2 },
    diabetes: { no: 0, type2_under40: -12, type2_40_50: -8, type2_over50: -5 }
  };

  const CONDITION_MODIFIERS = {
    heart_disease: -5,
    cancer_remission: -2,
    active_cancer: -10
  };

