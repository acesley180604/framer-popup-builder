import type { SpinWheelConfig, SpinWheelSegment } from "@/utils/defaults"

interface SpinWheelProps {
    config: SpinWheelConfig
    onChange: (config: SpinWheelConfig) => void
}

export function SpinWheel({ config, onChange }: SpinWheelProps) {
    const update = <K extends keyof SpinWheelConfig>(key: K, value: SpinWheelConfig[K]) => {
        onChange({ ...config, [key]: value })
    }

    const updateSegment = (id: string, updates: Partial<SpinWheelSegment>) => {
        const segments = config.segments.map((s) =>
            s.id === id ? { ...s, ...updates } : s
        )
        update("segments", segments)
    }

    const addSegment = () => {
        if (config.segments.length >= 8) return
        const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]
        const newSegment: SpinWheelSegment = {
            id: Date.now().toString(),
            label: "New Prize",
            value: "CODE",
            probability: 10,
            color: colors[config.segments.length % colors.length],
            isNoPrize: false,
        }
        update("segments", [...config.segments, newSegment])
    }

    const removeSegment = (id: string) => {
        if (config.segments.length <= 4) return
        update("segments", config.segments.filter((s) => s.id !== id))
    }

    return (
        <section className="stack">
            <div className="row-between">
                <div>
                    <h2>Spin Wheel</h2>
                    <p style={{ marginTop: 4 }}>Configure prize segments for gamified popups.</p>
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
                    <div className="row-between">
                        <label style={{ margin: 0 }}>Segments ({config.segments.length}/8)</label>
                        {config.segments.length < 8 && (
                            <button className="btn-link" onClick={addSegment}>+ Add Segment</button>
                        )}
                    </div>

                    {config.segments.map((segment) => (
                        <div key={segment.id} className="card" style={{ padding: 8 }}>
                            <div className="row-between" style={{ marginBottom: 6 }}>
                                <div className="row gap-6">
                                    <input
                                        type="color"
                                        value={segment.color}
                                        onChange={(e) => updateSegment(segment.id, { color: e.target.value })}
                                        style={{ width: 24, height: 24 }}
                                    />
                                    <input
                                        type="text"
                                        value={segment.label}
                                        onChange={(e) => updateSegment(segment.id, { label: e.target.value })}
                                        style={{ width: 80, fontSize: 11 }}
                                        placeholder="Label"
                                    />
                                </div>
                                <div className="row gap-4">
                                    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, margin: 0 }}>
                                        <input
                                            type="checkbox"
                                            checked={segment.isNoPrize}
                                            onChange={(e) => updateSegment(segment.id, { isNoPrize: e.target.checked, value: e.target.checked ? "" : segment.value })}
                                        />
                                        No Prize
                                    </label>
                                    {config.segments.length > 4 && (
                                        <button className="btn-danger" style={{ fontSize: 10 }} onClick={() => removeSegment(segment.id)}>
                                            Del
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="grid-2" style={{ gap: 6 }}>
                                {!segment.isNoPrize && (
                                    <div>
                                        <label style={{ fontSize: 10 }}>Coupon Code</label>
                                        <input
                                            type="text"
                                            value={segment.value}
                                            onChange={(e) => updateSegment(segment.id, { value: e.target.value })}
                                            placeholder="SAVE10"
                                            style={{ fontSize: 11 }}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label style={{ fontSize: 10 }}>Weight ({segment.probability})</label>
                                    <input
                                        type="range"
                                        min={1}
                                        max={100}
                                        value={segment.probability}
                                        onChange={(e) => updateSegment(segment.id, { probability: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <hr />

                    <div>
                        <label>Spin Button Text</label>
                        <input
                            type="text"
                            value={config.spinButtonText}
                            onChange={(e) => update("spinButtonText", e.target.value)}
                            placeholder="Spin to Win!"
                        />
                    </div>

                    <div>
                        <label>Prize Message (use {"{value}"} for coupon code)</label>
                        <input
                            type="text"
                            value={config.prizeMessage}
                            onChange={(e) => update("prizeMessage", e.target.value)}
                            placeholder="You won: {value}!"
                        />
                    </div>

                    <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <input
                            type="checkbox"
                            checked={config.emailBeforeSpin}
                            onChange={(e) => update("emailBeforeSpin", e.target.checked)}
                        />
                        <span>Require email before spinning</span>
                    </label>

                    <div className="grid-2" style={{ gap: 8 }}>
                        <div>
                            <label>Wheel Border</label>
                            <div className="color-row">
                                <input type="color" value={config.wheelBorderColor} onChange={(e) => update("wheelBorderColor", e.target.value)} />
                                <input type="text" value={config.wheelBorderColor} onChange={(e) => update("wheelBorderColor", e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label>Pointer Color</label>
                            <div className="color-row">
                                <input type="color" value={config.pointerColor} onChange={(e) => update("pointerColor", e.target.value)} />
                                <input type="text" value={config.pointerColor} onChange={(e) => update("pointerColor", e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}
