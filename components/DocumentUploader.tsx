"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";

interface PipelineStep {
  number: number;
  label: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { number: 1, label: "Upload document" },
  { number: 2, label: "Extract text" },
  { number: 3, label: "Clean text" },
  { number: 4, label: "Detect sections" },
  { number: 5, label: "Identify clauses" },
  { number: 6, label: "Analyze clauses" },
  { number: 7, label: "Generate summary" },
  { number: 8, label: "Calculate risk" },
  { number: 9, label: "Generate actions" },
];

interface DocumentUploaderProps {
  onUploadComplete?: (documentId: string) => void;
  compact?: boolean;
}

export default function DocumentUploader({ onUploadComplete, compact = false }: DocumentUploaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState("");
  const [successDocId, setSuccessDocId] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt"].includes(ext || "")) {
      setError("Please select a PDF, DOCX, or TXT file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10MB limit. Please upload a smaller file.");
      return;
    }
    setSelectedFile(file);
  };

  const startUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError("");
    setCurrentStepIndex(0);

    // Simulate progressive visual feedback through the 9-stage pipeline while server processes
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < 7) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to analyze document.");
        setIsProcessing(false);
        return;
      }

      // Complete last steps visually
      setCurrentStepIndex(8);
      setSuccessDocId(data.document.id);

      setTimeout(() => {
        if (onUploadComplete) {
          onUploadComplete(data.document.id);
        } else {
          router.push(`/documents/${data.document.id}`);
        }
      }, 700);
    } catch (err) {
      clearInterval(stepInterval);
      setError("A network error occurred while uploading. Please retry.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-200">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Processing Pipeline Modal/View */}
      {isProcessing ? (
        <div className="rounded-2xl border border-blue-500/30 bg-[#0d101d] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400 animate-spin" />
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {successDocId ? "Analysis Ready!" : "AI Legal Pipeline Active"}
                </h3>
                <p className="text-xs text-gray-400">
                  Processing: <span className="text-gray-200">{selectedFile?.name}</span>
                </p>
              </div>
            </div>
            <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-mono text-blue-300">
              Stage {currentStepIndex + 1} / 9
            </span>
          </div>

          {/* 9-Stage Progress Indicators */}
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
            {PIPELINE_STEPS.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.number}
                  className={`rounded-lg p-2 text-center border transition-all ${
                    isDone
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : isCurrent
                      ? "border-blue-500 bg-blue-500/20 text-blue-200 shadow-md shadow-blue-500/20"
                      : "border-[#1e2336] bg-[#090b14] text-gray-500"
                  }`}
                >
                  <div className="text-[10px] font-mono mb-0.5">
                    {isDone ? "✓" : `0${step.number}`}
                  </div>
                  <div className="text-[10px] font-medium leading-tight line-clamp-2">
                    {step.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Status Description */}
          <div className="rounded-xl border border-[#1e2336] bg-[#090b14] p-3 flex items-center justify-between text-xs">
            <span className="text-gray-400">Active Stage:</span>
            <span className="font-semibold text-blue-300 flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
              {PIPELINE_STEPS[currentStepIndex]?.label}...
            </span>
          </div>
        </div>
      ) : (
        /* Drag and drop upload zone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all p-8 text-center flex flex-col items-center justify-center ${
            dragActive
              ? "border-blue-500 bg-blue-500/10"
              : "border-[#242b42] bg-[#0d0f1a] hover:border-[#384266]"
          } ${compact ? "py-6" : "py-10"}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleChange}
            className="hidden"
          />

          <div className="h-14 w-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
            <UploadCloud className="h-7 w-7" />
          </div>

          {selectedFile ? (
            <div className="space-y-3 max-w-sm">
              <div className="rounded-xl border border-[#272e48] bg-[#141828] p-3 text-left flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText className="h-5 w-5 text-blue-400 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-semibold text-white truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-gray-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.name.split(".").pop()?.toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 text-gray-400 hover:text-rose-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={startUpload}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-2.5 text-xs font-semibold text-white shadow-md transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Start AI Extraction & Analysis
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 max-w-md">
              <p className="text-sm font-semibold text-white">
                Drag and drop your legal contract here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-400 hover:text-blue-300 underline font-medium"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-gray-400">
                Supports PDF, Word (DOCX), and Plain Text (TXT) up to 10MB
              </p>
              <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Private & Isolated
                </span>
                <span>•</span>
                <span>9-Stage AI Analysis Pipeline</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
