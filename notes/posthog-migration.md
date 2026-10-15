# Profile site PostHog preparation

Date: 2026-10-15. Branch: `codex/profile-posthog-analytics`, from `0236f777d75ab431c7db7a236d40790cbc297786`.

## Accepted requirements

- Replace Google Analytics with PostHog project 665552 (US, UTC).
- Count views by page, referring hostname and country; count selected navigation, project, article and contact/profile link clicks. Use a separate `shiromatz.com` dashboard.
- Preserve cookieless server hashing, no analytics persistence, no person profiles, replay or autocapture. Record fixed page/link identifiers and country code/name; remove arbitrary URLs, query/fragment, link text and unnecessary SDK enrichment.
- English/Japanese privacy page linked from the common layout.
- User rejected coupling to the TOEFL application and explicitly accepted a separate Vercel project and separate source repository. The local source is `../shiromatz-country` on `codex/initial-country-service`. No TOEFL or tablega.me application change is required.
- Preparation completed first. The user explicitly approved remote repository/project creation, task-only commit/push, reviewed main reflection, deployment and production verification on 2026-10-15. No billing, DNS, TOEFL Speaking or tablega.me change is included.

## Implementation

- `docs/_layouts/profile.html` loads pinned posthog-js 1.438.10 and the independent country helper. Production gate permits only HTTPS `shiromatz.com`, no custom port, and the seven profile-site page paths. Separate GitHub Pages project paths are excluded.
- `service_id=shiromatz-profile`, `release=profile-posthog-v1`, events `$pageview` and `profile_link_clicked`. Link group/id comes from a fixed allowlist. Immediate beacon delivery for clicks preserves normal navigation; bfcache restoration counts a view.
- Referring hostname is captured, never its path/query/credentials. `direct_or_unknown` includes browsers that suppress referrers. An `internal` hostname is kept separate. These are total events, not unique people or conversions.
- Independent static endpoint: credential-free cross-origin HEAD, no referrer, no redirects, no browser-cache reuse, 1200ms hard deadline. Invalid/unreadable/failed country is Unknown, without blocking navigation or measurement. Pending events flush synchronously on pagehide if the SDK is ready; late replies cannot duplicate them.
- Country labels are copied from the fixed 249-name mapping used by the other services. Nothing is read at runtime from either application. The proposed URL `https://shiromatz-country.vercel.app/analytics-country.json` must be confirmed or replaced with the actual assigned URL before release.
- Google Analytics config and runtime snippet are removed. The unused Gemfile dependency is left unchanged; it is not enabled as a Jekyll plugin.

## Verification so far

- Jekyll build succeeded using the existing Ruby bundle. The sandbox cannot launch Ruby; the same existing interpreter runs successfully with approved read/build access outside the sandbox. No dependency was installed or upgraded.
- 8 country helper tests and 3 independent endpoint configuration tests passed.
- Real SDK browser suite passed 55 checks, capturing 65 intercepted events. All five project cards, 17 article cards and seven profile/contact links were exercised. CORS wrong-origin and unexposed-header failures, missing/invalid country, offline/HTTP errors, ignored timeout, lifecycle deduplication, middle clicks, navigation/beacons, local/preview/project isolation, bfcache restoration, payload privacy and storage were checked. All PostHog requests in that suite were intercepted; its JP result is controlled test data, not an edge-country claim.
- English/Japanese desktop and 390px mobile privacy screenshots were inspected. A narrow-screen heading wrap was corrected, and the final screenshot and targeted browser recheck passed. Both CV footer navigation links are tagged.
- Separate live ingestion check sent 7 intentional `environment=verification` events at 19:46:25–19:46:31 UTC: 3 pageviews and 4 link clicks. The independent service is unpublished, so country was deliberately Unknown. Timestamp-bounded record inspection confirmed all seven stored events and their page/link/group/country fields. A native query independently returned 3 views and 4 clicks. Production chart filters exclude these records.
- Dedicated dashboard https://us.posthog.com/project/665552/dashboard/2216368 contains seven native charts: daily views, daily clicks, pages, referring hosts, country views/clicks, link group/id, and click source page. All seven saved queries executed successfully without warnings. Production series are empty as expected before publication; no actual visitor traffic or real country result is claimed. Layouts are non-overlapping. The saved IDs, queries and tile coordinates are in `posthog-dashboard.json`.
- Data Catalog inspection remains unavailable to this connection (`data_catalog:read` scope). These charts use operational total-event definitions, not governed business metrics. Existing service dashboards and privacy settings were not changed.

## Remaining preparation / publication gates

- Preparation completed at 19:55 UTC: final source/text/link checks passed for all seven generated pages, saved chart definitions/layouts matched the manifest, and the dedicated task browser was closed. No commit, push, merge, remote repository creation, new Vercel project or deployment has been performed. Read-only lookups found no existing `shiromatz/shiromatz-country` repository or `shiromatz-country` project in the intended Vercel team; this does not reserve the global deployment hostname.
- After publication approval: create the separate remote repository and Vercel project, confirm the actual endpoint URL, review/verify a protected candidate deployment's real country headers and CORS, then publish the endpoint. Review/merge the profile site through a PR into main and verify GitHub Pages deployment, GA removal, real country-bearing production events and dashboard results.
- Real Vercel geolocation, forged-header handling and warm-cache behavior for the new endpoint are not verified by local tests. Do not claim full production acceptance until they pass. Browser/OS termination before SDK load remains a delivery limitation; country is an IP-derived estimate affected by VPNs/proxies.
