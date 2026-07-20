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
  document.querySelectorAll<HTMLElement>('[data-project-lang]').forEach(section => {
    section.hidden = section.dataset.projectLang !== lang;
  });
  document.querySelectorAll<HTMLElement>('[data-project-nav-lang]').forEach(section => {
    section.hidden = section.dataset.projectNavLang !== lang;
  });
  const projectName = document.querySelector<HTMLElement>(`[data-project-lang="${lang}"] h1`)?.textContent;
  if (projectName) document.title = `${projectName} — Design Center`;

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

  // Contact CTAs always lead to the dedicated conversion section.
  document.querySelectorAll('.contact-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')) {
        e.preventDefault();
        document.querySelector<HTMLElement>('#contact')?.scrollIntoView({ behavior: 'smooth' });
        window.setTimeout(() => document.querySelector<HTMLInputElement>('[data-contact-name]')?.focus(), 350);
      }
    });
  });
}

// ==========================================
// 3. Reusable contact form
// ==========================================
function initContactForm() {
  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach(form => form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = form.querySelector<HTMLInputElement>('[data-contact-name]');
    const emailInput = form.querySelector<HTMLInputElement>('[data-contact-email]');
    const subjectInput = form.querySelector<HTMLInputElement>('[data-contact-subject]');
    const messageInput = form.querySelector<HTMLTextAreaElement>('[data-contact-message]');
    const status = form.querySelector<HTMLElement>('[data-contact-status]');
    const honeypot = form.querySelector<HTMLInputElement>('[name="website"]');

    let hasError = false;

    [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
      if (input) {
        input.classList.remove('border-red-500');
        input.classList.add('border-zinc-800');
        input.removeAttribute('aria-invalid');
      }
    });

    const invalid = (input: HTMLInputElement | HTMLTextAreaElement | null, valid: boolean) => {
      if (valid || !input) return false;
      input.classList.add('border-red-500'); input.setAttribute('aria-invalid', 'true'); return true;
    };
    if (invalid(nameInput, !!nameInput && nameInput.value.trim().length >= 2 && nameInput.value.trim().length <= 100)) {
      hasError = true;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (invalid(emailInput, !!emailInput && emailRegex.test(emailInput.value.trim()))) {
      hasError = true;
    }

    if (invalid(subjectInput, !!subjectInput && subjectInput.value.trim().length >= 3 && subjectInput.value.trim().length <= 200)) {
      hasError = true;
    }

    if (invalid(messageInput, !messageInput || messageInput.value.trim().length <= 2000)) hasError = true;
    if (hasError) { if (status) status.textContent = translate('contact.validation') || 'Please correct the highlighted fields.'; form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(); return; }
    if (honeypot?.value) return;

    const submitBtn = form.querySelector<HTMLButtonElement>('[data-contact-submit]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
    }

    const payload = {
      name: nameInput?.value.trim() || '',
      email: emailInput?.value.trim() || '',
      subject: subjectInput?.value.trim() || '',
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
  }));
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

function initProjectGalleries() {
  document.querySelectorAll<HTMLElement>('[data-project-gallery]').forEach(gallery => {
    const mainImage = gallery.querySelector<HTMLImageElement>('[data-project-main-image]');
    const thumbnails = Array.from(gallery.querySelectorAll<HTMLButtonElement>('[data-project-thumbnail]'));
    const strip = gallery.querySelector<HTMLElement>('[data-project-thumbnail-strip]');
    thumbnails.forEach(thumbnail => thumbnail.addEventListener('click', () => {
      if (!mainImage) return;
      mainImage.src = thumbnail.dataset.imageSrc || mainImage.src;
      mainImage.alt = thumbnail.dataset.imageAlt || mainImage.alt;
      thumbnails.forEach(item => { item.classList.toggle('is-selected', item === thumbnail); item.setAttribute('aria-pressed', String(item === thumbnail)); });
    }));
    if (gallery.dataset.galleryAutoplay !== 'true' || thumbnails.length < 2 || !strip) return;
    const interval = Math.max(1000, Number(gallery.dataset.galleryInterval) || 5000);
    let index = 0;
    window.setInterval(() => {
      index = (index + 1) % thumbnails.length;
      thumbnails[index].click();
      thumbnails[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, interval);
  });
}

// ==========================================
// 6. Dynamic Project Gallery (CRM: public/data/projects.json)
//    Rendered in the original portfolio-card style:
//    image, bold title, italic category/location below.
// ==========================================
let projectsCache: ContentRecord[] | null = null;
async function initDynamicProjects() {
  const container = document.getElementById('dynamic-projects-gallery');
  if (!container) return;

  try {
    if (!projectsCache) {
      const response = await fetch('/data/projects.json');
      if (!response.ok) throw new Error('Failed to load projects data');
      const data = await response.json(); projectsCache = data.items || data;
    }
    const projects = (projectsCache || []).filter(project => project.published !== false && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(project.id || '')));
    container.innerHTML = '';

    projects.forEach((project: ContentRecord) => {
      const name = getLocalizedValue(project, 'name');
      const imageUrl = normalizeMediaUrl(project.imageUrl);

      const card = document.createElement('article');
      card.className = 'project-card';
      const link = document.createElement('a');
      link.href = `/projects/${encodeURIComponent(String(project.id))}.html`;
      link.className = 'project-card-link';

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = getLocalizedValue(project, 'imageAlt') || name;
      img.loading = 'lazy';

      const label = document.createElement('span');
      label.className = 'project-card-overlay';
      label.textContent = name;
      link.append(img, label);
      card.appendChild(link);
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading dynamic projects:', error);
    container.textContent = translate('project.load_error') || 'Projects could not be loaded. Please try again later.';
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
      div.className = 'flex items-center justify-center h-32 xl:h-40';

      const img = document.createElement('img');
      img.src = normalizeMediaUrl(client.imageUrl);
      img.alt = String(client.name || '');
      img.loading = 'lazy';
      img.className = 'max-h-28 xl:max-h-36 max-w-full w-auto object-contain';

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
  initProjectGalleries();
  initLanguageToggle(); // also triggers initDynamicProjects / initDynamicClients
});
