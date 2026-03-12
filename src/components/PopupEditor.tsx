import { useCampaignStore, DEFAULT_POPUP_CONFIG } from "@/store/campaignStore"
import type { PopupConfig } from "@/utils/defaults"
import type { PopupType, CloseButtonStyle } from "@/utils/defaults"
import PreviewPanel from "./PreviewPanel"
import { useState } from "react"

const POPUP_TYPES: { value: PopupType; label: string; description: string }[] = [
    { value: "modal", label: "Modal", description: "Centered overlay with backdrop" },
    { value: "slide-in", label: "Slide-in", description: "Slides from bottom-right corner" },
    { value: "fullscreen", label: "Fullscreen", description: "Full-page takeover" },
    { value: "banner-top", label: "Banner Top", description: "Fixed bar at top of page" },
    { value: "banner-bottom", label: "Banner Bottom", description: "Fixed bar at bottom" },
    { value: "toast", label: "Toast", description: "Small notification corner popup" },
]

const CLOSE_STYLES: { value: CloseButtonStyle; label: string }[] = [
    { value: "x", label: "X icon" },
    { value: "text", label: "Close text" },
    { value: "icon-circle", label: "Circle icon" },
    { value: "none", label: "None" },
]

export default function PopupEditor() {
    const { activeCampaign, autoSave } = useCampaignStore()
    const campaign = activeCampaign()
    const [showPreview, setShowPreview] = useState(false)

    if (!campaign) return null

    const config: PopupConfig = campaign.popup_config ?? DEFAULT_POPUP_CONFIG

    const update = <K extends keyof PopupConfig>(key: K, value: PopupConfig[K]) => {
        const newConfig = { ...config, [key]: value }
        autoSave(campaign.id, { popup_config: newConfig })
    }

    return (
        <div className="stack-lg">
            {/* Campaign Name */}
            <section>
                <label>Campaign Name</label>
                <input
                    type="text"
                    value={campaign.name}
                    onChange={(e) => autoSave(campaign.id, { name: e.target.value })}
                />
            </section>

            <hr />

            {/* Popup Type */}
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

            {/* Style */}
            <section>
                <h2 style={{ marginBottom: 10 }}>Style</h2>
                <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                        <label>Background</label>
                        <div className="color-row">
                            <input
                                type="color"
                                value={config.backgroundColor}
                                onChange={(e) => update("backgroundColor", e.target.value)}
                            />
                            <input
                                type="text"
                                value={config.backgroundColor}
                                onChange={(e) => update("backgroundColor", e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Text</label>
                        <div className="color-row">
                            <input
                                type="color"
                                value={config.textColor}
                                onChange={(e) => update("textColor", e.target.value)}
                            />
                            <input
                                type="text"
                                value={config.textColor}
                                onChange={(e) => update("textColor", e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Button</label>
                        <div className="color-row">
                            <input
                                type="color"
                                value={config.buttonColor}
                                onChange={(e) => update("buttonColor", e.target.value)}
                            />
                            <input
                                type="text"
                                value={config.buttonColor}
                                onChange={(e) => update("buttonColor", e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Button Text</label>
                        <div className="color-row">
                            <input
                                type="color"
                                value={config.buttonTextColor}
                                onChange={(e) => update("buttonTextColor", e.target.value)}
                            />
                            <input
                                type="text"
                                value={config.buttonTextColor}
                                onChange={(e) => update("buttonTextColor", e.target.value)}
                            />
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
                    <input
                        type="url"
                        value={config.backgroundImage}
                        onChange={(e) => update("backgroundImage", e.target.value)}
                        placeholder="https://example.com/bg.jpg"
                    />
                </div>
                <div>
                    <label>CSS Gradient (overrides color)</label>
                    <input
                        type="text"
                        value={config.backgroundGradient}
                        onChange={(e) => update("backgroundGradient", e.target.value)}
                        placeholder="linear-gradient(135deg, #667eea, #764ba2)"
                    />
                </div>
            </section>

            <hr />

            {/* Layout options */}
            <section>
                <h2 style={{ marginBottom: 10 }}>Layout</h2>
                <div className="grid-2" style={{ gap: 12 }}>
                    <div>
                        <label>Border Radius ({config.borderRadius}px)</label>
                        <input
                            type="range"
                            min={0}
                            max={30}
                            value={config.borderRadius}
                            onChange={(e) => update("borderRadius", parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Shadow ({config.shadowIntensity})</label>
                        <input
                            type="range"
                            min={0}
                            max={5}
                            value={config.shadowIntensity}
                            onChange={(e) => update("shadowIntensity", parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Max Width ({config.maxWidth}px)</label>
                        <input
                            type="range"
                            min={280}
                            max={800}
                            step={10}
                            value={config.maxWidth}
                            onChange={(e) => update("maxWidth", parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                        <label>Close Button</label>
                        <select
                            value={config.closeButtonStyle}
                            onChange={(e) => update("closeButtonStyle", e.target.value as CloseButtonStyle)}
                        >
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
                <input
                    type="url"
                    value={config.imageUrl}
                    onChange={(e) => update("imageUrl", e.target.value)}
                    placeholder="https://example.com/popup-image.jpg"
                />
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
            <button
                className="framer-button-primary w-full"
                onClick={() => setShowPreview(!showPreview)}
            >
                {showPreview ? "Hide Preview" : "Show Preview"}
            </button>

            {showPreview && <PreviewPanel config={config} />}
        </div>
    )
}
