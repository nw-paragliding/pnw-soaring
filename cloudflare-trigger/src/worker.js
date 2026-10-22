// Punctual trigger for the pnw-soaring forecast pipelines.
//
// On each Cloudflare cron tick (see wrangler.toml [triggers]) this fires one
// GitHub `repository_dispatch` per event type mapped to that cron. HRRR and
// NAM run on SEPARATE schedules and event types (run-hrrr / run-nam) so each
// catches its own cycle promptly: NAM GRIB publishes ~40 min after HRRR, so a
// shared HRRR-timed dispatch made NAM (which auto-selects the freshest cycle)
// grab the stale *previous* cycle — the "15 hours ago" staleness.
// `repository_dispatch` is not throttled the way GitHub's own `schedule`
// events are, so it starts the workflow in seconds.
//
// RRFS rides the NAM crons: the free tier caps a Worker at 5 cron triggers
// (3 HRRR + 2 NAM), so instead of a sixth cron the two NAM ticks dispatch
// BOTH run-nam and run-rrfs. RRFS GRIB lands ~40 min after NAM's, which
// forecast-rrfs.yml absorbs with its own NOMADS readiness gate.

// Map each configured cron to the list of {event_type, cycle} dispatches it
// fires. Keys MUST match the crons in wrangler.toml exactly. `cycle` is
// informational — HRRR derives its --target-cycle from the fire hour, NAM and
// RRFS auto-select the freshest available.
const CRON_MAP = {
  // HRRR — 3x/day, a little after HRRR GRIB publishes (short 48h reach)
  "15 1 * * *": [{ type: "run-hrrr", cycle: "0" }],   // 00z — night-before / tomorrow
  "15 7 * * *": [{ type: "run-hrrr", cycle: "6" }],   // 06z — pre-dawn refresh of today
  "0 13 * * *": [{ type: "run-hrrr", cycle: "12" }],  // 12z — freshest of today
  // NAM + RRFS — 2x/day, after NAM GRIB publishes (~40 min later; 84h reach covers more)
  "5 2 * * *":  [{ type: "run-nam",  cycle: "0" },  { type: "run-rrfs", cycle: "0" }],   // 00z — overnight multi-day outlook
  "0 14 * * *": [{ type: "run-nam",  cycle: "12" }, { type: "run-rrfs", cycle: "12" }],  // 12z — freshest midday
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

// Fire every dispatch mapped to a cron. Each is independent: one failing
// (e.g. a transient GitHub 5xx) must not stop the others, so settle them all,
// log each outcome, and only then surface a combined error.
async function dispatchAll(env, cron, list) {
  const results = await Promise.allSettled(list.map((m) => dispatch(env, m.type, m.cycle)));
  const failed = [];
  results.forEach((r, i) => {
    const m = list[i];
    if (r.status === "fulfilled") {
      console.log(`Dispatched ${m.type} cycle=${m.cycle}z (cron "${cron}")`);
    } else {
      console.error(String(r.reason));
      failed.push(m.type);
    }
  });
  if (failed.length) throw new Error(`${failed.length}/${list.length} dispatch(es) failed for cron "${cron}": ${failed.join(", ")}`);
}

export default {
  // Cron-triggered entrypoint.
  async scheduled(event, env, ctx) {
    const list = CRON_MAP[event.cron];
    if (!list || !list.length) {
      console.error(`No mapping for cron "${event.cron}" — check wrangler.toml/worker.js`);
      return;
    }
    ctx.waitUntil(dispatchAll(env, event.cron, list));
  },

  // Health/config endpoint — handy for confirming a deploy. Does NOT trigger a
  // run (forecasts fire on cron only; use the GitHub UI for a manual run).
  async fetch(request, env) {
    return new Response(
      JSON.stringify({
        worker: "pnw-soaring-trigger",
        target: `${env.GH_OWNER}/${env.GH_REPO}`,
        crons: Object.fromEntries(
          Object.entries(CRON_MAP).map(([cron, list]) => [cron, list.map((m) => `${m.type} ${m.cycle}z`).join(" + ")])),
        note: "Forecasts fire on the cron schedule above. This endpoint does not trigger a run.",
      }, null, 2),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
