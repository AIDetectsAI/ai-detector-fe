import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
<<<<<<< HEAD
import react from '@astrojs/react';
=======

>>>>>>> 19f05df8774ffbfd0c650263304befaf12254a9c
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
