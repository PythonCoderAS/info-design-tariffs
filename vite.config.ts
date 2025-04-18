import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "process";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // If in Github Actions, set the base to the repository name
  base: process.env.GITHUB_ACTIONS
    ? process.env.GITHUB_REPOSITORY
      ? `/${process.env.GITHUB_REPOSITORY.split("/")[1]}/`
      : "/info-design-tariffs/"
    : undefined,
});
