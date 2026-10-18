import { useImageUrl } from "../hooks";
import type { Design } from "../types";

export default function DesignCard({ design, view, onView, onEdit, onDelete, onFavorite }: { design: Design; view: "grid" | "list"; onView: () => void; onEdit: () => void; onDelete: () => void; onFavorite: () => void }) {
  const image = useImageUrl(design.imageId, design.sampleImage);
  return <article className={`design-card ${view === "list" ? "list-card" : ""}`}>
    <button className="design-image" onClick={onView} aria-label={`View ${design.title}`}><img src={image} alt={`${design.title} preview`} /><span className="view-overlay"><i className="bi bi-arrows-fullscreen" /> View project</span></button>
    <div className="design-info"><div className="design-meta"><span>{design.category}</span><button onClick={onFavorite} aria-label={design.favorite ? "Remove favorite" : "Add favorite"}><i className={`bi bi-heart${design.favorite ? "-fill" : ""}`} /></button></div><h3>{design.title}</h3><p>{design.date ? new Date(design.date + "T00:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""} <b className={design.status === "Published" ? "published" : "draft"}>{design.status}</b></p></div>
    <div className="design-actions"><button onClick={onView} title="View"><i className="bi bi-eye" /></button><button onClick={onEdit} title="Edit"><i className="bi bi-pencil" /></button><button onClick={onDelete} title="Move to trash"><i className="bi bi-trash3" /></button></div>
  </article>;
}
