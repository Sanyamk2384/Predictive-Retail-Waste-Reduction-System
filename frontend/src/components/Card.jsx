export default function Card({ className = "", children, as: Component = "div", ...props }) {
  return (
    <Component
      className={`rounded-lg border border-hairline bg-canvas p-6 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
