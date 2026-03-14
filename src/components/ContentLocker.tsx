import type { ContentLockerConfig, ContentLockMode, ContentLockDuration } from "@/utils/defaults"

interface ContentLockerProps {
    config: ContentLockerConfig
    onChange: (config: ContentLockerConfig) => void
}

export function ContentLocker({ config, onChange }: ContentLockerProps) {
    const update = <K extends keyof ContentLockerConfig>(key: K, value: ContentLockerConfig[K]) => {
        onChange({ ...config, [key]: value })
    }

    return (
        <section className="stack">
            <div className="row-between">
                <div>
                    <h2>Content Locking</h2>
                    <p style={{ marginTop: 4 }}>Lock page content behind email signup.</p>
                </div>
                <button
                    onClick={() => update("enabled", !config.enabled)}
                    className={`toggle ${config.enabled ? "on" : ""}`}
                >
                    <span className="toggle-knob" />
                </button>
            </div>

            {config.enabled && (
                <div className="stack" style={{ paddingTop: 8, borderTop: "1px solid var(--framer-color-divider)" }}>
                    <div>
                        <label>Lock Mode</label>
                        <div className="segment-group">
                            {(["blur", "hide"] as ContentLockMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => update("lockMode", mode)}
                                    className={`segment-btn ${config.lockMode === mode ? "active" : ""}`}
                                >
                                    {mode === "blur" ? "Blur Content" : "Hide Content"}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label>CSS Selectors to Lock</label>
                        <input
                            type="text"
                            value={config.selectors}
                            onChange={(e) => update("selectors", e.target.value)}
                            placeholder=".premium-content, .locked-section"
                        />
                        <p style={{ fontSize: 10, marginTop: 4, color: "var(--framer-color-text-tertiary)" }}>
                            Comma-separated CSS selectors for elements to lock.
                        </p>
                    </div>

                    {config.lockMode === "blur" && (
                        <div>
                            <label>Blur Amount ({config.blurAmount}px)</label>
                            <input
                                type="range"
                                min={2}
                                max={20}
                                value={config.blurAmount}
                                onChange={(e) => update("blurAmount", parseInt(e.target.value))}
                            />
                        </div>
                    )}

                    <div>
                        <label>Overlay Message</label>
                        <input
                            type="text"
                            value={config.overlayMessage}
                            onChange={(e) => update("overlayMessage", e.target.value)}
                            placeholder="Subscribe to unlock this content"
                        />
                    </div>

                    <div>
                        <label>Unlock Duration</label>
                        <div className="segment-group">
                            {(["session", "permanent"] as ContentLockDuration[]).map((dur) => (
                                <button
                                    key={dur}
                                    onClick={() => update("unlockDuration", dur)}
                                    className={`segment-btn ${config.unlockDuration === dur ? "active" : ""}`}
                                >
                                    {dur === "session" ? "This Session" : "Permanent"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
