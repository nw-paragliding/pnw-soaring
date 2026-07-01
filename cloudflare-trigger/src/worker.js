// Punctual trigger for the pnw-soaring forecast pipelines.
//
// On each Cloudflare cron tick (see wrangler.toml [triggers]) this fires a
// GitHub `repository_dispatch` event of type DISPATCH_EVENT_TYPE. The
// forecast workflows (HRRR, NAM) subscribe to that event type and
// run immediately — `repository_dispatch` is not throttled the way GitHub's
// own `schedule` events are.
//
// The cron string that fired is mapped to the NWP cycle (00z or 12z); the
// workflows read it from client_payload.cycle and pass --target-cycle, then
// poll NOMADS until that cycle's data is published.

// Map each configured cron trigger to the forecast cycle it targets.
// Keys MUST match the crons in wrangler.toml exactly.
const CRON_TO_CYCLE = {
  "15 1 * * *": "0",    // evening  -> 00z cycle (night-before / tomorrow)
  "15 7 * * *": "6",    // pre-dawn -> 06z cycle (clean early refresh of today)
  "0 13 * * *": "12",   // morning  -> 12z cycle (freshest of today)
};

async function dispatch(env, cycle) {
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
      event_type: env.DISPATCH_EVENT_TYPE,
      client_payload: { cycle, target_date: "" },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`repository_dispatch failed: ${res.status} ${text}`);
  }
}

export default {
  // Cron-triggered entrypoint.
  async scheduled(event, env, ctx) {
    const cycle = CRON_TO_CYCLE[event.cron];
    if (cycle === undefined) {
      console.error(`No cycle mapping for cron "${event.cron}" — check wrangler.toml/worker.js`);
      return;
    }
    ctx.waitUntil(
      dispatch(env, cycle)
        .then(() => console.log(`Dispatched ${env.DISPATCH_EVENT_TYPE} cycle=${cycle}z (cron "${event.cron}")`))
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
        event_type: env.DISPATCH_EVENT_TYPE,
        crons: Object.keys(CRON_TO_CYCLE),
        note: "Forecasts fire on the cron schedule above. This endpoint does not trigger a run.",
      }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
