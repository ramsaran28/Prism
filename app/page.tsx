"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Upload } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PrivacyFooter } from "@/components/PrivacyFooter";
import { fileToBase64, saveSession } from "@/lib/session";

const ACCEPT = "application/pdf,image/jpeg,image/png,image/jpg";

export default function HomePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [language, setLanguage] = useState("English");
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    const valid =
      file.type === "application/pdf" ||
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/jpg";
    if (!valid) {
      alert("Please upload a PDF, JPG, or PNG file.");
      return;
    }

    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      saveSession({
        base64,
        mimeType: file.type,
        language,
        fileName: file.name,
      });
      router.push("/analyze");
    } catch {
      alert("Could not read your file. Please try again.");
      setUploading(false);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-2 text-sm tracking-wide text-text-secondary">
            Prism · Saathi
          </p>
          <h1 className="mb-6 text-3xl font-semibold leading-tight text-text-primary md:text-5xl">
            Your report, in words you understand.
          </h1>
          <p className="mb-10 text-base leading-relaxed text-text-secondary md:text-lg">
            Upload your lab report or doctor&apos;s note. Saathi reads it,
            explains it simply, and tells you what to do next. Nothing is saved.
            Ever.
          </p>

          <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-text-secondary">
            <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />
            Zero storage. Your report never leaves your session.
          </div>

          <div className="mb-8 flex flex-col items-center gap-6">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              className="items-center"
            />

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={onInputChange}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-element bg-accent px-8 py-4 text-sm font-medium text-background transition hover:opacity-90 disabled:opacity-60"
            >
              <Upload className="h-5 w-5" />
              {uploading ? "Preparing…" : "Upload your report"}
            </button>
            <p className="text-xs text-text-secondary">PDF, JPG, or PNG</p>
          </div>

          <p className="text-xs text-text-secondary">
            This is not medical advice. Please consult a qualified doctor.
          </p>
        </div>
      </div>
      <PrivacyFooter />
    </main>
  );
}
