import type { PopupConfig } from "@/utils/defaults"

interface PreviewPanelProps {
    config: PopupConfig
}

export default function PreviewPanel({ config }: PreviewPanelProps) {
    const bg = config.backgroundGradient || config.backgroundColor
    const isBanner = config.popupType === "banner-top" || config.popupType === "banner-bottom"
    const isToast = config.popupType === "toast"

    const shadowLevels = [
        "none",
        "0 1px 3px rgba(0,0,0,0.1)",
        "0 4px 12px rgba(0,0,0,0.12)",
        "0 8px 24px rgba(0,0,0,0.15)",
        "0 12px 36px rgba(0,0,0,0.2)",
        "0 20px 50px rgba(0,0,0,0.25)",
    ]

    return (
        <div className="preview-container">
            <div className="preview-header">
                Preview: {config.popupType}
            </div>
            <div
                style={{
                    padding: isBanner ? "12px 16px" : "20px",
                    textAlign: isBanner ? "left" : "center",
                    background: "#f0f0f0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 120,
                }}
            >
                <div
                    style={{
                        background: bg,
                        backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        color: config.textColor,
                        borderRadius: isBanner ? 0 : config.borderRadius,
                        boxShadow: shadowLevels[Math.min(config.shadowIntensity, 5)],
                        padding: isBanner ? "12px 16px" : "20px",
                        maxWidth: isToast ? 260 : isBanner ? "100%" : Math.min(config.maxWidth, 300),
                        width: isBanner ? "100%" : "auto",
                        position: "relative",
                        display: isBanner ? "flex" : "block",
                        alignItems: "center",
                        gap: isBanner ? "12px" : undefined,
                    }}
                >
                    {config.closeButtonStyle !== "none" && (
                        <span style={{
                            position: "absolute",
                            top: 4,
                            right: 8,
                            fontSize: config.closeButtonStyle === "text" ? 10 : 16,
                            opacity: 0.5,
                            color: config.textColor,
                        }}>
                            {config.closeButtonStyle === "text" ? "Close" : "\u00D7"}
                        </span>
                    )}

                    {config.imageUrl && !isBanner && (
                        <img
                            src={config.imageUrl}
                            alt=""
                            style={{
                                maxWidth: isToast ? 60 : 120,
                                maxHeight: isToast ? 60 : 100,
                                borderRadius: 6,
                                display: "block",
                                margin: "0 auto 8px auto",
                                objectFit: "cover",
                            }}
                        />
                    )}

                    <div style={isBanner ? { flex: 1 } : undefined}>
                        <h3 style={{
                            color: "inherit",
                            fontSize: isBanner || isToast ? 12 : 16,
                            fontWeight: 700,
                            margin: "0 0 4px 0",
                        }}>
                            {config.headline}
                        </h3>
                        {(!isBanner || isToast) && (
                            <p style={{
                                color: "inherit",
                                fontSize: isToast ? 9 : 10,
                                opacity: 0.8,
                                margin: "0 0 8px 0",
                                lineHeight: 1.4,
                            }}>
                                {config.body}
                            </p>
                        )}
                    </div>

                    <div style={isBanner ? { display: "flex", alignItems: "center", gap: 6 } : undefined}>
                        {config.formFields.map((field) => (
                            <input
                                key={field.id}
                                type="text"
                                placeholder={field.placeholder}
                                readOnly
                                style={{
                                    maxWidth: isBanner ? 120 : 180,
                                    margin: isBanner ? 0 : "0 auto 4px auto",
                                    display: "block",
                                    padding: "4px 6px",
                                    fontSize: 10,
                                    border: "1px solid #ddd",
                                    borderRadius: 4,
                                }}
                            />
                        ))}
                        <button
                            style={{
                                backgroundColor: config.buttonColor,
                                color: config.buttonTextColor,
                                padding: isBanner || isToast ? "4px 12px" : "6px 16px",
                                borderRadius: 4,
                                fontWeight: 600,
                                fontSize: isBanner || isToast ? 10 : 11,
                                display: isBanner ? "inline-block" : "block",
                                margin: isBanner ? 0 : "4px auto 0 auto",
                                border: "none",
                            }}
                        >
                            {config.ctaText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
