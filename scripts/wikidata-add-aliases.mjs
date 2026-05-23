#!/usr/bin/env node
/**
 * Add brand-name aliases to a Wikidata item (per language).
 *
 * Why: search engines and AI engines lean on Wikidata for brand-entity
 * disambiguation. Adding "Barbaria Maroc", "Maison Barbaria", and the
 * short "Barbaria" form as aliases tells the open knowledge graph that
 * all those strings point to the same entity, which dramatically speeds
 * up cross-language brand recognition (esp. FR "Maroc" vs EN "Morocco").
 *
 * Usage:
 *   $env:WIKIDATA_USERNAME='YourUser@BotName'
 *   $env:WIKIDATA_BOT_PASSWORD='thelongrandomstring'
 *   node scripts/wikidata-add-aliases.mjs Q139891256
 *
 * The same bot password used by wikidata-add-statements.mjs works here,
 * provided it includes the "Edit existing pages" grant.
 */

const API = "https://www.wikidata.org/w/api.php";
const Q = process.argv[2];
if (!Q || !/^Q\d+$/.test(Q)) {
  console.error("Usage: node scripts/wikidata-add-aliases.mjs Q<number>");
  process.exit(1);
}

const USERNAME = process.env.WIKIDATA_USERNAME;
const PASSWORD = process.env.WIKIDATA_BOT_PASSWORD;
if (!USERNAME || !PASSWORD) {
  console.error(
    "Set WIKIDATA_USERNAME and WIKIDATA_BOT_PASSWORD env vars first.\n" +
      "Generate at https://www.wikidata.org/wiki/Special:BotPasswords"
  );
  process.exit(1);
}

const cookies = new Map();
function cookieHeader() {
  return Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}
function recordSetCookies(res) {
  const raws =
    res.headers.getSetCookie?.() ??
    res.headers.raw?.()["set-cookie"] ??
    [];
  for (const raw of raws) {
    const [pair] = raw.split(";");
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}

async function api(params, method = "GET") {
  const body = new URLSearchParams({ ...params, format: "json" });
  const opts = {
    method,
    headers: {
      "user-agent": "BarbariaMorocco-WikidataSetup/1.0 (contact: admin@barbariamorocco.com)",
      cookie: cookieHeader(),
    },
  };
  let url = API;
  if (method === "POST") {
    opts.body = body;
    opts.headers["content-type"] = "application/x-www-form-urlencoded";
  } else {
    url = `${API}?${body}`;
  }
  const res = await fetch(url, opts);
  recordSetCookies(res);
  return res.json();
}

console.log("Fetching login token...");
const loginTokenRes = await api({ action: "query", meta: "tokens", type: "login" });
const loginToken = loginTokenRes.query.tokens.logintoken;

console.log("Logging in as", USERNAME);
const loginRes = await api(
  {
    action: "login",
    lgname: USERNAME,
    lgpassword: PASSWORD,
    lgtoken: loginToken,
  },
  "POST"
);
if (loginRes.login?.result !== "Success") {
  console.error("Login failed:", JSON.stringify(loginRes, null, 2));
  process.exit(1);
}
console.log("Logged in.");

const csrfRes = await api({ action: "query", meta: "tokens", type: "csrf" });
const csrfToken = csrfRes.query.tokens.csrftoken;
if (!csrfToken || csrfToken === "+\\") {
  console.error("Failed to get CSRF token. Login may have failed silently.");
  process.exit(1);
}

// Per-locale alias plan. The Wikidata label stays "Barbaria Morocco"
// in both languages (it is the legal brand string); aliases capture
// the variants real buyers type. "Barbaria Maroc" is FR-only because
// "Maroc" is the French word for Morocco. "Maison Barbaria" is FR-only
// because "maison" is a French commerce honorific (anglophones type
// "Barbaria" or "House of Barbaria", and the latter is rarely searched).
const ALIASES = [
  { language: "fr", values: ["Barbaria", "Barbaria Maroc", "Barbaria Casablanca", "Maison Barbaria"] },
  { language: "en", values: ["Barbaria", "Barbaria Casablanca"] },
];

console.log(`Adding aliases to ${Q}...\n`);
let ok = 0;
let failed = 0;
for (const a of ALIASES) {
  const res = await api(
    {
      action: "wbsetaliases",
      id: Q,
      language: a.language,
      // `add` appends without touching existing aliases. Pipe-separated.
      add: a.values.join("|"),
      token: csrfToken,
      bot: "1",
    },
    "POST"
  );
  if (res.success === 1) {
    console.log(`  ✓ [${a.language}]  ${a.values.join(", ")}`);
    ok++;
  } else {
    console.log(`  ✗ [${a.language}]  →`, res.error?.info ?? JSON.stringify(res));
    failed++;
  }
  await new Promise((r) => setTimeout(r, 250));
}

console.log(`\nDone. ${ok} batches added, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
