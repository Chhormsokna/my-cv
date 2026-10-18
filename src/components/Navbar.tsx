import { useImageUrl } from "../hooks";
import type { Settings } from "../types";

export default function Navbar({ settings, search, setSearch, onMenu, onTheme }: { settings: Settings; search: string; setSearch: (v: string) => void; onMenu: () => void; onTheme: () => void }) {
  const avatar = useImageUrl(settings.profileImageId);
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMenu} aria-label="Open menu"><i className="bi bi-list" /></button>
    <label className="global-search"><i className="bi bi-search" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search designs or tags..." /><kbd>⌘ K</kbd></label>
    <div className="top-actions">
      <button onClick={onTheme} aria-label="Toggle theme"><i className={`bi bi-${settings.theme === "dark" ? "sun" : "moon-stars"}`} /></button>
      <button className="notification" aria-label="Notifications" onClick={() => alert("You're all caught up.")}><i className="bi bi-bell" /><span /></button>
      <div className="profile-chip">{avatar ? <img src={avatar} alt="Profile" /> : <span>{settings.name.split(" ").map(x => x[0]).slice(0,2).join("")}</span>}<div><strong>{settings.name}</strong><small>Graphic Designer</small></div></div>
    </div>
  </header>;
}
