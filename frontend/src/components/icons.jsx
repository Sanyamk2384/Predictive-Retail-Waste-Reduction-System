// Minimal hand-authored line icons (no icon library in the stack).
const base = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export const IconGrid = (props) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

export const IconUpload = (props) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
    <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
    <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
  </svg>
);

export const IconBox = (props) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
    <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export const IconLayers = (props) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
    <path d="M12 3l9 5-9 5-9-5 9-5Z" />
    <path d="M3 13l9 5 9-5" />
  </svg>
);

export const IconStore = (props) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
    <path d="M4 9l1-5h14l1 5" />
    <path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z" />
    <path d="M9 20v-5h6v5" />
  </svg>
);

export const IconUser = (props) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" />
  </svg>
);

export const IconLogout = (props) => (
  <svg viewBox="0 0 24 24" width={18} height={18} {...base} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const IconMenu = (props) => (
  <svg viewBox="0 0 24 24" width={20} height={20} {...base} {...props}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export const IconClose = (props) => (
  <svg viewBox="0 0 24 24" width={20} height={20} {...base} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
