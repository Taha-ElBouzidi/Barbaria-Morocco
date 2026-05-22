import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/constants";

/**
 * robots.txt policy. Most AI crawlers default to indexing only when
 * explicitly allowed (vs traditional search engines which assume
 * allow-all). The catch-all `*` rule covers Googlebot, Bingbot, and the
 * long tail; the named blocks make each major AI crawler's permission
 * explicit so they are not relying on the catch-all that some publishers
 * use to block AI training.
 *
 * Posture: Barbaria Morocco WANTS to be discoverable by AI search and
 * chatbots (ChatGPT, Claude, Perplexity, Gemini, Copilot). Allowing
 * them by name removes ambiguity.
 *
 * `/admin` (staff dashboard) and `/api` (programmatic endpoints) are
 * disallowed for every crawler.
 */
const AI_FRIENDLY_CRAWLERS = [
  // OpenAI / ChatGPT
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  // Anthropic / Claude
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Google AI (separate from Googlebot; controls training/grounding use)
  "Google-Extended",
  // Apple Intelligence
  "Applebot-Extended",
  // Common Crawl (used to train many models)
  "CCBot",
  // Cohere
  "cohere-ai",
  // Meta / Llama
  "FacebookBot",
  "meta-externalagent",
  // Diffbot (used by various AI agents)
  "Diffbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
      ...AI_FRIENDLY_CRAWLERS.map((ua) => ({
        userAgent: ua,
        allow: "/",
        disallow: ["/admin", "/api"],
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
