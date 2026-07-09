# Design Center - Website & CRM

## Overview
This is a modern, fast static website built with Vite, TypeScript, and TailwindCSS. It includes a built-in static CRM powered by JSON files, allowing administrators to edit projects and clients via an Admin Dashboard (Decap CMS).

## Development Setup
1. Clone the repository
2. Run `npm install`
3. Run `npm run dev` to start the local development server

## Architecture
- **Frontend:** HTML, TailwindCSS, TypeScript, Vite
- **Localization:** Client-side i18n via `src/locales.ts` and `data-i18n` attributes in HTML.
- **CRM / Admin:** Decap CMS running locally without a database. Data is saved in `public/data/projects.json` and `public/data/clients.json`. Access the admin panel at `/admin/index.html`.

## Deployment
This project is configured to auto-deploy to Cityhost via GitHub Actions.
When a commit is pushed to the `main` branch (e.g., via the Admin Dashboard saving a change), GitHub will:
1. Build the static assets (`npm run build`)
2. Connect to Cityhost via FTP
3. Upload the `dist/` folder to `public_html/`

**Required Secrets:**
Ensure the following secrets are set in **GitHub -> Settings -> Secrets and variables -> Actions**:
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
