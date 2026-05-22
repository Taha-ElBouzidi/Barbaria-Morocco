#!/usr/bin/env node
/**
 * Add Barbaria Morocco's baseline Wikidata statements to an item.
 *
 * Wikidata's QuickStatements requires 4 days of autoconfirmation. This
 * script bypasses that by calling the MediaWiki action API directly with
 * a Wikidata bot password (which can be issued the day the account is
 * created and scoped to "edit existing pages" only).
 *
 * Usage (PowerShell):
 *   $env:WIKIDATA_USERNAME='YourUser@BotName'
 *   $env:WIKIDATA_BOT_PASSWORD='thelongrandomstringwikidataissues'
 *   node scripts/wikidata-add-statements.mjs Q139891256
 *
 * Usage (Bash):
 *   WIKIDATA_USERNAME='YourUser@BotName' \
 *   WIKIDATA_BOT_PASSWORD='thelongrandomstring' \
 *   node scripts/wikidata-add-statements.mjs Q139891256
 *
 * Generate a bot password at:
 *   https://www.wikidata.org/wiki/Special:BotPasswords
 *   Scope: tick "Edit existing pages" only (least privilege).
 *
 * The script logs each statement add and prints any failures with the
 * Wikidata API error code. Already-existing statements return a known
 * error code that the script treats as a no-op.
 */

const API = "https://www.wikidata.org/w/api.php";
const Q = process.argv[2];
if (!Q || !/^Q\d+$/.test(Q)) {
  console.error("Usage: node scripts/wikidata-add-statements.mjs Q<number>");
  process.exit(1);
}

const USERNAME = process.env.WIKIDATA_USERNAME;
const PASSWORD = process.env.WIKIDATA_BOT_PASSWORD;
if (!USERNAME || !PASSWORD) {
  console.error(
    "Set WIKIDATA_USERNAME and WIKIDATA_BOT_PASSWORD env vars first.\n" +
      "Generate them at https://www.wikidata.org/wiki/Special:BotPasswords"
  );
  process.exit(1);
}

// Simple cookie jar (the MediaWiki API uses session cookies for auth).
const cookies = new Map();
function cookieHeader() {
  return Array.from(cookies.entries()).map(([k, v]) => `${k}=${v}`).join("; ");
}
function recordSetCookies(res) {
  // getSetCookie() returns the raw Set-Cookie values per the spec; Node 22+
  // implements it on the Headers object. Fall back to the older API if not.
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

// Step 1: login token
console.log("Fetching login token...");
const loginTokenRes = await api({
  action: "query",
  meta: "tokens",
  type: "login",
});
const loginToken = loginTokenRes.query.tokens.logintoken;

// Step 2: login with bot password
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

// Step 3: CSRF token
const csrfRes = await api({ action: "query", meta: "tokens", type: "csrf" });
const csrfToken = csrfRes.query.tokens.csrftoken;
if (!csrfToken || csrfToken === "+\\") {
  console.error("Failed to get CSRF token (still anon?). Login may have failed silently.");
  process.exit(1);
}

// Step 4: statement plan
const STATEMENTS = [
  { property: "P31", item: 4830453, label: "instance of: business" },
  { property: "P1454", item: 1187513, label: "legal form: limited liability company" },
  { property: "P17", item: 1028, label: "country: Morocco" },
  { property: "P159", item: 5891, label: "headquarters: Casablanca" },
  { property: "P452", item: 105886, label: "industry: cosmetics industry" },
  { property: "P452", item: 15323870, label: "industry: luxury goods industry" },
  { property: "P856", string: "https://barbariamorocco.com", label: "official website" },
  { property: "P2003", string: "barbaria_00", label: "Instagram username" },
  { property: "P4264", string: "barbaria-morocco", label: "LinkedIn company ID" },
];

console.log(`Adding ${STATEMENTS.length} statements to ${Q}...\n`);
let ok = 0;
let skipped = 0;
let failed = 0;
for (const s of STATEMENTS) {
  const valueJson =
    "item" in s
      ? JSON.stringify({ "entity-type": "item", "numeric-id": s.item })
      : JSON.stringify(s.string);
  const res = await api(
    {
      action: "wbcreateclaim",
      entity: Q,
      property: s.property,
      snaktype: "value",
      value: valueJson,
      token: csrfToken,
      bot: "1",
    },
    "POST"
  );
  if (res.success === 1) {
    console.log(`  ✓ ${s.property}  ${s.label}`);
    ok++;
  } else if (res.error?.code === "modification-failed") {
    console.log(`  ~ ${s.property}  ${s.label}  (already present, skipped)`);
    skipped++;
  } else {
    console.log(`  ✗ ${s.property}  ${s.label}  →`, res.error?.info ?? res);
    failed++;
  }
  // Be a polite API consumer.
  await new Promise((r) => setTimeout(r, 250));
}

console.log(`\nDone. ${ok} added, ${skipped} skipped, ${failed} failed.`);
process.exit(failed > 0 ? 1 : 0);
