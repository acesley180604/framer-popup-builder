import { useState } from "react"
import { useCampaignStore } from "@/store/campaignStore"

export default function AnalyticsDashboard() {
    const { activeCampaign } = useCampaignStore()
    const campaign = activeCampaign()
    const [activeSection, setActiveSection] = useState<"overview" | "devices" | "variants">(
        "overview"
    )

    if (!campaign) return null

    const data = campaign.analytics
    const totalImpressions = data?.totalImpressions ?? 0
    const totalConversions = data?.totalConversions ?? 0
    const totalCloses = data?.totalCloses ?? 0
    const conversionRate = data?.conversionRate ?? 0
    const closeRate = data?.closeRate ?? 0

    return (
        <div className="stack-lg">
            {/* Summary Cards */}
            <div className="grid-3">
                <div className="stat-card">
                    <div className="stat-label">Impressions</div>
                    <div className="stat-value">{totalImpressions.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Conversions</div>
                    <div className="stat-value highlight">{totalConversions.toLocaleString()}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Closes</div>
                    <div className="stat-value">{totalCloses.toLocaleString()}</div>
                </div>
            </div>

            <div className="grid-2">
                <div className="stat-card">
                    <div className="stat-label">Conversion Rate</div>
                    <div className="stat-value">{conversionRate.toFixed(1)}%</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Close Rate</div>
                    <div className="stat-value">{closeRate.toFixed(1)}%</div>
                </div>
            </div>

            {/* Section tabs */}
            <div className="tab-bar">
                {(
                    [
                        { id: "overview", label: "Daily" },
                        { id: "devices", label: "Devices" },
                        { id: "variants", label: "A/B Variants" },
                    ] as const
                ).map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={activeSection === s.id ? "active" : ""}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Daily Stats */}
            {activeSection === "overview" && (
                <div style={{ border: "1px solid var(--framer-color-divider)", borderRadius: 8, overflow: "hidden" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th className="text-right">Impr.</th>
                                <th className="text-right">Conv.</th>
                                <th className="text-right">Closes</th>
                                <th className="text-right">Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.dailyStats ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: 20, color: "var(--framer-color-text-tertiary)" }}>
                                        No data yet. Analytics data appears here once your popup is live and receiving traffic.
                                    </td>
                                </tr>
                            ) : (
                                data?.dailyStats.map((day) => (
                                    <tr key={day.date}>
                                        <td className="text-primary">{day.date}</td>
                                        <td className="text-right">{day.impressions.toLocaleString()}</td>
                                        <td className="text-right text-green">{day.conversions}</td>
                                        <td className="text-right">{day.closes}</td>
                                        <td className="text-right">
                                            {day.impressions > 0 ? ((day.conversions / day.impressions) * 100).toFixed(1) : "0"}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Device Breakdown */}
            {activeSection === "devices" && (
                <div style={{ border: "1px solid var(--framer-color-divider)", borderRadius: 8, overflow: "hidden" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Device</th>
                                <th className="text-right">Impressions</th>
                                <th className="text-right">Conversions</th>
                                <th className="text-right">Rate</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.deviceBreakdown ?? []).length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center", padding: 20, color: "var(--framer-color-text-tertiary)" }}>
                                        No device data available yet.
                                    </td>
                                </tr>
                            ) : (
                                data?.deviceBreakdown.map((d) => (
                                    <tr key={d.device}>
                                        <td className="text-primary capitalize">{d.device}</td>
                                        <td className="text-right">{d.impressions.toLocaleString()}</td>
                                        <td className="text-right text-green">{d.conversions}</td>
                                        <td className="text-right">
                                            {d.impressions > 0 ? ((d.conversions / d.impressions) * 100).toFixed(1) : "0"}%
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* A/B Variant Stats */}
            {activeSection === "variants" && (
                <>
                    {data?.variantStats && data.variantStats.length > 0 ? (
                        <div style={{ border: "1px solid var(--framer-color-divider)", borderRadius: 8, overflow: "hidden" }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Variant</th>
                                        <th className="text-right">Impr.</th>
                                        <th className="text-right">Conv.</th>
                                        <th className="text-right">Rate</th>
                                        <th className="text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.variantStats.map((v) => {
                                        const bestRate = Math.max(
                                            ...data.variantStats!.map((vs) => vs.conversionRate)
                                        )
                                        const isWinner =
                                            v.conversionRate === bestRate &&
                                            v.impressions >= 100 &&
                                            data.variantStats!.length > 1
                                        return (
                                            <tr key={v.variant_id}>
                                                <td className="text-primary">{v.variant_name}</td>
                                                <td className="text-right">{v.impressions.toLocaleString()}</td>
                                                <td className="text-right text-green">{v.conversions}</td>
                                                <td className="text-right">{v.conversionRate.toFixed(1)}%</td>
                                                <td className="text-right">
                                                    {isWinner ? (
                                                        <span style={{ fontSize: 10, fontWeight: 600, color: "#38a169" }}>
                                                            Winner
                                                        </span>
                                                    ) : v.impressions < 100 ? (
                                                        <span style={{ fontSize: 10, color: "var(--framer-color-text-tertiary)" }}>
                                                            Collecting data...
                                                        </span>
                                                    ) : (
                                                        <span style={{ fontSize: 10, color: "var(--framer-color-text-tertiary)" }}>--</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            <div style={{ padding: "6px 10px", background: "var(--framer-color-bg-secondary)", fontSize: 10, color: "var(--framer-color-text-tertiary)" }}>
                                A variant needs at least 100 impressions to be considered for winner detection.
                            </div>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p style={{ fontSize: 10 }}>
                                No A/B test data. Enable A/B testing in the A/B Test tab to see variant performance.
                            </p>
                        </div>
                    )}
                </>
            )}

            <div className="info-box info-box-default">
                Analytics data is collected via the embed script. Connect an analytics endpoint
                in the Embed tab settings for server-side tracking and persistent data.
            </div>
        </div>
    )
}
