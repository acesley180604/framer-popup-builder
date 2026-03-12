import { useCampaignStore } from "@/store/campaignStore"
import type { IntegrationConfig, IntegrationType } from "@/utils/defaults"

// ── Integration definitions ──────────────────────────────────────────────────

interface IntegrationMeta {
    type: IntegrationType
    name: string
    description: string
    fields: {
        key: string
        label: string
        type: "text" | "password" | "url"
        placeholder: string
        required: boolean
        helpText?: string
    }[]
}

const INTEGRATIONS: IntegrationMeta[] = [
    {
        type: "mailchimp",
        name: "Mailchimp",
        description: "Add new subscribers to your Mailchimp audience list.",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "xxxxxxxxxxxxxxxx-us21",
                required: true,
                helpText: "Find this in Account > Extras > API Keys",
            },
            {
                key: "list_id",
                label: "Audience/List ID",
                type: "text",
                placeholder: "abc1234def",
                required: true,
                helpText: "Found in Audience > Settings > Audience name and defaults",
            },
            {
                key: "server_prefix",
                label: "Server Prefix",
                type: "text",
                placeholder: "us21",
                required: true,
                helpText: "The 'usX' part from your API key (after the dash)",
            },
        ],
    },
    {
        type: "convertkit",
        name: "ConvertKit",
        description: "Add subscribers to your ConvertKit forms or sequences.",
        fields: [
            {
                key: "api_key",
                label: "API Key",
                type: "password",
                placeholder: "your-api-key",
                required: true,
                helpText: "Find this in Settings > General",
            },
            {
                key: "form_id",
                label: "Form ID",
                type: "text",
                placeholder: "1234567",
                required: true,
                helpText: "The numeric ID from your form URL",
            },
        ],
    },
    {
        type: "webhook",
        name: "Custom Webhook",
        description: "Send lead data to any URL via POST request. Works with Zapier, Make, n8n, etc.",
        fields: [
            {
                key: "url",
                label: "Webhook URL",
                type: "url",
                placeholder: "https://your-api.com/webhook",
                required: true,
            },
            {
                key: "secret",
                label: "Secret Header (optional)",
                type: "password",
                placeholder: "optional-shared-secret",
                required: false,
                helpText: "Sent as X-Webhook-Secret header for verification",
            },
        ],
    },
]

function getIntegrationMeta(type: IntegrationType): IntegrationMeta | undefined {
    return INTEGRATIONS.find((i) => i.type === type)
}

function createDefaultIntegration(type: IntegrationType): IntegrationConfig {
    const meta = getIntegrationMeta(type)
    const config: Record<string, string> = {}
    if (meta) {
        for (const field of meta.fields) {
            config[field.key] = ""
        }
    }
    return { type, enabled: false, config }
}

export default function IntegrationsPanel() {
    const { activeCampaign, autoSave } = useCampaignStore()
    const campaign = activeCampaign()

    if (!campaign) return null

    const integrations: IntegrationConfig[] = campaign.integrations ?? []

    const addIntegration = (type: IntegrationType) => {
        if (integrations.some((i) => i.type === type)) return
        const newIntegration = createDefaultIntegration(type)
        autoSave(campaign.id, { integrations: [...integrations, newIntegration] })
    }

    const removeIntegration = (type: IntegrationType) => {
        autoSave(campaign.id, {
            integrations: integrations.filter((i) => i.type !== type),
        })
    }

    const toggleIntegration = (type: IntegrationType) => {
        autoSave(campaign.id, {
            integrations: integrations.map((i) =>
                i.type === type ? { ...i, enabled: !i.enabled } : i
            ),
        })
    }

    const updateField = (type: IntegrationType, key: string, value: string) => {
        autoSave(campaign.id, {
            integrations: integrations.map((i) =>
                i.type === type ? { ...i, config: { ...i.config, [key]: value } } : i
            ),
        })
    }

    const availableToAdd = INTEGRATIONS.filter(
        (meta) => !integrations.some((i) => i.type === meta.type)
    )

    return (
        <div className="stack-lg">
            <section>
                <h2>Email Integrations</h2>
                <p style={{ marginTop: 4 }}>
                    Connect your email service to automatically sync leads when visitors convert.
                </p>
            </section>

            {/* Active integrations */}
            {integrations.length > 0 && (
                <div className="stack">
                    {integrations.map((integration) => {
                        const meta = getIntegrationMeta(integration.type)
                        if (!meta) return null
                        return (
                            <div
                                key={integration.type}
                                className={integration.enabled ? "card card-active" : "card"}
                            >
                                <div className="row-between" style={{ marginBottom: 10 }}>
                                    <div>
                                        <h3>{meta.name}</h3>
                                        <p style={{ fontSize: 10, marginTop: 2 }}>{meta.description}</p>
                                    </div>
                                    <div className="row gap-6">
                                        <button
                                            onClick={() => toggleIntegration(integration.type)}
                                            className={`toggle ${integration.enabled ? "on" : ""}`}
                                        >
                                            <span className="toggle-knob" />
                                        </button>
                                        <button
                                            className="btn-danger"
                                            onClick={() => removeIntegration(integration.type)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className="stack-sm">
                                    {meta.fields.map((field) => (
                                        <div key={field.key}>
                                            <label>
                                                {field.label}
                                                {field.required && (
                                                    <span style={{ color: "#e53e3e", marginLeft: 2 }}>*</span>
                                                )}
                                            </label>
                                            <input
                                                type={field.type === "password" ? "password" : "text"}
                                                value={integration.config[field.key] ?? ""}
                                                onChange={(e) =>
                                                    updateField(integration.type, field.key, e.target.value)
                                                }
                                                placeholder={field.placeholder}
                                            />
                                            {field.helpText && (
                                                <p style={{ fontSize: 9, color: "var(--framer-color-text-tertiary)", marginTop: 2 }}>
                                                    {field.helpText}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Add new integration */}
            {availableToAdd.length > 0 && (
                <section>
                    <h3 style={{ marginBottom: 8, color: "var(--framer-color-text-secondary)" }}>
                        Add Integration
                    </h3>
                    <div className="grid-2">
                        {availableToAdd.map((meta) => (
                            <button
                                key={meta.type}
                                onClick={() => addIntegration(meta.type)}
                                className="card"
                                style={{
                                    textAlign: "left",
                                    width: "100%",
                                    padding: 10,
                                    borderStyle: "dashed",
                                }}
                            >
                                <div style={{ fontSize: 12, fontWeight: 500 }}>{meta.name}</div>
                                <p style={{ fontSize: 10, marginTop: 2 }}>{meta.description}</p>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            <div className="info-box info-box-tint">
                Integration credentials are stored locally in your browser. For production use,
                configure integrations server-side via the webhook option for maximum security.
            </div>
        </div>
    )
}
