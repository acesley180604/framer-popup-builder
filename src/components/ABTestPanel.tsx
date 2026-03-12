import { useCampaignStore, DEFAULT_POPUP_CONFIG } from "@/store/campaignStore"
import type { ABVariant, ABTestConfig, PopupConfig } from "@/utils/defaults"

export default function ABTestPanel() {
    const { activeCampaign, autoSave } = useCampaignStore()
    const campaign = activeCampaign()

    if (!campaign) return null

    const abConfig: ABTestConfig = campaign.ab_test_config ?? {
        enabled: false,
        variants: [],
    }

    const updateABConfig = (updates: Partial<ABTestConfig>) => {
        autoSave(campaign.id, { ab_test_config: { ...abConfig, ...updates } })
    }

    const createVariantFromA = () => {
        const baseConfig: PopupConfig = campaign.popup_config ?? DEFAULT_POPUP_CONFIG

        const existingVariants = abConfig.variants
        const totalExistingWeight = existingVariants.reduce((sum, v) => sum + v.weight, 0)

        if (existingVariants.length === 0) {
            const variantA: ABVariant = {
                id: crypto.randomUUID(),
                name: "Variant A (Original)",
                weight: 50,
                popupConfig: { ...baseConfig },
            }
            const variantB: ABVariant = {
                id: crypto.randomUUID(),
                name: "Variant B",
                weight: 50,
                popupConfig: {
                    ...baseConfig,
                    headline: baseConfig.headline + " (B)",
                },
            }
            updateABConfig({ enabled: true, variants: [variantA, variantB] })
        } else {
            const newVariantName = `Variant ${String.fromCharCode(65 + existingVariants.length)}`
            const newWeight = Math.floor(100 / (existingVariants.length + 1))
            const remainingWeight = 100 - newWeight

            const updatedVariants = existingVariants.map((v) => ({
                ...v,
                weight: Math.floor(
                    (v.weight / totalExistingWeight) * remainingWeight
                ),
            }))

            const totalDistributed = updatedVariants.reduce((s, v) => s + v.weight, 0)
            if (updatedVariants.length > 0) {
                updatedVariants[0].weight += remainingWeight - totalDistributed
            }

            const newVariant: ABVariant = {
                id: crypto.randomUUID(),
                name: newVariantName,
                weight: newWeight,
                popupConfig: {
                    ...baseConfig,
                    headline: baseConfig.headline + ` (${newVariantName.slice(-1)})`,
                },
            }

            updateABConfig({ variants: [...updatedVariants, newVariant] })
        }
    }

    const removeVariant = (variantId: string) => {
        const filtered = abConfig.variants.filter((v) => v.id !== variantId)
        if (filtered.length <= 1) {
            updateABConfig({ enabled: false, variants: [] })
        } else {
            const totalWeight = filtered.reduce((s, v) => s + v.weight, 0)
            const normalized = filtered.map((v) => ({
                ...v,
                weight: Math.round((v.weight / totalWeight) * 100),
            }))
            const total = normalized.reduce((s, v) => s + v.weight, 0)
            if (normalized.length > 0) {
                normalized[0].weight += 100 - total
            }
            updateABConfig({ variants: normalized })
        }
    }

    const updateVariantWeight = (variantId: string, weight: number) => {
        const updated = abConfig.variants.map((v) =>
            v.id === variantId ? { ...v, weight } : v
        )

        const thisWeight = weight
        const others = updated.filter((v) => v.id !== variantId)
        const othersTotal = 100 - thisWeight
        const currentOthersTotal = others.reduce((s, v) => s + v.weight, 0)

        if (currentOthersTotal > 0 && others.length > 0) {
            const final = updated.map((v) => {
                if (v.id === variantId) return v
                return {
                    ...v,
                    weight: Math.max(1, Math.round((v.weight / currentOthersTotal) * othersTotal)),
                }
            })
            updateABConfig({ variants: final })
        } else {
            updateABConfig({ variants: updated })
        }
    }

    const updateVariantConfig = (
        variantId: string,
        key: keyof PopupConfig,
        value: string | boolean | number
    ) => {
        const updated = abConfig.variants.map((v) =>
            v.id === variantId
                ? { ...v, popupConfig: { ...v.popupConfig, [key]: value } }
                : v
        )
        updateABConfig({ variants: updated })
    }

    const updateVariantName = (variantId: string, name: string) => {
        const updated = abConfig.variants.map((v) =>
            v.id === variantId ? { ...v, name } : v
        )
        updateABConfig({ variants: updated })
    }

    return (
        <div className="stack-lg">
            <div className="row-between">
                <div>
                    <h2>A/B Testing</h2>
                    <p style={{ marginTop: 4 }}>
                        Test different popup versions to find the highest converting variant.
                    </p>
                </div>
                <button
                    onClick={() => updateABConfig({ enabled: !abConfig.enabled })}
                    className={`toggle ${abConfig.enabled ? "on" : ""}`}
                >
                    <span className="toggle-knob" />
                </button>
            </div>

            {!abConfig.enabled || abConfig.variants.length === 0 ? (
                <div className="empty-state">
                    <p>Create variants to split-test your popup.</p>
                    <button
                        className="framer-button-primary"
                        onClick={createVariantFromA}
                        style={{ marginTop: 8 }}
                    >
                        Create A/B Test
                    </button>
                </div>
            ) : (
                <>
                    {/* Traffic Split */}
                    <section>
                        <h3 style={{ marginBottom: 6, color: "var(--framer-color-text-secondary)" }}>
                            Traffic Split
                        </h3>
                        <div className="traffic-bar">
                            {abConfig.variants.map((v) => (
                                <div
                                    key={v.id}
                                    className="traffic-bar-segment"
                                    style={{ width: `${v.weight}%` }}
                                    title={`${v.name}: ${v.weight}%`}
                                />
                            ))}
                        </div>
                        <div className="row-between" style={{ marginTop: 4 }}>
                            {abConfig.variants.map((v) => (
                                <span key={v.id} style={{ fontSize: 9, color: "var(--framer-color-text-tertiary)" }}>
                                    {v.name}: {v.weight}%
                                </span>
                            ))}
                        </div>
                    </section>

                    {/* Variant Cards */}
                    <div className="stack">
                        {abConfig.variants.map((variant) => (
                            <div key={variant.id} className="card">
                                <div className="row-between" style={{ marginBottom: 10 }}>
                                    <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => updateVariantName(variant.id, e.target.value)}
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 500,
                                            background: "transparent",
                                            border: "none",
                                            padding: 0,
                                            width: "auto",
                                        }}
                                    />
                                    <div className="row gap-6">
                                        <label className="row gap-4" style={{ fontSize: 10, color: "var(--framer-color-text-tertiary)" }}>
                                            <span>Weight:</span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={99}
                                                value={variant.weight}
                                                onChange={(e) =>
                                                    updateVariantWeight(variant.id, parseInt(e.target.value) || 50)
                                                }
                                                style={{ width: 40, padding: "2px 4px", fontSize: 10 }}
                                            />
                                            <span>%</span>
                                        </label>
                                        {abConfig.variants.length > 1 && (
                                            <button
                                                className="btn-danger"
                                                onClick={() => removeVariant(variant.id)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="stack-sm">
                                    <div>
                                        <label>Headline</label>
                                        <input
                                            type="text"
                                            value={variant.popupConfig.headline}
                                            onChange={(e) =>
                                                updateVariantConfig(variant.id, "headline", e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label>Body</label>
                                        <textarea
                                            value={variant.popupConfig.body}
                                            onChange={(e) =>
                                                updateVariantConfig(variant.id, "body", e.target.value)
                                            }
                                            rows={2}
                                        />
                                    </div>
                                    <div className="row gap-8">
                                        <div style={{ flex: 1 }}>
                                            <label>CTA Text</label>
                                            <input
                                                type="text"
                                                value={variant.popupConfig.ctaText}
                                                onChange={(e) =>
                                                    updateVariantConfig(variant.id, "ctaText", e.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label>Button Color</label>
                                            <input
                                                type="color"
                                                value={variant.popupConfig.buttonColor}
                                                onChange={(e) =>
                                                    updateVariantConfig(variant.id, "buttonColor", e.target.value)
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add variant */}
                    {abConfig.variants.length < 5 && (
                        <button
                            onClick={createVariantFromA}
                            className="w-full"
                            style={{
                                padding: 10,
                                border: "2px dashed var(--framer-color-divider)",
                                borderRadius: 8,
                                fontSize: 12,
                                color: "var(--framer-color-text-tertiary)",
                                transition: "border-color 0.15s, color 0.15s",
                            }}
                        >
                            + Add Variant
                        </button>
                    )}
                </>
            )}

            <div className="info-box info-box-tint">
                Each variant is served based on its weight percentage. Statistical significance
                requires at least 100 impressions per variant. Check the Analytics tab for results.
            </div>
        </div>
    )
}
