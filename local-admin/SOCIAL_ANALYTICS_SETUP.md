# Social Analytics auto-fetch — one-time setup

This is the part I can't do for you: creating a Meta developer app and connecting
your accounts requires your own login and consent. Everything else (the script, the
scheduled workflow, the dashboard tab) is already built and waiting on these
credentials.

Once this is done, `.github/workflows/social-analytics.yml` runs
`scripts/fetch_social_analytics.py` once a day and logs a follower-count snapshot for
Instagram and Threads straight into the dashboard's existing Social Analytics tab —
no manual typing needed.

## 1. Create a Meta developer app

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps) and
   log in with the Facebook account tied to your Instagram/Threads.
2. **Create App** → choose **Other** → **Business** as the app type.
3. Name it something like "Paris Pullen Analytics" — it's internal, never reviewed
   or published.
4. Note the **App ID** and **App Secret** (Settings → Basic) — you'll need both later.

## 2. Instagram: make sure it's a Professional account

1. In the Instagram app: Settings → Account type and tools → make sure it's set to
   **Professional account** (Business or Creator — either works), linked to a
   **Facebook Page** you control. If you don't have a Page yet, Instagram will offer
   to create one during this step.

## 3. Instagram: add the product and generate a token

1. In your Meta app dashboard, **Add Product** → **Instagram Graph API** (sometimes
   listed under "Facebook Login for Business").
2. Go to **Graph API Explorer** (developers.facebook.com/tools/explorer), select your
   app, and click **Generate Access Token**. Grant these permissions when prompted:
   `pages_show_list`, `pages_read_engagement`, `instagram_basic`,
   `instagram_manage_insights`.
3. That token is short-lived (~1 hour). Exchange it for a long-lived one (~60 days) by
   opening this URL in your browser (fill in your own values):
   ```
   https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
   ```
   The response's `access_token` is your long-lived token — this is `META_IG_ACCESS_TOKEN`.
4. Find your Instagram Business Account ID: with that token, open
   ```
   https://graph.facebook.com/v21.0/me/accounts?access_token=YOUR_LONG_LIVED_TOKEN
   ```
   to list your Pages and their `id`, then
   ```
   https://graph.facebook.com/v21.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_LONG_LIVED_TOKEN
   ```
   The `instagram_business_account.id` in the response is `META_IG_USER_ID`.

## 4. Threads: add the product and generate a token

1. In the same Meta app, **Add Product** → **Threads API**.
2. Under the Threads API product's settings, use its own OAuth flow (Meta's Threads
   API docs walk through this — it's a "Login with Threads" consent screen, separate
   from the Instagram one above) to authorize your Threads account with scopes
   `threads_basic` and `threads_manage_insights`.
3. That flow gives you a short-lived Threads token; exchange it for a long-lived one:
   ```
   https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=YOUR_APP_SECRET&access_token=YOUR_SHORT_LIVED_THREADS_TOKEN
   ```
   The `access_token` in the response is `META_THREADS_ACCESS_TOKEN`.
4. Find your Threads user ID:
   ```
   https://graph.threads.net/v1.0/me?fields=id,username&access_token=YOUR_LONG_LIVED_THREADS_TOKEN
   ```
   The `id` is `META_THREADS_USER_ID`.

## 5. (Recommended) A GitHub token so refreshed tokens save themselves

Both long-lived tokens above expire in ~60 days. The script tries to refresh them
automatically every run and, if you set this up, saves the new one back to your
repo's secrets so you never have to redo steps 3/4 by hand every two months.

1. [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
   → **Fine-grained token**.
2. Repository access: **Only select repositories** → `parispullen-git/website`.
3. Permissions → Repository permissions → **Secrets** → **Read and write**.
4. Generate, copy the token — this is `GH_PAT`.

Skipping this is fine too — the script still runs and fetches fine without it, it
just logs a note each run and you'll need to redo steps 3/4 manually roughly every
two months when a token expires.

## 6. Add everything as GitHub Actions secrets

Go to `github.com/parispullen-git/website` → **Settings** → **Secrets and variables**
→ **Actions** → **New repository secret**, and add each of these (exact names,
case-sensitive):

| Secret name | Value |
|---|---|
| `META_APP_ID` | from step 1 |
| `META_APP_SECRET` | from step 1 |
| `META_IG_ACCESS_TOKEN` | from step 3 |
| `META_IG_USER_ID` | from step 3 |
| `META_THREADS_ACCESS_TOKEN` | from step 4 |
| `META_THREADS_USER_ID` | from step 4 |
| `GH_PAT` | from step 5 (optional but recommended) |

`DASHBOARD_PASSPHRASE_HASH` is **already set** (the Daily News workflow uses the same
one) — nothing to do there.

## 7. Test it

1. Go to the **Actions** tab on GitHub → **Social Analytics** (in the left sidebar) →
   **Run workflow** → **Run workflow** (the green button). This runs it immediately
   instead of waiting for the daily schedule.
2. Watch the run's log — it prints `Instagram: N followers` / `Threads: N followers`
   on success, or a clear error if a token/permission is wrong.
3. Check `https://parispullen.com/dashboard.html` → **Social Analytics** tab — you
   should see a new entry for today, one per platform, marked as an account snapshot.

From then on it runs automatically once a day (12:30 UTC) with no further action from
you, until a token needs manual renewal (only if step 5 was skipped).
