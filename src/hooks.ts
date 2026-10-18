import { useEffect, useState } from "react";
import { getImage } from "./services/storageService";

export function useImageUrl(imageId?: string, sampleImage?: string) {
  const [url, setUrl] = useState(sampleImage || "");
  useEffect(() => {
    let objectUrl = "";
    if (!imageId) { setUrl(sampleImage || ""); return; }
    getImage(imageId).then((blob) => {
      if (blob) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); }
    });
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [imageId, sampleImage]);
  return url;
}