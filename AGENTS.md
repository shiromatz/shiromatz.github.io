# Project policy

Project release profile: release-managed

GitHub Pages publishes `main:/docs` through Jekyll. Use a development branch for public changes. Keep local artifacts under ignored `output/`. Commits, pushes, merges, remote repository creation and publication require the user's explicit approval for this scope.

For analytics, retain the existing shared PostHog project's cookieless server hashing and explicit event/property allowlists. Keep this site's country lookup independent of TOEFL Speaking and tablega.me application releases.

Verify Jekyll output, relevant real-browser flows, payload privacy, country lookup failures and exclusion of local/preview traffic before publication. Do not treat a mocked country response as proof of a deployed edge service.
