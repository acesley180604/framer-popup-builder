/**
 * Popup Builder - Lightweight embed script for visitor-facing sites.
 * Target: < 50kB minified.
 * Features: modal, slide-in, fullscreen, banner, toast popup types.
 * Triggers: time-delay, scroll, exit-intent, click, page-load, inactivity.
 * Targeting: visitor type, device, URL rules, referrer, date range, frequency.
 * A/B testing: weighted variant selection.
 */

interface PbConfig {
    campaignId: string
    apiUrl: string
    popupType: string
    triggers: TriggerDef[]
    popup: PopupDef
    targeting: TargetDef
    abTest?: ABTestDef
    integrations?: IntegrationDef[]
    variantId?: string | null
    schedule?: ScheduleDef
}

interface TriggerDef {
    type: "time-delay" | "scroll" | "exit-intent" | "click" | "page-load" | "inactivity"
    enabled: boolean
    config: Record<string, string | number>
}

interface VideoDef {
    enabled: boolean
    url: string
    autoplay: boolean
    muted: boolean
}

interface AdvancedStyleDef {
    backdropBlur?: number
    borderWidth?: number
    borderColor?: string
    titleFontSize?: number
    bodyFontSize?: number
    buttonFontSize?: number
    padding?: number
}

interface ScheduleDef {
    enabled: boolean
    startDate: string | null
    endDate: string | null
    timezone: string
}

interface PopupDef {
    popupType: "modal" | "slide-in" | "fullscreen" | "banner-top" | "banner-bottom" | "toast"
    headline: string
    body: string
    ctaText: string
    backgroundColor: string
    backgroundImage?: string
    backgroundGradient?: string
    textColor: string
    buttonColor?: string
    buttonTextColor?: string
    imageUrl?: string
    closeButtonStyle?: "x" | "text" | "icon-circle" | "none"
    borderRadius?: number
    shadowIntensity?: number
    maxWidth?: number
    customCss?: string
    successMessage?: string
    redirectUrl?: string
    formFields?: FormFieldDef[]
    video?: VideoDef
    advancedStyle?: AdvancedStyleDef
    forcedInteraction?: boolean
}

interface FormFieldDef {
    id: string
    type: "email" | "name" | "phone" | "custom"
    label: string
    placeholder: string
    required: boolean
}

interface TargetDef {
    visitorType: "all" | "new" | "returning"
    deviceType: "all" | "desktop" | "mobile" | "tablet"
    pageRules?: PageRuleDef[]
    referrerSource?: string
    dateStart?: string
    dateEnd?: string
    frequency: "once" | "once-per-session" | "once-per-day" | "always"
}

interface PageRuleDef {
    id: string
    type: "exact" | "contains" | "regex"
    value: string
    exclude: boolean
}

interface ABTestDef {
    enabled: boolean
    variants: ABVariantDef[]
}

interface ABVariantDef {
    id: string
    name: string
    weight: number
    popupConfig: PopupDef
}

interface IntegrationDef {
    type: "mailchimp" | "convertkit" | "webhook"
    config: Record<string, string>
}

(function () {
    const STORAGE_PREFIX = "pb_"
    let shown = false
    let sessionCount = 0
    let inactivityTimer: ReturnType<typeof setTimeout> | null = null

    // ── Visitor ID ──────────────────────────────────────────────────────────────

    function getVisitorId(): string {
        const key = STORAGE_PREFIX + "vid"
        try {
            const existing = localStorage.getItem(key)
            if (existing) return existing
        } catch {
            // localStorage unavailable
        }
        const id = generateUUID()
        try {
            localStorage.setItem(key, id)
        } catch {
            // localStorage unavailable
        }
        return id
    }

    function generateUUID(): string {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID()
        }
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0
            const v = c === "x" ? r : (r & 0x3) | 0x8
            return v.toString(16)
        })
    }

    // ── Device detection ────────────────────────────────────────────────────────

    function getDeviceType(): "mobile" | "tablet" | "desktop" {
        const w = window.innerWidth
        if (w < 768) return "mobile"
        if (w < 1024) return "tablet"
        return "desktop"
    }

    // ── Config loading ──────────────────────────────────────────────────────────

    function getConfig(): PbConfig | null {
        const el = document.querySelector("[data-pb-config]")
        if (!el) return null
        try {
            return JSON.parse(el.getAttribute("data-pb-config") || "")
        } catch {
            return null
        }
    }

    // ── Email validation ────────────────────────────────────────────────────────

    function isValidEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // ── Video URL helpers ────────────────────────────────────────────────────────

    function getVideoEmbedUrl(url: string, autoplay: boolean, muted: boolean): string | null {
        // YouTube
        let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/)
        if (match) {
            const params = new URLSearchParams()
            if (autoplay) params.set("autoplay", "1")
            if (muted) params.set("mute", "1")
            const qs = params.toString()
            return `https://www.youtube.com/embed/${match[1]}${qs ? "?" + qs : ""}`
        }

        // Vimeo
        match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
        if (match) {
            const params = new URLSearchParams()
            if (autoplay) params.set("autoplay", "1")
            if (muted) params.set("muted", "1")
            const qs = params.toString()
            return `https://player.vimeo.com/video/${match[1]}${qs ? "?" + qs : ""}`
        }

        return null
    }

    // ── Schedule check ───────────────────────────────────────────────────────────

    function isScheduleActive(schedule?: ScheduleDef): boolean {
        if (!schedule || !schedule.enabled) return true
        const now = new Date()
        if (schedule.startDate) {
            const start = new Date(schedule.startDate)
            if (now < start) return false
        }
        if (schedule.endDate) {
            const end = new Date(schedule.endDate)
            if (now > end) return false
        }
        return true
    }

    // ── Page rule evaluation ────────────────────────────────────────────────────

    function matchesPageRule(rule: PageRuleDef, url: string): boolean {
        switch (rule.type) {
            case "exact":
                return url === rule.value
            case "contains":
                return url.includes(rule.value)
            case "regex":
                try {
                    return new RegExp(rule.value).test(url)
                } catch {
                    return false
                }
            default:
                return false
        }
    }

    function evaluatePageRules(rules: PageRuleDef[]): boolean {
        if (!rules || rules.length === 0) return true

        const url = window.location.pathname + window.location.search
        const includeRules = rules.filter((r) => !r.exclude)
        const excludeRules = rules.filter((r) => r.exclude)

        for (const rule of excludeRules) {
            if (matchesPageRule(rule, url)) return false
        }

        if (includeRules.length > 0) {
            return includeRules.some((rule) => matchesPageRule(rule, url))
        }

        return true
    }

    // ── Targeting ───────────────────────────────────────────────────────────────

    function matchesTarget(target: TargetDef): boolean {
        // Visitor type
        if (target.visitorType !== "all") {
            const visited = localStorage.getItem(STORAGE_PREFIX + "visited")
            const isReturning = !!visited
            localStorage.setItem(STORAGE_PREFIX + "visited", "1")
            if (target.visitorType === "new" && isReturning) return false
            if (target.visitorType === "returning" && !isReturning) return false
        }

        // Device type
        if (target.deviceType !== "all") {
            const device = getDeviceType()
            if (target.deviceType !== device) return false
        }

        // Page rules
        if (target.pageRules && target.pageRules.length > 0) {
            if (!evaluatePageRules(target.pageRules)) return false
        }

        // Referrer source
        if (target.referrerSource) {
            const ref = document.referrer.toLowerCase()
            if (!ref.includes(target.referrerSource.toLowerCase())) return false
        }

        // Date range
        if (target.dateStart) {
            const now = new Date()
            const start = new Date(target.dateStart)
            if (now < start) return false
        }
        if (target.dateEnd) {
            const now = new Date()
            const end = new Date(target.dateEnd)
            if (now > end) return false
        }

        return true
    }

    // ── Frequency ───────────────────────────────────────────────────────────────

    function checkFrequency(freq: string): boolean {
        const fk = STORAGE_PREFIX + "freq_"

        if (freq === "always") return true

        if (freq === "once") {
            if (localStorage.getItem(fk + "once")) return false
            return true
        }

        if (freq === "once-per-session") {
            if (sessionCount > 0) return false
            return true
        }

        if (freq === "once-per-day") {
            const lastDay = localStorage.getItem(fk + "day")
            if (lastDay) {
                const d = new Date(parseInt(lastDay))
                const n = new Date()
                if (d.toDateString() === n.toDateString()) return false
            }
            return true
        }

        return true
    }

    function markFrequency(freq: string): void {
        const fk = STORAGE_PREFIX + "freq_"
        if (freq === "once") localStorage.setItem(fk + "once", "1")
        if (freq === "once-per-day") localStorage.setItem(fk + "day", Date.now().toString())
    }

    // ── Tracking ────────────────────────────────────────────────────────────────

    function trackEvent(
        config: PbConfig,
        event: "view" | "close" | "convert",
        lead?: Record<string, string>
    ): void {
        if (!config.apiUrl) return

        const payload: Record<string, unknown> = {
            campaignId: config.campaignId,
            event,
            visitorId: getVisitorId(),
            device: getDeviceType(),
            pageUrl: window.location.href,
            variantId: config.variantId ?? null,
        }

        if (lead) {
            payload.lead = lead
        }

        fetch(config.apiUrl + "/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        }).catch(() => {})
    }

    // ── Send to integrations ────────────────────────────────────────────────────

    function sendToIntegrations(config: PbConfig, lead: Record<string, string>): void {
        if (!config.integrations) return

        for (const integration of config.integrations) {
            if (integration.type === "webhook" && integration.config.url) {
                const headers: Record<string, string> = { "Content-Type": "application/json" }
                if (integration.config.secret) {
                    headers["X-Webhook-Secret"] = integration.config.secret
                }
                fetch(integration.config.url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        event: "lead.created",
                        timestamp: new Date().toISOString(),
                        data: {
                            ...lead,
                            campaign_id: config.campaignId,
                            page_url: window.location.href,
                        },
                    }),
                }).catch(() => {})
            }

            if (integration.type === "convertkit" && integration.config.api_key && integration.config.form_id) {
                fetch(`https://api.convertkit.com/v3/forms/${integration.config.form_id}/subscribe`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        api_key: integration.config.api_key,
                        email: lead.email || "",
                        first_name: lead.name?.split(" ")[0] || "",
                    }),
                }).catch(() => {})
            }

            if (
                integration.type === "mailchimp" &&
                integration.config.api_key &&
                integration.config.list_id &&
                integration.config.server_prefix
            ) {
                // Mailchimp requires server-side calls due to CORS.
                // Send to webhook endpoint that proxies to Mailchimp.
                const proxyUrl = config.apiUrl + "/mailchimp-subscribe"
                if (config.apiUrl) {
                    fetch(proxyUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            api_key: integration.config.api_key,
                            list_id: integration.config.list_id,
                            server_prefix: integration.config.server_prefix,
                            email: lead.email || "",
                            name: lead.name || "",
                        }),
                    }).catch(() => {})
                }
            }
        }
    }

    // ── CSS Animations ──────────────────────────────────────────────────────────

    function injectAnimationStyles(): void {
        if (document.getElementById("pb-animations")) return
        const style = document.createElement("style")
        style.id = "pb-animations"
        style.textContent = `
            @keyframes pb-fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes pb-scale-up { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            @keyframes pb-slide-right { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
            @keyframes pb-slide-down { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }
            @keyframes pb-slide-up { from { opacity: 0; transform: translateY(100%); } to { opacity: 1; transform: translateY(0); } }
            #pb-overlay { animation: pb-fade-in 0.3s ease-out; }
            .pb-modal { animation: pb-scale-up 0.3s ease-out; }
            .pb-slide-in { animation: pb-slide-right 0.4s ease-out; }
            .pb-fullscreen { animation: pb-fade-in 0.3s ease-out; }
            .pb-banner-top { animation: pb-slide-down 0.3s ease-out; }
            .pb-banner-bottom { animation: pb-slide-up 0.3s ease-out; }
            .pb-toast { animation: pb-slide-right 0.3s ease-out; }
        `
        document.head.appendChild(style)
    }

    // ── Popup rendering ─────────────────────────────────────────────────────────

    function renderPopup(config: PbConfig, popupOverride?: PopupDef) {
        const popup = popupOverride || config.popup
        if (!popup) return

        injectAnimationStyles()

        const overlay = document.createElement("div")
        overlay.id = "pb-overlay"

        const pt = popup.popupType
        const isBannerTop = pt === "banner-top"
        const isBannerBottom = pt === "banner-bottom"
        const isSlideIn = pt === "slide-in"
        const isToast = pt === "toast"
        const isFullscreen = pt === "fullscreen"
        const isBanner = isBannerTop || isBannerBottom

        const advStyle = popup.advancedStyle
        const backdropBlur = advStyle?.backdropBlur ?? 0

        // Overlay styles
        Object.assign(overlay.style, {
            position: "fixed",
            zIndex: "999999",
            ...(isBannerTop
                ? { top: "0", left: "0", right: "0" }
                : isBannerBottom
                    ? { bottom: "0", left: "0", right: "0" }
                    : isSlideIn || isToast
                        ? { bottom: "20px", right: "20px" }
                        : {
                              top: "0",
                              left: "0",
                              right: "0",
                              bottom: "0",
                              background: "rgba(0,0,0,0.5)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              ...(backdropBlur > 0 ? { backdropFilter: `blur(${backdropBlur}px)`, WebkitBackdropFilter: `blur(${backdropBlur}px)` } : {}),
                          }),
        })

        // Box
        const box = document.createElement("div")
        box.className = `pb-${pt}`

        let bg = popup.backgroundColor || "#ffffff"
        if (popup.backgroundGradient) bg = popup.backgroundGradient

        const shadowLevels = [
            "none",
            "0 1px 3px rgba(0,0,0,0.1)",
            "0 4px 12px rgba(0,0,0,0.12)",
            "0 8px 24px rgba(0,0,0,0.15)",
            "0 12px 36px rgba(0,0,0,0.2)",
            "0 20px 50px rgba(0,0,0,0.25)",
        ]

        const customPadding = advStyle?.padding ?? 28

        Object.assign(box.style, {
            background: bg,
            color: popup.textColor || "#111827",
            padding: isBanner ? "14px 24px" : `${customPadding}px`,
            borderRadius: isBanner ? "0" : `${popup.borderRadius ?? 12}px`,
            maxWidth: isFullscreen ? "100vw" : `${popup.maxWidth ?? 480}px`,
            width: isBanner ? "100%" : isSlideIn || isToast ? "340px" : "90%",
            boxShadow: shadowLevels[Math.min(popup.shadowIntensity ?? 3, 5)],
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            position: "relative",
            ...(advStyle?.borderWidth ? { border: `${advStyle.borderWidth}px solid ${advStyle.borderColor || "#e5e7eb"}` } : {}),
            ...(isBanner ? { display: "flex", alignItems: "center", gap: "16px" } : { textAlign: "center" }),
            ...(isFullscreen ? { maxHeight: "100vh", overflow: "auto" } : {}),
        })

        // Background image
        if (popup.backgroundImage) {
            Object.assign(box.style, {
                backgroundImage: `url(${popup.backgroundImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
            })
        }

        // Custom CSS
        if (popup.customCss) {
            const customStyle = document.createElement("style")
            customStyle.textContent = popup.customCss
            overlay.appendChild(customStyle)
        }

        // Close button (hidden when forced interaction is enabled)
        const isForcedInteraction = popup.forcedInteraction ?? false
        const closeStyle = popup.closeButtonStyle ?? "x"
        if (closeStyle !== "none" && !isForcedInteraction) {
            const close = document.createElement("button")
            close.textContent = closeStyle === "text" ? "Close" : "\u00D7"
            Object.assign(close.style, {
                position: "absolute",
                top: "8px",
                right: "12px",
                background: closeStyle === "icon-circle" ? "rgba(0,0,0,0.1)" : "none",
                border: "none",
                fontSize: closeStyle === "text" ? "12px" : "20px",
                cursor: "pointer",
                color: popup.textColor || "#111827",
                opacity: "0.6",
                borderRadius: closeStyle === "icon-circle" ? "50%" : "0",
                width: closeStyle === "icon-circle" ? "28px" : "auto",
                height: closeStyle === "icon-circle" ? "28px" : "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: "1",
            })
            close.onclick = () => {
                trackEvent(config, "close")
                overlay.remove()
            }
            box.appendChild(close)
        }

        // Forced interaction: prevent backdrop click and Escape key
        if (isForcedInteraction) {
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) e.stopPropagation()
            })
            const escHandler = (e: KeyboardEvent) => {
                if (e.key === "Escape") e.preventDefault()
            }
            document.addEventListener("keydown", escHandler)
            // Clean up on removal
            const observer = new MutationObserver(() => {
                if (!document.body.contains(overlay)) {
                    document.removeEventListener("keydown", escHandler)
                    observer.disconnect()
                }
            })
            observer.observe(document.body, { childList: true })
        } else {
            // Allow backdrop click to close
            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) {
                    trackEvent(config, "close")
                    overlay.remove()
                }
            })
        }

        // Image
        if (popup.imageUrl && !isBanner) {
            const img = document.createElement("img")
            img.src = popup.imageUrl
            img.alt = ""
            Object.assign(img.style, {
                display: "block",
                maxWidth: "100%",
                borderRadius: "8px",
                maxHeight: isToast ? "80px" : "200px",
                objectFit: "cover",
                margin: "0 auto 14px auto",
            })
            box.appendChild(img)
        }

        // Video embed
        if (popup.video?.enabled && popup.video.url && !isBanner) {
            const embedUrl = getVideoEmbedUrl(popup.video.url, popup.video.autoplay, popup.video.muted)
            if (embedUrl) {
                const videoWrap = document.createElement("div")
                Object.assign(videoWrap.style, {
                    position: "relative",
                    width: "100%",
                    paddingBottom: "56.25%", // 16:9 aspect ratio
                    marginBottom: "14px",
                    borderRadius: "8px",
                    overflow: "hidden",
                })
                const iframe = document.createElement("iframe")
                iframe.src = embedUrl
                iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                iframe.allowFullscreen = true
                Object.assign(iframe.style, {
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "100%",
                    border: "none",
                })
                videoWrap.appendChild(iframe)
                box.appendChild(videoWrap)
            }
        }

        // Content wrapper for banner layout
        const contentWrap = isBanner ? document.createElement("div") : box
        if (isBanner) {
            contentWrap.style.flex = "1"
            box.appendChild(contentWrap)
        }

        // Headline
        const h = document.createElement("h2")
        h.textContent = popup.headline
        const titleSize = advStyle?.titleFontSize ?? (isBanner || isToast ? 15 : 22)
        Object.assign(h.style, {
            margin: "0 0 6px 0",
            fontSize: `${titleSize}px`,
            fontWeight: "700",
        })
        contentWrap.appendChild(h)

        // Body text (skip for banner)
        if (!isBanner) {
            const p = document.createElement("p")
            p.textContent = popup.body
            const bodySize = advStyle?.bodyFontSize ?? (isToast ? 12 : 14)
            Object.assign(p.style, {
                margin: "0 0 14px 0",
                fontSize: `${bodySize}px`,
                opacity: "0.8",
                lineHeight: "1.5",
            })
            contentWrap.appendChild(p)
        }

        // Form container
        const formContainer = document.createElement("div")
        formContainer.id = "pb-form"

        // Error element
        const errorEl = document.createElement("div")
        errorEl.id = "pb-error"
        Object.assign(errorEl.style, {
            color: "#ef4444",
            fontSize: "12px",
            marginBottom: "8px",
            display: "none",
        })
        formContainer.appendChild(errorEl)

        // Form fields
        const fields = popup.formFields ?? []
        const inputMap: Record<string, { el: HTMLInputElement; field: FormFieldDef }> = {}

        for (const field of fields) {
            const input = document.createElement("input")
            input.type = field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"
            input.placeholder = field.placeholder || field.label
            input.id = `pb-field-${field.id}`
            Object.assign(input.style, {
                display: "block",
                width: isBanner ? "180px" : "100%",
                maxWidth: "300px",
                margin: isBanner ? "0" : "0 auto 8px auto",
                padding: "8px 12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
            })
            formContainer.appendChild(input)
            inputMap[field.id] = { el: input, field }
        }

        // CTA button
        const btnColor = popup.buttonColor || "#3b82f6"
        const btnTextColor = popup.buttonTextColor || "#ffffff"
        const btnFontSize = advStyle?.buttonFontSize ?? 14
        const btn = document.createElement("button")
        btn.textContent = popup.ctaText || "Submit"
        btn.id = "pb-cta-btn"
        Object.assign(btn.style, {
            padding: "10px 24px",
            background: btnColor,
            color: btnTextColor,
            border: "none",
            borderRadius: "6px",
            fontSize: `${btnFontSize}px`,
            fontWeight: "600",
            cursor: "pointer",
            display: isBanner ? "inline-block" : "block",
            margin: isBanner ? "0" : "8px auto 0 auto",
        })

        btn.onclick = () => {
            // Validate
            for (const key of Object.keys(inputMap)) {
                const { el, field } = inputMap[key]
                const val = el.value.trim()
                if (field.required && !val) {
                    showError(errorEl, `Please fill in ${field.label}.`)
                    return
                }
                if (field.type === "email" && val && !isValidEmail(val)) {
                    showError(errorEl, "Please enter a valid email address.")
                    return
                }
            }

            // Collect lead data
            const leadData: Record<string, string> = {}
            for (const key of Object.keys(inputMap)) {
                leadData[key] = inputMap[key].el.value.trim()
            }

            // Track conversion
            trackEvent(config, "convert", leadData)

            // Send to integrations
            sendToIntegrations(config, leadData)

            // Show success state
            showSuccessState(formContainer, popup, overlay)
        }
        formContainer.appendChild(btn)

        if (isBanner) {
            Object.assign(formContainer.style, {
                display: "flex",
                alignItems: "center",
                gap: "8px",
            })
        }

        contentWrap.appendChild(formContainer)
        overlay.appendChild(box)
        document.body.appendChild(overlay)

        // Track view
        trackEvent(config, "view")
    }

    function showError(errorEl: HTMLElement, message: string): void {
        errorEl.textContent = message
        errorEl.style.display = "block"
        setTimeout(() => {
            errorEl.style.display = "none"
        }, 3000)
    }

    function showSuccessState(formContainer: HTMLElement, popup: PopupDef, overlay: HTMLElement): void {
        const successMessage = popup.successMessage || "Thanks for submitting!"

        // Hide form inputs and button
        const inputs = formContainer.querySelectorAll("input, button")
        inputs.forEach((el) => {
            ;(el as HTMLElement).style.display = "none"
        })
        const errorEl = formContainer.querySelector("#pb-error")
        if (errorEl) (errorEl as HTMLElement).style.display = "none"

        // Show success message
        const successEl = document.createElement("div")
        successEl.textContent = successMessage
        Object.assign(successEl.style, {
            padding: "16px",
            fontSize: "16px",
            fontWeight: "600",
            textAlign: "center",
        })
        formContainer.appendChild(successEl)

        // Redirect or auto-close
        if (popup.redirectUrl) {
            setTimeout(() => {
                window.location.href = popup.redirectUrl!
            }, 2000)
        } else {
            setTimeout(() => {
                overlay.remove()
            }, 3000)
        }
    }

    // ── Show popup (with A/B test support) ──────────────────────────────────────

    function showPopup(config: PbConfig) {
        if (shown) return
        if (!checkFrequency(config.targeting.frequency)) return

        shown = true
        sessionCount++
        markFrequency(config.targeting.frequency)

        // A/B test variant selection
        if (config.abTest?.enabled && config.abTest.variants.length > 0) {
            const rand = Math.random() * 100
            let acc = 0
            for (const variant of config.abTest.variants) {
                acc += variant.weight
                if (rand <= acc) {
                    config.variantId = variant.id
                    renderPopup(config, variant.popupConfig)
                    return
                }
            }
            // Fallback to first variant
            config.variantId = config.abTest.variants[0].id
            renderPopup(config, config.abTest.variants[0].popupConfig)
        } else {
            renderPopup(config)
        }
    }

    // ── Trigger setup ───────────────────────────────────────────────────────────

    function setupTriggers(config: PbConfig) {
        for (const trigger of config.triggers) {
            if (!trigger.enabled) continue

            switch (trigger.type) {
                case "exit-intent": {
                    const sensitivity = (trigger.config.sensitivity as number) || 20
                    document.addEventListener("mouseleave", (e) => {
                        if (e.clientY <= sensitivity) {
                            showPopup(config)
                        }
                    })
                    break
                }
                case "scroll": {
                    const pct = (trigger.config.percentage as number) || 50
                    window.addEventListener("scroll", () => {
                        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
                        if (scrolled >= pct) {
                            showPopup(config)
                        }
                    })
                    break
                }
                case "time-delay": {
                    const seconds = (trigger.config.seconds as number) || 5
                    setTimeout(() => {
                        showPopup(config)
                    }, seconds * 1000)
                    break
                }
                case "click": {
                    const selector = trigger.config.selector as string
                    if (selector) {
                        document.addEventListener("click", (e) => {
                            if ((e.target as Element).matches && (e.target as Element).matches(selector)) {
                                showPopup(config)
                            }
                        })
                    }
                    break
                }
                case "page-load": {
                    showPopup(config)
                    break
                }
                case "inactivity": {
                    const inactivitySeconds = (trigger.config.seconds as number) || 30
                    const resetInactivityTimer = () => {
                        if (inactivityTimer) clearTimeout(inactivityTimer)
                        inactivityTimer = setTimeout(() => {
                            showPopup(config)
                        }, inactivitySeconds * 1000)
                    }

                    resetInactivityTimer()
                    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"]
                    for (const eventType of activityEvents) {
                        document.addEventListener(eventType, resetInactivityTimer, { passive: true })
                    }
                    break
                }
            }
        }
    }

    // ── Init ────────────────────────────────────────────────────────────────────

    function init() {
        const config = getConfig()
        if (!config) {
            console.warn("[Popup Builder] No configuration found. Add data-pb-config attribute.")
            return
        }

        // Check campaign schedule
        if (!isScheduleActive(config.schedule)) return

        if (!matchesTarget(config.targeting)) return

        // Graceful degradation: if exit-intent unavailable (mobile), skip that trigger
        if (!("onmouseleave" in document)) {
            config.triggers = config.triggers.map((t) =>
                t.type === "exit-intent" ? { ...t, enabled: false } : t
            )
        }

        setupTriggers(config)
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init)
    } else {
        init()
    }
})()

// ── Exports for testing ─────────────────────────────────────────────────────

export function _testIsValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function _testGetDeviceType(width: number): "mobile" | "tablet" | "desktop" {
    if (width < 768) return "mobile"
    if (width < 1024) return "tablet"
    return "desktop"
}

export function _testMatchesPageRule(
    rule: { type: "exact" | "contains" | "regex"; value: string; exclude: boolean },
    url: string
): boolean {
    switch (rule.type) {
        case "exact":
            return url === rule.value
        case "contains":
            return url.includes(rule.value)
        case "regex":
            try {
                return new RegExp(rule.value).test(url)
            } catch {
                return false
            }
        default:
            return false
    }
}
