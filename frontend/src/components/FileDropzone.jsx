import { useRef, useState } from "react";

export default function FileDropzone({ onFileSelected, disabled, selectedFileName }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors ${
        disabled ? "cursor-not-allowed opacity-60" : "hover:border-ink"
      } ${isDragging ? "border-ink bg-surface-soft" : "border-hairline"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
      <span className="text-sm font-medium text-ink">
        {selectedFileName ? selectedFileName : "Drag a CSV file here, or click to browse"}
      </span>
      <span className="text-xs text-muted">Only .csv files are accepted</span>
    </div>
  );
}
