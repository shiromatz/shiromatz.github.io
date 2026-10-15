# Proposed publication scope

The user explicitly approved this publication scope on 2026-10-15: create the independent repository/project, commit and push only this task's changes, review PRs, merge to main, publish, and verify real country detection, stored PostHog events and the service dashboard. TOEFL Speaking, tablega.me and the subscription must remain unchanged.

The user subsequently authorized verifying this small country endpoint directly in Production, without a dedicated Preview gate. PR review and main reflection still apply. The new Vercel Git connection could not be established by the existing CLI connection, so deploy the exact reviewed main commit with the CLI; do not claim automatic Git deployments are configured.

## Country service

- Local source: `C:/Users/shiro/dev/shiromatz-country`, branch `codex/initial-country-service`.
- Proposed new public GitHub repository: `shiromatz/shiromatz-country`.
- Proposed new Vercel project: `shiromatz-country`, team `team_BEUmvu4hlWovY5YbAbbY998l` (existing shiromatz team). No billing, DNS, Firebase or existing application settings are changed.
- Commit/push this source only. If the new repository needs a main base before its first PR, initialize an empty release base, then review the implementation in a PR. Link the new Vercel project to this repository, verify a dedicated protected Preview and inspect all PR comments/reviews/unresolved threads before main publication.
- Verify the actual assigned endpoint URL before putting it into the profile site's `analytics_country_url`. The proposed default hostname is not reserved yet.
- Acceptance requires real normal/warm-cache and forged-header HEAD checks, country-only output, no cookies, no IP/city/coordinates, exact CORS origin/exposed header, and a real browser request from the profile origin. Keep failures as Unknown and never disable Deployment Protection to test.

## Profile website

- Existing repository: `shiromatz/shiromatz.github.io`; local branch `codex/profile-posthog-analytics`; base `main@0236f777d75ab431c7db7a236d40790cbc297786`.
- Commit/push only the current implementation, verification and developer records; leave Gemfile/Gemfile.lock unchanged. Open a PR into main, run Codex review and inspect all feedback before merge.
- GitHub Pages publishes `main:/docs`. Wait for a successful build and verify the expected public domain, actual published assets, common privacy link, both privacy languages, GA removal, normal navigation and narrow layout.
- Verify real `$pageview` and `profile_link_clicked` requests with `service_id=shiromatz-profile`, `environment=production`, correct fixed page/link identifiers, and a country derived from the independent deployed service. Confirm storage in PostHog and rerun all seven dashboard queries. Intentional production smoke events should be disclosed as test activity; do not delete or rewrite visitor data.
- Dashboard: https://us.posthog.com/project/665552/dashboard/2216368. After production acceptance, update its preparation description and this release record. Keep TOEFL Speaking/tablega.me dashboards and application releases independent.

## Already verified

Jekyll build, 8 country helper tests, 3 endpoint configuration tests, 55 real-SDK intercepted browser checks, targeted final mobile/CV checks, seven generated-page source/link/GA checks, 7 live verification events persisted (3 views / 4 clicks, Unknown), seven saved native production queries, exact saved definitions and non-overlapping layout. The SDK and country lookup are disabled for local/preview/other GitHub Pages project paths. No production acceptance of the new country endpoint is claimed before deployment.
