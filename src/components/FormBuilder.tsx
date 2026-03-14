import { useCampaignStore, DEFAULT_POPUP_CONFIG } from "@/store/campaignStore"
import type { PopupConfig, FormField } from "@/utils/defaults"

const FIELD_TYPES: { value: FormField["type"]; label: string }[] = [
    { value: "email", label: "Email" },
    { value: "name", label: "Name" },
    { value: "phone", label: "Phone" },
    { value: "custom", label: "Custom Text" },
]

export function FormBuilder() {
    const { activeCampaign, autoSave } = useCampaignStore()
    const campaign = activeCampaign()

    if (!campaign) return null

    const config: PopupConfig = campaign.popup_config ?? DEFAULT_POPUP_CONFIG
    const fields = config.formFields ?? []

    const updateFields = (newFields: FormField[]) => {
        void autoSave(campaign.id, { popup_config: { ...config, formFields: newFields } })
    }

    const addField = () => {
        const newField: FormField = {
            id: Date.now().toString(),
            type: "custom",
            label: "Custom Field",
            placeholder: "Enter value...",
            required: false,
        }
        updateFields([...fields, newField])
    }

    const removeField = (id: string) => {
        updateFields(fields.filter((f) => f.id !== id))
    }

    const updateField = (id: string, updates: Partial<FormField>) => {
        updateFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)))
    }

    const moveField = (index: number, direction: -1 | 1) => {
        const newIndex = index + direction
        if (newIndex < 0 || newIndex >= fields.length) return
        const updated = [...fields]
        const temp = updated[index]
        updated[index] = updated[newIndex]
        updated[newIndex] = temp
        updateFields(updated)
    }

    return (
        <div className="stack-lg">
            <section>
                <div className="row-between">
                    <div>
                        <h2>Form Fields</h2>
                        <p style={{ marginTop: 4 }}>
                            Configure the fields shown in your popup form. Drag to reorder.
                        </p>
                    </div>
                    <button className="framer-button-primary" onClick={addField}>
                        + Add Field
                    </button>
                </div>
            </section>

            {fields.length === 0 ? (
                <div className="empty-state">
                    <p>No form fields. Your popup will show as content-only (no inputs).</p>
                    <button className="framer-button-primary" onClick={addField} style={{ marginTop: 8 }}>
                        Add First Field
                    </button>
                </div>
            ) : (
                <div className="stack">
                    {fields.map((field, index) => (
                        <div key={field.id} className="card">
                            <div className="row-between" style={{ marginBottom: 8 }}>
                                <div className="row gap-4">
                                    <button className="btn-secondary" style={{ padding: "2px 6px", fontSize: 10 }} onClick={() => moveField(index, -1)} disabled={index === 0} title="Move up">Up</button>
                                    <button className="btn-secondary" style={{ padding: "2px 6px", fontSize: 10 }} onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} title="Move down">Dn</button>
                                    <span style={{ fontSize: 11, fontWeight: 500 }}>{field.label}</span>
                                </div>
                                <button className="btn-danger" onClick={() => removeField(field.id)}>Remove</button>
                            </div>

                            <div className="grid-2" style={{ gap: 8 }}>
                                <div>
                                    <label>Type</label>
                                    <select value={field.type} onChange={(e) => updateField(field.id, { type: e.target.value as FormField["type"], label: e.target.value === "custom" ? field.label : e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) })}>
                                        {FIELD_TYPES.map((ft) => (
                                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Label</label>
                                    <input type="text" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} />
                                </div>
                                <div>
                                    <label>Placeholder</label>
                                    <input type="text" value={field.placeholder} onChange={(e) => updateField(field.id, { placeholder: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
                                        <input type="checkbox" checked={field.required} onChange={(e) => updateField(field.id, { required: e.target.checked })} />
                                        <span>Required</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick add presets */}
            <section>
                <h3 style={{ marginBottom: 8, color: "var(--framer-color-text-secondary)" }}>Quick Add</h3>
                <div className="row gap-6">
                    {[
                        { type: "email" as const, label: "Email", placeholder: "your@email.com" },
                        { type: "name" as const, label: "Name", placeholder: "Your name" },
                        { type: "phone" as const, label: "Phone", placeholder: "+1 (555) 000-0000" },
                    ].filter((preset) => !fields.some((f) => f.type === preset.type)).map((preset) => (
                        <button key={preset.type} className="btn-secondary" onClick={() => {
                            const newField: FormField = { id: Date.now().toString(), type: preset.type, label: preset.label, placeholder: preset.placeholder, required: preset.type === "email" }
                            updateFields([...fields, newField])
                        }}>
                            + {preset.label}
                        </button>
                    ))}
                </div>
            </section>

            <div className="info-box info-box-default">
                Form submissions are captured by the embed script and sent to your configured integrations (Mailchimp, ConvertKit, or webhook).
            </div>
        </div>
    )
}
