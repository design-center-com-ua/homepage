import './style.css';
import { translations } from './locales';

const storedLang = localStorage.getItem('lang');
let currentLang: 'uk' | 'en' = storedLang === 'en' ? 'en' : 'uk';

type ContentRecord = Record<string, unknown>;

function initGoogleAnalytics() {
  const measurementId = document
    .querySelector<HTMLMetaElement>('meta[name="google-analytics-id"]')
    ?.content.trim();

  if (!measurementId || !/^G-[A-Z0-9]+$/.test(measurementId) || measurementId === 'G-XXXXXXXXXX') {
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  const analyticsWindow = window as Window & { dataLayer?: unknown[][] };
  const dataLayer = analyticsWindow.dataLayer ??= [];
  const gtag = (...args: unknown[]) => dataLayer.push(args);
  gtag('js', new Date());
  gtag('config', measurementId);
}

initGoogleAnalytics();

function getLocalizedValue(item: ContentRecord, key: string) {
  return String(item[`${key}_${currentLang}`] || item[`${key}_uk`] || item[key] || '');
}

function normalizeMediaUrl(value: unknown) {
  const url = String(value || '').trim();
  if (url.startsWith('/') || url.startsWith('https://') || url.startsWith('http://')) {
    return url;
  }
  return '';
}

export function setLanguage(lang: 'uk' | 'en') {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (!key) return;
    const keys = key.split('.');
    let value: any = translations[lang];
    for (const k of keys) {
      if (value) value = value[k];
    }
    if (value && typeof value === 'string') {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        (el as HTMLInputElement).placeholder = value;
      } else if (el.tagName === 'META') {
        el.setAttribute('content', value);
      } else if (el.tagName === 'TITLE') {
        document.title = value;
      } else {
        el.textContent = value;
      }
    }
  });

  initDynamicProjects();
  initDynamicClients();
  initServiceCategories();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('text-brand', 'font-bold');
      btn.classList.remove('text-zinc-500');
    } else {
      btn.classList.remove('text-brand', 'font-bold');
      btn.classList.add('text-zinc-500');
    }
  });
}

function translate(key: string) {
  return key.split('.').reduce<unknown>((value, part) => {
    if (value && typeof value === 'object' && part in value) {
      return (value as Record<string, unknown>)[part];
    }
    return undefined;
  }, translations[currentLang]) as string | undefined;
}

function initLanguageToggle() {
  document.querySelectorAll('.lang-btn').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = toggle.getAttribute('data-lang') as 'uk' | 'en';
      if (lang) setLanguage(lang);
    });
  });
  setLanguage(currentLang);
}

// ==========================================
// 1. Side Menu Drawer (dots button / hamburger)
// ==========================================
function initMenuDrawer() {
  const openBtns = [document.getElementById('mobile-menu-btn'), document.getElementById('mobile-menu-btn-small')];
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-menu');

  if (!drawer) return;

  // Language switcher at the bottom of the drawer
  const menuContent = drawer.querySelector('.flex-grow');
  if (menuContent && !drawer.querySelector('.mobile-lang-switcher')) {
    const switcher = document.createElement('div');
    switcher.className = 'mobile-lang-switcher mt-auto pt-6 border-t border-zinc-800 flex items-center gap-3';
    menuContent.appendChild(switcher);
    (['uk', 'en'] as const).forEach((lang, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'lang-btn text-xs uppercase tracking-widest text-zinc-500 hover:text-brand';
      button.setAttribute('data-lang', lang);
      button.textContent = lang.toUpperCase();
      switcher.appendChild(button);
      if (index === 0) {
        const separator = document.createElement('span');
        separator.className = 'text-zinc-700';
        separator.textContent = '|';
        switcher.appendChild(separator);
      }
    });
  }

  const toggleMenu = (open: boolean) => {
    openBtns.forEach(btn => btn?.setAttribute('aria-expanded', String(open)));
    drawer.setAttribute('aria-hidden', String(!open));
    drawer.toggleAttribute('inert', !open);
    if (open) {
      drawer.classList.remove('translate-x-full');
      document.body.classList.add('overflow-hidden');
      closeBtn?.focus();
    } else {
      drawer.classList.add('translate-x-full');
      document.body.classList.remove('overflow-hidden');
    }
  };

  openBtns.forEach(btn => btn && btn.addEventListener('click', () => toggleMenu(true)));
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleMenu(false));
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && drawer.getAttribute('aria-hidden') === 'false') {
      toggleMenu(false);
      openBtns.find(btn => btn && btn.offsetParent !== null)?.focus();
    }
  });

  // Close drawer when a menu link is clicked
  drawer.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // "Написати нам" / "Зв'язатись з нами" triggers open the drawer with the contact form
  document.querySelectorAll('.contact-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu(true);
      const nameInput = drawer.querySelector<HTMLInputElement>('#form-name');
      setTimeout(() => nameInput?.focus(), 350);
    });
  });
}

// ==========================================
// 3. Contact Form (inside the side drawer)
// ==========================================
function initContactForm() {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const successToast = document.getElementById('contact-success-toast');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('form-name') as HTMLInputElement;
    const emailInput = document.getElementById('form-email') as HTMLInputElement;
    const subjectInput = document.getElementById('form-subject') as HTMLInputElement;
    const messageInput = document.getElementById('form-message') as HTMLTextAreaElement;
    const status = document.getElementById('form-status');
    const honeypot = form.querySelector<HTMLInputElement>('[name="website"]');

    let hasError = false;

    [nameInput, emailInput, subjectInput].forEach(input => {
      if (input) {
        input.classList.remove('border-red-500');
        input.classList.add('border-zinc-800');
      }
    });

    if (!nameInput || nameInput.value.trim().length < 2) {
      nameInput?.classList.add('border-red-500');
      hasError = true;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
      emailInput?.classList.add('border-red-500');
      hasError = true;
    }

    if (!subjectInput || subjectInput.value.trim().length < 3) {
      subjectInput?.classList.add('border-red-500');
      hasError = true;
    }

    if (hasError) return;
    if (honeypot?.value) return;

    const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
    }

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      subject: subjectInput.value.trim(),
      message: messageInput ? messageInput.value.trim() : '',
      website: honeypot?.value || ''
    };

    if (status) {
      status.textContent = translate('modal.sending') || 'Sending…';
      status.classList.remove('text-red-500', 'text-brand');
    }

    try {
      const response = await fetch(form.getAttribute('action') || '/sendmail.php', {
        method: form.getAttribute('method') || 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Server error');

      form.reset();
      if (status) {
        status.textContent = translate('modal.success_desc') || 'Thank you! We will contact you shortly.';
        status.classList.add('text-brand');
      }
      if (successToast) {
        successToast.classList.remove('translate-y-24', 'opacity-0');
        setTimeout(() => {
          successToast.classList.add('translate-y-24', 'opacity-0');
        }, 3500);
      }
    } catch (error) {
      console.error('Error:', error);
      const message = translate('modal.error') || 'Could not send the message. Please try again later.';
      if (status) {
        status.textContent = message;
        status.classList.add('text-red-500');
      } else {
        alert(message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
    }
  });
}

// ==========================================
// 4. Active nav underline (matches original)
// ==========================================
function highlightActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const isHome = href === '/' || href === '/index.html';
    const matchesHome = isHome && (path === '/' || path.endsWith('/index.html'));
    const matchesPage = !isHome && path.includes(href.replace('/', ''));
    link.classList.toggle('active', matchesHome || matchesPage);
  });
}

// ==========================================
// 5. Back to top
// ==========================================
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  const update = () => {
    const show = window.scrollY > 400;
    btn.classList.toggle('opacity-0', !show);
    btn.classList.toggle('pointer-events-none', !show);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==========================================
// 6. Dynamic Project Gallery (CRM: public/data/projects.json)
//    Rendered in the original portfolio-card style:
//    image, bold title, italic category/location below.
// ==========================================
async function initDynamicProjects() {
  const container = document.getElementById('dynamic-projects-gallery');
  if (!container) return;

  try {
    const response = await fetch('/data/projects.json');
    if (!response.ok) throw new Error('Failed to load projects data');

    const data = await response.json();
    const projects = data.items || data;
    container.innerHTML = '';

    projects.forEach((project: ContentRecord) => {
      const name = getLocalizedValue(project, 'name');
      const category = getLocalizedValue(project, 'categoryLabel');
      const location = getLocalizedValue(project, 'location');
      const desc = getLocalizedValue(project, 'description');
      const imageUrl = normalizeMediaUrl(project.imageUrl);

      const card = document.createElement('article');
      card.className = 'project-card';

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = name;
      img.loading = 'lazy';

      const title = document.createElement('h5');
      title.className = 'project-title';
      title.textContent = name;

      const categoryEl = document.createElement('p');
      categoryEl.className = 'project-category';
      categoryEl.textContent = location ? `${category} / ${location}` : category;

      card.append(img, title, categoryEl);

      if (desc) {
        const descEl = document.createElement('p');
        descEl.className = 'project-description';
        descEl.textContent = desc;
        card.append(descEl);
      }
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading dynamic projects:', error);
  }
}

// ==========================================
// 7. Dynamic Partners Gallery (CRM: public/data/clients.json)
// ==========================================
async function initDynamicClients() {
  const container = document.getElementById('dynamic-clients-gallery');
  if (!container) return;

  try {
    const response = await fetch('/data/clients.json');
    if (!response.ok) throw new Error('Failed to load clients data');
    const data = await response.json();
    const clients = data.items || data;

    container.innerHTML = '';

    clients.forEach((client: ContentRecord) => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-center h-28';

      const img = document.createElement('img');
      img.src = normalizeMediaUrl(client.imageUrl);
      img.alt = String(client.name || '');
      img.loading = 'lazy';
      img.className = 'max-h-24 max-w-full w-auto object-contain';

      div.appendChild(img);
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// 8. Service Categories (services page)
//    Rendered from the localized services_page.categories array so the
//    category titles and sub-item lists follow the active language.
//    Images are recycled from the homepage category tiles.
// ==========================================
const SERVICE_CATEGORY_IMAGES = [
  '/images/services/signs.jpg',       // Зовнішня реклама
  '/images/services/facades.jpg',     // Вентильовані фасади
  '/images/services/structures.jpg',  // Металоконструкції
  '/images/services/printing.jpg'     // Поліграфія (light image -> dark title)
];

function initServiceCategories() {
  const container = document.getElementById('services-categories');
  if (!container) return;

  const categories = (translations[currentLang].services_page as any).categories as
    { title: string; items: string[] }[];
  if (!Array.isArray(categories)) return;

  container.innerHTML = '';

  categories.forEach((cat, index) => {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-1 md:grid-cols-2 gap-10 items-center';

    // Image tile with green hover + centered title
    const tile = document.createElement('div');
    tile.className = 'cat-tile aspect-[966/472]';

    const bg = document.createElement('span');
    bg.className = 'cat-bg';

    const img = document.createElement('img');
    img.src = SERVICE_CATEGORY_IMAGES[index] || SERVICE_CATEGORY_IMAGES[0];
    img.alt = cat.title;
    img.loading = 'lazy';

    const titleEl = document.createElement('span');
    titleEl.className = 'cat-title' + (index === 3 ? ' cat-title-dark' : '');
    titleEl.textContent = cat.title;

    tile.append(bg, img, titleEl);

    // Sub-item list
    const list = document.createElement('ul');
    list.className = 'flex flex-col gap-5 md:pl-10';
    cat.items.forEach(item => {
      const li = document.createElement('li');
      const h4 = document.createElement('h4');
      h4.className = 'text-lg font-medium';
      h4.textContent = item;
      li.appendChild(h4);
      list.appendChild(li);
    });

    row.append(tile, list);
    container.appendChild(row);
  });
}

// ==========================================
// Initialize on DOM Content Loaded
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initMenuDrawer();
  initContactForm();
  highlightActiveNav();
  initBackToTop();
  initLanguageToggle(); // also triggers initDynamicProjects / initDynamicClients
});
