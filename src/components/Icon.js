function Icon({ name, size = 16, className = "" }) {
    const iconRef = React.useRef(null);

    React.useEffect(() => {
        if (iconRef.current && window.lucide) {
            window.lucide.createIcons({
                attrs: {
                    class: className,
                    width: size,
                    height: size,
                    "stroke-width": 2,
                },
                nameAttr: "data-lucide",
                icons: {
                    [name]: true
                }
            });
        }
    }, [name, size, className]);

    // Note: Lucide React usually uses a different approach, 
    // but in a standalone Babel environment with UMD Lucide, 
    // this manual approach or using a data-lucide attribute is common.
    // We'll use the data-lucide attribute which is standard for Lucide UMD.

    return <i data-lucide={name} style={{ width: size, height: size }} className={className}></i>;
}

window.Icon = Icon;
