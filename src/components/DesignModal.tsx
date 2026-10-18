import { useImageUrl } from "../hooks";
import type { Design } from "../types";

export default function DesignModal({ design, onClose, onEdit }: { design: Design; onClose: () => void; onEdit: () => void }) {
  const image = useImageUrl(design.imageId, design.sampleImage);
  return <div className="modal-layer project-layer" role="presentation" onMouseDown={onClose}><div className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={e => e.stopPropagation()}><button className="modal-x" onClick={onClose}><i className="bi bi-x-lg" /></button><div className="detail-image"><img src={image} alt={design.title} /></div><div className="detail-copy"><span>{design.category}</span><h2 id="detail-title">{design.title}</h2><p>{design.description}</p><div className="tag-row">{design.tags.map(tag => <b key={tag}>#{tag}</b>)}</div><dl><div><dt>Status</dt><dd>{design.status}</dd></div><div><dt>Created</dt><dd>{new Date(design.date + "T00:00:00").toLocaleDateString()}</dd></div></dl><button className="btn btn-dark" onClick={onEdit}><i className="bi bi-pencil me-2" />Edit project</button></div></div></div>;
}