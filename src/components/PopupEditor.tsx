import { useCampaignStore, DEFAULT_POPUP_CONFIG, DEFAULT_SCHEDULE_CONFIG } from "@/store/campaignStore"
import type { PopupConfig, PopupType, CloseButtonStyle } from "@/utils/defaults"
import { PreviewPanel } from "./PreviewPanel"
import { CountdownTimer } from "./CountdownTimer"
import { ContentLocker } from "./ContentLocker"
import { SpinWheel } from "./SpinWheel"
import { useState, useCallback } from "react"

const TIMEZONES = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Kolkata",
    "Australia/Sydney",
    "Pacific/Auckland",
]

const POPUP_TYPES: { value: PopupType; label: string; description: string }[] = [
    { value: "modal", label: "Modal", description: "Centered overlay with backdrop" },
    { value: "slide-in", label: "Slide-in", description: "Slides from bottom-right corner" },
    { value: "fullscreen", label: "Fullscreen", description: "Full-page takeover" },
    { value: "banner-top", label: "Banner Top", description: "Fixed bar at top of page" },
    { value: "banner-bottom", label: "Banner Bottom", description: "Fixed bar at bottom" },
    { value: "toast", label: "Toast", description: "Small corner popup" },
    { value: "notification", label: "Notification", description: "Corner notification toast" },
    { value: "spin-wheel", label: "Spin Wheel", description: "Gamification spin-to-win" },
    { value: "content-locker", label: "Content Locker", description: "Lock content behind signup" },
    { value: "floating-button", label: "Floating Button", description: "Click-to-expand button" },
]

const CLOSE_STYLES: { value: CloseButtonStyle; label: string }[] = [
    { value: "x", label: "X icon" },
    { value: "text", label: "Close text" },
    { value: "icon-circle", label: "Circle icon" },
    { value: "none", label: "None" },
]

export function PopupEditor() {
    const { activeCampaign, autoSave } = useCampaignStore()
    const campaign = activeCampaign()
    const [showPreview, setShowPreview] = useState(false)

    const togglePreview = useCallback(() => setShowPreview((p) => !p), [])

    if (!campaign) return null

    const config: PopupConfig = campaign.popup_config ?? DEFAULT_POPUP_CONFIG

    const update = <K extends keyof PopupConfig>(key: K, value: PopupConfig[K]) => {
        const newConfig = { ...config, [key]: value }
        void autoSave(campaign.id, { popup_config: newConfig })
    }

    return (
        <div className="stack-lg">
            {/* Campaign Name */}
            <section>
                <label>Campaign Name</label>
                <input
                    type="text"
                    value={campaign.name}
                    onChange={(e) => void autoSave(campaign.id, { name: e.target.value })}
                />
            </section>

            <hr />

            {/* Popup Type - 10 types */}
            <section>
                <h2 style={{ marginBottom: 10 }}>Popup Type</h2>
                <div className="grid-3">
                    {POPUP_TYPES.map((pt) => (
                        <button
                            key={pt.value}
                            onClick={() => update("popupType", pt.value)}
                            className={config.popupType === pt.value ? "card card-active" : "card"}
                            style={{ textAlign: "left", width: "100%", padding: 8 }}
                        >
                            <div style={{ fontSize: 11, fontWeight: 500 }}>{pt.label}</div>
                            <div style={{ fontSize: 9, color: "var(--framer-color-text-secondary)", marginTop: 2 }}>
                                {pt.description}
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <hr />

            {/* Content */}
            <section className="stack">
                <h2>Content</h2>
                <div>
                    <label>Headline</label>
                    <input
                        type="text"
                        value={config.headline}
                        onChange={(e) => update("headline", e.target.value)}
                    />
                </div>
                <div>
                    <label>Body Text</label>
                    <textarea
                        value={config.body}
                        onChange={(e) => update("body", e.target.value)}
                        rows={3}
                    />
                </div>
                <div>
                    <label>Button Text</label>
                    <input
                        type="text"
                        value={config.ctaText}
                        onChange={(e) => update("ctaText", e.target.value)}
                    />
                </div>
                <div>
                    <label>Success Message</label>
                    <input
                        type="text"
                        value={config.successMessage}
                        onChange={(e) => update("successMessage", e.target.value)}
                        placeholder="Thanks! You're all set."
                    />
                </div>
                <div>
                    <label>Redirect URL (optional)</label>
                    <input
                        type="url"
                        value={config.redirectUrl}
                        onChange={(e) => update("redirectUrl", e.target.value)}
                        placeholder="https://example.com/thank-you"
                    />
                </div>
            </section>

            <hr />

            {/* Countdown Timer */}
            <CountdownTimer
                config={config.countdown}
                onChange={(countdown) => update("countdown", countdown)}
            />

            <hr />

            {/* Content Locker (shown when type is content-locker) */}
            {config.popupType === "content-locker" && (
                <>
                    <ContentLocker
                        config={config.contentLocker}
                        onChange={(contentLocker) => update("contentLocker", contentLocker)}
                    />
                    <hr />
                </>
            )}

            {/* Spin Wheel (shown when type is spin-wheel) */}
            {config.popupType === "spin-wheel" && (
                <>
                    <SpinWheel
                        config={config.spinWheel}
                        onChange={(spinWheel) => update("spinWheel", spinWheel)}
                    />
                    <hr />
                </>
            )}

            {/* Style */}
            <section>
                <h2 style={{ marginBottom: 10 }}>Style</h2>
                <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                        <label>Background</label>
                        <div className="color-row">
                            <input type="color" value={config.backgroundColor} onChange={(e) => update("backgroundColor", e.target.value)} />
                            <input type="text" value={config.backgroundColor} onChange={(e) => update("backgroundColor", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label>Text</label>
                        <div className="color-row">
                            <input type="color" value={config.textColor} onChange={(e) => update("textColor", e.target.value)} />
                            <input type="text" value={config.textColor} onChange={(e) => update("textColor", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label>Button</label>
                        <div className="color-row">
                            <input type="color" value={config.buttonColor} onChange={(e) => update("buttonColor", e.target.value)} />
                            <input type="text" value={config.buttonColor} onChange={(e) => update("buttonColor", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label>Button Text</label>
                        <div className="color-row">
                            <input type="color" value={config.buttonTextColor} onChange={(e) => update("buttonTextColor", e.target.value)} />
                            <input type="text" value={config.buttonTextColor} onChange={(e) => update("buttonTextColor", e.target.value)} />
                        </div>
                    </div>
                </div>
            </section>

            <hr />

            {/* Background Image / Gradient */}
            <section className="stack">
                <h2>Background (advanced)</h2>
                <div>
                    <label>Background Image URL</label>
                    <input type="url" value={config.backgroundImage} onChange={(e) => update("backgroundImage", e.target.value)} placeholder="https://example.com/bg.jpg" />
                </div>
                <div>
                    <label>CSS Gradient (overrides color)</label>
                    <input type="text" value={config.backgroundGradient} onChange={(e) => update("backgroundGradient", e.target.value)} placeholder="linear-gradient(135deg, #667eea, #764ba2)" />
                </div>
            </section>

            <hr />

            {/* Layout options */}
            <section>
                <h2 style={{ marginBottom: 10 }}>Layout</h2>
                <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                        <label>Border Radius ({config.borderRadius}px)</label>
                        <input type="range" min={0} max={30} value={config.borderRadius} onChange={(e) => update("borderRadius", parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label>Shadow ({config.shadowIntensity})</label>
                        <input type="range" min={0} max={5} value={config.shadowIntensity} onChange={(e) => update("shadowIntensity", parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label>Max Width ({config.maxWidth}px)</label>
                        <input type="range" min={280} max={800} step={10} value={config.maxWidth} onChange={(e) => update("maxWidth", parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label>Close Button</label>
                        <select value={config.closeButtonStyle} onChange={(e) => update("closeButtonStyle", e.target.value as CloseButtonStyle)}>
                            {CLOSE_STYLES.map((cs) => (
                                <option key={cs.value} value={cs.value}>{cs.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </section>

            <hr />

            {/* Image URL */}
            <section>
                <label>Image / Media URL (optional)</label>
                <input type="url" value={config.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} placeholder="https://example.com/popup-image.jpg" />
            </section>

            <hr />

            {/* Video Popup */}
            <section className="stack">
                <div className="row-between">
                    <h2>Video</h2>
                    <label className="checkbox-label" style={{ margin: 0 }}>
                        <input
                            type="checkbox"
                            checked={config.video?.enabled ?? false}
                            onChange={(e) => update("video", { ...config.video, enabled: e.target.checked })}
                        />
                        Enable
                    </label>
                </div>
                {config.video?.enabled && (
                    <>
                        <div>
                            <label>Video URL (YouTube or Vimeo)</label>
                            <input
                                type="url"
                                value={config.video.url}
                                onChange={(e) => update("video", { ...config.video, url: e.target.value })}
                                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                            />
                        </div>
                        <div className="grid-2" style={{ gap: 12 }}>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={config.video.autoplay}
                                    onChange={(e) => update("video", { ...config.video, autoplay: e.target.checked })}
                                />
                                Autoplay
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={config.video.muted}
                                    onChange={(e) => update("video", { ...config.video, muted: e.target.checked })}
                                />
                                Muted
                            </label>
                        </div>
                    </>
                )}
            </section>

            <hr />

            {/* Forced Interaction */}
            <section className="stack">
                <div className="row-between">
                    <h2>Require Action</h2>
                    <label className="checkbox-label" style={{ margin: 0 }}>
                        <input
                            type="checkbox"
                            checked={config.forcedInteraction ?? false}
                            onChange={(e) => update("forcedInteraction", e.target.checked)}
                        />
                        Enable
                    </label>
                </div>
                {config.forcedInteraction && (
                    <div className="info-box info-box-warn" style={{ fontSize: 10 }}>
                        When enabled, the popup cannot be dismissed with the close button, Escape key, or clicking the backdrop.
                        Users must submit the form or click the CTA button to close it. Use sparingly to avoid frustrating visitors.
                    </div>
                )}
            </section>

            <hr />

            {/* Campaign Scheduling */}
            <section className="stack">
                <div className="row-between">
                    <h2>Schedule</h2>
                    <label className="checkbox-label" style={{ margin: 0 }}>
                        <input
                            type="checkbox"
                            checked={campaign.schedule?.enabled ?? false}
                            onChange={(e) => {
                                const schedule = { ...(campaign.schedule ?? DEFAULT_SCHEDULE_CONFIG), enabled: e.target.checked }
                                void autoSave(campaign.id, { schedule })
                            }}
                        />
                        Enable
                    </label>
                </div>
                {campaign.schedule?.enabled && (
                    <>
                        <div className="grid-2" style={{ gap: 12 }}>
                            <div>
                                <label>Start Date</label>
                                <input
                                    type="datetime-local"
                                    value={campaign.schedule.startDate ?? ""}
                                    onChange={(e) => {
                                        const schedule = { ...campaign.schedule, startDate: e.target.value || null }
                                        void autoSave(campaign.id, { schedule })
                                    }}
                                />
                            </div>
                            <div>
                                <label>End Date</label>
                                <input
                                    type="datetime-local"
                                    value={campaign.schedule.endDate ?? ""}
                                    onChange={(e) => {
                                        const schedule = { ...campaign.schedule, endDate: e.target.value || null }
                                        void autoSave(campaign.id, { schedule })
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label>Timezone</label>
                            <select
                                value={campaign.schedule.timezone}
                                onChange={(e) => {
                                    const schedule = { ...campaign.schedule, timezone: e.target.value }
                                    void autoSave(campaign.id, { schedule })
                                }}
                            >
                                {TIMEZONES.map((tz) => (
                                    <option key={tz} value={tz}>{tz}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
            </section>

            <hr />

            {/* Advanced Styling */}
            <section className="stack">
                <details>
                    <summary style={{ cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Advanced Styling</summary>
                    <div className="grid-2" style={{ gap: 12, marginTop: 12 }}>
                        <div>
                            <label>Backdrop Blur ({config.advancedStyle?.backdropBlur ?? 0}px)</label>
                            <input
                                type="range" min={0} max={20}
                                value={config.advancedStyle?.backdropBlur ?? 0}
                                onChange={(e) => update("advancedStyle", { ...config.advancedStyle, backdropBlur: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label>Border Width ({config.advancedStyle?.borderWidth ?? 0}px)</label>
                            <input
                                type="range" min={0} max={5}
                                value={config.advancedStyle?.borderWidth ?? 0}
                                onChange={(e) => update("advancedStyle", { ...config.advancedStyle, borderWidth: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label>Border Color</label>
                            <div className="color-row">
                                <input type="color" value={config.advancedStyle?.borderColor ?? "#e5e7eb"} onChange={(e) => update("advancedStyle", { ...config.advancedStyle, borderColor: e.target.value })} />
                                <input type="text" value={config.advancedStyle?.borderColor ?? "#e5e7eb"} onChange={(e) => update("advancedStyle", { ...config.advancedStyle, borderColor: e.target.value })} />
                            </div>
                        </div>
                        <div>
                            <label>Title Font Size ({config.advancedStyle?.titleFontSize ?? 22}px)</label>
                            <input
                                type="range" min={12} max={40}
                                value={config.advancedStyle?.titleFontSize ?? 22}
                                onChange={(e) => update("advancedStyle", { ...config.advancedStyle, titleFontSize: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label>Body Font Size ({config.advancedStyle?.bodyFontSize ?? 14}px)</label>
                            <input
                                type="range" min={10} max={24}
                                value={config.advancedStyle?.bodyFontSize ?? 14}
                                onChange={(e) => update("advancedStyle", { ...config.advancedStyle, bodyFontSize: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label>Button Font Size ({config.advancedStyle?.buttonFontSize ?? 14}px)</label>
                            <input
                                type="range" min={10} max={24}
                                value={config.advancedStyle?.buttonFontSize ?? 14}
                                onChange={(e) => update("advancedStyle", { ...config.advancedStyle, buttonFontSize: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label>Padding ({config.advancedStyle?.padding ?? 28}px)</label>
                            <input
                                type="range" min={8} max={60}
                                value={config.advancedStyle?.padding ?? 28}
                                onChange={(e) => update("advancedStyle", { ...config.advancedStyle, padding: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                </details>
            </section>

            {/* Custom CSS */}
            <section>
                <label>Custom CSS (advanced)</label>
                <textarea
                    value={config.customCss}
                    onChange={(e) => update("customCss", e.target.value)}
                    rows={3}
                    placeholder="#pb-overlay { /* your styles */ }"
                    style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 11 }}
                />
            </section>

            {/* Preview Toggle */}
            <button className="framer-button-primary w-full" onClick={togglePreview}>
                {showPreview ? "Hide Preview" : "Show Preview"}
            </button>

            {showPreview && <PreviewPanel config={config} />}
        </div>
    )
}
