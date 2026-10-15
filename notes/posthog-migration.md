# Profile site PostHog publication

Date: 2026-10-15. Implementation branch: `codex/profile-posthog-analytics`, from `0236f777d75ab431c7db7a236d40790cbc297786`. Production acceptance completed; see the publication record below.

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
- Country labels are copied from the fixed 249-name mapping used by the other services. Nothing is read at runtime from either application. The assigned and verified production URL is `https://shiromatz-country.vercel.app/analytics-country.json`.
- Google Analytics config and runtime snippet are removed. The unused Gemfile dependency is left unchanged; it is not enabled as a Jekyll plugin.

## Preparation verification

- Jekyll build succeeded using the existing Ruby bundle. The sandbox cannot launch Ruby; the same existing interpreter runs successfully with approved read/build access outside the sandbox. No dependency was installed or upgraded.
- 8 country helper tests and 3 independent endpoint configuration tests passed.
- Real SDK browser suite passed 55 checks, capturing 65 intercepted events. All five project cards, 17 article cards and seven profile/contact links were exercised. CORS wrong-origin and unexposed-header failures, missing/invalid country, offline/HTTP errors, ignored timeout, lifecycle deduplication, middle clicks, navigation/beacons, local/preview/project isolation, bfcache restoration, payload privacy and storage were checked. All PostHog requests in that suite were intercepted; its JP result is controlled test data, not an edge-country claim.
- English/Japanese desktop and 390px mobile privacy screenshots were inspected. A narrow-screen heading wrap was corrected, and the final screenshot and targeted browser recheck passed. Both CV footer navigation links are tagged.
- Before endpoint publication, a separate live ingestion check sent 7 intentional `environment=verification` events at 19:46:25–19:46:31 UTC: 3 pageviews and 4 link clicks. Country was deliberately Unknown. Timestamp-bounded record inspection confirmed all seven stored events and their page/link/group/country fields. A native query independently returned 3 views and 4 clicks. Production chart filters exclude these records.
- Dedicated dashboard https://us.posthog.com/project/665552/dashboard/2216368 contains seven native charts: daily views, daily clicks, pages, referring hosts, country views/clicks, link group/id, and click source page. All seven saved queries executed successfully without warnings before and after publication. Layouts are non-overlapping. The saved IDs, queries and tile coordinates are in `posthog-dashboard.json`.
- Data Catalog inspection remains unavailable to this connection (`data_catalog:read` scope). These charts use operational total-event definitions, not governed business metrics. Existing service dashboards and privacy settings were not changed.

## Publication acceptance

- The user explicitly permitted this small endpoint to be verified directly in Production. Both implementation PRs still received Codex review on their final heads, with no findings; comments, reviews and review threads were checked before squash merge.
- Country repository: https://github.com/shiromatz/shiromatz-country. PR https://github.com/shiromatz/shiromatz-country/pull/1 reviewed `13eb2b355e3cf5684282a78f0eed733a4905063d`, merged as `09d6edb923edf0d7fb44a082e9baad851396bb1b`; the trees match. Vercel project `prj_U5XlGxEDHJAGEJdGlAk1Xfny363q`, deployment `dpl_EJuPuBm4kU8No85HZjjM6wXKDtMd` is READY Production at that exact main SHA.
- Real endpoint checks passed for normal and warm-cache HEAD requests. Forged JP, ZZ and invalid country input all retained the actual US edge country. Verified private/no-store, country Vary, country-only response, no cookies, exact profile-origin CORS and exposed header. A real browser at the profile origin read US; a different origin was blocked by CORS. These checks used Vercel responses, not mocked geography.
- Profile PR https://github.com/shiromatz/shiromatz.github.io/pull/2 reviewed `715a284927134b978229281836b13ea27787d01f`, merged as runtime publication commit `c137531f549b950172a4d8e8d5ba505ea08710ab`; the trees match. GitHub Pages built that commit successfully at 20:11:10 UTC.
- Public HTTP checks passed for all seven profile pages and the pinned SDK. The module is served with JavaScript MIME. Google Analytics is absent, the common privacy link and both languages are public, and the 390px privacy layout has no horizontal overflow.
- Actual public HTML/assets, the actual independent country endpoint and actual PostHog ingestion were exercised. The completed browser run at 20:15:11–20:15:19 UTC passed all 10 checks: 4 pageviews and 5 selected clicks carry US / United States, one credential/referrer-free country request per document, successful ingestion, no cookies or browser persistence, and no application exception. Query/fragment and precise-location properties were absent from captured event payloads.
- An initial browser observer could not read Chromium beacon bodies and reported a verification-script error; this was corrected in the local verification driver, without a production code change. Both attempts delivered their intended events. Timestamp-bounded PostHog record inspection confirmed all 18 intentional production events (8 views, 10 clicks), with page/link/group fields and US / United States. Do not interpret these as organic usage. No visitor events were deleted or rewritten.
- All seven saved native dashboard queries were refreshed successfully after ingestion, without warnings. Country breakdown shows United States: 8 views / 10 clicks; pages, referring hosts, link group/id and source-page results agree with the known smoke activity. The dashboard description now explains that publication-day verification activity is included. `environment=verification` events remain excluded.
- Final Vercel metadata matches the pre-release baseline for tablega.me (`3246b8cae93a3284abb077bbfc78084d3e5a6277`, `dpl_2VfN1erUrPntTgmTJPxign8V6VqZ`) and TOEFL Speaking (`f11b3bcb0f209b08d5c715f6484e65664cb6f152`, `dpl_5QJhRtZqx8jvxT4pxPMaNTJ1NU6D`). Both remain on Pro. Their source, deployments, staging, dashboards and settings were not changed by this work. No Hobby, DNS or Firebase change was made.

## Operational limits

- The Vercel Git connection could not be established through the existing integration. The approved release used the CLI from reviewed main; automatic deployments on future Git pushes are not configured. For future country-service changes, review/merge first, then deploy that exact main commit with the CLI in team `team_BEUmvu4hlWovY5YbAbbY998l` and verify the assigned production SHA. GitHub Pages retains its existing main-based publication.
- Browser/OS termination before SDK load remains a delivery limitation. Country is an IP-derived estimate affected by VPNs/proxies; invalid or unavailable country becomes Unknown. The service provides no exact location and has no runtime dependency on TOEFL Speaking or tablega.me.
