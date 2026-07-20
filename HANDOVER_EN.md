# Design Center Website — Final Handover

**Website:** https://design-center.com.ua  
**Admin:** https://design-center.com.ua/admin/  
**Repository:** https://github.com/design-center-com-ua/homepage  
**Client contact:** contact@design-center.com.ua  
**Handover date:** 13 July 2026

## Projects

Projects are edited through Internal → CRM: Projects. Each published item creates `/projects/{id}.html`; do not change the lowercase slug unless the URL should change. The public work gallery is image-led, and each project page includes a selectable main image with clickable thumbnails below it.

Add the cover image first, then optional gallery images. Drag gallery items in Internal to set their display order. Add alt text in both Ukrainian and English for the cover and each gallery image; captions are optional. Complete both-language long text. Editors can turn gallery auto-play on or off and set its interval to 1–60 seconds (default: 5 seconds). The project page links to the dedicated contact page at `/contact.html`. Publish when ready and wait for the automatic build.

This document summarizes ownership, access, operation, deployment, security, and maintenance of the Design Center website. Replace the placeholders in the credential inventory only inside the client's password manager. Never commit completed passwords, tokens, secrets, or recovery codes to this repository.

## 1. Final system overview

- The public website is a static Vite site built from HTML, CSS, and TypeScript.
- Projects and partner logos are stored as JSON and image files in GitHub.
- Editors manage this content through Decap CMS at `/admin/`.
- Admin authentication uses the client-owned GitHub account and a GitHub OAuth App.
- The OAuth code exchange is handled by a small PHP bridge on Cityhost.
- GitHub Actions builds the site and deploys `dist/` to Cityhost over FTP.
- Netlify is no longer used by the website or admin panel.
- Google Analytics measurement ID: `G-Y4FJ8HHW7L`.

## 2. Client ownership

The following services should remain under client-controlled accounts:

- GitHub account/repository owner: `design-center-com-ua`
- Primary contact email: `contact@design-center.com.ua`
- Cityhost hosting account
- Domain registrar and DNS account
- GitHub OAuth App: `Design Center Internal`
- Google Analytics property

Every human editor should use an individual GitHub account with write access. Do not share the repository owner's password. Enable two-factor authentication on all accounts that support it.

## 3. Credential inventory

Store the completed values in the client's password manager, not in this file.

### GitHub owner account

| Item | Value |
|---|---|
| Username | `design-center-com-ua` |
| Sign-in email | `[GITHUB_ACCOUNT_EMAIL]` |
| Password | `[STORE_IN_PASSWORD_MANAGER]` |
| Two-factor method | `[AUTHENTICATOR_OR_SECURITY_KEY]` |
| Recovery codes | `[STORE_AS_SECURE_ATTACHMENT]` |
| Repository | `design-center-com-ua/homepage` |

### GitHub OAuth App

| Item | Value |
|---|---|
| Application name | `Design Center Internal` |
| Homepage URL | `https://design-center.com.ua` |
| Callback URL | `https://design-center.com.ua/admin/oauth/callback.php` |
| Client ID | `[GITHUB_OAUTH_CLIENT_ID]` |
| Client Secret | `[GITHUB_OAUTH_CLIENT_SECRET]` |
| Secret rotation date | `[YYYY-MM-DD]` |

The Client Secret is stored only on Cityhost in `private-config/oauth.php`. The directory is protected from HTTP access. Never paste the secret into GitHub, a support ticket, email, or chat.

### Cityhost

| Item | Value |
|---|---|
| Control-panel URL | `[CITYHOST_CONTROL_PANEL_URL]` |
| Account/login email | `[CITYHOST_LOGIN]` |
| Password | `[STORE_IN_PASSWORD_MANAGER]` |
| Customer/account ID | `[CITYHOST_ACCOUNT_ID]` |
| FTP server | `[FTP_SERVER]` |
| FTP port | `[FTP_PORT_DEFAULT_21]` |
| FTP username | `[FTP_USERNAME]` |
| FTP password | `[FTP_PASSWORD]` |
| Deployment directory | `./www/design-center.com.ua/` |
| Website document root | `/var/www/[CITYHOST_ACCOUNT]/www/design-center.com.ua/` |

### Domain and DNS

| Item | Value |
|---|---|
| Registrar/provider | `[DOMAIN_REGISTRAR]` |
| Account email | `[DOMAIN_ACCOUNT_EMAIL]` |
| Password | `[STORE_IN_PASSWORD_MANAGER]` |
| Domain expiry date | `[YYYY-MM-DD]` |
| Auto-renewal enabled | `[YES/NO]` |
| DNS provider | `[DNS_PROVIDER]` |

### Google Analytics

| Item | Value |
|---|---|
| Measurement ID | `G-Y4FJ8HHW7L` |
| Account owner email | `[GOOGLE_ANALYTICS_OWNER_EMAIL]` |
| Property name | `[GA4_PROPERTY_NAME]` |
| Recovery/2FA details | `[STORE_IN_PASSWORD_MANAGER]` |

### Developer SSH access

| Item | Value |
|---|---|
| Git remote | `git@github-design-center:design-center-com-ua/homepage.git` |
| Local SSH host alias | `github-design-center` |
| Key title in GitHub | `[GITHUB_SSH_KEY_TITLE]` |
| Private key location | `~/.ssh/id_ed25519_design_center` |
| Key passphrase | `[STORE_IN_PASSWORD_MANAGER]` |

Never copy the private SSH key into this repository. Remove obsolete keys from GitHub under **Settings → SSH and GPG keys**.

## 4. GitHub Actions secrets

The deployment workflow is `.github/workflows/deploy.yml`. These repository secrets must exist under **Settings → Secrets and variables → Actions**:

| Secret name | Stored value |
|---|---|
| `FTP_SERVER` | `[FTP_SERVER]` |
| `FTP_USERNAME` | `[FTP_USERNAME]` |
| `FTP_PASSWORD` | `[FTP_PASSWORD]` |

Do not place secret values in the workflow file. The workflow builds with Node.js 24 and uploads `dist/` to Cityhost.

## 5. Editing website content

1. Open https://design-center.com.ua/admin/.
2. Select **Login with GitHub**.
3. Sign in with a GitHub account that has write access to the repository.
4. Choose **CRM: Projects** or **CRM: Partners**.
5. Edit the content and upload images where required.
6. Complete both Ukrainian and English fields.
7. Select **Publish**.
8. Wait approximately 60–90 seconds, then refresh the public website.

Publishing creates a GitHub commit and triggers the Cityhost deployment automatically. The GitHub Actions result is visible at:

https://github.com/design-center-com-ua/homepage/actions

Partner uploads are stored in `public/clients/`. Project uploads are stored in `public/data/projects/`.

## 6. Managing editor access

Add or remove editors in the repository under **Settings → Collaborators**.

- Give access only to people who need to edit the site.
- Each editor uses a separate GitHub account.
- Write access is required for publishing through Decap CMS.
- Require two-factor authentication where possible.
- Remove access promptly when a person no longer needs it.

An OAuth token cannot grant more repository access than its GitHub user already has.

## 7. OAuth configuration on Cityhost

The deployed PHP bridge is located at `public/admin/oauth/` in the repository. Cityhost's restricted file manager uses this protected configuration file:

```text
private-config/oauth.php
```

Expected format:

```php
<?php

return [
    'client_id' => '[GITHUB_OAUTH_CLIENT_ID]',
    'client_secret' => '[GITHUB_OAUTH_CLIENT_SECRET]',
    'redirect_uri' => 'https://design-center.com.ua/admin/oauth/callback.php',
    'cms_origin' => 'https://design-center.com.ua',
    'scope' => 'public_repo read:user user:email',
];
```

The file must never be committed. `private-config/.htaccess` must remain present. Verify configuration without exposing the secret at:

https://design-center.com.ua/admin/oauth/status.php

Expected response:

```json
{"configured":true,"provider":"github"}
```

## 8. Deployment and recovery

Normal deployment:

1. A commit reaches `main`.
2. GitHub Actions runs `npm ci` and `npm run build`.
3. The generated `dist/` directory is synchronized to Cityhost by FTP.
4. Verify the public site and `/admin/` after deployment.

If deployment fails:

1. Open the failed run in GitHub Actions.
2. Confirm whether the build or FTP step failed.
3. A Cityhost `control socket` or `ETIMEDOUT` error normally indicates temporary FTP connectivity; retry the workflow after confirming FTP access.
4. Check that `FTP_SERVER`, `FTP_USERNAME`, and `FTP_PASSWORD` remain valid.
5. Never print secrets into workflow logs.

For a code rollback, revert the relevant commit through Git and push the new revert commit to `main`. Do not use destructive history rewrites on the deployed branch.

## 9. Local development

Node.js 20.19+ or 22.12+ is required. `npm run dev` generates project pages before Vite starts; open a project locally at `/projects/{id}.html`.

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm run build
```

The local CMS sandbox is available at:

```text
http://localhost:5173/admin/index.html?backend=test
```

The sandbox does not authenticate or save changes.

## 10. Costs and service status

- GitHub OAuth authentication has no separate usage fee.
- GitHub Actions usage for this public repository is expected to remain within GitHub's free public-repository allowance, subject to GitHub's current terms.
- Cityhost hosting and domain registration remain the client's normal paid services.
- Netlify is not required and can remain disabled or be deleted after confirming no unrelated client property uses it.
- Google Analytics 4 has no charge for this standard implementation.

Review provider pricing and terms periodically because third-party services can change them.

## 11. Security checklist

- [ ] GitHub owner account uses 2FA.
- [ ] Cityhost account uses the strongest available authentication.
- [ ] Recovery codes are stored securely offline or in the password manager.
- [ ] OAuth Client Secret exists only on Cityhost.
- [ ] FTP credentials exist only in the password manager and GitHub Actions secrets.
- [ ] `private-config/` returns HTTP 403.
- [ ] Former editors and obsolete SSH keys have been removed.
- [ ] Domain auto-renewal and billing contact are current.
- [ ] OAuth and FTP secrets have a documented rotation date.

## 12. Optional future improvements

The core website and administration workflow are operational. Optional SEO work not required for normal operation includes:

- `robots.txt`
- `sitemap.xml`
- canonical URLs
- Open Graph/social-sharing metadata
- `LocalBusiness` structured data
- Search Console registration
- separate indexable URLs for the English-language version

## 13. Acceptance record

| Check | Status/date |
|---|---|
| Public pages reviewed | `[CONFIRMED / YYYY-MM-DD]` |
| Mobile layout reviewed | `[CONFIRMED / YYYY-MM-DD]` |
| GitHub admin login tested | `[CONFIRMED / YYYY-MM-DD]` |
| Project publish tested | `[CONFIRMED / YYYY-MM-DD]` |
| Partner upload tested | `[CONFIRMED / YYYY-MM-DD]` |
| Cityhost deployment tested | `[CONFIRMED / YYYY-MM-DD]` |
| Analytics receiving data | `[CONFIRMED / YYYY-MM-DD]` |
| Credential inventory transferred | `[CONFIRMED / YYYY-MM-DD]` |
| Client acceptance | `[CLIENT NAME / SIGNATURE / DATE]` |
