import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { existsSync, readdirSync, readFileSync } from 'node:fs'

const generatedProjects = resolve(__dirname, '.generated/projects')
const projectInputs = (() => {
  try {
    return Object.fromEntries(readdirSync(generatedProjects)
      .filter(file => file.endsWith('.html'))
      .map(file => [`projects/${file.slice(0, -5)}`, resolve(generatedProjects, file)]));
  } catch { return {}; }
})();

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: 'serve-generated-project-pages',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const match = req.url?.match(/^\/projects\/([a-z0-9]+(?:-[a-z0-9]+)*)\.html(?:\?.*)?$/);
          if (!match) return next();
          const file = resolve(generatedProjects, `${match[1]}.html`);
          if (!existsSync(file)) return next();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(readFileSync(file, 'utf8'));
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        products: resolve(__dirname, 'products.html'),
        contact: resolve(__dirname, 'contact.html'),
        ...projectInputs,
      },
    },
  },
})
