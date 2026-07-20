import { readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, '.generated/projects');
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const escape = (value = '') => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const markdown = (value = '') => escape(value).split(/\n{2,}/).filter(Boolean).map(block => {
  if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`;
  if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`;
  return `<p>${block.replace(/\n/g, '<br>')}</p>`;
}).join('');
const required = ['id', 'name_uk', 'name_en', 'description_uk', 'description_en', 'body_uk', 'body_en', 'imageUrl', 'imageAlt_uk', 'imageAlt_en'];
function validate(item, seen) {
  if (!item || typeof item !== 'object') throw new Error('Every project must be an object.');
  if (!slugPattern.test(item.id || '')) throw new Error(`Invalid project slug: ${item.id || '(missing)'}`);
  if (seen.has(item.id)) throw new Error(`Duplicate project slug: ${item.id}`); seen.add(item.id);
  for (const key of required) if (!String(item[key] || '').trim()) throw new Error(`Project ${item.id}: missing required ${key}`);
  if (!String(item.imageUrl).startsWith('/')) throw new Error(`Project ${item.id}: imageUrl must be a root-relative URL.`);
  if (item.gallery && !Array.isArray(item.gallery)) throw new Error(`Project ${item.id}: gallery must be a list.`);
  for (const image of item.gallery || []) for (const key of ['imageUrl', 'alt_uk', 'alt_en']) if (!String(image[key] || '').trim()) throw new Error(`Project ${item.id}: gallery item missing ${key}`);
}
function content(item, lang) {
  const t = lang === 'uk' ? { meta: 'Проєкт', location: 'Локація' } : { meta: 'Project', location: 'Location' };
  const get = key => escape(item[`${key}_${lang}`] || item[`${key}_uk`] || '');
  const galleryImages = [{ imageUrl: item.imageUrl, alt: item[`imageAlt_${lang}`] || item.imageAlt_uk }, ...(item.gallery || []).map(image => ({ imageUrl: image.imageUrl, alt: image[`alt_${lang}`] || image.alt_uk, caption: image[`caption_${lang}`] || image.caption_uk }))];
  const gallery = galleryImages.map((image, index) => `<button type="button" class="project-thumbnail${index === 0 ? ' is-selected' : ''}" data-project-thumbnail data-image-src="${escape(image.imageUrl)}" data-image-alt="${escape(image.alt)}" aria-label="${escape(image.alt)}" aria-pressed="${index === 0 ? 'true' : 'false'}"><img src="${escape(image.imageUrl)}" alt="" loading="${index === 0 ? 'eager' : 'lazy'}"></button>`).join('');
  const interval = Math.max(1, Number(item.galleryInterval) || 5) * 1000;
  return `<p class="project-kicker">${t.meta}</p><h1>${get('name')}</h1><p class="project-meta">${get('categoryLabel')}${item.location_uk ? ` · ${t.location}: ${get('location')}` : ''}</p><section class="project-media" data-project-gallery data-gallery-autoplay="${item.galleryAutoplay !== false}" data-gallery-interval="${interval}" aria-label="Project images"><img class="project-hero" data-project-main-image src="${escape(item.imageUrl)}" alt="${get('imageAlt')}" fetchpriority="high"><div class="project-gallery" data-project-thumbnail-strip>${gallery}</div></section><div class="project-body">${markdown(item[`body_${lang}`])}</div>`;
}
const contact = `<section class="contact-section"><div class="w-full md:w-5/6 max-w-6xl mx-auto px-5 py-16"><h2 data-i18n="contact.title">Почнімо ваш проєкт</h2><p data-i18n="contact.description">Розкажіть про задачу — ми зв’яжемося найближчим часом.</p><a href="/contact.html" class="dc-btn mt-6" data-i18n="nav.contact">Контакти</a></div></section>`;
const data = JSON.parse(await readFile(resolve(root, 'public/data/projects.json'), 'utf8'));
const items = (data.items || data).filter(item => item.published !== false); const seen = new Set(); items.forEach(item => validate(item, seen));
const template = await readFile(resolve(root, 'project.template.html'), 'utf8'); await rm(resolve(root, '.generated'), { recursive: true, force: true }); await mkdir(out, { recursive: true });
for (let i = 0; i < items.length; i++) { const item = items[i], previous = items[i - 1], next = items[i + 1]; const url = x => x ? `/projects/${encodeURIComponent(x.id)}.html` : '#'; const link = (x, lang, label) => x ? `<span data-project-nav-lang="${lang}"${lang === 'en' ? ' hidden' : ''}><small>${label}</small>${escape(x[`name_${lang}`])}</span>` : ''; const canonical = `https://design-center.com.ua/projects/${item.id}.html`; const replacements = { '__TITLE_UK__': escape(`${item.name_uk} — Дизайн Центр`), '__DESCRIPTION_UK__': escape(item.description_uk), '__CANONICAL__': canonical, '__IMAGE__': escape(`https://design-center.com.ua${item.imageUrl}`), '__CONTENT_UK__': content(item, 'uk'), '__CONTENT_EN__': content(item, 'en'), '__PREV_URL__': url(previous), '__NEXT_URL__': url(next), '__PREV_LINK__': `${link(previous, 'uk', '← Попередній проєкт')} ${link(previous, 'en', '← Previous project')}`, '__NEXT_LINK__': `${link(next, 'uk', 'Наступний проєкт →')} ${link(next, 'en', 'Next project →')}`, '__CONTACT_SECTION__': contact, '__JSON_LD__': JSON.stringify({ '@context': 'https://schema.org', '@type': 'CreativeWork', name: item.name_uk, description: item.description_uk, image: `https://design-center.com.ua${item.imageUrl}`, url: canonical }) }; let page = template; for (const [token, value] of Object.entries(replacements)) page = page.replaceAll(token, value); await writeFile(resolve(out, `${item.id}.html`), page); }
console.log(`Generated ${items.length} project pages.`);
