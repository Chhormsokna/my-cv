import type { Page } from "../types";

const items: { page: Page; label: string; icon: string }[] = [
  { page: "dashboard", label: "Dashboard", icon: "grid-1x2" },
  { page: "designs", label: "My Designs", icon: "images" },
  { page: "add", label: "Add New Design", icon: "plus-square" },
  { page: "categories", label: "Categories", icon: "tags" },
  { page: "portfolio", label: "My Portfolio", icon: "person-bounding-box" },
  { page: "cv", label: "CV / Resume", icon: "file-earmark-person" },
  { page: "favorites", label: "Favorites", icon: "heart" },
  { page: "trash", label: "Trash", icon: "trash3" },
  { page: "settings", label: "Settings", icon: "sliders" },
];

export default function Sidebar({ page, open, onNavigate, onClose }: { page: Page; open: boolean; onNavigate: (page: Page) => void; onClose: () => void }) {
  return <>
    <aside className={`studio-sidebar ${open ? "mobile-open" : ""}`}>
      <div className="brand"><span>F.</span><div>FORME<small>CREATIVE STUDIO</small></div></div>
      <nav className="side-nav" aria-label="Dashboard navigation">
        <p>Workspace</p>
        {items.map(item => <button key={item.page} className={page === item.page ? "active" : ""} onClick={() => { onNavigate(item.page); onClose(); }}><i className={`bi bi-${item.icon}`} /><span>{item.label}</span>{item.page === "add" && <b>+</b>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="storage-ring">42%</div><div><strong>Local storage</strong><small>Images stay on this device</small></div></div>
      <button className="logout" onClick={() => alert("This local dashboard has no account session to end.")}><i className="bi bi-box-arrow-left" /> Logout</button>
    </aside>
    {open && <button className="sidebar-backdrop" onClick={onClose} aria-label="Close navigation" />}
  </>;
}
