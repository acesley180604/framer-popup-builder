/**
 * Countdown timer utility functions.
 */

export interface CountdownValues {
    days: number
    hours: number
    minutes: number
    seconds: number
    expired: boolean
}

/**
 * Calculate remaining time from a deadline timestamp.
 */
export function getTimeRemaining(deadline: number): CountdownValues {
    const now = Date.now()
    const diff = deadline - now

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    }

    return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        expired: false,
    }
}

/**
 * Get or create an evergreen deadline for a visitor.
 */
export function getEvergreenDeadline(campaignId: string, durationMinutes: number): number {
    const key = `pb_countdown_${campaignId}`
    try {
        const stored = localStorage.getItem(key)
        if (stored) {
            const deadline = parseInt(stored, 10)
            if (!isNaN(deadline)) return deadline
        }
    } catch {
        // localStorage unavailable
    }

    const deadline = Date.now() + durationMinutes * 60 * 1000
    try {
        localStorage.setItem(key, deadline.toString())
    } catch {
        // localStorage unavailable
    }
    return deadline
}

/**
 * Parse a fixed deadline string to timestamp.
 */
export function parseFixedDeadline(dateString: string): number {
    const d = new Date(dateString)
    return isNaN(d.getTime()) ? Date.now() : d.getTime()
}

/**
 * Format a countdown value with leading zero.
 */
export function padValue(value: number): string {
    return value.toString().padStart(2, "0")
}
