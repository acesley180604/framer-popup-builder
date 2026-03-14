import { useCampaignStore, DEFAULT_POPUP_CONFIG } from "@/store/campaignStore"
import type { PopupConfig, MultiStepConfig, MultiStep, MultiStepChoice, FormField } from "@/utils/defaults"
import { useCallback, useState } from "react"

const STEP_TYPES: { value: MultiStep["type"]; label: string }[] = [
    { value: "yes-no", label: "Yes/No Question" },
    { value: "form", label: "Form / Email Capture" },
    { value: "message", label: "Message / Info" },
    { value: "offer", label: "Offer / CTA" },
]

export function MultiStepEditor() {
    const { activeCampaign, autoSave } = useCampaignStore()
    const campaign = activeCampaign()
    const [expandedStep, setExpandedStep] = useState<string | null>(null)

    if (!campaign) return null

    const config: PopupConfig = campaign.popup_config ?? DEFAULT_POPUP_CONFIG
    const msConfig: MultiStepConfig = config.multiStep

    const updateMultiStep = useCallback((updates: Partial<MultiStepConfig>) => {
        void autoSave(campaign.id, {
            popup_config: {
                ...config,
                multiStep: { ...msConfig, ...updates },
            },
        })
    }, [autoSave, campaign.id, config, msConfig])

    const addStep = useCallback(() => {
        if (msConfig.steps.length >= 5) return
        const stepId = `step-${Date.now()}`
        const newStep: MultiStep = {
            id: stepId,
            type: "yes-no",
            headline: "New Step",
            body: "",
            ctaText: "Continue",
            choices: [
                { id: "opt-1", label: "Option A", nextStepId: null },
                { id: "opt-2", label: "Option B", nextStepId: null },
            ],
            formFields: [],
        }
        const steps = [...msConfig.steps, newStep]
        updateMultiStep({
            steps,
            entryStepId: msConfig.entryStepId || stepId,
        })
        setExpandedStep(stepId)
    }, [msConfig, updateMultiStep])

    const removeStep = useCallback((stepId: string) => {
        const steps = msConfig.steps.filter((s) => s.id !== stepId)
        const entryStepId = msConfig.entryStepId === stepId
            ? (steps[0]?.id ?? "")
            : msConfig.entryStepId
        updateMultiStep({ steps, entryStepId })
    }, [msConfig, updateMultiStep])

    const updateStep = useCallback((stepId: string, updates: Partial<MultiStep>) => {
        const steps = msConfig.steps.map((s) =>
            s.id === stepId ? { ...s, ...updates } : s
        )
        updateMultiStep({ steps })
    }, [msConfig, updateMultiStep])

    const updateChoice = useCallback((stepId: string, choiceId: string, updates: Partial<MultiStepChoice>) => {
        const steps = msConfig.steps.map((s) => {
            if (s.id !== stepId) return s
            return {
                ...s,
                choices: s.choices.map((c) =>
                    c.id === choiceId ? { ...c, ...updates } : c
                ),
            }
        })
        updateMultiStep({ steps })
    }, [msConfig, updateMultiStep])

    const addChoice = useCallback((stepId: string) => {
        const step = msConfig.steps.find((s) => s.id === stepId)
        if (!step || step.choices.length >= 4) return
        const newChoice: MultiStepChoice = {
            id: `choice-${Date.now()}`,
            label: "New Option",
            nextStepId: null,
        }
        updateStep(stepId, { choices: [...step.choices, newChoice] })
    }, [msConfig, updateStep])

    const removeChoice = useCallback((stepId: string, choiceId: string) => {
        const step = msConfig.steps.find((s) => s.id === stepId)
        if (!step || step.choices.length <= 2) return
        updateStep(stepId, { choices: step.choices.filter((c) => c.id !== choiceId) })
    }, [msConfig, updateStep])

    const addFormField = useCallback((stepId: string) => {
        const step = msConfig.steps.find((s) => s.id === stepId)
        if (!step) return
        const field: FormField = {
            id: Date.now().toString(),
            type: "custom",
            label: "Field",
            placeholder: "Enter value...",
            required: false,
        }
        updateStep(stepId, { formFields: [...step.formFields, field] })
    }, [msConfig, updateStep])

    const stepOptions = msConfig.steps.map((s) => ({ id: s.id, label: s.headline || s.id }))

    return (
        <div className="stack-lg">
            <section>
                <div className="row-between">
                    <div>
                        <h2>Multi-Step Flows</h2>
                        <p style={{ marginTop: 4 }}>
                            Build yes/no questions, quiz funnels, and conditional branching. Up to 5 steps.
                        </p>
                    </div>
                    <button
                        onClick={() => updateMultiStep({ enabled: !msConfig.enabled })}
                        className={`toggle ${msConfig.enabled ? "on" : ""}`}
                    >
                        <span className="toggle-knob" />
                    </button>
                </div>
            </section>

            {!msConfig.enabled ? (
                <div className="empty-state">
                    <p>Enable multi-step to create yes/no flows, quiz funnels, and conditional branching.</p>
                    <button
                        className="framer-button-primary"
                        onClick={() => {
                            updateMultiStep({ enabled: true })
                            if (msConfig.steps.length === 0) addStep()
                        }}
                        style={{ marginTop: 8 }}
                    >
                        Enable Multi-Step
                    </button>
                </div>
            ) : (
                <>
                    {msConfig.steps.length > 0 && (
                        <div>
                            <label>Entry Step</label>
                            <select
                                value={msConfig.entryStepId}
                                onChange={(e) => updateMultiStep({ entryStepId: e.target.value })}
                            >
                                {stepOptions.map((s) => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Visual flow preview */}
                    {msConfig.steps.length > 0 && (
                        <div className="info-box info-box-tint" style={{ fontSize: 10 }}>
                            Flow: {msConfig.steps.map((s) => s.headline || s.id).join(" -> ")}
                        </div>
                    )}

                    <div className="stack">
                        {msConfig.steps.map((step, _index) => {
                            const isExpanded = expandedStep === step.id
                            return (
                                <div key={step.id} className={isExpanded ? "card card-active" : "card"}>
                                    <div className="row-between" style={{ cursor: "pointer" }} onClick={() => setExpandedStep(isExpanded ? null : step.id)}>
                                        <div>
                                            <div className="row gap-6">
                                                <span className="badge badge-draft" style={{ fontSize: 9 }}>{step.type}</span>
                                                <span style={{ fontSize: 12, fontWeight: 500 }}>{step.headline || "Untitled Step"}</span>
                                            </div>
                                        </div>
                                        <div className="row gap-4">
                                            <button
                                                className="btn-danger"
                                                style={{ fontSize: 10 }}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeStep(step.id)
                                                }}
                                            >
                                                Del
                                            </button>
                                            <span style={{ fontSize: 10, color: "var(--framer-color-text-tertiary)" }}>
                                                {isExpanded ? "Collapse" : "Expand"}
                                            </span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="stack" style={{ paddingTop: 10, marginTop: 10, borderTop: "1px solid var(--framer-color-divider)" }}>
                                            <div>
                                                <label>Step Type</label>
                                                <select
                                                    value={step.type}
                                                    onChange={(e) => updateStep(step.id, { type: e.target.value as MultiStep["type"] })}
                                                >
                                                    {STEP_TYPES.map((st) => (
                                                        <option key={st.value} value={st.value}>{st.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label>Headline</label>
                                                <input type="text" value={step.headline} onChange={(e) => updateStep(step.id, { headline: e.target.value })} />
                                            </div>

                                            <div>
                                                <label>Body Text</label>
                                                <textarea value={step.body} onChange={(e) => updateStep(step.id, { body: e.target.value })} rows={2} />
                                            </div>

                                            {(step.type === "yes-no") && (
                                                <div className="stack-sm">
                                                    <div className="row-between">
                                                        <label style={{ margin: 0 }}>Choices</label>
                                                        {step.choices.length < 4 && (
                                                            <button className="btn-link" style={{ fontSize: 10 }} onClick={() => addChoice(step.id)}>
                                                                + Add Choice
                                                            </button>
                                                        )}
                                                    </div>
                                                    {step.choices.map((choice) => (
                                                        <div key={choice.id} className="row gap-4" style={{ padding: 6, border: "1px solid var(--framer-color-divider)", borderRadius: 6 }}>
                                                            <input
                                                                type="text"
                                                                value={choice.label}
                                                                onChange={(e) => updateChoice(step.id, choice.id, { label: e.target.value })}
                                                                style={{ flex: 1, fontSize: 11 }}
                                                                placeholder="Button label"
                                                            />
                                                            <select
                                                                className="compact"
                                                                value={choice.nextStepId ?? ""}
                                                                onChange={(e) => updateChoice(step.id, choice.id, { nextStepId: e.target.value || null })}
                                                            >
                                                                <option value="">Close popup</option>
                                                                {stepOptions.filter((s) => s.id !== step.id).map((s) => (
                                                                    <option key={s.id} value={s.id}>Go to: {s.label}</option>
                                                                ))}
                                                            </select>
                                                            {step.choices.length > 2 && (
                                                                <button className="btn-danger" style={{ fontSize: 10 }} onClick={() => removeChoice(step.id, choice.id)}>x</button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {(step.type === "form") && (
                                                <div className="stack-sm">
                                                    <div className="row-between">
                                                        <label style={{ margin: 0 }}>Form Fields</label>
                                                        <button className="btn-link" style={{ fontSize: 10 }} onClick={() => addFormField(step.id)}>+ Add Field</button>
                                                    </div>
                                                    {step.formFields.map((field) => (
                                                        <div key={field.id} className="row gap-4">
                                                            <select
                                                                className="compact"
                                                                value={field.type}
                                                                onChange={(e) => {
                                                                    const newType = e.target.value as FormField["type"]
                                                                    updateStep(step.id, {
                                                                        formFields: step.formFields.map((f) =>
                                                                            f.id === field.id ? { ...f, type: newType } : f
                                                                        ),
                                                                    })
                                                                }}
                                                            >
                                                                <option value="email">Email</option>
                                                                <option value="name">Name</option>
                                                                <option value="phone">Phone</option>
                                                                <option value="custom">Custom</option>
                                                            </select>
                                                            <input
                                                                type="text"
                                                                value={field.label}
                                                                onChange={(e) => {
                                                                    updateStep(step.id, {
                                                                        formFields: step.formFields.map((f) =>
                                                                            f.id === field.id ? { ...f, label: e.target.value } : f
                                                                        ),
                                                                    })
                                                                }}
                                                                style={{ flex: 1, fontSize: 11 }}
                                                            />
                                                            <button className="btn-danger" style={{ fontSize: 10 }} onClick={() => {
                                                                updateStep(step.id, {
                                                                    formFields: step.formFields.filter((f) => f.id !== field.id),
                                                                })
                                                            }}>x</button>
                                                        </div>
                                                    ))}
                                                    <div>
                                                        <label>Submit Button Text</label>
                                                        <input type="text" value={step.ctaText} onChange={(e) => updateStep(step.id, { ctaText: e.target.value })} />
                                                    </div>
                                                </div>
                                            )}

                                            {(step.type === "message" || step.type === "offer") && (
                                                <div>
                                                    <label>CTA Button Text</label>
                                                    <input type="text" value={step.ctaText} onChange={(e) => updateStep(step.id, { ctaText: e.target.value })} />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {msConfig.steps.length < 5 && (
                        <button onClick={addStep} className="w-full" style={{ padding: 10, border: "2px dashed var(--framer-color-divider)", borderRadius: 8, fontSize: 12, color: "var(--framer-color-text-tertiary)" }}>
                            + Add Step ({msConfig.steps.length}/5)
                        </button>
                    )}
                </>
            )}

            <div className="info-box info-box-default">
                Multi-step flows replace the default form when enabled. Each step can branch based on visitor choices.
            </div>
        </div>
    )
}
