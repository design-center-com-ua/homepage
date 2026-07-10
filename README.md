# Design Center (design-center.com.ua) - Website Source Code

This repository contains the source code for the new, lightning-fast static website for **Design Center**.

This website was built to be completely secure, unhackable, and extremely fast. It does not use WordPress or a traditional database. Instead, it uses a modern "Static Generation" approach combined with an easy-to-use Admin Dashboard.

---

## 📝 For the Client (How to Edit Content)

You do not need to understand code or use this GitHub repository to update the website! 

### How to add/edit Projects and Clients:
1. Go to your live website and add `/admin` to the end of the URL (e.g., `https://design-center.com.ua/admin`).
2. Log in using your email and password.
3. You will see a friendly **Admin Dashboard** (Decap CMS).
4. Click on **"CRM: Projects"** or **"CRM: Clients"** on the left side.
5. Here, you can edit text, upload new images, and add new portfolio items in both Ukrainian and English.
6. When you are done, click the green **"Publish"** button.

### How long does it take to update?
When you click "Publish" in the Admin Dashboard, the changes are saved directly here to GitHub. 
GitHub will then **automatically** rebuild the website and upload the fresh files to Cityhost. 
**Please wait about 60 to 90 seconds** after clicking Publish, then refresh your live website to see the changes!

### 🔐 How do the Admin Passwords work? (Netlify Identity)
Because this is a completely static site with no MySQL database, the passwords for the `/admin` page are handled by a free third-party authentication service called **Netlify Identity**.
- The authentication bridge is hosted at `https://mellow-chimera-825f2d.netlify.app`.
- This bridge connects the login screen on Cityhost directly to this GitHub repository.
- If you need to change your password, add a new team member, or revoke access, you must log into your **Netlify.com dashboard**, select the site, and manage users in the **Identity** tab.

---

## 💻 For Developers (Technical Architecture)

If a developer needs to make structural changes to the website design or add new pages, here is how the architecture works:

### Tech Stack
- **Frontend Engine:** Vite (HTML, CSS, TypeScript)
- **Styling:** TailwindCSS
- **CMS:** Decap CMS (Git-based CMS)
- **Authentication Bridge:** Netlify Identity (`mellow-chimera-825f2d.netlify.app`)
- **Hosting / CI/CD:** Cityhost via GitHub Actions

### Local Development
To run this project on your local machine:

1. **Install Dependencies:**
   ```bash
   npm install
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
