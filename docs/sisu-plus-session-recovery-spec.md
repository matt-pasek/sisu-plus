# Sisu+ — Session Detection & Recovery Spec

**Status:** Proposed **Scope:** Login/session-expiry detection and graceful re-auth UX **Affected areas:**
`src/content/index.ts`, `src/app/api/client.ts`, `src/background/runtime/sisuRuntime.ts`, new main-world script, new
in-app auth overlay

---

## 1. Problem statement

Sisu+ replaces the native `/student` Angular app with a React app mounted in a shadow root. It relies on detecting when
the user's Sisu session is no longer valid so it can step out of the way and let the user re-authenticate. Today that
detection is unreliable:

- Client-side redirects to `/student/login` (Angular router navigations) frequently are **not caught**, so Sisu+ stays
  mounted on top of a dead session.
- When expiry _is_ caught, recovery is a hard teardown / reload that flashes raw native Sisu and loses the user's place.

Goal: catch **every** transition into an unauthenticated state, and make recovery feel like a one-tap blip rather than
getting dumped out of the app.

---

## 2. Current architecture (as built)

### 2.1 Token capture — passive header sniffing

`src/background/runtime/sisuRuntime.ts` registers a `chrome.webRequest.onBeforeSendHeaders` listener over the Sisu and
Moodle origins. It reads the `Authorization: Bearer …` header off Sisu's **own** outgoing requests and caches the token
per-origin in `chrome.storage.session` under `sisuTokensByOrigin` (plus `AWSALB`/`AWSALBCORS` cookies under
`sisuCookiesByOrigin`). On capture it messages the tab with `SISU_TOKEN_CAPTURED`.

The content script and API client retrieve the token via a `GET_TOKEN` message; the API client injects it as
`Authorization: Bearer` through its `securityWorker`.

### 2.2 Detection mechanism A — route watching

`src/content/index.ts`:

- Monkeypatches `history.pushState` / `history.replaceState` and listens for `popstate`, funnelling all into
  `reconcileRoute`.
- `reconcileRoute` unmounts (via `handOffToSisuLogin`) when `isStudentLoginPage()` is true, and mounts Sisu+ when on a
  student page **with a stored token present**.

### 2.3 Detection mechanism B — API response watching

`src/app/api/client.ts` wraps `fetch` in a proxy (`customFetch`). If `response.url.includes('/student/login')`, it
dispatches the `sisuplus:session-expired` DOM event. The content script listens and runs `handleSessionExpired` → clears
the stored session for the origin → `removeSisuPlus`.

### 2.4 Recovery (current)

Three exits, all destructive:

- `handOffToSisuLogin` → `removeSisuPlus()` (rips the shadow root out, revealing native Sisu).
- `handleSessionExpired` → clear session + `removeSisuPlus()`.
- `reloadToRestoreNativeSisu` → full `window.location.reload()`.

---

## 3. Root-cause analysis

### Bug 1 — Monkeypatched `pushState` never sees Angular's navigations (primary)

Content scripts execute in an **isolated world**. Assigning `history.pushState = fn` from the content script overrides
the method **only in that isolated world**. Sisu's Angular app runs in the **main world** and calls the original,
unpatched `pushState`. Therefore client-side `router.navigate('/student/login')` (and every other SPA route change)
**never triggers** `handleRouteChange`.

Reliable route signals today are limited to:

- Initial page load (`init` → `reconcileRoute`).
- `popstate` (back/forward only — this fires across worlds).

This is the direct cause of "redirected to `/login` but the extension doesn't catch it."

### Bug 2 — Token presence treated as session validity

`reconcileRoute` mounts Sisu+ whenever a token is present. The token is cached in `storage.session` and persists after
the server-side session dies. Nothing proactively confirms it still works; staleness is only discovered reactively, on a
failing call.

### Bug 3 — API signal looks for the wrong failure shape

`response.url.includes('/student/login')` assumes an expired session causes the Kori/Arto/Ilmo/Ori/Osuva APIs to
**redirect** to that path. These are **Bearer-token APIs** (`securityWorker` sets `Authorization: Bearer`). An
expired/invalid bearer token returns **HTTP 401/403 with a JSON body**, not a 302 to `/student/login`. For the most
common expiry case the check **never fires**. It also misses redirects to the SSO/HAKA IdP (different host/path).

### Bug 4 — Structural: once the body is replaced, no fresh tokens are minted

Token capture is passive — it sniffs Sisu's own outgoing requests. But `mountSisuPlus` calls
`document.body.replaceChildren()`, removing Angular. With Angular gone, Sisu issues no more requests, so the bearer
token can only ever go stale and can never be passively re-captured. **Session death under Sisu+ is therefore inevitable
over time, and re-auth must round-trip through native Sisu** (the only thing that mints a token). A hidden iframe to the
login page won't work — login/IdP pages frame-bust (`X-Frame-Options: DENY` / CSP `frame-ancestors`).

### Bug 5 — Recovery is jarring and stateless

All recovery paths tear down the shadow root or reload, exposing raw native Sisu and discarding the user's current
view/route.

---

## 4. Proposed fixes — detection

### Fix 1 — Catch every route change via a main-world bridge

Register a second content script with `world: 'MAIN'` (alongside the existing isolated one in
`syncContentScriptRegistration`, `runAt: 'document_start'`). It patches history in the page's own world and posts route
changes back:

```ts
// main-world script
for (const m of ['pushState', 'replaceState'] as const) {
  const orig = history[m];
  history[m] = function (...args) {
    const result = orig.apply(this, args);
    window.postMessage({ __sisuplus: 'route', path: location.pathname }, location.origin);
    return result;
  };
}
window.addEventListener('popstate', () =>
  window.postMessage({ __sisuplus: 'route', path: location.pathname }, location.origin),
);
```

The isolated content script consumes it:

```ts
window.addEventListener('message', (e) => {
  if (e.source !== window) return;
  if (e.origin !== window.location.origin) return;
  if (e.data?.__sisuplus !== 'route') return;
  void reconcileRoute();
});
```

**Low-effort alternative** (acceptable at current scale): a `setInterval` (~250ms) that diffs `location.pathname` and
calls `reconcileRoute` on change. Ugly but bulletproof and world-agnostic. Can ship as v1 and be replaced by the bridge
later.

### Fix 2 — Broaden the API auth-failure signal (highest value, smallest change)

Replace the narrow URL check in `customFetch` with a single shared predicate:

```ts
const isAuthFailure = (res: Response) =>
  res.status === 401 || res.status === 403 || (res.redirected && /\/(student\/)?login|\/sso|\/idp/i.test(res.url));
```

In the proxy, when `isAuthFailure(response)` → dispatch `sisuplus:session-expired`. This makes the reactive path fire
for the common bearer-token 401, not just for the rare redirect case.

### Fix 3 — Validate instead of assuming

Treat "token present" as necessary but not sufficient.

- On mount, and on `document.visibilitychange` → `visible`, fire one cheap authenticated "whoami"/ping request.
- If it returns `isAuthFailure`, enter the unauthenticated state (overlay, see §5).
- Refocus revalidation matters because sessions usually die while the tab is backgrounded.

### Fix 4 — Single, debounced state funnel

All signals — route lands on login, `isAuthFailure` from any call, validation ping fail — call one idempotent function:

```ts
let unauthenticated = false;
const enterUnauthenticated = (reason: 'route' | 'api' | 'ping') => {
  if (unauthenticated) return; // idempotent
  unauthenticated = true;
  showAuthOverlay(reason); // §5 — does NOT tear down
};
```

Debounce so concurrent failing calls don't thrash. A matching `exitUnauthenticated()` runs after a fresh token is
captured and the app remounts.

**Loop-safety — keep "no token yet" and "session expired" strictly separate.** These are two different states and must
not share a code path:

- **No token captured yet** (valid session, sniffer just hasn't seen a request) → _wait_; this is the existing
  `waitingForToken` behavior. Never navigate to Shibboleth here.
- **Session expired** (401/403, or route landed on login) → `enterUnauthenticated` → Shibboleth navigation.

If these are conflated, a slow token capture on a perfectly valid session can bounce the user to Shibboleth for no
reason, or worse, produce a redirect loop. `enterUnauthenticated` must fire **only** on genuine expiry signals (`api` /
`route`), stay idempotent, and be guarded so it cannot re-fire while a re-auth navigation is already in flight.

---

## 5. Proposed fixes — smoothing the experience

The core principle: **never tear the UI out from under the user.** Replace the destructive exits with an in-shadow
overlay + state preservation.

### 5.1 Overlay instead of teardown

On entering the unauthenticated state, do **not** call `removeSisuPlus()`. Instead render an auth overlay **inside the
existing shadow root**, blurring the current Sisu+ view behind it:

> "Your Sisu session expired. [ Log back in ]"

The user keeps seeing Sisu+ chrome, not a flash of raw Angular.

### 5.2 Preserve the user's place

Before the re-auth round trip, stash current context into `chrome.storage.session` (or `sessionStorage` on the origin):

```ts
await chrome.storage.session.set({
  sisuPlusResume: { origin: location.origin, path: location.pathname, view: currentViewState },
});
```

### 5.3 The re-auth round trip (unavoidable per Bug 4)

Re-auth is a **top-level navigation** to Sisu's Shibboleth entry point — the same URL the native login page's blue
button targets. Navigating there directly **skips the white `/student/login` interstitial entirely**; the user never
sees the flashing native login page.

```ts
const target = `${location.origin}/student/${resumePath}`; // deep-link back to where they were
window.location.assign(`${location.origin}/Shibboleth.sso/LUTLogin?target=${encodeURIComponent(target)}`);
```

Full confirmed entry point (LUT): `https://sisu.lut.fi/Shibboleth.sso/LUTLogin?target=<return-url>`.

Flow: `LUTLogin` kicks off SAML → HAKA IdP. **If the IdP session is still alive** (likely — the Sisu bearer token
expires faster than the IdP cookie), Shibboleth silently re-asserts and bounces straight back to `target` with no login
form: just a couple of fast redirects. **If the IdP session is dead**, the user hits the HAKA login form — which is what
they expected anyway.

On return, native Sisu boots at `target`, fires its first authed request, the existing `onBeforeSendHeaders` sniffer
captures the fresh `Authorization: Bearer` token → caches it → sends `SISU_TOKEN_CAPTURED` → the content script's
existing listener runs `reconcileRoute` → remount.

**`target` is your primary route-resume.** Because Shibboleth returns the user to `target`, the route restores for free
— you lean less on the `storage.session` stash (§5.2), which now only needs to carry finer in-view state (e.g. a
half-filled form), not the route itself.

> **Must verify:** confirm Sisu's Shibboleth accepts an arbitrary **same-origin deep** `target` (e.g.
> `…/student/courses/…`) and doesn't sanitize/whitelist it back to a default. Test a deep path, not just
> `/student/login`. If it does restrict, fall back to `target=…/student` + the `storage.session` route restore.

**Fire from the overlay button, never a blind auto-redirect.** You can't know in advance whether the round trip will be
silent (IdP alive) or land on a HAKA form (IdP dead). A blind auto-nav that yanks someone to a credential form mid-task
— destroying the page and any unsaved Sisu+ state — is the bad version. The overlay + "Continue" button gives the user
control and still skips the interstitial: one click to silent when the IdP is alive; and if it's dead, they expected to
log in anyway.

### 5.4 Restore on remount

After `mountSisuPlus`, read `sisuPlusResume`; if present and origin matches, restore the route/view and clear the key.
This is the step that converts "it logged me out" into "it just blinked."

```ts
const { sisuPlusResume } = await chrome.storage.session.get('sisuPlusResume');
if (sisuPlusResume?.origin === location.origin) {
  restoreView(sisuPlusResume.view, sisuPlusResume.path);
  await chrome.storage.session.remove('sisuPlusResume');
}
```

### 5.5 Cover the return boot-flash with a Sisu+ splash

One residual seam remains after the round trip: on return, native Angular must boot at `target` and fire its first
authed request before the sniffer catches the fresh token and Sisu+ remounts — so there's a brief native `/student`
flash. It's smaller than the login-page flash, but visible.

Hide it by having the content script paint a minimal Sisu+ **loading splash into the shadow root immediately at
`document_start`** (before Angular renders), then swap to the full app once `SISU_TOKEN_CAPTURED` lands and
`mountSisuPlus` runs. The user sees Sisu+ branding throughout instead of raw Sisu booting. This also improves cold
first-loads, not just re-auth returns.

### 5.6 Proactive, not reactive

With the `visibilitychange` ping (Fix 3), surface the overlay **before** the user clicks into a dead view. Returning to
the tab shows a calm "tap to continue" prompt instead of a broken interaction.

### 5.7 Optional — best-effort silent refresh

The SSO/IdP session (cookie-based) often outlives the Sisu bearer token. A best-effort silent attempt may mint a new
token without user interaction, _if_ Sisu exposes a refresh/login endpoint that completes without a top-level SAML
redirect. Treat as opportunistic: try silently first, fall back to the §5.1 overlay if it doesn't yield a token within a
short timeout. Do not assume it works — HAKA/SAML typically requires a top-level redirect.

---

## 6. State model

```
            ┌─────────────────────────────────────────────┐
            │                  MOUNTED                     │
            │  (token present, validated, app rendered)    │
            └───────────────┬─────────────────────────────┘
                            │ enterUnauthenticated(route|api|ping)
                            ▼
            ┌─────────────────────────────────────────────┐
            │              OVERLAY (in-shadow)             │
            │  blurred app + "Log back in"; resume stashed │
            └───────────────┬─────────────────────────────┘
                            │ "Continue" → top-level nav to
                            │ /Shibboleth.sso/LUTLogin?target=<deep-link>
                            │ → HAKA IdP (silent if IdP alive) → back to target
                            ▼
            ┌─────────────────────────────────────────────┐
            │      RETURN: native boot under splash        │
            │  Sisu+ splash painted at document_start;     │
            │  Angular boots at target, fires 1st request  │
            └───────────────┬─────────────────────────────┘
                            ▼
            ┌─────────────────────────────────────────────┐
            │           TOKEN CAPTURED (sniffer)           │
            │   SISU_TOKEN_CAPTURED → reconcileRoute       │
            └───────────────┬─────────────────────────────┘
                            │ remount (target restores route) + restore in-view state
                            ▼
                          MOUNTED
```

Signals into `enterUnauthenticated` (expiry only — **not** "no token yet"):

- route bridge reports `/student/login` (Fix 1)
- any API call returns `isAuthFailure` (Fix 2)
- visibility/mount validation ping fails (Fix 3)

---

## 7. Implementation checklist

**Phase 1 — stop the leaks (detection)**

- [x] Add `isAuthFailure(res)` helper; use it in `customFetch` (`src/app/api/client.ts`) in place of the
      `/student/login` URL check.
- [x] Add main-world route bridge: new script + `world: 'MAIN'` registration in `syncContentScriptRegistration`
      (`sisuRuntime.ts`); consume via `message` listener in `content/index.ts`. (Or ship the `setInterval` pathname
      watcher as interim.)
- [x] Add mount + `visibilitychange` validation ping; route failures into the funnel.
- [x] Introduce `enterUnauthenticated` / `exitUnauthenticated`; make idempotent + debounced; replace direct calls to
      `handleSessionExpired` / `handOffToSisuLogin`.
- [x] **Keep "no token yet" (`waitingForToken`, → wait) strictly separate from "session expired" (→ Shibboleth nav);**
      guard `enterUnauthenticated` against re-firing while a re-auth nav is in flight.

**Phase 2 — smoothing (UX)**

- [ ] Build the in-shadow auth overlay (blur + "Continue"); render instead of `removeSisuPlus()`.
- [ ] Stash `sisuPlusResume` (in-view state) before the re-auth navigation.
- [ ] Wire "Continue" to
      `window.location.assign(\`${origin}/Shibboleth.sso/LUTLogin?target=${encodeURIComponent(deepLink)}\`)`— skips the interstitial;`target`
      deep-links back to the current view.
- [ ] Paint a Sisu+ loading splash into the shadow root at `document_start`; swap to full app on `SISU_TOKEN_CAPTURED`
      (covers the return boot-flash + cold loads).
- [ ] Restore in-view state after remount (route comes back via `target`); clear the resume key.

**Phase 3 — optional polish**

- [ ] Best-effort silent refresh with timeout fallback to overlay.
- [ ] Telemetry/counter (local only) on which signal caught each expiry, to confirm Fix 1/2 coverage in the wild.

---

## 8. Test scenarios

- [ ] Idle until bearer token expires, then click a view → overlay appears (was: dead view).
- [ ] Angular client-side redirect to `/student/login` → caught immediately (was: missed).
- [ ] API returns 401 with JSON body → caught (was: missed).
- [ ] Background the tab past session expiry, refocus → proactive overlay (was: silent dead state).
- [ ] Re-auth round trip lands the user back on the exact view/route they left (via `target`).
- [ ] Deep `target` (e.g. `…/student/courses/…`) is honored by Shibboleth and not sanitized to a default.
- [ ] IdP session alive → round trip is silent (no HAKA form), only redirects.
- [ ] IdP session dead → HAKA login form shown, then returns to `target`.
- [ ] Return boot shows the Sisu+ splash, not a raw native `/student` flash.
- [ ] Valid session with slow token capture does **not** trigger a Shibboleth nav (loop-safety holds).
- [ ] `popstate` (back/forward) into and out of login still reconciles correctly.
- [ ] Pause/`sisuPlusActive=false` path and `universityConfig` change still behave (no regressions in existing
      `reconcileRoute` branches).
- [ ] Rapid repeated failing calls fire a single overlay + single nav (debounce + in-flight guard hold).

---

## 9. Notes & constraints

- Re-auth **must** go through native Sisu (Bug 4); there is no passive refresh while the body is replaced, and login/IdP
  pages can't be framed (`X-Frame-Options` / CSP `frame-ancestors`).
- Re-auth entry point is Shibboleth directly, **not** `/student/login` — navigating to
  `/Shibboleth.sso/LUTLogin?target=…` skips the white interstitial. The blue button on `/student/login` targets this
  same URL.
- All cross-world messaging must check `e.source === window` and `e.origin === location.origin`.
- The fix set is additive and reuses the existing `SISU_TOKEN_CAPTURED` → `reconcileRoute` handoff; no change to the
  capture mechanism in `sisuRuntime.ts` beyond registering the second (main-world) script.
- Keep the overlay strictly inside the shadow root so it inherits `global.css` and can't be styled/leaked by native
  Sisu.

---

## 10. SAML flow — verify in devtools before Phase 1

Confirmed for LUT: `https://sisu.lut.fi/Shibboleth.sso/LUTLogin?target=<return-url>` is the login entry point (the
`/student/login` blue button's target). The generic form is `<origin>/Shibboleth.sso/LUTLogin?target=<return-url>`;
parameterize per `universityConfig` rather than hardcoding LUT.

Open Network tab with **Preserve log** on, let a session die, and capture:

- [ ] **Expiry response shape** — what a Kori/Arto/Ilmo/Ori/Osuva call returns on a dead bearer token: `401`/`403` (JSON
      body), a `302` to an IdP host, or a `200` with an error envelope. Widen `isAuthFailure` to match whatever LUT
      actually does.
- [ ] **IdP host** — the host `LUTLogin` redirects to, so the `/sso|/idp` branch of `isAuthFailure` matches the real
      hostname.
- [ ] **`target` handling** — whether Shibboleth honors an arbitrary same-origin **deep** `target` or sanitizes it to a
      default. Determines whether route-resume rides on `target` (preferred) or must fall back to the `storage.session`
      stash.
- [ ] **Return URL** — the exact path Sisu lands on after the assertion, so `reconcileRoute` has the right expectation.
- [ ] **Silent re-assert** — with a live IdP session, confirm `LUTLogin` returns without a login form (validates the
      "near-seamless common case" and the optional §5.7 silent refresh).
