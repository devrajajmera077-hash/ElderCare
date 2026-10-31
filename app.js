const translations = {
  hi: { good: 'अच्छा', okay: 'सामान्य', help: 'मुझे मदद चाहिए', saved: 'आज का हाल इस ब्राउज़र में सहेज लिया गया।', storageError: 'इसे सहेज नहीं पाए। कृपया ब्राउज़र की सेटिंग जाँचें।', dateLocale: 'hi-IN' },
  en: { good: 'Good', okay: 'Okay', help: 'I need support', saved: "Today's check-in was saved in this browser.", storageError: 'Could not save this. Please check your browser settings.', dateLocale: 'en-IN' }
};
const moodButtons = [...document.querySelectorAll('[data-mood]')];
const feedback = document.querySelector('#checkin-feedback');
let language = 'hi';
try { language = localStorage.getItem('eldercare-language') || 'hi'; } catch { /* use Hindi when browser storage is unavailable */ }

function todayStorageKey() {
  const date = new Date();
  const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return `eldercare-checkin-${localDate}`;
}

function setLanguage(next) {
  language = next;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-en]').forEach((element) => {
    if (!element.dataset.hi) element.dataset.hi = element.textContent;
    element.textContent = language === 'en' ? element.dataset.en : element.dataset.hi;
  });
  const group = document.querySelector('.mood-options');
  group.setAttribute('aria-label', language === 'en' ? group.dataset.enLabel : 'आज का हाल चुनें');
  const languageToggle = document.querySelector('#language-toggle');
  languageToggle.textContent = language === 'hi' ? 'English' : 'हिन्दी';
  languageToggle.setAttribute('aria-label', language === 'hi' ? 'भाषा बदलें' : 'Switch language');
  document.querySelector('#today-date').textContent = new Intl.DateTimeFormat(translations[language].dateLocale, { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  moodButtons.forEach((button) => { button.querySelector('b').textContent = translations[language][button.dataset.mood]; });
  try { localStorage.setItem('eldercare-language', language); } catch { /* language still works for this page */ }
  refreshCheckin();
}

function refreshCheckin() {
  const key = todayStorageKey();
  let saved = null;
  try { saved = localStorage.getItem(key); } catch { feedback.textContent = translations[language].storageError; return; }
  if (!['good', 'okay', 'help'].includes(saved)) saved = null;
  moodButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mood === saved)));
  feedback.textContent = saved ? `${translations[language][saved]}. ${translations[language].saved}` : '';
}

document.querySelector('#language-toggle').addEventListener('click', () => setLanguage(language === 'hi' ? 'en' : 'hi'));
moodButtons.forEach((button) => button.addEventListener('click', () => {
  const key = todayStorageKey();
  try { localStorage.setItem(key, button.dataset.mood); feedback.textContent = `${translations[language][button.dataset.mood]}. ${translations[language].saved}`; }
  catch { feedback.textContent = translations[language].storageError; }
  if (feedback.textContent !== translations[language].storageError) refreshCheckin();
}));
setLanguage(language);
