import { useCampaignStore, DEFAULT_TRIGGER_CONFIG } from "@/store/campaignStore"
import type { TriggerConfig as TriggerConfigType, TriggerType } from "@/utils/defaults"

const TRIGGER_DESCRIPTIONS: Record<TriggerType, string> = {
    "time-delay": "Shows after a set number of seconds on page",
    scroll: "Shows after visitor scrolls past a percentage of the page",
    "exit-intent": "Shows when visitor moves cursor toward browser close/back",
    click: "Shows when visitor clicks a specific element (CSS selector)",
    "page-load": "Shows immediately when the page loads",
    inactivity: "Shows after visitor becomes idle on the page",
}

export default function TriggerConfig() {
    const { activeCampaign, autoSave } = useCampaignStore()
    const campaign = activeCampaign()

    if (!campaign) return null

    const triggers: TriggerConfigType[] = campaign.trigger_config ?? DEFAULT_TRIGGER_CONFIG

    const toggleTrigger = (index: number) => {
        const updated = triggers.map((t, i) =>
            i === index ? { ...t, enabled: !t.enabled } : t
        )
        autoSave(campaign.id, { trigger_config: updated })
    }

    const updateConfig = (index: number, key: string, value: number | string) => {
        const updated = triggers.map((t, i) =>
            i === index ? { ...t, config: { ...t.config, [key]: value } } : t
        )
        autoSave(campaign.id, { trigger_config: updated })
    }

    return (
        <div className="stack">
            <p>
                Configure when your popup appears. Enable multiple triggers to maximize conversions.
            </p>

            {triggers.map((trigger, index) => (
                <div
                    key={trigger.type}
                    className={trigger.enabled ? "card card-active" : "card"}
                >
                    <div className="row-between" style={{ marginBottom: 6 }}>
                        <div>
                            <h3 className="capitalize">
                                {trigger.type.replace(/-/g, " ")}
                            </h3>
                            <p style={{ fontSize: 10, marginTop: 2 }}>
                                {TRIGGER_DESCRIPTIONS[trigger.type]}
                            </p>
                        </div>
                        <button
                            onClick={() => toggleTrigger(index)}
                            className={`toggle ${trigger.enabled ? "on" : ""}`}
                        >
                            <span className="toggle-knob" />
                        </button>
                    </div>

                    {trigger.enabled && (
                        <div style={{ paddingTop: 8, marginTop: 8, borderTop: "1px solid var(--framer-color-divider)" }}>
                            {trigger.type === "time-delay" && (
                                <div>
                                    <label>Delay (seconds)</label>
                                    <input
                                        type="number"
                                        className="compact"
                                        min={1}
                                        max={120}
                                        value={(trigger.config.seconds as number) ?? 5}
                                        onChange={(e) =>
                                            updateConfig(index, "seconds", parseInt(e.target.value))
                                        }
                                    />
                                </div>
                            )}
                            {trigger.type === "scroll" && (
                                <div>
                                    <label>Scroll percentage</label>
                                    <input
                                        type="range"
                                        min={10}
                                        max={90}
                                        step={5}
                                        value={(trigger.config.percentage as number) ?? 50}
                                        onChange={(e) =>
                                            updateConfig(index, "percentage", parseInt(e.target.value))
                                        }
                                    />
                                    <span style={{ fontSize: 11, color: "var(--framer-color-text-tertiary)" }}>
                                        {trigger.config.percentage}%
                                    </span>
                                </div>
                            )}
                            {trigger.type === "exit-intent" && (
                                <div>
                                    <label>Sensitivity (px from top)</label>
                                    <input
                                        type="range"
                                        min={5}
                                        max={50}
                                        value={(trigger.config.sensitivity as number) ?? 20}
                                        onChange={(e) =>
                                            updateConfig(index, "sensitivity", parseInt(e.target.value))
                                        }
                                    />
                                    <span style={{ fontSize: 11, color: "var(--framer-color-text-tertiary)" }}>
                                        {trigger.config.sensitivity}px
                                    </span>
                                </div>
                            )}
                            {trigger.type === "click" && (
                                <div>
                                    <label>CSS Selector</label>
                                    <input
                                        type="text"
                                        placeholder="#my-button, .cta-link"
                                        value={(trigger.config.selector as string) ?? ""}
                                        onChange={(e) =>
                                            updateConfig(index, "selector", e.target.value)
                                        }
                                    />
                                </div>
                            )}
                            {trigger.type === "page-load" && (
                                <p style={{ fontSize: 10, color: "var(--framer-color-text-tertiary)" }}>
                                    Popup will show immediately when the page loads. Use with frequency rules to avoid showing too often.
                                </p>
                            )}
                            {trigger.type === "inactivity" && (
                                <div>
                                    <label>Inactivity timeout (seconds)</label>
                                    <input
                                        type="number"
                                        className="compact"
                                        min={5}
                                        max={300}
                                        value={(trigger.config.seconds as number) ?? 30}
                                        onChange={(e) =>
                                            updateConfig(index, "seconds", parseInt(e.target.value))
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}

            <div className="info-box info-box-warn">
                Exit-intent detection works on desktop only (mouse-based). On mobile, the popup will
                fall back to other enabled triggers.
            </div>
        </div>
    )
}
