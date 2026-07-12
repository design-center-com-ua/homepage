# Design Center (design-center.com.ua) - Website Source Code

This repository contains the source code for the new, lightning-fast static website for **Design Center**.

The public website is statically generated and does not use WordPress or a traditional database. Content is stored in this GitHub repository and edited through a Decap CMS admin dashboard.

---

## 📝 For the Client (How to Edit Content)

You do not need to understand code or use this GitHub repository to update the website!

> **Note:** This same guide is available inside the admin panel itself — click the green **"Guide" / "Довідка"** button in the bottom-right corner after opening the **Internal** page. The panel is bilingual; switch it with the **УКР | EN** button in the bottom-left corner.

### How to add/edit Projects and Partners:
1. Go to your live website and add `/admin` to the end of the URL (e.g., `https://design-center.com.ua/admin`). This is the **Internal** page.
2. Log in with the authentication method shown on screen. GitHub sign-in is being introduced as the client-owned replacement for Netlify Identity.
3. You will see a friendly **Admin Dashboard** (Decap CMS).
4. On the left, choose **"CRM: Projects"** (the work gallery items) or **"CRM: Partners"** (the partner logos).
5. Click the **"… List"** to open the existing entries.
6. Edit text or upload new images. Fill in **both the Ukrainian and English** fields — the site is bilingual.
7. To add a new item, click the **"Add …"** button at the bottom of the list.
8. When you are done, click the green **"Publish"** button at the top.

### How long does it take to update?
When you click "Publish" in the Admin Dashboard, the changes are saved directly here to GitHub. 
GitHub will then **automatically** rebuild the website and upload the fresh files to Cityhost. 
**Please wait about 60 to 90 seconds** after clicking Publish, then refresh your live website to see the changes!

### 🔐 Admin access

The target authentication method is the client-owned **GitHub account**:

- Open `/admin` and choose GitHub sign-in once the migration is complete.
- The GitHub account must have write access to `design-center-com-ua/homepage`.
- Every editor must use an individual GitHub account; never share the repository owner password.
- Enable two-factor authentication and store recovery codes securely.
- Add or remove editors through the repository's **Settings → Collaborators** page.

During the staged migration, the existing Netlify Identity login remains the default rollback path. The GitHub flow is tested at `/admin/index.html?backend=github` and becomes the default only after the OAuth App credentials are installed and a complete publish test succeeds.

> **Testing the panel locally (developers):** the dev server has no login service, so open `http://localhost:5173/admin/index.html?backend=test` to explore the CMS with an in-memory sandbox (no login, nothing is saved).

---

## 💻 For Developers (Technical Architecture)

If a developer needs to make structural changes to the website design or add new pages, here is how the architecture works:

### Tech Stack
- **Frontend Engine:** Vite (HTML, CSS, TypeScript)
- **Styling:** TailwindCSS
- **CMS:** Decap CMS (Git-based CMS)
- **CMS Authentication:** client-owned GitHub OAuth through a Cityhost PHP bridge
- **Temporary Rollback Authentication:** Netlify Identity / Git Gateway
- **Hosting / CI/CD:** Cityhost via GitHub Actions

### GitHub OAuth migration

Decap CMS cannot safely exchange a GitHub OAuth code entirely in browser JavaScript because the OAuth client secret must remain server-side. The repository therefore includes a small PHP bridge in `public/admin/oauth/`.

#### 1. Create the client-owned GitHub OAuth App

Create an OAuth App under the client-controlled GitHub account or organization:

- **Application name:** `Design Center Internal`
- **Homepage URL:** `https://design-center.com.ua`
- **Authorization callback URL:** `https://design-center.com.ua/admin/oauth/callback.php`

The client ID is not secret. The client secret must never be committed to Git, placed in the CMS HTML, or stored in a GitHub Actions log.

#### 2. Configure Cityhost

Set these PHP environment variables on Cityhost:

```text
GITHUB_OAUTH_CLIENT_ID=<client-owned OAuth App client ID>
GITHUB_OAUTH_CLIENT_SECRET=<client-owned OAuth App client secret>
GITHUB_OAUTH_REDIRECT_URI=https://design-center.com.ua/admin/oauth/callback.php
GITHUB_OAUTH_CMS_ORIGIN=https://design-center.com.ua
GITHUB_OAUTH_SCOPE=public_repo read:user user:email
```

If Cityhost does not expose PHP environment variables, upload a file named `.design-center-oauth.php` to the parent `www` directory, outside `www/design-center.com.ua`. The bridge discovers that location automatically. A different absolute location can be selected with `DESIGN_CENTER_OAUTH_CONFIG`.

```php
<?php
return [
    'client_id' => 'CLIENT_ID',
    'client_secret' => 'CLIENT_SECRET',
    'redirect_uri' => 'https://design-center.com.ua/admin/oauth/callback.php',
    'cms_origin' => 'https://design-center.com.ua',
    'scope' => 'public_repo read:user user:email',
];
```

The public status endpoint `/admin/oauth/status.php` reports whether both credentials are available, but never returns the secret.

#### 3. Test before cutover

1. Confirm `/admin/oauth/status.php` returns `"configured": true`.
2. Open `/admin/index.html?backend=github`.
3. Sign in with a GitHub collaborator account that has write access to this repository.
4. Read existing projects and partners.
5. Make and publish a harmless content change.
6. Confirm the commit appears in GitHub and the Cityhost deployment succeeds.

The normal `/admin` URL continues using Netlify during this test. After the round trip succeeds, change the default backend in `public/admin/index.html` from `netlify` to `github`, deploy once, then disable Netlify Identity/Git Gateway after a rollback period.

#### Security notes

- The OAuth bridge validates a short-lived, HTTP-only `state` cookie before exchanging a code.
- The callback only communicates with `https://design-center.com.ua`.
- The default `public_repo` scope is sufficient while this repository is public. If the repository becomes private, change it to `repo read:user user:email`.
- GitHub collaborator access is the source of truth for CMS authorization.

### Local Development
To run this project on your local machine:

1. **Install Dependencies:**
   ```bash
   npm ci
   ```
2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
3. **Build for Production:**
   ```bash
   npm run build
   ```
   *(This generates the static files into the `dist/` folder).*

### Deployment Pipeline
This repository has an automated CI/CD pipeline configured in `.github/workflows/deploy.yml`. 
Every time code is pushed to the `main` branch (either by a developer pushing code, or by the client clicking "Publish" in the CMS), GitHub Actions will automatically run `npm run build` and FTP the compiled `dist/` folder directly to the Cityhost server.

**Required GitHub Secrets for Deployment:**
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
