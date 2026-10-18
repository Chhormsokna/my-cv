import type { PortfolioData } from "../types";

const KEY = "studio.portfolio.v1";
export const defaultPortfolio: PortfolioData = {
  title: "Graphic Designer & Visual Thinker",
  intro: "I create bold identities, thoughtful digital experiences, and visual systems built to connect.",
  bio: "I am a Phnom Penh-based designer who combines strategic thinking with expressive typography and color. My process is curious, collaborative, and grounded in clear communication.",
  location: "Phnom Penh, Cambodia", experienceYears: "2+", interests: "Brand identity, editorial design, digital products",
  accent: "#6558ef", theme: "light",
  skills: [{ id: "s1", name: "Adobe Photoshop", level: 80 }, { id: "s2", name: "Illustrator", level: 72 }, { id: "s3", name: "Figma", level: 65 }],
  experience: [{ id: "e1", title: "Graphic Designer", organization: "Independent", dates: "2024 - Present", description: "Creating brand identities, posters, and digital campaign assets for growing businesses." }],
  education: [{ id: "ed1", title: "Management Information Systems", organization: "Setec Institute", dates: "2025 - Present", description: "Developing a practical foundation across technology, systems, and communication." }],
  services: ["Brand Identity", "Poster Design", "Social Media Design", "UI/UX Design"],
  social: { behance: "", dribbble: "", linkedin: "", github: "" },
  sectionOrder: ["about", "skills", "projects", "experience", "education", "services", "contact"], published: true,
};
export const loadPortfolio = (): PortfolioData => { const v = localStorage.getItem(KEY); return v ? { ...defaultPortfolio, ...JSON.parse(v) } : defaultPortfolio; };
export const savePortfolio = (value: PortfolioData) => localStorage.setItem(KEY, JSON.stringify(value));
