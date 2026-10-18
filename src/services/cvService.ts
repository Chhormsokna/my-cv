import { jsPDF } from "jspdf";
import type { CvData } from "../types";
import { getImage } from "./storageService";

const KEY = "studio.cv.v1";
export const defaultCv: CvData = {
  fullName: "Chhorm Sokna", title: "Graphic Designer", email: "chhormsokna46@gmail.com", phone: "+855 81 550 749",
  location: "Phnom Penh, Cambodia", summary: "Curious graphic designer focused on visual identity, editorial layouts, and useful digital experiences.",
  skills: ["Adobe Photoshop", "Adobe Illustrator", "Figma", "Brand Identity"], languages: ["Khmer - Native", "English - Intermediate"], certifications: ["Front-end Web Development"], links: "behance.net/your-profile",
  experience: [{ id: "ce1", title: "Operations & Creative Support", organization: "Emart24", dates: "2024", description: "Supported daily operations, customer communication, and visual merchandising." }],
  education: [{ id: "ced1", title: "Management Information Systems", organization: "Setec Institute", dates: "2025 - Present", description: "Bachelor degree studies." }], template: "modern",
};
export const loadCv = (): CvData => { const v = localStorage.getItem(KEY); return v ? { ...defaultCv, ...JSON.parse(v) } : defaultCv; };
export const saveCv = (value: CvData) => localStorage.setItem(KEY, JSON.stringify(value));

export async function generateCvPdf(cv: CvData, output: "save" | "blob" = "save") {
  const doc = new jsPDF(); const accent: [number, number, number] = cv.template === "modern" ? [101, 88, 239] : [30, 30, 35];
  const fullName = cv.fullName?.trim() || "Curriculum Vitae";
  const title = cv.title?.trim() || "";
  doc.setFillColor(...accent); doc.rect(0, 0, 210, 45, "F"); doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(25); doc.text(fullName, 16, 21); doc.setFontSize(11); doc.text(title, 16, 31);
  if (cv.profileImageId) { const image = await getImage(cv.profileImageId); if (image) { try { doc.addImage(new Uint8Array(await image.arrayBuffer()), image.type.includes("png") ? "PNG" : "JPEG", 169, 6, 25, 32); } catch { /* Skip unsupported image data without blocking the PDF. */ } } }
  doc.setTextColor(40); doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text(`${cv.email || ""}  |  ${cv.phone || ""}  |  ${cv.location || ""}`, 16, 54);
  let y = 69; const section = (titleText: string) => { doc.setTextColor(...accent); doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(titleText.toUpperCase(), 16, y); y += 7; doc.setTextColor(45); };
  const paragraph = (text: string) => { doc.setFont("helvetica", "normal"); doc.setFontSize(9); const lines = doc.splitTextToSize(text || "", 178); doc.text(lines, 16, y); y += lines.length * 5 + 7; };
  section("Profile"); paragraph(cv.summary || ""); section("Experience"); (cv.experience || []).forEach(x => { doc.setFont("helvetica", "bold"); doc.text(`${x.title} / ${x.organization}`, 16, y); doc.setFont("helvetica", "normal"); doc.text(x.dates, 194, y, { align: "right" }); y += 5; paragraph(x.description || ""); });
  section("Education"); (cv.education || []).forEach(x => { doc.setFont("helvetica", "bold"); doc.text(`${x.title} / ${x.organization}`, 16, y); y += 5; paragraph(`${x.dates}. ${x.description || ""}`); });
  section("Skills & Languages"); paragraph(`${(cv.skills || []).join("  /  ")}\n${(cv.languages || []).join("  /  ")}`); if (cv.certifications?.length) { section("Certifications"); paragraph(cv.certifications.join("  /  ")); }
  if (output === "save") doc.save(`${fullName.replace(/\s+/g, "-").toLowerCase()}-cv.pdf`);
  return doc.output("blob");
}