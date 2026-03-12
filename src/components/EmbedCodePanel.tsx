import { useState } from "react"
import { useCampaignStore } from "@/store/campaignStore"
import { generateEmbedCode, copyToClipboard } from "@/utils/embedGenerator"

export default function EmbedCodePanel() {
    const { activeCampaign } = useCampaignStore()
    const campaign = activeCampaign()
    const [copied, setCopied] = useState(false)

    if (!campaign) return null

    const analyticsUrl = import.meta.env.VITE_ANALYTICS_URL as string || ""
    const embedCode = generateEmbedCode(campaign, analyticsUrl)

    const handleCopy = async () => {
        const ok = await copyToClipboard(embedCode)
        if (ok) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="stack-lg">
            <section>
                <h2>Embed Code</h2>
                <p style={{ marginTop: 4 }}>
                    Add this code snippet to your website to display the popup.
                </p>
            </section>

            {/* Info box */}
            <div className="info-box info-box-default">
                The embed code contains your full popup configuration inline. Update the embed
                code whenever you change your popup settings.
            </div>

            {/* Code block */}
            <div className="code-block">
                <button
                    onClick={handleCopy}
                    className={`copy-btn ${copied ? "copied" : ""}`}
                >
                    {copied ? "Copied!" : "Copy"}
                </button>
                {embedCode}
            </div>

            {/* Campaign status warning */}
            {campaign.status !== "active" && (
                <div className="info-box info-box-warn">
                    This popup is currently <strong>{campaign.status}</strong>. Set it to{" "}
                    <strong>active</strong> before embedding to ensure it displays correctly.
                </div>
            )}

            {/* Campaign ID reference */}
            <section>
                <label>Campaign ID</label>
                <code style={{
                    display: "block",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid var(--framer-color-divider)",
                    background: "var(--framer-color-bg-secondary)",
                    userSelect: "all",
                }}>
                    {campaign.id}
                </code>
            </section>

            {/* Installation instructions */}
            <div className="install-guide">
                <header>Installation Guide</header>
                <ol>
                    <li>Copy the embed code above</li>
                    <li>
                        Paste it into your website's HTML, just before the closing{" "}
                        <code>&lt;/body&gt;</code> tag
                    </li>
                    <li>
                        For Framer: Go to Site Settings &rarr; Custom Code &rarr; End of{" "}
                        <code>&lt;body&gt;</code>
                    </li>
                    <li>
                        For other builders: Use their custom code injection feature (Webflow, Squarespace, WordPress, etc.)
                    </li>
                    <li>Publish your site and verify the popup appears</li>
                </ol>
            </div>

            {/* Size estimate */}
            <div className="info-box info-box-tint">
                Embed size: ~{(new Blob([embedCode]).size / 1024).toFixed(1)}KB uncompressed.
                The popup runtime is fully self-contained with no external dependencies.
            </div>
        </div>
    )
}
