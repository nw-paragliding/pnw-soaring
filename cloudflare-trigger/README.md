# pnw-soaring forecast trigger (Cloudflare Worker)

Punctual trigger for the forecast pipelines. Replaces GitHub's `schedule` cron,
which was throttled and ran forecasts ~5h late (sometimes dropped entirely).

## How it works

```
Cloudflare cron (wrangler.toml [triggers])
        │  fires on time
        ▼
Worker (src/worker.js)  ──POST repository_dispatch──►  GitHub
        │  type: run-forecast, client_payload.cycle = 0 | 12
        ▼
forecast-hrrr.yml / forecast-hrrr-1km.yml / forecast-nam.yml
        │  start within seconds (repository_dispatch is not throttled)
        ▼
pipeline polls NOMADS for that cycle, runs, deploys to Pages
```

The **schedule is the `crons` list in `wrangler.toml`** — the single source of
truth, version-controlled here. It is deployed to Cloudflare by CI on every push
to `main` (`.github/workflows/deploy-trigger.yml`); never hand-edit it in the
Cloudflare dashboard. To change forecast timing, edit `wrangler.toml` and merge.

## One-time setup (repo secrets)

Set these in the GitHub repo (Settings → Secrets and variables → Actions):

| Secret | What |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare token with **Workers Scripts: Edit** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID |
| `DISPATCH_PAT` | Fine-grained GitHub PAT for `nw-paragliding/pnw-soaring` with **Contents: Read and write** (the permission `POST /dispatches` needs — *not* Actions, which is for workflow_dispatch). The deploy workflow injects it as the Worker secret `GH_DISPATCH_TOKEN`. |

Then merge to `main` (or run **Deploy Cloudflare trigger** manually) and the
Worker — code, schedule, and token — is live. No local `wrangler` needed.

## Verifying

- Deploy: the **Deploy Cloudflare trigger** workflow should be green.
- Health: `GET https://pnw-soaring-trigger.<subdomain>.workers.dev/` returns the
  config (it does **not** trigger a run).
- End to end: at the next cron tick, a `run-forecast` dispatch appears and all
  three forecast workflows start within seconds.

## Changing cadence / cycles

`wrangler.toml` `crons` and the matching `CRON_TO_CYCLE` map in `src/worker.js`
must stay in sync (each cron string is a key in the map). Add a cron + map entry
to add a run; the cycle value (`"0"`/`"12"`) flows to the pipeline as
`--target-cycle`.
