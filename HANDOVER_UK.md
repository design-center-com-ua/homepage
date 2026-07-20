# Вебсайт Design Center — фінальна передача проєкту

**Вебсайт:** https://design-center.com.ua  
**Адмінпанель:** https://design-center.com.ua/admin/  
**Репозиторій:** https://github.com/design-center-com-ua/homepage  
**Контакт клієнта:** contact@design-center.com.ua  
**Дата передачі:** 13 липня 2026 року

## Проєкти

Проєкти редагуються в Internal → CRM: Проєкти. Кожен опублікований запис створює сторінку `/projects/{id}.html`; не змінюйте slug малими латинськими літерами, якщо не потрібно змінити URL. Додайте повний текст і alt-текст обкладинки двома мовами. Галерея необов’язкова, але для кожного зображення потрібен alt-текст двома мовами. Натисніть Publish і зачекайте автоматичного збирання.

Цей документ описує власність, доступ, роботу, розгортання, безпеку та обслуговування вебсайту Design Center. Заповнюйте поля облікових даних лише в менеджері паролів клієнта. Ніколи не додавайте паролі, токени, секрети чи коди відновлення до цього репозиторію.

## 1. Фінальна структура системи

- Публічний вебсайт — статичний сайт на Vite, створений за допомогою HTML, CSS і TypeScript.
- Проєкти та логотипи партнерів зберігаються у GitHub як JSON-файли та зображення.
- Редактори керують вмістом через Decap CMS за адресою `/admin/`.
- Для входу використовується клієнтський GitHub-акаунт і GitHub OAuth App.
- Обмін OAuth-коду виконує PHP-модуль на Cityhost.
- GitHub Actions збирає сайт і завантажує `dist/` на Cityhost через FTP.
- Netlify більше не використовується вебсайтом або адмінпанеллю.
- Google Analytics Measurement ID: `G-Y4FJ8HHW7L`.

## 2. Власність клієнта

Під контролем клієнта мають залишатися:

- GitHub-акаунт і репозиторій: `design-center-com-ua`
- Основна електронна адреса: `contact@design-center.com.ua`
- Хостинг Cityhost
- Реєстратор домену та DNS
- GitHub OAuth App: `Design Center Internal`
- Ресурс Google Analytics

Кожен редактор повинен використовувати окремий GitHub-акаунт із правом запису. Не передавайте пароль власника репозиторію. Увімкніть двофакторну автентифікацію в усіх сервісах, де вона доступна.

## 3. Перелік облікових даних

Зберігайте заповнені значення в менеджері паролів клієнта, а не в цьому файлі.

### Обліковий запис власника GitHub

| Поле | Значення |
|---|---|
| Ім’я користувача | `design-center-com-ua` |
| Електронна адреса для входу | `[GITHUB_ACCOUNT_EMAIL]` |
| Пароль | `[STORE_IN_PASSWORD_MANAGER]` |
| Метод 2FA | `[AUTHENTICATOR_OR_SECURITY_KEY]` |
| Коди відновлення | `[STORE_AS_SECURE_ATTACHMENT]` |
| Репозиторій | `design-center-com-ua/homepage` |

### GitHub OAuth App

| Поле | Значення |
|---|---|
| Назва застосунку | `Design Center Internal` |
| Домашня сторінка | `https://design-center.com.ua` |
| Callback URL | `https://design-center.com.ua/admin/oauth/callback.php` |
| Client ID | `[GITHUB_OAUTH_CLIENT_ID]` |
| Client Secret | `[GITHUB_OAUTH_CLIENT_SECRET]` |
| Дата ротації секрету | `[YYYY-MM-DD]` |

Client Secret зберігається лише на Cityhost у `private-config/oauth.php`. Каталог захищено від HTTP-доступу. Ніколи не вставляйте секрет у GitHub, заявку до служби підтримки, електронний лист або чат.

### Cityhost

| Поле | Значення |
|---|---|
| URL панелі керування | `[CITYHOST_CONTROL_PANEL_URL]` |
| Логін або електронна адреса | `[CITYHOST_LOGIN]` |
| Пароль | `[STORE_IN_PASSWORD_MANAGER]` |
| ID клієнта/акаунта | `[CITYHOST_ACCOUNT_ID]` |
| FTP-сервер | `[FTP_SERVER]` |
| FTP-порт | `[FTP_PORT_DEFAULT_21]` |
| FTP-ім’я користувача | `[FTP_USERNAME]` |
| FTP-пароль | `[FTP_PASSWORD]` |
| Каталог розгортання | `./www/design-center.com.ua/` |
| Корінь вебсайту | `/var/www/[CITYHOST_ACCOUNT]/www/design-center.com.ua/` |

### Домен і DNS

| Поле | Значення |
|---|---|
| Реєстратор/провайдер | `[DOMAIN_REGISTRAR]` |
| Електронна адреса акаунта | `[DOMAIN_ACCOUNT_EMAIL]` |
| Пароль | `[STORE_IN_PASSWORD_MANAGER]` |
| Дата завершення реєстрації | `[YYYY-MM-DD]` |
| Автопродовження | `[YES/NO]` |
| DNS-провайдер | `[DNS_PROVIDER]` |

### Google Analytics

| Поле | Значення |
|---|---|
| Measurement ID | `G-Y4FJ8HHW7L` |
| Електронна адреса власника | `[GOOGLE_ANALYTICS_OWNER_EMAIL]` |
| Назва ресурсу | `[GA4_PROPERTY_NAME]` |
| Відновлення/2FA | `[STORE_IN_PASSWORD_MANAGER]` |

### SSH-доступ розробника

| Поле | Значення |
|---|---|
| Git remote | `git@github-design-center:design-center-com-ua/homepage.git` |
| Локальний SSH-псевдонім | `github-design-center` |
| Назва ключа у GitHub | `[GITHUB_SSH_KEY_TITLE]` |
| Приватний ключ | `~/.ssh/id_ed25519_design_center` |
| Парольна фраза | `[STORE_IN_PASSWORD_MANAGER]` |

Не копіюйте приватний SSH-ключ до репозиторію. Видаляйте застарілі ключі в GitHub у **Settings → SSH and GPG keys**.

## 4. Секрети GitHub Actions

Workflow розгортання: `.github/workflows/deploy.yml`. У **Settings → Secrets and variables → Actions** мають бути:

| Назва секрету | Значення |
|---|---|
| `FTP_SERVER` | `[FTP_SERVER]` |
| `FTP_USERNAME` | `[FTP_USERNAME]` |
| `FTP_PASSWORD` | `[FTP_PASSWORD]` |

Не записуйте значення секретів у workflow-файл. Workflow використовує Node.js 24, збирає сайт і завантажує `dist/` на Cityhost.

## 5. Редагування вебсайту

1. Відкрийте https://design-center.com.ua/admin/.
2. Натисніть **Login with GitHub**.
3. Увійдіть через GitHub-акаунт із правом запису.
4. Оберіть **CRM: Проєкти** або **CRM: Партнери**.
5. Відредагуйте дані та завантажте потрібні зображення.
6. Заповніть поля українською та англійською.
7. Натисніть **Publish**.
8. Зачекайте приблизно 60–90 секунд і оновіть сайт.

Публікація створює commit у GitHub і запускає розгортання на Cityhost. Стан розгортання:

https://github.com/design-center-com-ua/homepage/actions

Зображення партнерів зберігаються в `public/clients/`, а зображення проєктів — у `public/data/projects/`.

## 6. Керування редакторами

Додавайте або видаляйте редакторів у **Settings → Collaborators** репозиторію.

- Надавайте доступ лише тим, кому потрібно редагувати сайт.
- Кожен редактор використовує окремий GitHub-акаунт.
- Для публікації через Decap CMS потрібне право запису.
- Використовуйте двофакторну автентифікацію.
- Видаляйте доступ, коли він більше не потрібен.

OAuth-токен не може надати більше прав, ніж уже має користувач GitHub.

## 7. OAuth на Cityhost

PHP-модуль розташований у `public/admin/oauth/`. Конфігурація на Cityhost зберігається у захищеному файлі:

```text
private-config/oauth.php
```

Формат:

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

Файл не можна додавати до Git. `private-config/.htaccess` має залишатися на місці. Перевірка конфігурації:

https://design-center.com.ua/admin/oauth/status.php

Відповідь має містити:

```json
{"configured":true,"provider":"github"}
```

## 8. Розгортання та відновлення

Нормальне розгортання:

1. Commit потрапляє до `main`.
2. GitHub Actions виконує `npm ci` і `npm run build`.
3. `dist/` синхронізується з Cityhost через FTP.
4. Після розгортання перевіряються сайт і `/admin/`.

Якщо розгортання не вдалося:

1. Відкрийте невдалий запуск у GitHub Actions.
2. Визначте, чи сталася помилка під час збірки або FTP.
3. `control socket` або `ETIMEDOUT` зазвичай означає тимчасову проблему FTP; повторіть workflow після перевірки доступу.
4. Перевірте `FTP_SERVER`, `FTP_USERNAME` і `FTP_PASSWORD`.
5. Не виводьте секрети в журнали workflow.

Для повернення попередньої версії створіть revert потрібного commit і надішліть новий commit до `main`. Не переписуйте історію гілки деструктивними командами.

## 9. Локальна розробка

```bash
npm ci
npm run dev
```

Production-перевірка:

```bash
npm run build
```

Локальна тестова CMS:

```text
http://localhost:5173/admin/index.html?backend=test
```

Тестова CMS не виконує автентифікацію та не зберігає зміни.

## 10. Витрати та сервіси

- GitHub OAuth не має окремої плати за автентифікацію.
- Очікується, що GitHub Actions для публічного репозиторію залишатиметься в межах безплатних умов GitHub; актуальні умови слід перевіряти.
- Cityhost і реєстрація домену залишаються платними послугами клієнта.
- Netlify не потрібен і може залишатися вимкненим або бути видаленим, якщо там немає інших потрібних проєктів.
- Стандартне використання Google Analytics 4 у цій конфігурації не потребує оплати.

Періодично перевіряйте тарифи й умови сторонніх провайдерів.

## 11. Контрольний список безпеки

- [ ] Для власника GitHub увімкнено 2FA.
- [ ] Для Cityhost використовується найнадійніша доступна автентифікація.
- [ ] Коди відновлення збережено офлайн або в менеджері паролів.
- [ ] OAuth Client Secret зберігається лише на Cityhost.
- [ ] FTP-дані зберігаються лише в менеджері паролів і GitHub Actions secrets.
- [ ] `private-config/` повертає HTTP 403.
- [ ] Застарілі доступи редакторів і SSH-ключі видалено.
- [ ] Автопродовження домену та платіжні контакти актуальні.
- [ ] Визначено дату ротації OAuth- і FTP-секретів.

## 12. Необов’язкові покращення

Основний сайт і адмінпанель працюють. До необов’язкових SEO-покращень належать:

- `robots.txt`
- `sitemap.xml`
- canonical URL
- Open Graph і метадані соціальних мереж
- структуровані дані `LocalBusiness`
- Google Search Console
- окремі індексовані URL англійської версії

## 13. Підтвердження приймання

| Перевірка | Статус/дата |
|---|---|
| Перевірено публічні сторінки | `[CONFIRMED / YYYY-MM-DD]` |
| Перевірено мобільну версію | `[CONFIRMED / YYYY-MM-DD]` |
| Перевірено вхід через GitHub | `[CONFIRMED / YYYY-MM-DD]` |
| Перевірено публікацію проєкту | `[CONFIRMED / YYYY-MM-DD]` |
| Перевірено завантаження партнера | `[CONFIRMED / YYYY-MM-DD]` |
| Перевірено розгортання на Cityhost | `[CONFIRMED / YYYY-MM-DD]` |
| Google Analytics отримує дані | `[CONFIRMED / YYYY-MM-DD]` |
| Передано облікові дані | `[CONFIRMED / YYYY-MM-DD]` |
| Приймання клієнтом | `[CLIENT NAME / SIGNATURE / DATE]` |
