# Design Center Data and Form Contracts

This document describes the data structures used by the current website, project-page generator, Decap CMS configuration, and contact endpoint.

## 1. Contact inquiry

The public forms submit JSON to `POST /sendmail.php`.

```typescript
interface ContactInquiry {
  name: string;
  email: string;
  subject: string;
  message?: string;
  website?: string;
}
```

Validation rules:

- `name`: required after trimming, 2–100 characters.
- `email`: required and must be a valid email address.
- `subject`: required after trimming, 3–200 characters; line breaks are removed server-side.
- `message`: optional, maximum 2,000 characters.
- `website`: honeypot field; real visitors must leave it empty.

The browser sends `Content-Type: application/json`. The endpoint returns JSON with HTTP status `200`, `400`, `405`, or `500`.

```typescript
interface ContactResponse {
  status: 'success' | 'error';
  message: string;
}
```

Messages are delivered to `design_office@ukr.net`. The visitor's email is used as `Reply-To`; the server uses `no-reply@design-center.com.ua` as the sender.

## 2. Project records

Projects are stored in `public/data/projects.json` under the top-level `items` array. Published records appear in the work galleries and generate `/projects/{id}.html` during `npm run build`.

```typescript
interface ProjectRecord {
  id: string;
  published: boolean;
  name_uk: string;
  name_en: string;
  category: string;
  categoryLabel_uk?: string;
  categoryLabel_en?: string;
  location_uk?: string;
  location_en?: string;
  description_uk: string;
  description_en: string;
  body_uk: string;
  body_en: string;
  imageUrl: string;
  imageAlt_uk: string;
  imageAlt_en: string;
  galleryAutoplay?: boolean;
  galleryInterval?: number;
  gallery?: ProjectGalleryImage[];
}

interface ProjectGalleryImage {
  imageUrl: string;
  alt_uk: string;
  alt_en: string;
  caption_uk?: string;
  caption_en?: string;
}
```

Build validation:

- `id` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$` and be unique.
- `name_*`, `description_*`, `body_*`, `imageAlt_*`, and `imageUrl` are required.
- The cover `imageUrl` must be a root-relative public path; every gallery image URL is required.
- Every gallery image requires Ukrainian and English alt text.
- `gallery`, when present, must be an array.
- `galleryInterval` is configured in the CMS from 1 to 60 seconds; runtime fallback is 5 seconds.
- `published: false` excludes the record from galleries and generated output.

The cover image is always the first project image. Optional gallery images follow in their JSON order. The current body renderer supports paragraphs plus `##` and `###` headings; other Markdown syntax is not expanded into rich HTML.

## 3. Partner records

Partners are stored in `public/data/clients.json` under `items` and are rendered in file order.

```typescript
interface PartnerRecord {
  id: string;
  name: string;
  imageUrl: string;
}
```

Partner logos are uploaded to `public/clients/` and published at `/clients/{filename}`.

## 4. Localization

Static interface strings live in `src/locales.ts`. HTML elements use dotted `data-i18n` keys, for example `data-i18n="about.title"`.

Project records use field suffixes:

- `_uk`: Ukrainian value.
- `_en`: English value.

The public site defaults to Ukrainian. The selected language is saved in browser `localStorage` under `lang`. Missing localized project values fall back to Ukrainian, then to an unsuffixed value when one exists.

## 5. CMS and publishing

The inline Decap CMS configuration is in `public/admin/index.html`.

- Backend: GitHub.
- Repository: `design-center-com-ua/homepage`.
- Branch: `main`.
- Project uploads: `public/data/projects/` → `/data/projects/`.
- Partner uploads: `public/clients/` → `/clients/`.

Each CMS publication creates a Git commit on `main`. GitHub Actions runs `npm ci`, `npm run build`, and deploys `dist/` to Cityhost over FTP.
