import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import StatCard from "./components/StatCard";
import DesignCard from "./components/DesignCard";
import DesignForm, { type DesignPayload } from "./components/DesignForm";
import ConfirmDialog from "./components/ConfirmDialog";
import DesignModal from "./components/DesignModal";
import { useImageUrl } from "./hooks";
import { deleteImage, loadCategories, loadDesigns, loadSettings, saveCategories, saveDesigns, saveImage, saveSettings } from "./services/storageService";
import type { Design, Page, Settings } from "./types";
import type { CvData, PortfolioData } from "./types";
import { useLocation, useNavigate } from "react-router-dom";
import PortfolioManager from "./pages/PortfolioManager";
import CVManager from "./pages/CVManager";
import PublicPortfolio from "./portfolio/PublicPortfolio";
import { loadPortfolio, savePortfolio } from "./services/portfolioService";
import { loadCv, saveCv } from "./services/cvService";

type Toast = { type: "success" | "error"; message: string };
type ConfirmState = { title: string; message: string; label: string; danger?: boolean; action: () => void };

export default function App() {
  const routerNavigate = useNavigate();
  const location = useLocation();
  const [page, setPage] = useState<Page>("dashboard");
  const [designs, setDesigns] = useState<Design[]>(loadDesigns);
  const [categories, setCategories] = useState<string[]>(loadCategories);
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [sidebar, setSidebar] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">(settings.defaultView);
  const [editing, setEditing] = useState<Design>();
  const [viewing, setViewing] = useState<Design>();
  const [confirm, setConfirm] = useState<ConfirmState>();
  const [toast, setToast] = useState<Toast>();
  const [portfolio, setPortfolio] = useState<PortfolioData>(loadPortfolio);
  const [cv, setCv] = useState<CvData>(loadCv);

  useEffect(() => saveDesigns(designs), [designs]);
  useEffect(() => saveCategories(categories), [categories]);
  useEffect(() => { saveSettings(settings); document.documentElement.dataset.theme = settings.theme; }, [settings]);
  useEffect(() => savePortfolio(portfolio), [portfolio]);
  useEffect(() => saveCv(cv), [cv]);
  useEffect(() => {
    const candidate = location.pathname.slice(1) as Page;
    if (["dashboard","designs","add","categories","portfolio","cv","favorites","trash","settings"].includes(candidate)) setPage(candidate);
  }, [location.pathname]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(undefined), 3200); return () => clearTimeout(timer); }, [toast]);

  const notify = (message: string, type: Toast["type"] = "success") => setToast({ message, type });
  const navigate = (next: Page) => { setPage(next); routerNavigate(`/${next}`); setEditing(undefined); if (next !== "designs") setSearch(""); };
  const activeDesigns = designs.filter(item => !item.deleted);

  const filtered = useMemo(() => {
    const source = page === "favorites" ? activeDesigns.filter(d => d.favorite) : activeDesigns;
    const query = search.toLowerCase().trim();
    return source.filter(d => (!query || d.title.toLowerCase().includes(query) || d.tags.some(t => t.toLowerCase().includes(query))) && (categoryFilter === "All" || d.category === categoryFilter) && (statusFilter === "All" || d.status === statusFilter)).sort((a, b) => sort === "oldest" ? a.date.localeCompare(b.date) : sort === "title" ? a.title.localeCompare(b.title) : b.date.localeCompare(a.date));
  }, [designs, page, search, categoryFilter, statusFilter, sort]);

  const saveProject = async (data: DesignPayload, image?: File) => {
    try {
      if (editing) {
        let imageId = editing.imageId;
        if (image) { if (imageId) await deleteImage(imageId); imageId = `image-${editing.id}-${Date.now()}`; await saveImage(imageId, image); }
        setDesigns(items => items.map(item => item.id === editing.id ? { ...item, ...data, imageId, sampleImage: image ? undefined : item.sampleImage } : item));
        notify("Project changes saved.");
      } else {
        const id = crypto.randomUUID();
        const imageId = `image-${id}`;
        if (image) await saveImage(imageId, image);
        setDesigns(items => [{ ...data, id, imageId, favorite: false, deleted: false, createdAt: Date.now() }, ...items]);
        notify("New project added.");
      }
      setEditing(undefined); setPage("designs");
    } catch { notify("The project could not be saved. Try again.", "error"); }
  };

  const moveToTrash = (design: Design) => setConfirm({ title: "Move to trash?", message: `${design.title} will be removed from your active portfolio. You can restore it later.`, label: "Move to trash", action: () => { setDesigns(v => v.map(d => d.id === design.id ? { ...d, deleted: true } : d)); setConfirm(undefined); notify("Project moved to trash."); } });
  const restore = (design: Design) => { setDesigns(v => v.map(d => d.id === design.id ? { ...d, deleted: false } : d)); notify("Project restored."); };
  const permanentlyDelete = (design: Design) => setConfirm({ title: "Delete permanently?", message: `${design.title} and its stored image will be erased from this device. This cannot be undone.`, label: "Delete permanently", action: async () => { await deleteImage(design.imageId); setDesigns(v => v.filter(d => d.id !== design.id)); setConfirm(undefined); notify("Project permanently deleted."); } });
  const toggleFavorite = (id: string) => setDesigns(v => v.map(d => d.id === id ? { ...d, favorite: !d.favorite } : d));
  const editDesign = (design: Design) => { setViewing(undefined); setEditing(design); setPage("add"); };

  const gallery = (title: string, intro: string) => <>
    <PageTitle eyebrow="PORTFOLIO LIBRARY" title={title} intro={intro} action={<button className="btn btn-primary" onClick={() => navigate("add")}><i className="bi bi-plus-lg me-2" />Add design</button>} />
    <div className="filter-bar"><label className="filter-search"><i className="bi bi-search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or tag" /></label><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option>All</option>{categories.map(c => <option key={c}>{c}</option>)}</select><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option><option>Published</option><option>Draft</option></select><select value={sort} onChange={e => setSort(e.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A-Z</option></select><div className="view-toggle"><button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")}><i className="bi bi-grid" /></button><button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><i className="bi bi-list-ul" /></button></div></div>
    {filtered.length ? <div className={`design-grid ${view === "list" ? "list-view" : ""}`}>{filtered.map(design => <DesignCard key={design.id} design={design} view={view} onView={() => setViewing(design)} onEdit={() => editDesign(design)} onDelete={() => moveToTrash(design)} onFavorite={() => toggleFavorite(design.id)} />)}</div> : <Empty icon={page === "favorites" ? "heart" : "images"} title={page === "favorites" ? "No favorites yet" : "No designs found"} text={search || categoryFilter !== "All" || statusFilter !== "All" ? "Try clearing your search or filters." : "Add your first project to start building your creative library."} action={() => navigate("add")} />}
  </>;

  if (location.pathname === "/portfolio") return <PublicPortfolio data={portfolio} designs={designs} settings={settings} cv={cv} preview={new URLSearchParams(location.search).has("preview")} onExit={() => navigate("portfolio")} />;

  return <div className="app-shell">
    <Sidebar page={page} open={sidebar} onNavigate={navigate} onClose={() => setSidebar(false)} />
    <div className="main-shell"><Navbar settings={settings} search={search} setSearch={v => { setSearch(v); if (v && page === "dashboard") setPage("designs"); }} onMenu={() => setSidebar(true)} onTheme={() => setSettings(s => ({ ...s, theme: s.theme === "light" ? "dark" : "light" }))} />
      <main className="workspace">
        {page === "dashboard" && <Dashboard designs={activeDesigns} categories={categories} settings={settings} cv={cv} onAdd={() => navigate("add")} onView={setViewing} onAll={() => navigate("designs")} onCv={() => navigate("cv")} onPortfolio={() => navigate("portfolio")} onPreview={() => routerNavigate("/portfolio?preview=1")} />}
        {page === "designs" && gallery("My designs", "Manage, filter, and present every piece in your creative archive.")}
        {page === "favorites" && gallery("Favorites", "A focused collection of the work you want close at hand.")}
        {page === "add" && <DesignForm key={editing?.id || "new"} design={editing} categories={categories} onSave={saveProject} onCancel={() => { setEditing(undefined); navigate("designs"); }} />}
        {page === "categories" && <Categories categories={categories} designs={activeDesigns} setCategories={setCategories} setDesigns={setDesigns} notify={notify} />}
        {page === "portfolio" && <PortfolioManager data={portfolio} setData={setPortfolio} designs={designs} onDesignChange={(id,field)=>setDesigns(v=>v.map(d=>d.id===id?{...d,[field]:!d[field],...(field==="public"&&d.public?{featured:false}:{})}:d))} onPreview={() => routerNavigate("/portfolio?preview=1")} notify={notify} />}
        {page === "cv" && <CVManager cv={cv} setCv={setCv} publicDownload={settings.publicCv} setPublicDownload={v => setSettings(s => ({ ...s, publicCv: v }))} notify={notify} />}
        {page === "trash" && <Trash designs={designs.filter(d => d.deleted)} onRestore={restore} onDelete={permanentlyDelete} />}
        {page === "settings" && <SettingsPage settings={settings} setSettings={setSettings} setView={setView} designs={designs} categories={categories} portfolio={portfolio} cv={cv} importData={(data) => { if(data.designs)setDesigns(data.designs);if(data.categories)setCategories(data.categories);if(data.portfolio)setPortfolio(data.portfolio);if(data.cv)setCv(data.cv);if(data.settings)setSettings(data.settings); }} notify={notify} />}
      </main>
    </div>
    {viewing && <DesignModal design={viewing} onClose={() => setViewing(undefined)} onEdit={() => editDesign(viewing)} />}
    {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} confirmLabel={confirm.label} danger={confirm.danger} onConfirm={confirm.action} onCancel={() => setConfirm(undefined)} />}
    {toast && <div className={`studio-toast ${toast.type}`} role="status"><i className={`bi bi-${toast.type === "success" ? "check-circle-fill" : "exclamation-circle-fill"}`} />{toast.message}<button onClick={() => setToast(undefined)}><i className="bi bi-x" /></button></div>}
  </div>;
}

function PageTitle({ eyebrow, title, intro, action }: { eyebrow: string; title: string; intro: string; action?: React.ReactNode }) {
  return <div className="page-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div>{action}</div>;
}

function Dashboard({ designs, categories, settings, cv, onAdd, onView, onAll, onCv, onPortfolio, onPreview }: { designs: Design[]; categories: string[]; settings: Settings; cv: CvData; onAdd: () => void; onView: (d: Design) => void; onAll: () => void; onCv:()=>void; onPortfolio:()=>void; onPreview:()=>void }) {
  const recent = [...designs].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 4);
  const first = settings.name.split(" ")[0];
  return <><PageTitle eyebrow="CREATIVE OVERVIEW" title={`Good morning, ${first}.`} intro="Here is what is happening across your portfolio today." action={<button className="btn btn-primary" onClick={onAdd}><i className="bi bi-plus-lg me-2" />New project</button>} />
    <div className="stats-grid six"><StatCard label="Total designs" value={designs.length} icon="layers" tone="purple" detail="All active projects" /><StatCard label="Published" value={designs.filter(d => d.status === "Published").length} icon="globe2" tone="blue" detail="Visible work" /><StatCard label="Drafts" value={designs.filter(d => d.status === "Draft").length} icon="file-earmark" tone="orange" detail="Waiting for review" /><StatCard label="Categories" value={categories.length} icon="tags" tone="green" detail="Organized collections" /><StatCard label="Portfolio projects" value={designs.filter(d=>d.public&&d.status==="Published").length} icon="person-workspace" tone="purple" detail="Publicly visible" /><StatCard label="CV status" value={cv.fileId?1:0} icon="file-earmark-person" tone="blue" detail={cv.fileId?"File uploaded":"Generated profile ready"} /></div>
    <div className="quick-actions"><button onClick={onAdd}><i className="bi bi-plus-square"/><span><b>Add new design</b><small>Upload creative work</small></span></button><button onClick={onCv}><i className="bi bi-file-earmark-arrow-up"/><span><b>Upload CV</b><small>Manage your resume</small></span></button><button onClick={onPortfolio}><i className="bi bi-layout-text-window"/><span><b>Edit my portfolio</b><small>Update public content</small></span></button><button onClick={onPreview}><i className="bi bi-box-arrow-up-right"/><span><b>Preview portfolio</b><small>See the visitor view</small></span></button></div>
    <section className="recent-section"><div className="section-heading"><div><span>RECENTLY ADDED</span><h2>Latest projects</h2></div><button onClick={onAll}>View all designs <i className="bi bi-arrow-right" /></button></div><div className="recent-table"><div className="recent-row table-head"><span>Project</span><span>Category</span><span>Status</span><span>Date</span><span /></div>{recent.map(d => <RecentRow key={d.id} design={d} onView={() => onView(d)} />)}</div></section>
    <section className="dashboard-banner"><div><span>KEEP CREATING</span><h2>Your next standout project starts with a blank canvas.</h2></div><button onClick={onAdd}>Add something new <i className="bi bi-arrow-up-right" /></button></section>
  </>;
}

function RecentRow({ design, onView }: { design: Design; onView: () => void }) {
  const image = useImageUrl(design.imageId, design.sampleImage);
  return <button className="recent-row" onClick={onView}><span className="project-cell"><img src={image} alt="" /><b>{design.title}<small>{design.tags.slice(0,2).map(t => `#${t}`).join("  ")}</small></b></span><span>{design.category}</span><span><b className={`status-dot ${design.status.toLowerCase()}`}>{design.status}</b></span><span>{new Date(design.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span><span><i className="bi bi-arrow-up-right" /></span></button>;
}

function Categories({ categories, designs, setCategories, setDesigns, notify }: { categories: string[]; designs: Design[]; setCategories: React.Dispatch<React.SetStateAction<string[]>>; setDesigns: React.Dispatch<React.SetStateAction<Design[]>>; notify: (m: string, t?: Toast["type"]) => void }) {
  const [name, setName] = useState("");
  const add = () => { const value = name.trim(); if (!value) return notify("Enter a category name.", "error"); if (categories.some(c => c.toLowerCase() === value.toLowerCase())) return notify("That category already exists.", "error"); setCategories(v => [...v, value]); setName(""); notify("Category added."); };
  const rename = (old: string) => { const next = window.prompt("Rename category", old)?.trim(); if (!next || next === old) return; if (categories.includes(next)) return notify("That category already exists.", "error"); setCategories(v => v.map(c => c === old ? next : c)); setDesigns(v => v.map(d => d.category === old ? { ...d, category: next } : d)); notify("Category renamed."); };
  const remove = (name: string) => { if (name === "Other") return notify("The fallback category cannot be deleted.", "error"); if (!window.confirm(`Delete ${name}? Projects in it will move to Other.`)) return; setCategories(v => v.filter(c => c !== name)); setDesigns(v => v.map(d => d.category === name ? { ...d, category: "Other" } : d)); notify("Category deleted."); };
  return <><PageTitle eyebrow="ORGANIZATION" title="Categories" intro="Build a taxonomy that keeps your growing design library easy to navigate." /><div className="category-create"><div><h2>Add category</h2><p>Create a new collection for your work.</p></div><div><input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="Category name" /><button className="btn btn-primary" onClick={add}>Add category</button></div></div><div className="category-list"><div className="category-head"><span>Name</span><span>Projects</span><span>Actions</span></div>{categories.map((c, i) => <div className="category-row" key={c}><span><i style={{ background: ["#6558ef", "#ff795d", "#2b9d82", "#e3ad2e"][i % 4] }} />{c}</span><span>{designs.filter(d => d.category === c).length} projects</span><span><button onClick={() => rename(c)}><i className="bi bi-pencil" /></button><button onClick={() => remove(c)}><i className="bi bi-trash3" /></button></span></div>)}</div></>;
}

function Trash({ designs, onRestore, onDelete }: { designs: Design[]; onRestore: (d: Design) => void; onDelete: (d: Design) => void }) {
  return <><PageTitle eyebrow="RECOVERY" title="Trash" intro="Restore removed projects or permanently erase them from this device." />{designs.length ? <div className="trash-list">{designs.map(d => <TrashRow key={d.id} design={d} onRestore={() => onRestore(d)} onDelete={() => onDelete(d)} />)}</div> : <Empty icon="trash3" title="Trash is empty" text="Projects you remove will stay here until you permanently delete them." />}</>;
}

function TrashRow({ design, onRestore, onDelete }: { design: Design; onRestore: () => void; onDelete: () => void }) {
  const image = useImageUrl(design.imageId, design.sampleImage);
  return <div className="trash-row"><img src={image} alt="" /><div><b>{design.title}</b><span>{design.category} / {design.date}</span></div><button className="btn btn-light" onClick={onRestore}><i className="bi bi-arrow-counterclockwise me-2" />Restore</button><button className="btn btn-outline-danger" onClick={onDelete}><i className="bi bi-trash3 me-2" />Delete forever</button></div>;
}

function SettingsPage({ settings, setSettings, setView, designs, categories, portfolio, cv, importData, notify }: { settings: Settings; setSettings: React.Dispatch<React.SetStateAction<Settings>>; setView: (v: "grid" | "list") => void; designs: Design[]; categories:string[]; portfolio:PortfolioData; cv:CvData; importData:(data:{designs?:Design[];categories?:string[];portfolio?:PortfolioData;cv?:CvData;settings?:Settings})=>void; notify: (m: string, t?: Toast["type"]) => void }) {
  const [form, setForm] = useState(settings);
  const avatar = useImageUrl(form.profileImageId);
  const changePhoto = async (file?: File) => { if (!file) return; if (!file.type.startsWith("image/") || file.size > 5*1024*1024) return notify("Choose an image smaller than 5 MB.", "error"); const id = `profile-${Date.now()}`; await saveImage(id, file); if (form.profileImageId) await deleteImage(form.profileImageId); setForm(v => ({ ...v, profileImageId: id })); };
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return notify("Enter a valid name and email.", "error"); setSettings(form); setView(form.defaultView); notify("Settings saved."); };
  const exportData=()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),designs,categories,portfolio,cv,settings},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="forme-dashboard-metadata.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);notify("Metadata export downloaded.")};
  const importFile=async(file?:File)=>{if(!file)return;try{const data=JSON.parse(await file.text());if(!data.version||!Array.isArray(data.designs))throw new Error();importData(data);setForm(data.settings||form);notify("Dashboard metadata imported.")}catch{notify("This is not a valid dashboard export.","error")}};
  return <><PageTitle eyebrow="PREFERENCES" title="Settings" intro="Personalize your profile, visibility, and gallery behavior." /><form className="settings-form" onSubmit={submit}><section><h2>Designer profile</h2><p>Shown in the dashboard navigation and portfolio details.</p><div className="profile-upload">{avatar ? <img src={avatar} alt="Profile" /> : <span>{form.name.slice(0,2).toUpperCase()}</span>}<label className="btn btn-light">Change photo<input type="file" accept="image/*" onChange={e => changePhoto(e.target.files?.[0])} /></label></div><div className="row g-4"><div className="col-md-6"><label className="form-label">Designer name</label><input className="form-control" value={form.name} onChange={e => setForm(v => ({ ...v, name: e.target.value }))} /></div><div className="col-md-6"><label className="form-label">Email address</label><input type="email" className="form-control" value={form.email} onChange={e => setForm(v => ({ ...v, email: e.target.value }))} /></div><div className="col-md-6"><label className="form-label">Phone number</label><input className="form-control" value={form.phone} onChange={e => setForm(v => ({ ...v, phone: e.target.value }))} /></div><div className="col-12"><label className="form-label">Portfolio description</label><textarea rows={4} className="form-control" value={form.bio} onChange={e => setForm(v => ({ ...v, bio: e.target.value }))} /></div></div></section><section><h2>Display preferences</h2><p>Choose how your workspace looks and how projects first appear.</p><div className="setting-choice"><label>Color theme<select value={form.theme} onChange={e => setForm(v => ({ ...v, theme: e.target.value as Settings["theme"] }))}><option value="light">Light workspace</option><option value="dark">Dark workspace</option></select></label><label>Default gallery view<select value={form.defaultView} onChange={e => setForm(v => ({ ...v, defaultView: e.target.value as Settings["defaultView"] }))}><option value="grid">Grid view</option><option value="list">List view</option></select></label></div><div className="settings-toggles"><label><input type="checkbox" checked={form.publicPortfolio} onChange={e=>setForm(v=>({...v,publicPortfolio:e.target.checked}))}/><span><b>Public portfolio enabled</b><small>Global visibility control for your public presence.</small></span></label><label><input type="checkbox" checked={form.publicCv} onChange={e=>setForm(v=>({...v,publicCv:e.target.checked}))}/><span><b>Public CV downloads</b><small>Visitors can download the current CV.</small></span></label></div></section><section><h2>Data portability</h2><p>Export or restore metadata. Uploaded image and CV blobs stay in IndexedDB and are not included in JSON exports.</p><div className="data-actions"><button type="button" className="btn btn-light" onClick={exportData}><i className="bi bi-download me-2"/>Export metadata</button><label className="btn btn-light"><i className="bi bi-upload me-2"/>Import metadata<input type="file" accept="application/json" onChange={e=>importFile(e.target.files?.[0])}/></label></div></section><div className="settings-save"><button className="btn btn-primary">Save settings</button></div></form></>;
}

function Empty({ icon, title, text, action }: { icon: string; title: string; text: string; action?: () => void }) {
  return <div className="empty-state"><i className={`bi bi-${icon}`} /><h2>{title}</h2><p>{text}</p>{action && <button className="btn btn-primary" onClick={action}>Add a design</button>}</div>;
}