import type { GeoTargetingConfig, GeoRule } from "@/utils/defaults"

interface GeoTargetingProps {
    config: GeoTargetingConfig
    onChange: (config: GeoTargetingConfig) => void
}

const COMMON_COUNTRIES = [
    "US", "CA", "GB", "DE", "FR", "AU", "NL", "SE", "NO", "DK",
    "ES", "IT", "PT", "BR", "MX", "JP", "KR", "IN", "SG", "AE",
]

export function GeoTargeting({ config, onChange }: GeoTargetingProps) {
    const update = (updates: Partial<GeoTargetingConfig>) => {
        onChange({ ...config, ...updates })
    }

    const addRule = () => {
        const rule: GeoRule = {
            id: Date.now().toString(),
            countries: [],
            action: "show",
            message: "",
        }
        update({ rules: [...config.rules, rule] })
    }

    const removeRule = (id: string) => {
        update({ rules: config.rules.filter((r) => r.id !== id) })
    }

    const updateRule = (id: string, updates: Partial<GeoRule>) => {
        update({ rules: config.rules.map((r) => r.id === id ? { ...r, ...updates } : r) })
    }

    const toggleCountry = (ruleId: string, country: string) => {
        const rule = config.rules.find((r) => r.id === ruleId)
        if (!rule) return
        const countries = rule.countries.includes(country)
            ? rule.countries.filter((c) => c !== country)
            : [...rule.countries, country]
        updateRule(ruleId, { countries })
    }

    return (
        <section className="stack">
            <div className="row-between">
                <div>
                    <h2>Geo-Location Targeting</h2>
                    <p style={{ marginTop: 4 }}>Show or hide popups based on visitor country.</p>
                </div>
                <button
                    onClick={() => update({ enabled: !config.enabled })}
                    className={`toggle ${config.enabled ? "on" : ""}`}
                >
                    <span className="toggle-knob" />
                </button>
            </div>

            {config.enabled && (
                <div className="stack" style={{ paddingTop: 8, borderTop: "1px solid var(--framer-color-divider)" }}>
                    <p style={{ fontSize: 10, color: "var(--framer-color-text-tertiary)" }}>
                        Uses client-side IP detection via a free geo-IP API. EU visitors can see GDPR-friendly messaging.
                    </p>

                    {config.rules.map((rule) => (
                        <div key={rule.id} className="card" style={{ padding: 10 }}>
                            <div className="row-between" style={{ marginBottom: 8 }}>
                                <select
                                    className="compact"
                                    value={rule.action}
                                    onChange={(e) => updateRule(rule.id, { action: e.target.value as "show" | "hide" })}
                                >
                                    <option value="show">Show popup in</option>
                                    <option value="hide">Hide popup in</option>
                                </select>
                                <button className="btn-danger" style={{ fontSize: 10 }} onClick={() => removeRule(rule.id)}>Remove</button>
                            </div>

                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
                                {COMMON_COUNTRIES.map((code) => (
                                    <button
                                        key={code}
                                        onClick={() => toggleCountry(rule.id, code)}
                                        className={`segment-btn ${rule.countries.includes(code) ? "active" : ""}`}
                                        style={{ padding: "2px 6px", fontSize: 10 }}
                                    >
                                        {code}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label style={{ fontSize: 10 }}>Custom message for these visitors (optional)</label>
                                <input
                                    type="text"
                                    value={rule.message}
                                    onChange={(e) => updateRule(rule.id, { message: e.target.value })}
                                    placeholder="e.g., GDPR-compliant offer for EU visitors"
                                    style={{ fontSize: 11 }}
                                />
                            </div>
                        </div>
                    ))}

                    <button onClick={addRule} className="btn-link" style={{ fontSize: 11 }}>+ Add Geo Rule</button>
                </div>
            )}
        </section>
    )
}
