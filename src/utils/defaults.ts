/**
 * Type definitions and default configurations for Popup Builder.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type CampaignStatus = "draft" | "active" | "paused"
export type PopupType = "modal" | "slide-in" | "fullscreen" | "banner-top" | "banner-bottom" | "toast"
export type TriggerType = "time-delay" | "scroll" | "exit-intent" | "click" | "page-load" | "inactivity"
export type EventType = "view" | "close" | "convert"
export type DeviceType = "desktop" | "mobile" | "tablet"
export type VisitorType = "all" | "new" | "returning"
export type FrequencyMode = "once" | "once-per-session" | "once-per-day" | "always"
export type CloseButtonStyle = "x" | "text" | "icon-circle" | "none"
export type IntegrationType = "mailchimp" | "convertkit" | "webhook"
export type PageRuleType = "exact" | "contains" | "regex"

export interface FormField {
    id: string
    type: "email" | "name" | "phone" | "custom"
    label: string
    placeholder: string
    required: boolean
}

export interface PopupConfig {
    popupType: PopupType
    headline: string
    body: string
    ctaText: string
    backgroundColor: string
    backgroundImage: string
    backgroundGradient: string
    textColor: string
    buttonColor: string
    buttonTextColor: string
    imageUrl: string
    closeButtonStyle: CloseButtonStyle
    borderRadius: number
    shadowIntensity: number
    maxWidth: number
    customCss: string
    successMessage: string
    redirectUrl: string
    formFields: FormField[]
}

export interface TriggerConfig {
    type: TriggerType
    enabled: boolean
    config: Record<string, string | number>
}

export interface PageRule {
    id: string
    type: PageRuleType
    value: string
    exclude: boolean
}

export interface TargetingConfig {
    visitorType: VisitorType
    deviceType: "all" | DeviceType
    pageRules: PageRule[]
    referrerSource: string
    dateStart: string
    dateEnd: string
    frequency: FrequencyMode
}

export interface ABVariant {
    id: string
    name: string
    weight: number
    popupConfig: PopupConfig
}

export interface ABTestConfig {
    enabled: boolean
    variants: ABVariant[]
}

export interface IntegrationConfig {
    type: IntegrationType
    enabled: boolean
    config: Record<string, string>
}

export interface AnalyticsSummary {
    totalImpressions: number
    totalConversions: number
    totalCloses: number
    conversionRate: number
    closeRate: number
    dailyStats: {
        date: string
        impressions: number
        conversions: number
        closes: number
    }[]
    deviceBreakdown: {
        device: DeviceType
        impressions: number
        conversions: number
    }[]
    variantStats?: {
        variant_id: string
        variant_name: string
        impressions: number
        conversions: number
        conversionRate: number
    }[]
}

export interface Campaign {
    id: string
    name: string
    status: CampaignStatus
    popup_config: PopupConfig
    trigger_config: TriggerConfig[]
    targeting_config: TargetingConfig
    ab_test_config: ABTestConfig
    integrations: IntegrationConfig[]
    analytics: AnalyticsSummary
    created_at: string
    updated_at: string
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_FORM_FIELDS: FormField[] = [
    { id: "email", type: "email", label: "Email", placeholder: "your@email.com", required: true },
]

export const DEFAULT_POPUP_CONFIG: PopupConfig = {
    popupType: "modal",
    headline: "Don't miss out!",
    body: "Subscribe to our newsletter and get exclusive updates delivered to your inbox.",
    ctaText: "Subscribe",
    backgroundColor: "#ffffff",
    backgroundImage: "",
    backgroundGradient: "",
    textColor: "#111827",
    buttonColor: "#3b82f6",
    buttonTextColor: "#ffffff",
    imageUrl: "",
    closeButtonStyle: "x",
    borderRadius: 12,
    shadowIntensity: 3,
    maxWidth: 480,
    customCss: "",
    successMessage: "Thanks! You're all set.",
    redirectUrl: "",
    formFields: [...DEFAULT_FORM_FIELDS],
}

export const DEFAULT_TRIGGER_CONFIG: TriggerConfig[] = [
    { type: "time-delay", enabled: true, config: { seconds: 5 } },
    { type: "scroll", enabled: false, config: { percentage: 50 } },
    { type: "exit-intent", enabled: false, config: { sensitivity: 20 } },
    { type: "click", enabled: false, config: { selector: "" } },
    { type: "page-load", enabled: false, config: {} },
    { type: "inactivity", enabled: false, config: { seconds: 30 } },
]

export const DEFAULT_TARGETING_CONFIG: TargetingConfig = {
    visitorType: "all",
    deviceType: "all",
    pageRules: [],
    referrerSource: "",
    dateStart: "",
    dateEnd: "",
    frequency: "once-per-session",
}

export const DEFAULT_AB_CONFIG: ABTestConfig = {
    enabled: false,
    variants: [],
}

export const DEFAULT_ANALYTICS: AnalyticsSummary = {
    totalImpressions: 0,
    totalConversions: 0,
    totalCloses: 0,
    conversionRate: 0,
    closeRate: 0,
    dailyStats: [],
    deviceBreakdown: [],
}
