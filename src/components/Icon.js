function resolveLucideIcon(name) {
  const icons = window.lucide?.icons;
  if (!icons || !name) return null;

  const raw = String(name).trim();
  const kebab = raw
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
  const pascal = kebab
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

  return (
    icons[raw] ||
    icons[kebab] ||
    icons[pascal] ||
    icons[raw.toLowerCase()] ||
    null
  );
}

function Icon({ name, size = 16, className = "", strokeWidth = 2 }) {
  const iconNode = React.useMemo(() => resolveLucideIcon(name), [name]);
  const nodeDef = iconNode?.iconNode;

  if (!Array.isArray(nodeDef)) {
    return (
      <span
        className={className}
        style={{ width: size, height: size, display: "inline-block" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {nodeDef.map(([tag, attrs], index) =>
        React.createElement(tag, { ...(attrs || {}), key: index })
      )}
    </svg>
  );
}

window.Icon = Icon;
