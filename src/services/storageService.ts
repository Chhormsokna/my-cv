import type { Design, Settings } from "../types";
import { DEFAULT_CATEGORIES } from "../types";

const DESIGN_KEY = "studio.designs.v1";
const CATEGORY_KEY = "studio.categories.v1";
const SETTINGS_KEY = "studio.settings.v1";
const DB_NAME = "studio-image-store";
const STORE = "images";

const art = (background: string, accent: string, title: string, detail: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650"><rect width="900" height="650" fill="${background}"/><circle cx="715" cy="130" r="170" fill="${accent}"/><path d="M0 460L900 260V650H0Z" fill="${accent}" opacity=".55"/><text x="55" y="115" font-family="Arial" font-size="28" letter-spacing="8" fill="#fff">${detail}</text><text x="50" y="385" font-family="Arial" font-size="105" font-weight="800" fill="#fff">${title}</text><rect x="54" y="430" width="175" height="12" fill="#fff"/></svg>`)}`;

const SAMPLES: Design[] = [
  { id: "sample-1", title: "Sora Coffee", description: "A bright identity system for an independent neighborhood coffee bar.", category: "Branding", tags: ["identity", "coffee"], status: "Published", date: "2025-05-16", favorite: true, deleted: false, public: true, featured: true, sampleImage: art("#5d3bf2", "#ff8066", "SORA", "BRAND IDENTITY  /  01"), createdAt: 3 },
  { id: "sample-2", title: "Form & Future", description: "Editorial poster series exploring form, movement, and emerging practice.", category: "Poster Design", tags: ["poster", "typography"], status: "Published", date: "2025-04-27", favorite: false, deleted: false, public: true, featured: true, sampleImage: art("#11141b", "#3867ff", "F/F", "EXHIBITION POSTER  /  02"), createdAt: 2 },
  { id: "sample-3", title: "Navi Finance", description: "A clear and approachable interface concept for a personal finance product.", category: "UI/UX Design", tags: ["ui", "web", "finance"], status: "Draft", date: "2025-03-08", favorite: true, deleted: false, public: false, featured: false, sampleImage: art("#05796b", "#d4ff45", "NAVI", "DIGITAL PRODUCT  /  03"), createdAt: 1 },
];

export const defaultSettings: Settings = { name: "Chhorm Sokna", email: "chhormsokna46@gmail.com", phone: "+855 81 550 749", bio: "Graphic designer creating clear, bold identities and digital experiences.", theme: "light", defaultView: "grid", publicPortfolio: true, publicCv: false };

export function loadDesigns(): Design[] {
  const value = localStorage.getItem(DESIGN_KEY);
  if (value) return (JSON.parse(value) as Design[]).map(d => ({ ...d, public: d.public ?? d.status === "Published", featured: d.featured ?? false }));
  localStorage.setItem(DESIGN_KEY, JSON.stringify(SAMPLES));
  return SAMPLES;
}

export const saveDesigns = (designs: Design[]) => localStorage.setItem(DESIGN_KEY, JSON.stringify(designs));

export function loadCategories(): string[] {
  const value = localStorage.getItem(CATEGORY_KEY);
  if (value) return JSON.parse(value) as string[];
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(DEFAULT_CATEGORIES));
  return DEFAULT_CATEGORIES;
}

export const saveCategories = (categories: string[]) => localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));

export function loadSettings(): Settings {
  const value = localStorage.getItem(SETTINGS_KEY);
  return value ? { ...defaultSettings, ...JSON.parse(value) } : defaultSettings;
}

export const saveSettings = (settings: Settings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImage(key: string, file: Blob) {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).put(file, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}

export async function getImage(key: string): Promise<Blob | undefined> {
  const db = await openDb();
  const result = await new Promise<Blob | undefined>((resolve, reject) => {
    const request = db.transaction(STORE, "readonly").objectStore(STORE).get(key);
    request.onsuccess = () => resolve(request.result as Blob | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return result;
}

export async function deleteImage(key?: string) {
  if (!key) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, "readwrite").objectStore(STORE).delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  db.close();
}
