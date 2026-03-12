/**
 * Type definitions and default configurations for Popup Builder v2.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export type CampaignStatus = "draft" | "active" | "paused"

export type PopupType =
    | "modal"
    | "slide-in"
    | "fullscreen"
    | "banner-top"
    | "banner-bottom"
    | "toast"
    | "notification"
    | "spin-wheel"
    | "content-locker"
    | "floating-button"

export type TriggerType =
    | "time-delay"
    | "scroll"
    | "exit-intent"
    | "click"
    | "page-load"
    | "inactivity"
    | "adblock"
    | "scroll-to-element"
    | "purchase-event"

export type EventType = "view" | "close" | "convert"
export type DeviceType = "desktop" | "mobile" | "tablet"
export type VisitorType = "all" | "new" | "returning"
export type FrequencyMode = "once" | "once-per-session" | "once-per-day" | "always"
export type CloseButtonStyle = "x" | "text" | "icon-circle" | "none"
export type IntegrationType = "mailchimp" | "convertkit" | "webhook"
export type PageRuleType = "exact" | "contains" | "regex"

export type CountdownMode = "evergreen" | "fixed"
export type CountdownExpiredBehavior = "hide" | "message" | "redirect"
export type ContentLockMode = "blur" | "hide"
export type ContentLockDuration = "session" | "permanent"

// ── Multi-Step ───────────────────────────────────────────────────────────────

export interface MultiStepChoice {
    id: string
    label: string
    nextStepId: string | null
}

export interface MultiStep {
    id: string
    type: "yes-no" | "form" | "message" | "offer"
    headline: string
    body: string
    ctaText: string
    choices: MultiStepChoice[]
    formFields: FormField[]
}

export interface MultiStepConfig {
    enabled: boolean
    steps: MultiStep[]
    entryStepId: string
}

// ── Countdown ────────────────────────────────────────────────────────────────

export interface CountdownConfig {
    enabled: boolean
    mode: CountdownMode
    evergreenMinutes: number
    fixedDeadline: string
    showDays: boolean
    showHours: boolean
    showMinutes: boolean
    showSeconds: boolean
    labelColor: string
    digitColor: string
    digitBgColor: string
    expiredBehavior: CountdownExpiredBehavior
    expiredMessage: string
    expiredRedirectUrl: string
}

// ── Content Locker ───────────────────────────────────────────────────────────

export interface ContentLockerConfig {
    enabled: boolean
    lockMode: ContentLockMode
    selectors: string
    unlockDuration: ContentLockDuration
    blurAmount: number
    overlayMessage: string
}

// ── Spin Wheel ───────────────────────────────────────────────────────────────

export interface SpinWheelSegment {
    id: string
    label: string
    value: string
    probability: number
    color: string
    isNoPrize: boolean
}

export interface SpinWheelConfig {
    enabled: boolean
    segments: SpinWheelSegment[]
    spinButtonText: string
    emailBeforeSpin: boolean
    wheelBorderColor: string
    pointerColor: string
    prizeMessage: string
}

// ── Geo Targeting ────────────────────────────────────────────────────────────

export interface GeoRule {
    id: string
    countries: string[]
    action: "show" | "hide"
    message: string
}

export interface GeoTargetingConfig {
    enabled: boolean
    rules: GeoRule[]
}

// ── Revenue Tracking ─────────────────────────────────────────────────────────

export interface RevenueTrackingConfig {
    enabled: boolean
    cookieDays: number
    conversionEventName: string
    revenueFieldSelector: string
}

export interface RevenueEntry {
    date: string
    campaignId: string
    revenue: number
    conversions: number
}

// ── Existing Types ───────────────────────────────────────────────────────────

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
    countdown: CountdownConfig
    contentLocker: ContentLockerConfig
    spinWheel: SpinWheelConfig
    multiStep: MultiStepConfig
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
    geoTargeting: GeoTargetingConfig
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
    totalRevenue: number
    dailyStats: {
        date: string
        impressions: number
        conversions: number
        closes: number
        revenue: number
    }[]
    deviceBreakdown: {
        device: DeviceType
        impressions: number
        conversions: number
    }[]
    geoBreakdown: {
        country: string
        impressions: number
        conversions: number
    }[]
    funnelStats: {
        stepId: string
        stepName: string
        impressions: number
        completions: number
    }[]
    variantStats?: {
        variant_id: string
        variant_name: string
        impressions: number
        conversions: number
        conversionRate: number
        revenue: number
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
    revenue_tracking: RevenueTrackingConfig
    created_at: string
    updated_at: string
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_FORM_FIELDS: FormField[] = [
    { id: "email", type: "email", label: "Email", placeholder: "your@email.com", required: true },
]

export const DEFAULT_COUNTDOWN_CONFIG: CountdownConfig = {
    enabled: false,
    mode: "evergreen",
    evergreenMinutes: 30,
    fixedDeadline: "",
    showDays: false,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    labelColor: "#6b7280",
    digitColor: "#111827",
    digitBgColor: "#f3f4f6",
    expiredBehavior: "hide",
    expiredMessage: "This offer has expired.",
    expiredRedirectUrl: "",
}

export const DEFAULT_CONTENT_LOCKER_CONFIG: ContentLockerConfig = {
    enabled: false,
    lockMode: "blur",
    selectors: ".locked-content",
    unlockDuration: "session",
    blurAmount: 8,
    overlayMessage: "Subscribe to unlock this content",
}

export const DEFAULT_SPIN_WHEEL_CONFIG: SpinWheelConfig = {
    enabled: false,
    segments: [
        { id: "1", label: "10% Off", value: "SAVE10", probability: 30, color: "#ef4444", isNoPrize: false },
        { id: "2", label: "No Prize", value: "", probability: 25, color: "#6b7280", isNoPrize: true },
        { id: "3", label: "25% Off", value: "SAVE25", probability: 15, color: "#3b82f6", isNoPrize: false },
        { id: "4", label: "Try Again", value: "", probability: 30, color: "#f59e0b", isNoPrize: true },
    ],
    spinButtonText: "Spin to Win!",
    emailBeforeSpin: true,
    wheelBorderColor: "#1f2937",
    pointerColor: "#ef4444",
    prizeMessage: "Congratulations! Your code: {value}",
}

export const DEFAULT_MULTI_STEP_CONFIG: MultiStepConfig = {
    enabled: false,
    steps: [],
    entryStepId: "",
}

export const DEFAULT_GEO_TARGETING_CONFIG: GeoTargetingConfig = {
    enabled: false,
    rules: [],
}

export const DEFAULT_REVENUE_TRACKING_CONFIG: RevenueTrackingConfig = {
    enabled: false,
    cookieDays: 30,
    conversionEventName: "purchase",
    revenueFieldSelector: "",
}

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
    countdown: { ...DEFAULT_COUNTDOWN_CONFIG },
    contentLocker: { ...DEFAULT_CONTENT_LOCKER_CONFIG },
    spinWheel: { ...DEFAULT_SPIN_WHEEL_CONFIG },
    multiStep: { ...DEFAULT_MULTI_STEP_CONFIG },
}

export const DEFAULT_TRIGGER_CONFIG: TriggerConfig[] = [
    { type: "time-delay", enabled: true, config: { seconds: 5 } },
    { type: "scroll", enabled: false, config: { percentage: 50 } },
    { type: "exit-intent", enabled: false, config: { sensitivity: 20 } },
    { type: "click", enabled: false, config: { selector: "" } },
    { type: "page-load", enabled: false, config: {} },
    { type: "inactivity", enabled: false, config: { seconds: 30 } },
    { type: "adblock", enabled: false, config: { message: "Please disable your ad blocker to support our site." } },
    { type: "scroll-to-element", enabled: false, config: { selector: "" } },
    { type: "purchase-event", enabled: false, config: { eventName: "purchase" } },
]

export const DEFAULT_TARGETING_CONFIG: TargetingConfig = {
    visitorType: "all",
    deviceType: "all",
    pageRules: [],
    referrerSource: "",
    dateStart: "",
    dateEnd: "",
    frequency: "once-per-session",
    geoTargeting: { ...DEFAULT_GEO_TARGETING_CONFIG },
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
    totalRevenue: 0,
    dailyStats: [],
    deviceBreakdown: [],
    geoBreakdown: [],
    funnelStats: [],
}
