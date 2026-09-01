# Proposals

Self-contained proposal pages that live inside the site, priced, clickable, and
recoverable via an exit-intent popup. This is the same engine built for Three
Piece Entertainment, rebranded for El Lambert.

## Making a new proposal

1. Open `_build.py`. Copy one of the three `d(slug=..., ...)` entries in the
   `PROPOSALS` list — pick whichever is closest (wedding, corporate/private
   event, or funeral & religious service).
2. Give it a new, **unguessable slug**: `clientname-<random hex>`. The random
   suffix is the privacy mechanism.
3. Fill in the real client name, date, venue, tiers and pricing. Give it its
   own `code` (the access code you send the client) and `pid` (a unique key).
4. Run `python3 _build.py` from inside this folder. It rewrites every
   proposal listed, plus the private index.
5. Send the client the URL (e.g. `https://ellambert.com/proposals/<slug>.html`)
   plus the access code.

The three entries currently in `_build.py` are **demos** — Sample Client,
Sample Company, Sample Family — so you can see the whole flow end to end
before touching real client data. Leave them in, edit them, or delete them;
`_build.py` re-renders whatever is in the `PROPOSALS` list each time you run it.

## The `PROPOSAL` config

| Field | What it does |
|---|---|
| `id` (`pid` in `_build.py`) | Unique key for this proposal's localStorage state. Must differ per proposal. |
| `expires` | Set automatically from `TODAY + valid` days — bump `TODAY` at the top of `_build.py` when you next run it, or hardcode a real ISO string per proposal for something that shouldn't drift. |
| `accessCode` (`code`) | Required to view the proposal. Anyone with the link can still read the HTML source, so treat this as friction, not security. |
| `tiers[]` | `id`, `name`, `price`, `meta`, `desc`, `best`, optional `recommended:true` |
| `agreement[]` | Shared `AGREE` clauses shown in the acceptance modal — edit once, applies everywhere. |

## Wiring payment (required before real use)

Each tier's `paymentLink` is unset by default. Clicking "Continue to secure
payment" with no link shows a reminder instead of navigating. Add a real
**Stripe Payment Link** (or Venmo/CashApp/PayPal link) to each tier dict, then
set that link's *success redirect* to:

```
https://ellambert.com/proposals/<file>.html?paid=1&tier=<tier id>
```

That redirect is what flips the page into its "You're booked in" state and
stops the exit popup.

## How the flow behaves

- **Select a tier** → agreement modal → tick to enable → opens the payment
  link in a new tab. Selection is remembered.
- **Exit intent** → on desktop, cursor leaving through the top of the
  viewport; on touch devices, back-gesture or repeated tab-hide. Armed after
  6 seconds so it never ambushes on arrival, and shown at most once per
  browser.
- **Paid** → banner, tiers switch to "Secured", countdown bar hides, popup
  disabled.
- **Expired** → everything locks, banner explains, popup tiers disable.

State is per-browser in `localStorage`. Clear it to re-test:

```js
Object.keys(localStorage).filter(k=>k.startsWith('elp_')).forEach(k=>localStorage.removeItem(k))
```

## The private index

`_build.py` also regenerates `_index-private-el40b2.html` — a table of every
proposal in `PROPOSALS`, its access code, price range, and expiry. It is not
linked from the site and is blocked by `robots.txt`, but it is **not
password-protected**. Bookmark it for yourself; don't share the URL.

## Limits you should know about

These are real constraints of a static site, not oversights:

1. **The access code is friction, not security.** It is checked in
   client-side JS, so anyone who views source can read it. The unlisted URL
   is the actual privacy boundary — `noindex` and `robots.txt` keep it out of
   search, but a forwarded link works for anyone. Don't put anything in a
   proposal you couldn't tolerate a third party seeing. Real access control
   needs a backend.
2. **"Paid" is a returning-visitor signal, not verification.** It trusts the
   `?paid=1` redirect and localStorage. Someone could hand-type that URL, and
   a genuine payer on a different device still sees the unpaid page. Your
   payment provider remains the source of truth — always confirm against
   your dashboard.
3. **Ticking the agreement box is not a signature.** It records nothing
   server-side. For enforceable execution, use the e-sign step in a real tool
   (or your payment provider's terms acceptance at checkout) and treat this
   modal as disclosure.
