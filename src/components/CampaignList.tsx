import { memo, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useCampaignStore } from "@/store/campaignStore"
import type { CampaignStatus } from "@/utils/defaults"

interface CampaignListProps {
    onShowTemplates: () => void
}

const POPUP_TYPE_LABELS: Record<string, string> = {
    modal: "Modal",
    "slide-in": "Slide-in",
    fullscreen: "Fullscreen",
    "banner-top": "Banner (top)",
    "banner-bottom": "Banner (bottom)",
    toast: "Toast",
    notification: "Notification",
    "spin-wheel": "Spin Wheel",
    "content-locker": "Content Locker",
    "floating-button": "Floating Button",
}

const CampaignCard = memo(function CampaignCard({
    campaign,
    onSelect,
    onSetStatus,
    onDuplicate,
    onDelete,
}: {
    campaign: { id: string; name: string; status: CampaignStatus; popup_config: { popupType: string }; updated_at: string }
    onSelect: (id: string) => void
    onSetStatus: (id: string, status: CampaignStatus) => void
    onDuplicate: (id: string) => void
    onDelete: (id: string) => void
}) {
    const statusOptions: CampaignStatus[] = ["draft", "active", "paused"]
    const badgeClasses: Record<CampaignStatus, string> = {
        active: "badge badge-active",
        paused: "badge badge-paused",
        draft: "badge badge-draft",
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="card group"
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(campaign.id)}
        >
            <div className="row-between">
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="row gap-6" style={{ marginBottom: 4 }}>
                        <span className="truncate" style={{ fontSize: 12, fontWeight: 500 }}>
                            {campaign.name}
                        </span>
                        <span className={badgeClasses[campaign.status]}>
                            {campaign.status}
                        </span>
                    </div>
                    <p style={{ fontSize: 10 }}>
                        {POPUP_TYPE_LABELS[campaign.popup_config?.popupType] ?? "Modal"} &middot; Updated{" "}
                        {new Date(campaign.updated_at).toLocaleDateString()}
                    </p>
                </div>
                <div
                    className="row gap-4 show-on-hover"
                    onClick={(e) => e.stopPropagation()}
                >
                    <select
                        className="compact"
                        value={campaign.status}
                        onChange={(e) => onSetStatus(campaign.id, e.target.value as CampaignStatus)}
                    >
                        {statusOptions.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <button
                        className="btn-secondary"
                        style={{ fontSize: 10, padding: "2px 6px" }}
                        onClick={() => onDuplicate(campaign.id)}
                        title="Duplicate"
                    >
                        Copy
                    </button>
                    <button
                        className="btn-danger"
                        style={{ fontSize: 10 }}
                        onClick={() => {
                            if (confirm("Delete this popup? This cannot be undone.")) {
                                onDelete(campaign.id)
                            }
                        }}
                        title="Delete"
                    >
                        Del
                    </button>
                </div>
            </div>
        </motion.div>
    )
})

export function CampaignList({ onShowTemplates }: CampaignListProps) {
    const {
        campaigns,
        selectCampaign,
        createCampaign,
        deleteCampaign,
        duplicateCampaign,
        setStatus,
    } = useCampaignStore()

    const handleCreate = useCallback(() => {
        void createCampaign()
    }, [createCampaign])

    return (
        <div className="stack">
            <div className="row-between">
                <h2>Your Popups ({campaigns.length})</h2>
                <div className="row gap-6">
                    <button className="btn-secondary" onClick={onShowTemplates}>
                        From Template
                    </button>
                    <button className="framer-button-primary" onClick={handleCreate}>
                        + New Popup
                    </button>
                </div>
            </div>

            {campaigns.length === 0 ? (
                <div className="empty-state">
                    <p>No popups yet. Create your first popup!</p>
                    <div className="row gap-6" style={{ justifyContent: "center" }}>
                        <button className="btn-secondary" onClick={onShowTemplates}>
                            Start from Template
                        </button>
                        <button className="framer-button-primary" onClick={handleCreate}>
                            Blank Popup
                        </button>
                    </div>
                </div>
            ) : (
                <div className="stack-sm">
                    <AnimatePresence>
                        {campaigns.map((campaign) => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onSelect={selectCampaign}
                                onSetStatus={setStatus}
                                onDuplicate={duplicateCampaign}
                                onDelete={deleteCampaign}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
