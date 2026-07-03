// Punctual trigger for the pnw-soaring forecast pipelines.
//
// On each Cloudflare cron tick (see wrangler.toml [triggers]) this fires a
// GitHub `repository_dispatch`. HRRR and NAM run on SEPARATE schedules and
// event types (run-hrrr / run-nam) so each catches its own cycle promptly:
// NAM GRIB publishes ~40 min after HRRR, so a shared HRRR-timed dispatch made
// NAM (which auto-selects the freshest cycle) grab the stale *previous* cycle
// — the "15 hours ago" staleness. `repository_dispatch` is not throttled the
// way GitHub's own `schedule` events are, so it starts the workflow in seconds.

// Map each configured cron to {event_type, cycle}. Keys MUST match the crons in
// wrangler.toml exactly. `cycle` is informational — HRRR derives its
// --target-cycle from the fire hour, NAM auto-selects the freshest available.
const CRON_MAP = {
  // HRRR — 3x/day, a little after HRRR GRIB publishes (short 48h reach)
  "15 1 * * *": { type: "run-hrrr", cycle: "0" },   // 00z — night-before / tomorrow
  "15 7 * * *": { type: "run-hrrr", cycle: "6" },   // 06z — pre-dawn refresh of today
  "0 13 * * *": { type: "run-hrrr", cycle: "12" },  // 12z — freshest of today
  // NAM — 2x/day, after NAM GRIB publishes (~40 min later; 84h reach covers more)
  "5 2 * * *":  { type: "run-nam",  cycle: "0" },   // 00z — overnight multi-day outlook
  "0 14 * * *": { type: "run-nam",  cycle: "12" },  // 12z — freshest midday
};

async function dispatch(env, type, cycle) {
  const url = `https://api.github.com/repos/${env.GH_OWNER}/${env.GH_REPO}/dispatches`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GH_DISPATCH_TOKEN}`,
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "pnw-soaring-trigger",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: type,
      client_payload: { cycle, target_date: "" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`repository_dispatch (${type}) failed: ${res.status} ${text}`);
  }
}

export default {
  // Cron-triggered entrypoint.
  async scheduled(event, env, ctx) {
    const m = CRON_MAP[event.cron];
    if (!m) {
      console.error(`No mapping for cron "${event.cron}" — check wrangler.toml/worker.js`);
      return;
    }
    ctx.waitUntil(
      dispatch(env, m.type, m.cycle)
        .then(() => console.log(`Dispatched ${m.type} cycle=${m.cycle}z (cron "${event.cron}")`))
        .catch((err) => { console.error(String(err)); throw err; })
    );
  },

  // Health/config endpoint — handy for confirming a deploy. Does NOT trigger a
  // run (forecasts fire on cron only; use the GitHub UI for a manual run).
  async fetch(request, env) {
    return new Response(
      JSON.stringify({
        worker: "pnw-soaring-trigger",
        target: `${env.GH_OWNER}/${env.GH_REPO}`,
        crons: Object.fromEntries(
          Object.entries(CRON_MAP).map(([cron, m]) => [cron, `${m.type} ${m.cycle}z`])),
        note: "Forecasts fire on the cron schedule above. This endpoint does not trigger a run.",
      }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
