import { POPUP_TEMPLATES, getTemplatesByCategory } from "@/utils/templates"
import { useCampaignStore, DEFAULT_TARGETING_CONFIG, DEFAULT_AB_CONFIG, DEFAULT_ANALYTICS } from "@/store/campaignStore"
import type { PopupTemplate } from "@/utils/templates"

interface TemplateGalleryProps {
    onClose: () => void
}

export default function TemplateGallery({ onClose }: TemplateGalleryProps) {
    const { createCampaign, autoSave } = useCampaignStore()
    const grouped = getTemplatesByCategory()

    const handleSelect = (template: PopupTemplate) => {
        const campaign = createCampaign(template.name)

        autoSave(campaign.id, {
            popup_config: template.popupConfig,
            trigger_config: template.triggerConfig,
            targeting_config: DEFAULT_TARGETING_CONFIG,
            ab_test_config: DEFAULT_AB_CONFIG,
            analytics: DEFAULT_ANALYTICS,
        })

        onClose()
    }

    return (
        <div className="overlay">
            <div className="modal">
                <div className="modal-header">
                    <div>
                        <h2 style={{ fontSize: 14 }}>Template Gallery</h2>
                        <p style={{ marginTop: 2, fontSize: 10 }}>
                            {POPUP_TEMPLATES.length} templates -- click to create
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        style={{ padding: "4px 8px" }}
                    >
                        x
                    </button>
                </div>

                <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {Object.entries(grouped).map(([category, templates]) => (
                        <section key={category}>
                            <h3 style={{ marginBottom: 8 }}>{category}</h3>
                            <div className="grid-2">
                                {templates.map((template) => (
                                    <button
                                        key={template.id}
                                        onClick={() => handleSelect(template)}
                                        className="card"
                                        style={{ textAlign: "left", width: "100%", padding: 10 }}
                                    >
                                        <div className="row gap-8" style={{ alignItems: "flex-start" }}>
                                            <div style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 8,
                                                background: "color-mix(in srgb, var(--framer-color-tint) 12%, var(--framer-color-bg))",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "var(--framer-color-tint)",
                                                fontWeight: 700,
                                                fontSize: 16,
                                                flexShrink: 0,
                                            }}>
                                                {template.preview}
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: 12, fontWeight: 500 }}>
                                                    {template.name}
                                                </div>
                                                <div className="line-clamp-2" style={{ fontSize: 10, color: "var(--framer-color-text-secondary)", marginTop: 2 }}>
                                                    {template.description}
                                                </div>
                                                <div className="capitalize" style={{ fontSize: 9, color: "var(--framer-color-text-tertiary)", marginTop: 4 }}>
                                                    {template.popupType.replace(/-/g, " ")}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    )
}
