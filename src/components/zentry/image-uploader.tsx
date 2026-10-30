"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Loader2, X, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  alt?: string;
  onAltChange?: (alt: string) => void;
  label?: string;
  aspect?: "16/9" | "2/3" | "square";
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/avif";
const MAX_SIZE_MB = 5;

export function ImageUploader({
  value,
  onChange,
  alt,
  onAltChange,
  label = "Cover image",
  aspect = "16/9",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large (max ${MAX_SIZE_MB} MB)`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      onChange(data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Network error");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          handleFile(file);
          break;
        }
      }
    }
  };

  const aspectClass = aspect === "16/9" ? "aspect-[16/9]" : aspect === "2/3" ? "aspect-[2/3]" : "aspect-square";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput((v) => !v)}
          className="text-xs text-muted-foreground hover:text-amber-glow flex items-center gap-1"
        >
          <LinkIcon size={11} /> {showUrlInput ? "Upload instead" : "Use URL instead"}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <Input
            type="url"
            value={urlInput || value}
            onChange={(e) => {
              setUrlInput(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="https://images.unsplash.com/photo-..."
            className="bg-graphite/60 border-bronze/20"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowUrlInput(false)}
            className="border-bronze/30 text-amber-glow"
          >
            Done
          </Button>
        </div>
      ) : value ? (
        <div
          className={`relative ${aspectClass} w-full rounded-lg border border-bronze/20 bg-graphite/40 overflow-hidden group`}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onPaste={onPaste}
          tabIndex={0}
        >
          <Image src={value} alt={alt ?? "preview"} fill className="object-cover" unoptimized sizes="(max-width: 768px) 100vw, 400px" />
          <div className="absolute inset-0 bg-espresso/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-espresso/80 border-bronze/30 text-amber-glow">
              <Upload size={12} className="mr-1.5" /> Replace
            </Button>
            <Button size="sm" variant="outline" onClick={() => onChange("")} className="bg-espresso/80 border-red-500/40 text-red-400">
              <X size={12} className="mr-1.5" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={`${aspectClass} w-full rounded-lg border-2 border-dashed border-bronze/30 bg-graphite/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-amber-glow/50 hover:bg-graphite/50 transition-colors p-4`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          onPaste={onPaste}
          tabIndex={0}
        >
          {uploading ? (
            <Loader2 size={28} className="animate-spin text-amber-glow" />
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-bronze/15 flex items-center justify-center">
                <Upload size={20} className="text-amber-glow" />
              </div>
              <div className="text-center">
                <p className="text-sm text-foreground/90 font-medium">Click, drop, or paste an image</p>
                <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP, GIF, AVIF · max {MAX_SIZE_MB} MB</p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value && onAltChange && (
        <Input
          type="text"
          value={alt ?? ""}
          onChange={(e) => onAltChange(e.target.value)}
          placeholder="Alt text (for accessibility & SEO)"
          className="bg-graphite/60 border-bronze/20 text-sm"
        />
      )}
    </div>
  );
}
