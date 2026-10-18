import { useState } from "react";
import { useImageUrl } from "../hooks";
import type { CvData, Design, PortfolioData, Settings, TimelineItem } from "../types";
import { generateCvPdf } from "../services/cvService";
import { getImage } from "../services/storageService";

export default function PublicPortfolio({ data, designs, settings, cv, preview = false, onExit }: { data: PortfolioData; designs: Design[]; settings: Settings; cv: CvData; preview?: boolean; onExit?: () => void }) {
  const [project, setProject] = useState<Design>();
  const profile = useImageUrl(data.profileImageId || settings.profileImageId);
  const cover = useImageUrl(data.coverImageId);
  const projects = designs.filter(d => !d.deleted && d.status === "Published" && d.public).sort((a,b) => Number(b.featured) - Number(a.featured));
  const downloadCv = async () => {
    if (!settings.publicCv && !preview) return;
    if (cv.fileId) { const blob = await getImage(cv.fileId); if (blob) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = cv.fileName || "cv.pdf"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); return; } }
    generateCvPdf(cv);
  };
  if ((!data.published || !settings.publicPortfolio) && !preview) return <div className="portfolio-offline"><b>CS.</b><h1>Portfolio under refinement.</h1><p>This portfolio is not public right now. Please check back soon.</p></div>;
  const sections: Record<string, React.ReactNode> = {
    about: <section id="about" className="pf-about"><span>01 / ABOUT</span><h2>{data.bio}</h2><div><p>Based in {data.location}. Interested in {data.interests.toLowerCase()}.</p><b>{data.experienceYears}<small>Years of experience</small></b></div></section>,
    skills: <section className="pf-skills"><header><span>02 / CAPABILITIES</span><h2>Tools, craft,<br />and clear thinking.</h2></header><div>{data.skills.map(s => <div key={s.id}><p><b>{s.name}</b><span>{s.level}%</span></p><i><em style={{ width: `${s.level}%` }} /></i></div>)}</div></section>,
    projects: <section id="work" className="pf-work"><header><span>03 / SELECTED WORK</span><h2>Projects made<br />with purpose.</h2></header><div>{projects.map((d,i) => <PortfolioProject key={d.id} design={d} index={i} onClick={() => setProject(d)} />)}</div></section>,
    experience: <Timeline title="Experience" number="04" items={data.experience} />,
    education: <Timeline title="Education" number="05" items={data.education} />,
    services: <section className="pf-services"><span>06 / SERVICES</span><h2>Ways we can<br />work together.</h2><div>{data.services.map((s,i) => <p key={s}><b>{String(i+1).padStart(2,"0")}</b>{s}<i className="bi bi-arrow-up-right" /></p>)}</div></section>,
    contact: <footer id="contact" className="pf-contact"><span>START A CONVERSATION</span><h2>Have an idea?<br /><em>Let's shape it.</em></h2><a href={`mailto:${settings.email}`}>{settings.email}<i className="bi bi-arrow-up-right" /></a><div><p>{settings.phone}<br />{data.location}</p><p>{Object.entries(data.social).filter(([,v]) => v).map(([k,v]) => <a key={k} href={v} target="_blank" rel="noreferrer">{k}</a>)}</p></div></footer>,
  };
  return <div className={`public-portfolio ${data.theme}`} style={{ "--pf-accent": data.accent } as React.CSSProperties}>
    {preview && <div className="preview-bar"><span><i className="bi bi-eye" /> Public preview</span><button onClick={onExit}>Return to dashboard</button></div>}
    <nav className="pf-nav"><a href="#pf-top">CS<span>.</span></a><div><a href="#work">Work</a><a href="#about">About</a><a href="#contact">Contact</a></div></nav>
    <header id="pf-top" className="pf-hero" style={cover ? { backgroundImage: `linear-gradient(90deg,rgba(13,13,16,.92),rgba(13,13,16,.32)),url(${cover})` } : {}}><div><span>GRAPHIC DESIGNER / {data.location.toUpperCase()}</span><h1>{data.title}</h1><p>{data.intro}</p><div><a href="#contact">Contact me <i className="bi bi-arrow-right" /></a>{(settings.publicCv || preview) && <button onClick={downloadCv}>Download CV <i className="bi bi-download" /></button>}</div></div><div className="pf-portrait">{profile ? <img src={profile} alt={settings.name} /> : <b>{settings.name.split(" ").map(x=>x[0]).join("")}</b>}<span>{settings.name}</span></div></header>
    {data.sectionOrder.map(key => <div key={key}>{sections[key]}</div>)}
    {project && <PortfolioProjectModal design={project} onClose={() => setProject(undefined)} />}
  </div>;
}

function PortfolioProject({ design, index, onClick }: { design: Design; index: number; onClick: () => void }) { const image = useImageUrl(design.imageId, design.sampleImage); return <button onClick={onClick}><div><img src={image} alt={design.title} />{design.featured && <span>Featured</span>}</div><p><small>{String(index+1).padStart(2,"0")} / {design.category}</small><b>{design.title}</b><i className="bi bi-arrow-up-right" /></p></button>; }
function PortfolioProjectModal({ design, onClose }: { design: Design; onClose: () => void }) { const image = useImageUrl(design.imageId, design.sampleImage); return <div className="pf-modal" onMouseDown={onClose}><article onMouseDown={e=>e.stopPropagation()}><button onClick={onClose}><i className="bi bi-x-lg" /></button><img src={image} alt={design.title} /><div><span>{design.category} / {design.date.slice(0,4)}</span><h2>{design.title}</h2><p>{design.description}</p></div></article></div>; }
function Timeline({ title, number, items }: { title: string; number: string; items: TimelineItem[] }) { return <section className="pf-timeline"><span>{number} / {title.toUpperCase()}</span><h2>{title}</h2><div>{items.map(x => <article key={x.id}><time>{x.dates}</time><div><h3>{x.title}</h3><b>{x.organization}</b><p>{x.description}</p></div></article>)}</div></section>; }
