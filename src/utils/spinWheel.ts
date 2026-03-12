/**
 * Spin Wheel utility functions for probability-weighted segment selection.
 */

import type { SpinWheelSegment } from "./defaults"

/**
 * Select a winning segment based on probability weights.
 */
export function selectWinningSegment(segments: SpinWheelSegment[]): SpinWheelSegment {
    const totalWeight = segments.reduce((sum, s) => sum + s.probability, 0)
    let rand = Math.random() * totalWeight
    for (const segment of segments) {
        rand -= segment.probability
        if (rand <= 0) return segment
    }
    return segments[segments.length - 1]
}

/**
 * Calculate the rotation angle for a specific segment index.
 */
export function getSegmentAngle(segmentCount: number, index: number): number {
    const segmentAngle = 360 / segmentCount
    return segmentAngle * index + segmentAngle / 2
}

/**
 * Calculate total spin rotation (multiple full spins + target angle).
 */
export function calculateSpinRotation(segmentCount: number, winnerIndex: number): number {
    const fullSpins = 5 + Math.floor(Math.random() * 3)
    const targetAngle = getSegmentAngle(segmentCount, winnerIndex)
    return fullSpins * 360 + (360 - targetAngle)
}

/**
 * Normalize probability weights to sum to 100.
 */
export function normalizeProbabilities(segments: SpinWheelSegment[]): SpinWheelSegment[] {
    const total = segments.reduce((sum, s) => sum + s.probability, 0)
    if (total === 0) return segments.map((s) => ({ ...s, probability: 100 / segments.length }))
    return segments.map((s) => ({
        ...s,
        probability: Math.round((s.probability / total) * 100),
    }))
}
