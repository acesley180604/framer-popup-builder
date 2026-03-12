import { create } from "zustand"
import type {
    Campaign,
    CampaignStatus,
    PopupConfig,
    TriggerConfig,
    TargetingConfig,
    ABTestConfig,
    IntegrationConfig,
    AnalyticsSummary,
    RevenueTrackingConfig,
} from "@/utils/defaults"
import {
    DEFAULT_POPUP_CONFIG,
    DEFAULT_TRIGGER_CONFIG,
    DEFAULT_TARGETING_CONFIG,
    DEFAULT_AB_CONFIG,
    DEFAULT_ANALYTICS,
    DEFAULT_REVENUE_TRACKING_CONFIG,
} from "@/utils/defaults"

// ── Local storage persistence ────────────────────────────────────────────────

const STORAGE_KEY = "pb_campaigns"

function loadCampaigns(): Campaign[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return JSON.parse(raw) as Campaign[]
    } catch {
        // ignore
    }
    return []
}

function saveCampaigns(campaigns: Campaign[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns))
    } catch {
        // ignore
    }
}

// ── Store types ──────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 800

interface CampaignState {
    campaigns: Campaign[]
    activeCampaignId: string | null
    loading: boolean
    saving: boolean
    error: string | null
    _saveTimer: ReturnType<typeof setTimeout> | null

    activeCampaign: () => Campaign | null

    fetchCampaigns: () => void
    createCampaign: (name?: string) => Campaign
    updateCampaign: (id: string, updates: Partial<Campaign>) => void
    deleteCampaign: (id: string) => void
    duplicateCampaign: (id: string) => Campaign | null
    setStatus: (id: string, status: CampaignStatus) => void

    selectCampaign: (id: string | null) => void
    autoSave: (id: string, updates: Partial<Campaign>) => void

    clearError: () => void
}

// ── Store implementation ─────────────────────────────────────────────────────

export const useCampaignStore = create<CampaignState>((set, get) => ({
    campaigns: [],
    activeCampaignId: null,
    loading: false,
    saving: false,
    error: null,
    _saveTimer: null,

    activeCampaign: () => {
        const { campaigns, activeCampaignId } = get()
        return campaigns.find((c) => c.id === activeCampaignId) ?? null
    },

    fetchCampaigns: () => {
        const campaigns = loadCampaigns()
        set({ campaigns, loading: false })
    },

    createCampaign: (name = "Untitled Popup") => {
        const campaign: Campaign = {
            id: crypto.randomUUID(),
            name,
            status: "draft",
            popup_config: structuredClone(DEFAULT_POPUP_CONFIG),
            trigger_config: structuredClone(DEFAULT_TRIGGER_CONFIG),
            targeting_config: structuredClone(DEFAULT_TARGETING_CONFIG),
            ab_test_config: structuredClone(DEFAULT_AB_CONFIG),
            integrations: [],
            analytics: structuredClone(DEFAULT_ANALYTICS),
            revenue_tracking: structuredClone(DEFAULT_REVENUE_TRACKING_CONFIG),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }
        set((state) => {
            const updated = [campaign, ...state.campaigns]
            saveCampaigns(updated)
            return { campaigns: updated, activeCampaignId: campaign.id }
        })
        return campaign
    },

    updateCampaign: (id, updates) => {
        set((state) => {
            const campaigns = state.campaigns.map((c) =>
                c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
            )
            saveCampaigns(campaigns)
            return { campaigns, saving: false }
        })
    },

    deleteCampaign: (id) => {
        set((state) => {
            const campaigns = state.campaigns.filter((c) => c.id !== id)
            saveCampaigns(campaigns)
            return {
                campaigns,
                activeCampaignId: state.activeCampaignId === id ? null : state.activeCampaignId,
            }
        })
    },

    duplicateCampaign: (id) => {
        const source = get().campaigns.find((c) => c.id === id)
        if (!source) return null

        const campaign: Campaign = {
            ...structuredClone(source),
            id: crypto.randomUUID(),
            name: `${source.name} (copy)`,
            status: "draft",
            analytics: structuredClone(DEFAULT_ANALYTICS),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        set((state) => {
            const updated = [campaign, ...state.campaigns]
            saveCampaigns(updated)
            return { campaigns: updated, activeCampaignId: campaign.id }
        })
        return campaign
    },

    setStatus: (id, status) => {
        get().updateCampaign(id, { status })
    },

    selectCampaign: (id) => {
        set({ activeCampaignId: id })
    },

    autoSave: (id, updates) => {
        const { _saveTimer } = get()
        if (_saveTimer) clearTimeout(_saveTimer)

        set((state) => ({
            campaigns: state.campaigns.map((c) =>
                c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
            ),
            saving: true,
            _saveTimer: setTimeout(() => {
                const campaigns = get().campaigns
                saveCampaigns(campaigns)
                set({ saving: false, _saveTimer: null })
            }, DEBOUNCE_MS),
        }))
    },

    clearError: () => set({ error: null }),
}))

// ── Re-export types and defaults for convenience ─────────────────────────────

export {
    DEFAULT_POPUP_CONFIG,
    DEFAULT_TRIGGER_CONFIG,
    DEFAULT_TARGETING_CONFIG,
    DEFAULT_AB_CONFIG,
    DEFAULT_ANALYTICS,
    DEFAULT_REVENUE_TRACKING_CONFIG,
}

export type {
    Campaign,
    CampaignStatus,
    PopupConfig,
    TriggerConfig,
    TargetingConfig,
    ABTestConfig,
    IntegrationConfig,
    AnalyticsSummary,
    RevenueTrackingConfig,
}
