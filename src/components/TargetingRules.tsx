import { useCampaignStore, DEFAULT_TARGETING_CONFIG } from "@/store/campaignStore"
import type { TargetingConfig, PageRule, FrequencyMode } from "@/utils/defaults"
import { GeoTargeting } from "./GeoTargeting"

type VisitorOption = "all" | "new" | "returning"
type DeviceOption = "all" | "desktop" | "mobile" | "tablet"

export function TargetingRules() {
    const { activeCampaign, autoSave } = useCampaignStore()
    const campaign = activeCampaign()

    if (!campaign) return null

    const config: TargetingConfig = campaign.targeting_config ?? DEFAULT_TARGETING_CONFIG

    const updateConfig = (updates: Partial<TargetingConfig>) => {
        void autoSave(campaign.id, { targeting_config: { ...config, ...updates } })
    }

    const addPageRule = () => {
        const rule: PageRule = { id: Date.now().toString(), type: "contains", value: "", exclude: false }
        updateConfig({ pageRules: [...config.pageRules, rule] })
    }

    const removePageRule = (id: string) => {
        updateConfig({ pageRules: config.pageRules.filter((r) => r.id !== id) })
    }

    const updatePageRule = (id: string, updates: Partial<PageRule>) => {
        updateConfig({ pageRules: config.pageRules.map((r) => r.id === id ? { ...r, ...updates } : r) })
    }

    return (
        <div className="stack-lg">
            {/* Visitor Type */}
            <section>
                <h2 style={{ marginBottom: 8 }}>Visitor Type</h2>
                <div className="segment-group">
                    {(["all", "new", "returning"] as VisitorOption[]).map((type) => (
                        <button key={type} onClick={() => updateConfig({ visitorType: type })} className={`segment-btn ${config.visitorType === type ? "active" : ""}`}>{type}</button>
                    ))}
                </div>
            </section>

            <hr />

            {/* Device Type */}
            <section>
                <h2 style={{ marginBottom: 8 }}>Device Type</h2>
                <div className="segment-group">
                    {(["all", "desktop", "mobile", "tablet"] as DeviceOption[]).map((type) => (
                        <button key={type} onClick={() => updateConfig({ deviceType: type })} className={`segment-btn ${config.deviceType === type ? "active" : ""}`}>{type}</button>
                    ))}
                </div>
            </section>

            <hr />

            {/* Geo-Location Targeting */}
            <GeoTargeting
                config={config.geoTargeting}
                onChange={(geoTargeting) => updateConfig({ geoTargeting })}
            />

            <hr />

            {/* Page Rules */}
            <section>
                <div className="row-between" style={{ marginBottom: 8 }}>
                    <h2>URL Rules</h2>
                    <button className="btn-link" onClick={addPageRule}>+ Add Rule</button>
                </div>
                {config.pageRules.length === 0 ? (
                    <p style={{ fontStyle: "italic", color: "var(--framer-color-text-tertiary)" }}>
                        No URL rules. Popup will show on all pages.
                    </p>
                ) : (
                    <div className="stack-sm">
                        {config.pageRules.map((rule) => (
                            <div key={rule.id} className="row gap-4" style={{ padding: 6, border: "1px solid var(--framer-color-divider)", borderRadius: 6 }}>
                                <select className="compact" value={rule.exclude ? "exclude" : "include"} onChange={(e) => updatePageRule(rule.id, { exclude: e.target.value === "exclude" })}>
                                    <option value="include">Show on</option>
                                    <option value="exclude">Hide on</option>
                                </select>
                                <select className="compact" value={rule.type} onChange={(e) => updatePageRule(rule.id, { type: e.target.value as PageRule["type"] })}>
                                    <option value="exact">URL equals</option>
                                    <option value="contains">URL contains</option>
                                    <option value="regex">URL matches regex</option>
                                </select>
                                <input type="text" value={rule.value} onChange={(e) => updatePageRule(rule.id, { value: e.target.value })} placeholder="/pricing" style={{ flex: 1, fontSize: 10 }} />
                                <button className="btn-danger" onClick={() => removePageRule(rule.id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <hr />

            {/* Referrer Source */}
            <section>
                <h2 style={{ marginBottom: 8 }}>Referrer Source</h2>
                <input type="text" value={config.referrerSource} onChange={(e) => updateConfig({ referrerSource: e.target.value })} placeholder="google.com, facebook.com, etc." />
                <p style={{ fontSize: 10, marginTop: 4, color: "var(--framer-color-text-tertiary)" }}>
                    Leave empty to show for all referrers.
                </p>
            </section>

            <hr />

            {/* Date Range Scheduling */}
            <section>
                <h2 style={{ marginBottom: 8 }}>Schedule</h2>
                <div className="grid-2" style={{ gap: 8 }}>
                    <div>
                        <label>Start Date</label>
                        <input type="date" value={config.dateStart} onChange={(e) => updateConfig({ dateStart: e.target.value })} />
                    </div>
                    <div>
                        <label>End Date</label>
                        <input type="date" value={config.dateEnd} onChange={(e) => updateConfig({ dateEnd: e.target.value })} />
                    </div>
                </div>
                <p style={{ fontSize: 10, marginTop: 4, color: "var(--framer-color-text-tertiary)" }}>Leave empty for no date restrictions.</p>
            </section>

            <hr />

            {/* Frequency */}
            <section>
                <h2 style={{ marginBottom: 8 }}>Display Frequency</h2>
                <div className="segment-group" style={{ flexWrap: "wrap" }}>
                    {([
                        { value: "once", label: "Once ever" },
                        { value: "once-per-session", label: "Once/session" },
                        { value: "once-per-day", label: "Once/day" },
                        { value: "always", label: "Always" },
                    ] as { value: FrequencyMode; label: string }[]).map((opt) => (
                        <button key={opt.value} onClick={() => updateConfig({ frequency: opt.value })} className={`segment-btn ${config.frequency === opt.value ? "active" : ""}`}>{opt.label}</button>
                    ))}
                </div>
            </section>
        </div>
    )
}
