# Design Center — вебсайт / website

**Українська:** [читати нижче](#українська)

**English:** [read below](#english)

Документи фінальної передачі / Final handover documents:

- [Українська](HANDOVER_UK.md)
- [English](HANDOVER_EN.md)
- [Покажчик / Index](HANDOVER.md)

Технічні довідники / Technical references:

- [Data and form contracts](API_Schema.md)
- [Current user flows](UserFlow.md)

---

## Українська

### Огляд

Це репозиторій статичного вебсайту [design-center.com.ua](https://design-center.com.ua). Сайт створено на Vite, TypeScript і Tailwind CSS; WordPress або окрема база даних не використовуються.

Контент зберігається безпосередньо в GitHub:

- проєкти — `public/data/projects.json` і `public/data/projects/`;
- партнери — `public/data/clients.json` і `public/clients/`;
- редактори працюють через Decap CMS за адресою `/admin/`;
- кожна публікація створює commit у гілці `main`;
- GitHub Actions збирає `dist/` і синхронізує його з Cityhost через FTP.

### Як редактору оновити сайт

1. Відкрийте `https://design-center.com.ua/admin/`.
2. Увійдіть через особистий GitHub-акаунт із правом запису до `design-center-com-ua/homepage`.
3. Оберіть **CRM: Проєкти** або **CRM: Партнери**.
4. Відкрийте список, змініть наявний запис або натисніть **Add …**.
5. Заповніть усі потрібні українські та англійські поля й завантажте зображення.
6. Натисніть **Publish**.
7. Зачекайте приблизно 60–90 секунд і оновіть публічну сторінку.

Ця коротка інструкція також доступна в Internal через зелену кнопку **Довідка**. Мова панелі перемикається кнопкою **УКР | EN**.

### Правила для проєктів

- `id` — унікальний slug із малих латинських літер, цифр і дефісів, наприклад `valeriy-holub-dentistry`.
- URL сторінки формується як `/projects/{id}.html`; не змінюйте `id` після публікації без потреби змінити URL.
- Вимкнений `published` прибирає проєкт із галереї та зі згенерованих сторінок.
- Спочатку додається обкладинка, потім необов’язкові зображення галереї.
- Зображення галереї можна перетягувати, щоб змінити порядок.
- Назви, короткі описи, повний текст і alt-тексти потрібно заповнити обома мовами.
- Автопрокрутку галереї можна вимкнути або налаштувати від 1 до 60 секунд; типове значення — 5 секунд.

### Що відбувається після Publish

```text
Internal / Decap CMS
  → змінює projects.json або clients.json і додає зображення
  → створює commit безпосередньо в main через GitHub API
  → push до main запускає .github/workflows/deploy.yml
  → npm ci
  → npm run build
  → генератор перевіряє проєкти й створює dist/projects/{id}.html
  → увесь dist/ синхронізується з Cityhost через FTP
  → оновлений сайт стає публічним
```

Галерея робіт завантажує `public/data/projects.json` у браузері з політикою `cache: "no-store"`, щоб після нового розгортання не показувати застарілий список. Окремі сторінки проєктів генеруються як статичні HTML-файли під час збірки.

### Якщо опублікований запис не з’явився

1. Зачекайте дві хвилини й оновіть сторінку.
2. Перевірте, чи з’явився commit у гілці `main`.
3. Відкрийте [GitHub Actions](https://github.com/design-center-com-ua/homepage/actions) і перевірте останнє розгортання.
4. Перевірте `https://design-center.com.ua/data/projects.json`.
5. Для проєкту перевірте `https://design-center.com.ua/projects/{id}.html`.

Діагностика:

- запису немає в GitHub — проблема з CMS, доступом або OAuth;
- запис є, але workflow неуспішний — проблема збірки або FTP;
- JSON оновлений, але сторінка повертає 404 — перевірте генерацію `dist/projects/`;
- JSON і сторінка доступні, але картки немає — перевірте консоль браузера та політику кешування.

### Локальна розробка

Потрібен Node.js 20.19+ або 22.12+.

```bash
npm ci
npm run dev
```

`npm run dev` спочатку генерує сторінки проєктів. Локальна адреса проєкту: `/projects/{id}.html`.

Production-збірка:

```bash
npm run build
```

Після збірки перевірте, що сторінки існують у `dist/projects/`, а не в `dist/.generated/`.

Локальна тестова CMS без входу та збереження:

```text
http://localhost:5173/admin/index.html?backend=test
```

### GitHub OAuth

Decap CMS використовує GitHub backend із репозиторієм `design-center-com-ua/homepage` і гілкою `main`. PHP-модуль у `public/admin/oauth/` безпечно обмінює GitHub authorization code на токен. OAuth Client Secret має зберігатися лише на Cityhost, ніколи не в Git.

OAuth App:

- Homepage URL: `https://design-center.com.ua`
- Callback URL: `https://design-center.com.ua/admin/oauth/callback.php`

Перевірка конфігурації, яка не показує секрет:

```text
https://design-center.com.ua/admin/oauth/status.php
```

Очікувана відповідь:

```json
{"configured":true,"provider":"github"}
```

Повна конфігурація OAuth, доступів, секретів, відновлення та передачі описана в [HANDOVER_UK.md](HANDOVER_UK.md).

### Розгортання

Workflow `.github/workflows/deploy.yml` запускається для кожного push до `main` і потребує GitHub Actions secrets:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

Не додавайте паролі, токени, приватні SSH-ключі, OAuth Client Secret або коди відновлення до репозиторію.

---

## English

### Overview

This repository contains the static website for [design-center.com.ua](https://design-center.com.ua). It uses Vite, TypeScript, and Tailwind CSS; there is no WordPress installation or separate content database.

Content is stored directly in GitHub:

- projects — `public/data/projects.json` and `public/data/projects/`;
- partners — `public/data/clients.json` and `public/clients/`;
- editors work through Decap CMS at `/admin/`;
- every publication creates a commit on `main`;
- GitHub Actions builds `dist/` and synchronizes it to Cityhost over FTP.

### Editing the website

1. Open `https://design-center.com.ua/admin/`.
2. Sign in with an individual GitHub account that has write access to `design-center-com-ua/homepage`.
3. Choose **CRM: Projects** or **CRM: Partners**.
4. Open the list, edit an existing record, or select **Add …**.
5. Complete the required Ukrainian and English fields and upload the images.
6. Select **Publish**.
7. Wait approximately 60–90 seconds and refresh the public page.

The same short guide is available inside Internal through the green **Guide** button. Switch the panel language with **УКР | EN**.

### Project rules

- `id` is a unique slug containing lowercase Latin letters, numbers, and hyphens, for example `valeriy-holub-dentistry`.
- The page URL is `/projects/{id}.html`; do not change `id` after publishing unless the URL should change.
- Turning off `published` removes the project from the gallery and generated page output.
- Add the cover image first, followed by optional gallery images.
- Drag gallery images to change their order.
- Complete names, short descriptions, long text, and alt text in both languages.
- Gallery autoplay can be disabled or configured from 1 to 60 seconds; the default is 5 seconds.

### What happens after Publish

```text
Internal / Decap CMS
  → updates projects.json or clients.json and adds image files
  → creates a commit directly on main through the GitHub API
  → the push to main triggers .github/workflows/deploy.yml
  → npm ci
  → npm run build
  → the generator validates projects and creates dist/projects/{id}.html
  → the complete dist/ directory is synchronized to Cityhost over FTP
  → the updated website becomes public
```

The work gallery fetches `public/data/projects.json` in the browser with `cache: "no-store"` so a new deployment does not leave visitors with a stale project list. Individual project pages are generated as static HTML during the build.

### If a published record does not appear

1. Wait two minutes and refresh the page.
2. Confirm that a commit appeared on `main`.
3. Open [GitHub Actions](https://github.com/design-center-com-ua/homepage/actions) and inspect the latest deployment.
4. Check `https://design-center.com.ua/data/projects.json`.
5. For a project, check `https://design-center.com.ua/projects/{id}.html`.

Diagnosis:

- no record in GitHub — CMS, access, or OAuth problem;
- record exists but the workflow failed — build or FTP problem;
- live JSON is current but the page returns 404 — inspect `dist/projects/` generation;
- JSON and page are live but the card is absent — inspect the browser console and caching policy.

### Local development

Node.js 20.19+ or 22.12+ is required.

```bash
npm ci
npm run dev
```

`npm run dev` generates project pages before starting Vite. A local project URL is `/projects/{id}.html`.

Production build:

```bash
npm run build
```

After building, verify that pages exist under `dist/projects/`, not `dist/.generated/`.

Local CMS sandbox without authentication or persistence:

```text
http://localhost:5173/admin/index.html?backend=test
```

### GitHub OAuth

Decap CMS uses the GitHub backend with repository `design-center-com-ua/homepage` and branch `main`. The PHP bridge in `public/admin/oauth/` securely exchanges the GitHub authorization code for an access token. The OAuth Client Secret must remain on Cityhost and must never be committed to Git.

OAuth App:

- Homepage URL: `https://design-center.com.ua`
- Callback URL: `https://design-center.com.ua/admin/oauth/callback.php`

Configuration check that never returns the secret:

```text
https://design-center.com.ua/admin/oauth/status.php
```

Expected response:

```json
{"configured":true,"provider":"github"}
```

The complete OAuth, access, secrets, recovery, and ownership documentation is in [HANDOVER_EN.md](HANDOVER_EN.md).

### Deployment

The `.github/workflows/deploy.yml` workflow runs for every push to `main` and requires these GitHub Actions secrets:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`

Never commit passwords, tokens, private SSH keys, the OAuth Client Secret, or recovery codes.
