import { defineConfig, type Plugin } from 'vite';
import { tripApi, weatherApi } from './scripts/api-plugins';
import { hotelSearchVite } from './scripts/vite-hotel-plugin.mjs';
import { placeEditsApi } from './scripts/vite-place-edits';
import { checklistApi } from './scripts/vite-checklists';
import { publicTrips } from './scripts/vite-public-trips';
import { appCache } from './scripts/vite-app-cache';
import { ICON_FONT_HREF } from './src/ui/icons';

/** Fetch the local icon subset early, including on GitHub Pages' nested base. */
function iconFont(): Plugin {
  let base = '/';
  return {
    name: 'tb-icon-font',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml() {
      return [
        {
          tag: 'link',
          injectTo: 'head',
          attrs: {
            rel: 'preload',
            as: 'font',
            type: 'font/woff2',
            crossorigin: '',
            href: `${base}${ICON_FONT_HREF}`,
          },
        },
      ];
    },
  };
}

export default defineConfig({
  base: !process.env.TB_PRIVATE_SERVER && process.env.GITHUB_ACTIONS ? "/travel-boss/" : "/",
  define: { 'import.meta.env.VITE_TB_PRIVATE_SERVER': JSON.stringify(process.env.TB_PRIVATE_SERVER === '1') },
  plugins: [publicTrips(), appCache(), checklistApi(), placeEditsApi(), iconFont(), hotelSearchVite(), tripApi(), weatherApi()],
  server: {
    port: 5173,
    strictPort: false,
  },
});
