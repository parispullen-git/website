# Proposals

Self-contained proposal pages that live inside the site, priced, clickable, and
recoverable via an exit-intent popup.

## Making a new proposal

1. Copy `northwood-gala-9f4c2e71.html` to a **new, unguessable filename**:
   `clientname-<random hex>.html`. The random suffix is the privacy mechanism.
2. Edit the `window.PROPOSAL` object at the bottom and the prose in the body.
3. Send the client the full URL plus the access code.

## The `PROPOSAL` config

| Field | What it does |
|---|---|
| `id` | Unique key for this proposal's localStorage state. Must differ per proposal. |
| `expires` | ISO datetime. Drives the sticky countdown, the popup clock, and the expired lockout. |
| `accessCode` | Optional. Delete the line to rely on the unlisted URL alone. |
| `tiers[]` | `id`, `name`, `price`, `note`, `includes[]`, `paymentLink`, optional `recommended:true` |
| `agreement[]` | `{h, p}` clauses shown in the acceptance modal. |

**The demo's `expires` is dynamic** — it sets itself 6 days out on first load so the
clock is always live for testing. Real proposals should use a fixed ISO string:
`expires: '2026-09-30T23:59:00-04:00'`.

## Wiring payment (required before real use)

Each tier's `paymentLink` currently reads `REPLACE_WITH_...`; clicking it shows a
reminder instead of navigating. Replace with a **Stripe Payment Link**, then set
that link's *success redirect* to:

```
https://threepieceent.com/proposals/<file>.html?paid=1&tier=<tier id>
```

That redirect is what flips the page into its "You're booked in" state and stops
the exit popup.

## How the flow behaves

- **Select a tier** → agreement modal → tick to enable → opens the payment link in
  a new tab. Selection is remembered.
- **Exit intent** → on desktop, cursor leaving through the top of the viewport;
  on touch devices, back-gesture or repeated tab-hide. Armed after 6 seconds so it
  never ambushes on arrival, and shown at most once per browser.
- **Paid** → banner, tiers switch to "Secured", countdown bar hides, popup disabled.
- **Expired** → everything locks, banner explains, popup tiers disable.

State is per-browser in `localStorage`. Clear it to re-test:

```js
Object.keys(localStorage).filter(k=>k.startsWith('tpe_')).forEach(k=>localStorage.removeItem(k))
```

## Limits you should know about

These are real constraints of a static site, not oversights:

1. **The access code is friction, not security.** It is checked in client-side JS,
   so anyone who views source can read it. The unlisted URL is the actual privacy
   boundary — `noindex` and `robots.txt` keep it out of search, but a forwarded
   link works for anyone. Don't put anything in a proposal you couldn't tolerate a
   third party seeing. Real access control needs a backend.
2. **"Paid" is a returning-visitor signal, not verification.** It trusts the
   `?paid=1` redirect and localStorage. Someone could hand-type that URL, and a
   genuine payer on a different device still sees the unpaid page. Stripe remains
   the source of truth — always confirm against your dashboard.
3. **Ticking the agreement box is not a signature.** It records nothing server-side.
   For enforceable execution, use the e-sign step in a real tool (or Stripe's terms
   acceptance at checkout) and treat this modal as disclosure.
