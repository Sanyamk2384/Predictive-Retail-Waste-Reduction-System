import { IconClose } from "./icons.jsx";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg border border-hairline bg-canvas p-6 shadow-elevated">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted hover:bg-surface-soft" aria-label="Close">
            <IconClose />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
