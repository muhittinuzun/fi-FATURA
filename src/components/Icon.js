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

  const svgMarkup = React.useMemo(() => {
    if (!iconNode?.toSvg) return "";
    return iconNode.toSvg({
      width: size,
      height: size,
      class: className,
      "stroke-width": strokeWidth,
    });
  }, [iconNode, size, className, strokeWidth]);

  if (!svgMarkup) {
    return (
      <span
        className={className}
        style={{ width: size, height: size, display: "inline-block" }}
        aria-hidden="true"
      />
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}

window.Icon = Icon;
