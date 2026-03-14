import type { CountdownConfig, CountdownMode, CountdownExpiredBehavior } from "@/utils/defaults"

interface CountdownTimerProps {
    config: CountdownConfig
    onChange: (config: CountdownConfig) => void
}

export function CountdownTimer({ config, onChange }: CountdownTimerProps) {
    const update = <K extends keyof CountdownConfig>(key: K, value: CountdownConfig[K]) => {
        onChange({ ...config, [key]: value })
    }

    return (
        <section className="stack">
            <div className="row-between">
                <div>
                    <h2>Countdown Timer</h2>
                    <p style={{ marginTop: 4 }}>Add urgency with a live countdown in your popup.</p>
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
                        <label>Timer Mode</label>
                        <div className="segment-group">
                            {(["evergreen", "fixed"] as CountdownMode[]).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => update("mode", mode)}
                                    className={`segment-btn ${config.mode === mode ? "active" : ""}`}
                                >
                                    {mode === "evergreen" ? "Evergreen" : "Fixed Deadline"}
                                </button>
                            ))}
                        </div>
                    </div>

                    {config.mode === "evergreen" ? (
                        <div>
                            <label>Duration (minutes)</label>
                            <input
                                type="number"
                                min={1}
                                max={1440}
                                value={config.evergreenMinutes}
                                onChange={(e) => update("evergreenMinutes", parseInt(e.target.value) || 30)}
                            />
                            <p style={{ fontSize: 10, marginTop: 4, color: "var(--framer-color-text-tertiary)" }}>
                                Timer resets per visitor. Each visitor gets their own countdown.
                            </p>
                        </div>
                    ) : (
                        <div>
                            <label>Deadline Date &amp; Time</label>
                            <input
                                type="datetime-local"
                                value={config.fixedDeadline}
                                onChange={(e) => update("fixedDeadline", e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label>Display Units</label>
                        <div className="row gap-8">
                            {([
                                { key: "showDays" as const, label: "Days" },
                                { key: "showHours" as const, label: "Hours" },
                                { key: "showMinutes" as const, label: "Minutes" },
                                { key: "showSeconds" as const, label: "Seconds" },
                            ]).map((unit) => (
                                <label key={unit.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                                    <input
                                        type="checkbox"
                                        checked={config[unit.key]}
                                        onChange={(e) => update(unit.key, e.target.checked)}
                                    />
                                    {unit.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid-2" style={{ gap: 8 }}>
                        <div>
                            <label>Digit Color</label>
                            <div className="color-row">
                                <input type="color" value={config.digitColor} onChange={(e) => update("digitColor", e.target.value)} />
                                <input type="text" value={config.digitColor} onChange={(e) => update("digitColor", e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label>Digit Background</label>
                            <div className="color-row">
                                <input type="color" value={config.digitBgColor} onChange={(e) => update("digitBgColor", e.target.value)} />
                                <input type="text" value={config.digitBgColor} onChange={(e) => update("digitBgColor", e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label>Label Color</label>
                            <div className="color-row">
                                <input type="color" value={config.labelColor} onChange={(e) => update("labelColor", e.target.value)} />
                                <input type="text" value={config.labelColor} onChange={(e) => update("labelColor", e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label>When Timer Expires</label>
                        <select
                            value={config.expiredBehavior}
                            onChange={(e) => update("expiredBehavior", e.target.value as CountdownExpiredBehavior)}
                        >
                            <option value="hide">Hide popup</option>
                            <option value="message">Show expired message</option>
                            <option value="redirect">Redirect to URL</option>
                        </select>
                    </div>

                    {config.expiredBehavior === "message" && (
                        <div>
                            <label>Expired Message</label>
                            <input
                                type="text"
                                value={config.expiredMessage}
                                onChange={(e) => update("expiredMessage", e.target.value)}
                                placeholder="This offer has expired."
                            />
                        </div>
                    )}

                    {config.expiredBehavior === "redirect" && (
                        <div>
                            <label>Redirect URL</label>
                            <input
                                type="url"
                                value={config.expiredRedirectUrl}
                                onChange={(e) => update("expiredRedirectUrl", e.target.value)}
                                placeholder="https://example.com/expired"
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    )
}
