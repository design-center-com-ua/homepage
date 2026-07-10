import './style.css';
import { translations } from './locales';

let currentLang: 'uk' | 'en' = (localStorage.getItem('lang') as 'uk' | 'en') || 'uk';

type ContentRecord = Record<string, unknown>;

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

function createLocationIcon() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'w-4 h-4 text-brand');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('viewBox', '0 0 24 24');

  const pinPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pinPath.setAttribute('stroke-linecap', 'round');
  pinPath.setAttribute('stroke-linejoin', 'round');
  pinPath.setAttribute('stroke-width', '2');
  pinPath.setAttribute('d', 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z');

  const dotPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  dotPath.setAttribute('stroke-linecap', 'round');
  dotPath.setAttribute('stroke-linejoin', 'round');
  dotPath.setAttribute('stroke-width', '2');
  dotPath.setAttribute('d', 'M15 11a3 3 0 11-6 0 3 3 0 016 0z');

  svg.append(pinPath, dotPath);
  return svg;
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
// 1. Mobile Menu Drawer
// ==========================================
function initMobileMenu() {
  const openBtns = [document.getElementById('mobile-menu-btn'), document.getElementById('mobile-menu-btn-small')];
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-menu');

  if (!drawer) return;

  const toggleMenu = (open: boolean) => {
    if (open) {
      drawer.classList.remove('translate-x-full');
      document.body.classList.add('overflow-hidden');
    } else {
      drawer.classList.add('translate-x-full');
      document.body.classList.remove('overflow-hidden');
    }
  };

  openBtns.forEach(btn => btn && btn.addEventListener('click', () => toggleMenu(true)));
  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleMenu(false));
  }

  // Close drawer on clicking menu links
  const links = drawer.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });
}

// ==========================================
// 2. Hero Slider (Home Page)
// ==========================================
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length <= 1) return;

  let currentIdx = 0;
  let intervalId: any = null;

  const showSlide = (idx: number) => {
    slides.forEach((slide, index) => {
      if (index === idx) {
        slide.classList.remove('opacity-0', 'pointer-events-none', 'z-0');
        slide.classList.add('opacity-100', 'z-10');
      } else {
        slide.classList.remove('opacity-100', 'z-10');
        slide.classList.add('opacity-0', 'pointer-events-none', 'z-0');
      }
    });
  };

  const nextSlide = () => {
    currentIdx = (currentIdx + 1) % slides.length;
    showSlide(currentIdx);
  };

  const startAutoPlay = () => {
    intervalId = setInterval(nextSlide, 6000);
  };

  const stopAutoPlay = () => {
    if (intervalId) clearInterval(intervalId);
  };

  // Initialize first slide state
  showSlide(currentIdx);
  startAutoPlay();

  // Pause on hover
  const sliderContainer = document.getElementById('hero-slider-container');
  if (sliderContainer) {
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);
  }
}

// ==========================================
// 3. Testimonials Carousel (Home Page)
// ==========================================
function initTestimonialSlider() {
  const cards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.testimonial-dot');
  if (cards.length === 0) return;

  let currentIdx = 0;
  let intervalId: any = null;

  const showTestimonial = (idx: number) => {
    cards.forEach((card, index) => {
      if (index === idx) {
        card.classList.remove('opacity-0', 'scale-95', 'pointer-events-none', 'hidden');
        card.classList.add('opacity-100', 'scale-100');
      } else {
        card.classList.remove('opacity-100', 'scale-100');
        card.classList.add('opacity-0', 'scale-95', 'pointer-events-none', 'hidden');
      }
    });

    dots.forEach((dot, index) => {
      if (index === idx) {
        dot.classList.add('bg-brand', 'scale-125');
        dot.classList.remove('bg-zinc-600');
      } else {
        dot.classList.remove('bg-brand', 'scale-125');
        dot.classList.add('bg-zinc-600');
      }
    });
    currentIdx = idx;
  };

  const nextTestimonial = () => {
    const nextIdx = (currentIdx + 1) % cards.length;
    showTestimonial(nextIdx);
  };

  // Add click events to indicators
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showTestimonial(index);
      resetAutoPlay();
    });
  });

  const startAutoPlay = () => {
    intervalId = setInterval(nextTestimonial, 7000);
  };

  const resetAutoPlay = () => {
    if (intervalId) clearInterval(intervalId);
    startAutoPlay();
  };

  showTestimonial(currentIdx);
  startAutoPlay();
}

// ==========================================
// 4. Contact Modal & Validation
// ==========================================
function initContactModal() {
  const modal = document.getElementById('contact-modal');
  const closeBtn = document.getElementById('contact-modal-close');
  const triggers = document.querySelectorAll('.contact-trigger');
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const successToast = document.getElementById('contact-success-toast');

  if (!modal) return;

  const toggleModal = (open: boolean) => {
    if (open) {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      const inner = modal.querySelector('.modal-content');
      if (inner) inner.classList.remove('scale-95', 'opacity-0');
      document.body.classList.add('overflow-hidden');
    } else {
      modal.classList.add('opacity-0', 'pointer-events-none');
      const inner = modal.querySelector('.modal-content');
      if (inner) inner.classList.add('scale-95', 'opacity-0');
      document.body.classList.remove('overflow-hidden');
    }
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleModal(true);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => toggleModal(false));
  }

  // Close modal when clicking outside the content panel
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      toggleModal(false);
    }
  });

  // Handle Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name') as HTMLInputElement;
      const emailInput = document.getElementById('form-email') as HTMLInputElement;
      const subjectInput = document.getElementById('form-subject') as HTMLInputElement;
      const messageInput = document.getElementById('form-message') as HTMLTextAreaElement;

      let hasError = false;

      // Clean previous error marks
      [nameInput, emailInput, subjectInput].forEach(input => {
        if (input) {
          input.classList.remove('border-red-500', 'focus:border-red-500');
          input.classList.add('border-zinc-800', 'focus:border-brand');
        }
      });

      if (!nameInput || nameInput.value.trim().length < 2) {
        nameInput?.classList.add('border-red-500', 'focus:border-red-500');
        hasError = true;
      }

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
        emailInput?.classList.add('border-red-500', 'focus:border-red-500');
        hasError = true;
      }

      if (!subjectInput || subjectInput.value.trim().length < 3) {
        subjectInput?.classList.add('border-red-500', 'focus:border-red-500');
        hasError = true;
      }

      if (hasError) return;

      // Disable button to prevent double-submit
      const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement | null;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
      }

      const formData = new URLSearchParams();
      formData.set('form-name', form.getAttribute('name') || 'contact');
      formData.set('name', nameInput.value.trim());
      formData.set('email', emailInput.value.trim());
      formData.set('subject', subjectInput.value.trim());
      formData.set('message', messageInput ? messageInput.value.trim() : '');

      try {
        const response = await fetch(form.getAttribute('action') || '/', {
          method: form.getAttribute('method') || 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        });

        if (!response.ok) throw new Error('Server error');

        form.reset();
        toggleModal(false);

        if (successToast) {
          successToast.classList.remove('translate-y-24', 'opacity-0');
          setTimeout(() => {
            successToast.classList.add('translate-y-24', 'opacity-0');
          }, 3500);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Помилка відправки повідомлення. Спробуйте пізніше.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.style.opacity = '1';
        }
      }
    });
  }
}

// ==========================================
// 5. Scroll-triggered Stats Count-up (About Us)
// ==========================================
function initStatsCounter() {
  const statsElements = document.querySelectorAll('[data-countup]');
  if (statsElements.length === 0) return;

  const startCountUp = (el: HTMLElement) => {
    const target = parseInt(el.getAttribute('data-countup') || '0', 10);
    const duration = 2000; // 2 seconds animation
    const stepTime = Math.abs(Math.floor(duration / target));
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      el.textContent = current.toString();
      if (current >= target) {
        el.textContent = target + (el.getAttribute('data-suffix') || '');
        clearInterval(timer);
      }
    }, Math.max(stepTime, 15));
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        startCountUp(el);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statsElements.forEach(el => observer.observe(el));
}

// ==========================================
// 6. Navigation Active Links styling
// ==========================================
function highlightActiveNav() {
  const path = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Check matching routes
    const isHome = href === '/' || href === 'index.html' || href === './';
    const matchesHome = isHome && (path === '/' || path.endsWith('index.html'));
    const matchesPage = !isHome && path.includes(href);

    if (matchesHome || matchesPage) {
      link.classList.add('text-brand', 'font-semibold');
      link.classList.remove('text-zinc-400');
    } else {
      link.classList.remove('text-brand', 'font-semibold');
      link.classList.add('text-zinc-400');
    }
  });
}

// ==========================================
// 7. Dynamic Project Gallery (CRM-like)
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

      const card = document.createElement('div');
      card.className = 'glass-panel overflow-hidden rounded-xl group flex flex-col h-full';

      const imageWrap = document.createElement('div');
      imageWrap.className = 'relative h-64 overflow-hidden bg-zinc-900 shrink-0';

      const overlay = document.createElement('div');
      overlay.className = 'absolute inset-0 bg-black/40 z-10 transition-colors group-hover:bg-black/10 duration-300';

      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = name;
      img.loading = 'lazy';
      img.className = 'w-full h-full object-cover transition-transform duration-700 group-hover:scale-110';

      const badgeWrap = document.createElement('div');
      badgeWrap.className = 'absolute top-4 right-4 z-20';

      const badge = document.createElement('span');
      badge.className = 'bg-brand text-zinc-950 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded shadow-lg';
      badge.textContent = category;

      const body = document.createElement('div');
      body.className = 'p-8 flex flex-col grow';

      const locationEl = document.createElement('div');
      locationEl.className = 'flex items-center gap-2 mb-3 text-zinc-400 text-xs font-medium';
      locationEl.append(createLocationIcon(), document.createTextNode(location));

      const title = document.createElement('h3');
      title.className = 'text-xl font-bold uppercase tracking-wide mb-3 group-hover:text-brand transition-colors';
      title.textContent = name;

      const description = document.createElement('p');
      description.className = 'text-zinc-400 text-sm font-light leading-relaxed grow';
      description.textContent = desc;

      badgeWrap.appendChild(badge);
      imageWrap.append(overlay, img, badgeWrap);
      body.append(locationEl, title, description);
      card.append(imageWrap, body);
      container.appendChild(card);
    });
    
  } catch (error) {
    console.error('Error loading dynamic projects:', error);
  }
}

// ==========================================
// 8. Dynamic Clients Gallery
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
      div.className = 'glass-panel p-6 rounded-xl flex items-center justify-center h-32 group hover:bg-zinc-900/80 transition-colors';

      const img = document.createElement('img');
      img.src = normalizeMediaUrl(client.imageUrl);
      img.alt = String(client.name || '');
      img.className = 'max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 opacity-60 group-hover:opacity-100';

      div.appendChild(img);
      container.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

// ==========================================
// Initialize everything on DOM Content Loaded
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initHeroSlider();
  initTestimonialSlider();
  initContactModal();
  initStatsCounter();
  highlightActiveNav();
  initLanguageToggle(); // This will call initDynamicProjects and initDynamicClients automatically
});
