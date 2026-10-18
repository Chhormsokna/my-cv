import { useState } from "react";
import { useImageUrl } from "../hooks";
import type { CvData, Design, PortfolioData, Settings, TimelineItem } from "../types";
import { generateCvPdf } from "../services/cvService";
import { getImage } from "../services/storageService";

export default function PublicPortfolio({ data, designs, settings, cv, preview = false, onExit }: { data: PortfolioData; designs: Design[]; settings: Settings; cv: CvData; preview?: boolean; onExit?: () => void }) {
  const [project, setProject] = useState<Design>();
  const profile = useImageUrl(data?.profileImageId || settings?.profileImageId);
  const cover = useImageUrl(data?.coverImageId);
  const safeDesigns = designs || [];
  const safeData = data || {} as PortfolioData;
  const safeSettings = settings || {} as Settings;
  const safeCv = cv || {} as CvData;
  const projects = safeDesigns.filter(d => !d.deleted && d.status === "Published" && d.public).sort((a,b) => Number(b.featured) - Number(a.featured));
  const downloadCv = async () => {
    if (!safeSettings.publicCv && !preview) return;
    try {
      if (safeCv.fileId) {
        const blob = await getImage(safeCv.fileId);
        if (blob) {
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = safeCv.fileName || "cv.pdf";
          a.click();
          setTimeout(() => URL.revokeObjectURL(a.href), 1000);
          return;
        }
      }
      await generateCvPdf(safeCv);
    } catch (e) {
      console.error("Failed to download CV:", e);
    }
  };
  if ((!safeData.published || !safeSettings.publicPortfolio) && !preview) {
    return (
      <div className="portfolio-offline">
        <b>CS.</b>
        <h1>Portfolio under refinement.</h1>
        <p>This portfolio is not public right now. Please check back soon.</p>
        <div style={{ marginTop: "24px" }}>
          {onExit ? (
            <button onClick={onExit} style={{ border: "1px solid #b7ff57", background: "transparent", color: "#b7ff57", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: 700 }}>
              Return to dashboard
            </button>
          ) : (
            <a href="#/dashboard" style={{ border: "1px solid #b7ff57", background: "transparent", color: "#b7ff57", padding: "10px 18px", borderRadius: "6px", textDecoration: "none", display: "inline-block", fontWeight: 700 }}>
              Return to dashboard
            </a>
          )}
        </div>
      </div>
    );
  }
  const initials = (safeSettings.name || "Designer").split(" ").filter(Boolean).map(x => x[0]).join("") || "CS";
  const scrollTo = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const formatUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);
  const sections: Record<string, React.ReactNode> = {
    about: <section id="about" className="pf-about"><span>01 / ABOUT</span><h2>{safeData.bio || ""}</h2><div><p>Based in {safeData.location || "everywhere"}. Interested in {(safeData.interests || "").toLowerCase()}.</p><b>{safeData.experienceYears || "0"}<small>Years of experience</small></b></div></section>,
    skills: <section className="pf-skills"><header><span>02 / CAPABILITIES</span><h2>Tools, craft,<br />and clear thinking.</h2></header><div>{(safeData.skills || []).map(s => <div key={s.id}><p><b>{s.name}</b><span>{s.level}%</span></p><i><em style={{ width: `${s.level}%` }} /></i></div>)}</div></section>,
    projects: <section id="work" className="pf-work"><header><span>03 / SELECTED WORK</span><h2>Projects made<br />with purpose.</h2></header><div>{projects.map((d,i) => <PortfolioProject key={d.id} design={d} index={i} onClick={() => setProject(d)} />)}</div></section>,
    experience: <Timeline title="Experience" number="04" items={safeData.experience || []} />,
    education: <Timeline title="Education" number="05" items={safeData.education || []} />,
    services: <section className="pf-services"><span>06 / SERVICES</span><h2>Ways we can<br />work together.</h2><div>{(safeData.services || []).map((s,i) => <p key={s}><b>{String(i+1).padStart(2,"0")}</b>{s}<i className="bi bi-arrow-up-right" /></p>)}</div></section>,
    contact: <footer id="contact" className="pf-contact"><span>START A CONVERSATION</span><h2>Have an idea?<br /><em>Let's shape it.</em></h2><a href={`mailto:${safeSettings.email || ""}`}>{safeSettings.email || ""}<i className="bi bi-arrow-up-right" /></a><div><p>{safeSettings.phone || ""}<br />{safeData.location || ""}</p><p>{Object.entries(safeData.social || {}).filter(([,v]) => v).map(([k,v]) => <a key={k} href={formatUrl(v)} target="_blank" rel="noreferrer">{k}</a>)}</p></div></footer>,
  };
  const sectionOrder = safeData.sectionOrder || ["about", "skills", "projects", "experience", "education", "services", "contact"];
  return <div className={`public-portfolio ${safeData.theme || "light"}`} style={{ "--pf-accent": safeData.accent || "#6558ef" } as React.CSSProperties}>
    {preview && <div className="preview-bar"><span><i className="bi bi-eye" /> Public preview</span><button type="button" onClick={onExit}>Return to dashboard</button></div>}
    <nav className="pf-nav"><a href="#pf-top" onClick={scrollTo("pf-top")}>CS<span>.</span></a><div><a href="#work" onClick={scrollTo("work")}>Work</a><a href="#about" onClick={scrollTo("about")}>About</a><a href="#contact" onClick={scrollTo("contact")}>Contact</a></div></nav>
    <header id="pf-top" className="pf-hero" style={cover ? { backgroundImage: `linear-gradient(90deg,rgba(13,13,16,.92),rgba(13,13,16,.32)),url("${cover}")` } : {}}><div><span>GRAPHIC DESIGNER / {(safeData.location || "").toUpperCase()}</span><h1>{safeData.title || ""}</h1><p>{safeData.intro || ""}</p><div><a href="#contact" onClick={scrollTo("contact")}>Contact me <i className="bi bi-arrow-right" /></a>{(safeSettings.publicCv || preview) && <button type="button" onClick={downloadCv}>Download CV <i className="bi bi-download" /></button>}</div></div><div className="pf-portrait">{profile ? <img src={profile} alt={safeSettings.name || "Designer"} /> : <b>{initials}</b>}<span>{safeSettings.name || "Designer"}</span></div></header>
    {sectionOrder.map(key => sections[key] ? <div key={key}>{sections[key]}</div> : null)}
    {project && <PortfolioProjectModal design={project} onClose={() => setProject(undefined)} />}
  </div>;
}

function PortfolioProject({ design, index, onClick }: { design: Design; index: number; onClick: () => void }) { const image = useImageUrl(design.imageId, design.sampleImage); return <button type="button" onClick={onClick}><div><img src={image} alt={design.title} />{design.featured && <span>Featured</span>}</div><p><small>{String(index+1).padStart(2,"0")} / {design.category}</small><b>{design.title}</b><i className="bi bi-arrow-up-right" /></p></button>; }
function PortfolioProjectModal({ design, onClose }: { design: Design; onClose: () => void }) { const image = useImageUrl(design.imageId, design.sampleImage); return <div className="pf-modal" onMouseDown={onClose}><article onMouseDown={e=>e.stopPropagation()}><button type="button" aria-label="Close" onClick={onClose}><i className="bi bi-x-lg" /></button><img src={image} alt={design.title} /><div><span>{design.category} / {(design.date || "").slice(0,4)}</span><h2>{design.title}</h2><p>{design.description}</p></div></article></div>; }
function Timeline({ title, number, items }: { title: string; number: string; items: TimelineItem[] }) { return <section className="pf-timeline"><span>{number} / {title.toUpperCase()}</span><h2>{title}</h2><div>{(items || []).map(x => <article key={x.id}><time>{x.dates}</time><div><h3>{x.title}</h3><b>{x.organization}</b><p>{x.description}</p></div></article>)}</div></section>; }

