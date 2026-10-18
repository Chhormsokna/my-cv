export type DesignStatus = "Published" | "Draft";

export type Design = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: DesignStatus;
  date: string;
  favorite: boolean;
  deleted: boolean;
  imageId?: string;
  sampleImage?: string;
  createdAt: number;
  public: boolean;
  featured: boolean;
};

export type Settings = {
  name: string;
  email: string;
  bio: string;
  theme: "light" | "dark";
  defaultView: "grid" | "list";
  profileImageId?: string;
  phone: string;
  publicPortfolio: boolean;
  publicCv: boolean;
};

export type Page = "dashboard" | "designs" | "add" | "categories" | "portfolio" | "cv" | "favorites" | "trash" | "settings";

export type Skill = { id: string; name: string; level: number };
export type TimelineItem = { id: string; title: string; organization: string; dates: string; description: string };
export type PortfolioData = {
  title: string; intro: string; bio: string; location: string; experienceYears: string;
  interests: string; accent: string; theme: "light" | "dark"; profileImageId?: string; coverImageId?: string;
  skills: Skill[]; experience: TimelineItem[]; education: TimelineItem[]; services: string[];
  social: { behance: string; dribbble: string; linkedin: string; github: string };
  sectionOrder: string[]; published: boolean;
};

export type CvData = {
  fullName: string; title: string; email: string; phone: string; location: string; summary: string;
  skills: string[]; languages: string[]; certifications: string[]; links: string;
  experience: TimelineItem[]; education: TimelineItem[]; template: "classic" | "modern";
  profileImageId?: string;
  fileId?: string; fileName?: string; fileType?: string; fileSize?: number; uploadedAt?: string;
};

export const DEFAULT_CATEGORIES = [
  "Logo Design", "Poster Design", "Banner Design", "Social Media Design",
  "Business Card", "Branding", "UI/UX Design", "Illustration", "Photography", "Other",
];
