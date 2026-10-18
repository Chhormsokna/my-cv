import { useEffect, useState } from "react";
import { useImageUrl } from "../hooks";
import type { Design, DesignStatus } from "../types";

export type DesignPayload = Omit<Design, "id" | "favorite" | "deleted" | "createdAt" | "imageId" | "sampleImage">;

export default function DesignForm({ design, categories, onSave, onCancel }: { design?: Design; categories: string[]; onSave: (data: DesignPayload, image?: File) => Promise<void>; onCancel: () => void }) {
  const storedImage = useImageUrl(design?.imageId, design?.sampleImage);
  const [title, setTitle] = useState(design?.title || "");
  const [description, setDescription] = useState(design?.description || "");
  const [category, setCategory] = useState(design?.category || categories[0] || "Other");
  const [tags, setTags] = useState(design?.tags ? design.tags.join(", ") : "");
  const [status, setStatus] = useState<DesignStatus>(design?.status || "Draft");
  const [date, setDate] = useState(design?.date || new Date().toISOString().slice(0, 10));
  const [isPublic, setIsPublic] = useState(design?.public ?? false);
  const [featured, setFeatured] = useState(design?.featured ?? false);
  const [image, setImage] = useState<File>();
  const [preview, setPreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!image) { setPreview(storedImage); return; }
    const url = URL.createObjectURL(image); setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image, storedImage]);

  const chooseImage = (file?: File) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) { setErrors(v => ({ ...v, image: "Choose a JPG, PNG, or WEBP image." })); return; }
    if (file.size > 10 * 1024 * 1024) { setErrors(v => ({ ...v, image: "Image must be smaller than 10 MB." })); return; }
    setErrors(v => ({ ...v, image: "" })); setImage(file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (title.trim().length < 2) nextErrors.title = "Enter a project title.";
    if (description.trim().length < 10) nextErrors.description = "Add at least 10 characters.";
    if (!category) nextErrors.category = "Choose a category.";
    if (!date) nextErrors.date = "Choose a creation date.";
    if (!design && !image) nextErrors.image = "Upload a project image.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    await onSave({ title: title.trim(), description: description.trim(), category, tags: tags.split(",").map(x => x.trim().replace(/^#/, "")).filter(Boolean), status, date, public: isPublic, featured }, image);
    setSaving(false);
  };

  return <form className="design-form" onSubmit={submit} noValidate>
    <div className="form-head"><div><span>{design ? "UPDATE PROJECT" : "NEW PROJECT"}</span><h1>{design ? "Edit design" : "Add a new design"}</h1><p>Keep your portfolio organized with useful details and a strong preview.</p></div><button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button></div>
    <div className="form-layout">
      <section className="form-panel">
        <h2>Project details</h2>
        <div className="mb-4"><label className="form-label">Project title *</label><input className={`form-control ${errors.title ? "is-invalid" : ""}`} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Sora Coffee Identity" /><div className="invalid-feedback">{errors.title}</div></div>
        <div className="mb-4"><label className="form-label">Description *</label><textarea className={`form-control ${errors.description ? "is-invalid" : ""}`} rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the brief, approach, and result..." /><div className="invalid-feedback">{errors.description}</div></div>
        <div className="row g-3 mb-4"><div className="col-md-6"><label className="form-label">Category *</label><select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></div><div className="col-md-6"><label className="form-label">Creation date *</label><input type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} /></div></div>
        <div className="mb-4"><label className="form-label">Tags</label><input className="form-control" value={tags} onChange={e => setTags(e.target.value)} placeholder="branding, typography, packaging" /><div className="form-text">Separate tags with commas.</div></div>
        <div><label className="form-label">Project status</label><div className="status-choice">{(["Published", "Draft"] as DesignStatus[]).map(item => <label key={item} className={status === item ? "selected" : ""}><input type="radio" name="status" checked={status === item} onChange={() => setStatus(item)} /><i className={`bi bi-${item === "Published" ? "globe2" : "file-earmark"}`} /><span><b>{item}</b><small>{item === "Published" ? "Visible in your portfolio" : "Keep it private for now"}</small></span></label>)}</div></div>
        <div className="visibility-options"><label><input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} disabled={status === "Draft"} /><span><b>Show on public portfolio</b><small>Drafts are always hidden from visitors.</small></span></label><label><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} disabled={!isPublic || status === "Draft"} /><span><b>Feature this project</b><small>Give it priority in the public project gallery.</small></span></label></div>
      </section>
      <aside className="upload-panel"><h2>Project artwork</h2><label className={`drop-zone ${errors.image ? "invalid" : ""}`}><input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={e => chooseImage(e.target.files?.[0])} />{preview ? <img src={preview} alt="Selected preview" /> : <div><i className="bi bi-cloud-arrow-up" /><strong>Drop or choose an image</strong><span>JPG, PNG, or WEBP up to 10 MB</span></div>}<b>{preview ? "Replace image" : "Browse files"}</b></label>{errors.image && <p className="upload-error">{errors.image}</p>}<div className="preview-note"><i className="bi bi-info-circle" /><p><b>Portfolio tip</b>Use a landscape image at least 1200px wide for the best gallery presentation.</p></div></aside>
    </div>
    <div className="form-footer"><button type="button" className="btn btn-light" onClick={onCancel}>Cancel</button><button className="btn btn-primary" disabled={saving}><i className={`bi bi-${saving ? "hourglass-split" : "check2-circle"} me-2`} />{saving ? "Saving..." : design ? "Save changes" : "Save project"}</button></div>
  </form>;
}