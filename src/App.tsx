import { useEffect, useState, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import { useCampaignStore } from "./store/campaignStore"
import { CampaignList } from "./components/CampaignList"
import { PopupEditor } from "./components/PopupEditor"
import { FormBuilder } from "./components/FormBuilder"
import { MultiStepEditor } from "./components/MultiStepEditor"
import { TriggerConfig } from "./components/TriggerConfig"
import { TargetingRules } from "./components/TargetingRules"
import { ABTestPanel } from "./components/ABTestPanel"
import { IntegrationsPanel } from "./components/IntegrationsPanel"
import { AnalyticsDashboard } from "./components/AnalyticsDashboard"
import { EmbedCodePanel } from "./components/EmbedCodePanel"
import { TemplateGallery } from "./components/TemplateGallery"
import { Toast } from "./components/Toast"

type Tab = "editor" | "form" | "multi-step" | "triggers" | "targeting" | "ab-test" | "integrations" | "analytics" | "embed"

const TABS: { id: Tab; label: string }[] = [
    { id: "editor", label: "Editor" },
    { id: "form", label: "Form" },
    { id: "multi-step", label: "Steps" },
    { id: "triggers", label: "Triggers" },
    { id: "targeting", label: "Targeting" },
    { id: "ab-test", label: "A/B Test" },
    { id: "integrations", label: "Integrations" },
    { id: "analytics", label: "Analytics" },
    { id: "embed", label: "Embed" },
]

export function App() {
    const [activeTab, setActiveTab] = useState<Tab>("editor")
    const [showTemplates, setShowTemplates] = useState(false)
    const { activeCampaignId, activeCampaign, error, clearError, saving, fetchCampaigns } =
        useCampaignStore()

    const campaign = activeCampaign()

    useEffect(() => {
        void fetchCampaigns()
    }, [fetchCampaigns])

    const handleShowTemplates = useCallback(() => setShowTemplates(true), [])
    const handleCloseTemplates = useCallback(() => setShowTemplates(false), [])
    const handleBack = useCallback(() => useCampaignStore.getState().selectCampaign(null), [])

    if (!activeCampaignId || !campaign) {
        return (
            <section>
                <header className="row-between" style={{ padding: "12px 15px", borderBottom: "1px solid var(--framer-color-divider)" }}>
                    <div className="row gap-8">
                        <h1>Popup Builder</h1>
                        {saving && <span className="saving-indicator">Saving...</span>}
                    </div>
                </header>
                <main>
                    <CampaignList onShowTemplates={handleShowTemplates} />
                </main>
                <AnimatePresence>
                    {showTemplates && <TemplateGallery onClose={handleCloseTemplates} />}
                </AnimatePresence>
                {error && <Toast message={error} type="error" onDismiss={clearError} />}
                <footer>Free plan active. Upgrade: Starter $19/mo | Growth $39/mo | Agency $79/mo</footer>
            </section>
        )
    }

    const badgeClass = `badge badge-${campaign.status}`

    return (
        <section>
            <header className="row-between" style={{ padding: "12px 15px", borderBottom: "1px solid var(--framer-color-divider)" }}>
                <div className="row gap-8">
                    <h1>Popup Builder</h1>
                    <span style={{ fontSize: 11, color: "var(--framer-color-text-secondary)" }}>/ {campaign.name}</span>
                    {saving && <span className="saving-indicator">Saving...</span>}
                </div>
            </header>

            <div className="row-between" style={{ padding: "8px 15px", borderBottom: "1px solid var(--framer-color-divider)" }}>
                <button className="btn-link" onClick={handleBack}>
                    &larr; All Campaigns
                </button>
                <span className={badgeClass}>{campaign.status}</span>
            </div>

            <nav className="tab-bar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={activeTab === tab.id ? "active" : ""}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            <main>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                    >
                        {activeTab === "editor" && <PopupEditor />}
                        {activeTab === "form" && <FormBuilder />}
                        {activeTab === "multi-step" && <MultiStepEditor />}
                        {activeTab === "triggers" && <TriggerConfig />}
                        {activeTab === "targeting" && <TargetingRules />}
                        {activeTab === "ab-test" && <ABTestPanel />}
                        {activeTab === "integrations" && <IntegrationsPanel />}
                        {activeTab === "analytics" && <AnalyticsDashboard />}
                        {activeTab === "embed" && <EmbedCodePanel />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {error && <Toast message={error} type="error" onDismiss={clearError} />}
            <footer>Free plan active. Upgrade: Starter $19/mo | Growth $39/mo | Agency $79/mo</footer>
        </section>
    )
}
