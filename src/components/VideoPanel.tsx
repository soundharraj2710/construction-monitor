import React, { useState, useRef } from "react";
import { UploadCloud, FileVideo, ShieldCheck, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { uploadVideoFile } from "../services/api";
import { VideoUpload } from "../types";

interface Props {
  latestVideo: VideoUpload | null;
  history: VideoUpload[];
  onUploadSuccess: () => void;
}

export default function VideoPanel({ latestVideo, history, onUploadSuccess }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("video/")) {
        setFile(droppedFile);
        setStatusText(`Selected: ${droppedFile.name}`);
      } else {
        setStatusText("Warning: Please supply a valid video format file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setStatusText(`Selected: ${selectedFile.name}`);
    }
  };

  const triggerUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(5);
    setStatusText("Multiplexing file into remote server stream...");

    try {
      // Perform the actual multipart video file upload to Express!
      const outcome = await uploadVideoFile(file, (pct) => {
        setProgress(pct);
        if (pct < 100) {
          setStatusText(`Uploading stream data: ${pct}%`);
        } else {
          setStatusText("File cached in memory. Executing AI LangGraph workflow nodes...");
        }
      });

      console.log("[VideoUpload] API returned:", outcome);
      setStatusText("Complete! Successfully processed frames.");
      onUploadSuccess(); // Reload overall statistics
      setFile(null);
      setProgress(0);
    } catch (err) {
      console.error(err);
      setStatusText(`Upload error: ${(err as any).message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="glass rounded-xl p-6 shadow-xl mb-6 border border-white/10">
      
      {/* Title */}
      <div className="border-b border-slate-700/50 pb-4 mb-4">
        <h2 className="text-md font-semibold text-white">Manual Video Upload</h2>
        <p className="text-xs text-slate-400 mt-0.5">Upload on-site drone or hand-camera footage files for sequence check-up</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Drag panel */}
        <div>
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? "border-blue-500 bg-blue-500/5"
                : "border-slate-800 hover:border-slate-700 bg-slate-950/25"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <UploadCloud size={32} className={file ? "text-blue-400 animate-bounce" : "text-slate-500"} />
              <p className="text-xs text-slate-300 font-medium">
                {file ? "Video Selected (Ready to Scan)" : "Drag & Drop video file here, or click to explore"}
              </p>
              <p className="text-[10px] text-slate-500">
                Supports MP4, WebM, MOV files. (Under 45MB)
              </p>
            </div>
          </div>

          {/* Upload Status / Actions */}
          {file && (
            <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between font-mono">
              <div className="flex items-center space-x-2 text-xs text-slate-300">
                <FileVideo size={16} className="text-blue-400 shrink-0" />
                <span className="truncate">{file.name}</span>
                <span className="text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>

              {!isUploading ? (
                <div className="flex space-x-2 mt-4 font-mono text-xs">
                  <button
                    onClick={() => setFile(null)}
                    className="flex-1 py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 font-medium outline-none"
                  >
                    Clear File
                  </button>
                  <button
                    onClick={triggerUpload}
                    className="flex-1 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider outline-none shadow-lg shadow-blue-500/10"
                  >
                    Ingest & Analyze
                  </button>
                </div>
              ) : (
                <div className="mt-4 font-mono">
                  {/* Progress gauge */}
                  <div className="w-full bg-slate-900 rounded-full h-1 relative overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                    <span className="flex items-center space-x-1">
                      <RefreshCw size={10} className="animate-spin text-blue-400" />
                      <span>{statusText}</span>
                    </span>
                    <span>{progress}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning / Feedback text */}
          {!file && statusText && (
            <p className="text-[10px] text-slate-400 font-mono mt-2 flex items-center space-x-1.5">
              <span className="h-1 w-1 bg-blue-400 rounded-full shrink-0 animate-pulse"></span>
              <span>{statusText}</span>
            </p>
          )}
        </div>

        {/* Right latest analysis results drawer */}
        <div>
          {latestVideo ? (
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3 font-mono">
                  <span className="text-xs font-semibold text-white">Latest Video Sequence Analysis</span>
                  <span className="text-[10px] text-slate-500">{new Date(latestVideo.timestamp).toLocaleTimeString()}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-4">
                  <div className="bg-slate-950/40 p-2 rounded border border-slate-800/60 font-mono">
                    <span className="block text-[9px] text-slate-400 uppercase">Workers</span>
                    <span className="text-sm font-bold text-white font-mono">{latestVideo.extractedData.workerCount}</span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded border border-slate-800/60 font-mono">
                    <span className="block text-[9px] text-slate-400 uppercase">Helmets</span>
                    <span className={`text-sm font-bold font-mono ${latestVideo.extractedData.helmetCount < latestVideo.extractedData.workerCount ? "text-red-400" : "text-emerald-400"}`}>
                      {latestVideo.extractedData.helmetCount}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded border border-slate-800/60 font-mono">
                    <span className="block text-[9px] text-slate-400 uppercase">Vehicles</span>
                    <span className="text-sm font-bold text-white font-mono">{latestVideo.extractedData.vehicleCount}</span>
                  </div>
                </div>

                {/* Materials & Safety Summary */}
                <div className="space-y-3 font-mono">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Materials</span>
                    <div className="flex flex-wrap gap-1">
                      {latestVideo.extractedData.materials.map((m, i) => (
                        <span key={i} className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-805 text-slate-300 border border-white/5">{m}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400 block mb-1">Safety logs</span>
                    {latestVideo.extractedData.safetyIssues.length > 0 ? (
                      <div className="flex items-start space-x-1.5 p-2 rounded bg-red-500/10 border border-red-500/20 text-[10px] text-red-300 font-mono">
                        <ShieldAlert size={12} className="text-red-400 mt-0.5 shrink-0" />
                        <p>{latestVideo.extractedData.safetyIssues.join(", ")}</p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1.5 p-2 rounded bg-emerald-500/10 border border-emerald-500/15 text-[10px] text-emerald-300">
                        <ShieldCheck size={12} className="text-emerald-400 shrink-0" />
                        <span>Sequence contains full safety/PPE alignment.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-900 pt-3 mt-4">
                <p className="text-[11px] leading-relaxed italic text-slate-400 font-sans">
                  "{latestVideo.extractedData.activitySummary}"
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 border border-slate-805 rounded-xl bg-slate-950/20 text-center text-xs text-slate-500 italic font-mono">
              No manual uploads currently buffered. Upload a clip to inspect workspace parameters.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
