"use client";

import { useState } from "react";
import Image from "next/image";
import { uploadImage, UploadError } from "@/lib/upload";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await uploadImage(file);
      onChange(result.secureUrl);
    } catch (err) {
      setError(err instanceof UploadError ? err.message : "Could not upload image");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  }

  return (
    <div>
      <span className="font-body text-sm text-text">Cover image</span>
      <div className="mt-1 flex items-center gap-4">
        {value ? (
          <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-bg">
            <Image src={value} alt="Cover preview" fill sizes="80px" className="object-cover" />
          </div>
        ) : (
          <div className="grid size-20 shrink-0 place-items-center rounded-lg border border-dashed border-border font-body text-xs text-muted">
            No image
          </div>
        )}
        <label className="cursor-pointer rounded-md border border-border px-4 py-2 font-body text-sm text-text hover:border-accent hover:text-accent">
          {busy ? "Uploading…" : value ? "Replace" : "Upload image"}
          <input type="file" accept="image/*" onChange={handleFile} disabled={busy} className="hidden" />
        </label>
      </div>
      {error && <p className="mt-1 font-body text-sm text-sale">{error}</p>}
    </div>
  );
}
