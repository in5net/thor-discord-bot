import { browser } from "$app/environment";
import { writable } from "svelte/store";

const initialMode = browser ? localStorage.getItem("theme") : "dark";
export const darkMode = writable(initialMode === "dark");
darkMode.subscribe($darkMode => {
  const theme = $darkMode ? "dark" : "light";
  if (browser) {
    localStorage.setItem("theme", theme);
    document.documentElement.dataset.theme = theme;
  }
});
