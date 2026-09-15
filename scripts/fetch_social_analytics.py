#!/usr/bin/env python3
"""
Social Analytics auto-fetch -- run on a schedule by
.github/workflows/social-analytics.yml, same shape as
scripts/fetch_daily_news.py (see that file's header for the pattern this
copies).

Pulls a daily account-level snapshot (follower count, media/post count)
for Instagram and Threads via Meta's Graph API, and writes each straight
to the dashboard's existing KV content store via
POST /api/content?collection=social-analytics -- the exact same
collection and endpoint the dashboard's manual "Social Analytics" tab
already reads and writes. No dashboard/backend change needed; this only
ever adds records the UI already knows how to render.

Each platform is independent and best-effort: a missing token/user-id
pair for one platform just skips it (so this works before both platforms
are configured), and an API error for one platform is printed as a
warning rather than failing the whole run.

Snapshot records use a DETERMINISTIC id (auto-<platform>-snapshot-<date>)
so re-running the same day upserts instead of creating duplicates --
functions/api/content.js's POST already upserts whenever an id is given.

Token refresh: Meta long-lived tokens expire (~60 days). Each run makes a
best-effort attempt to refresh both tokens first; if Meta returns a new
one, it's persisted back to this repo's GitHub Actions secrets via
`gh secret set` so the next scheduled run picks it up automatically.
Refresh needs one more secret than the fetch itself does -- see each
refresh function's docstring. A refresh failure only logs a warning; it
never blocks the actual fetch/post below it.

Required secrets are documented in local-admin/SOCIAL_ANALYTICS_SETUP.md.
"""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

SITE = "https://www.parispullen.com"
UA = "Mozilla/5.0 (compatible; ParisPullenSocialAnalytics/1.0)"
GRAPH_VERSION = "v21.0"


def fetch(url, timeout=15):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def fetch_json(url, timeout=15):
    data = json.loads(fetch(url, timeout=timeout))
    if isinstance(data, dict) and "error" in data:
        msg = data["error"].get("message", "unknown Graph API error") if isinstance(data["error"], dict) else str(data["error"])
        raise RuntimeError(msg)
    return data


def persist_refreshed_secret(name, value):
    """Best-effort: write a refreshed token back to this repo's Actions
    secrets so the next scheduled run doesn't need a human to update it.
    Needs GH_PAT (a fine-grained GitHub PAT with "Secrets: write" on this
    repo) and GITHUB_REPOSITORY (set automatically inside GitHub Actions).
    Silently skipped outside Actions or without GH_PAT -- this is a
    convenience, not a requirement for the fetch/post below to work."""
    pat = os.environ.get("GH_PAT")
    repo = os.environ.get("GITHUB_REPOSITORY")
    if not pat or not repo:
        print(f"  (skipping secret persist for {name} -- GH_PAT/GITHUB_REPOSITORY not set)", file=sys.stderr)
        return
    try:
        subprocess.run(
            ["gh", "secret", "set", name, "--repo", repo, "--body", value],
            env={**os.environ, "GH_TOKEN": pat},
            check=True, capture_output=True, text=True, timeout=30,
        )
        print(f"  refreshed {name} and saved it back to repo secrets")
    except Exception as e:
        print(f"  (could not persist refreshed {name}: {e})", file=sys.stderr)


def refresh_facebook_token(app_id, app_secret, token):
    """Instagram's token here is a Facebook long-lived Page/User token
    (the 'Instagram Graph API via a linked Facebook Page' flow -- the
    kind graph.facebook.com/{ig-user-id} calls below use). Its refresh is
    Facebook's long-lived-token exchange, which needs the app's own
    id/secret, not just the token. Returns the new token, or None."""
    if not app_id or not app_secret:
        return None
    qs = urllib.parse.urlencode({
        "grant_type": "fb_exchange_token",
        "client_id": app_id,
        "client_secret": app_secret,
        "fb_exchange_token": token,
    })
    try:
        data = fetch_json(f"https://graph.facebook.com/{GRAPH_VERSION}/oauth/access_token?{qs}")
        return data.get("access_token")
    except Exception as e:
        print(f"  Instagram token refresh failed (using existing token as-is): {e}", file=sys.stderr)
        return None


def refresh_threads_token(token):
    """Threads' long-lived token refreshes against its own endpoint, self
    -contained (no app id/secret needed) -- same shape as Instagram's
    separate 'Instagram API with Instagram Login' flow, just on
    graph.threads.net instead of graph.instagram.com. Returns the new
    token, or None."""
    qs = urllib.parse.urlencode({"grant_type": "th_refresh_token", "access_token": token})
    try:
        data = fetch_json(f"https://graph.threads.net/refresh_access_token?{qs}")
        return data.get("access_token")
    except Exception as e:
        print(f"  Threads token refresh failed (using existing token as-is): {e}", file=sys.stderr)
        return None


def fetch_instagram_snapshot(access_token, user_id):
    qs = urllib.parse.urlencode({"fields": "followers_count,media_count", "access_token": access_token})
    data = fetch_json(f"https://graph.facebook.com/{GRAPH_VERSION}/{user_id}?{qs}")
    return {
        "followers": data.get("followers_count"),
        "notes": f"Auto-fetched via Instagram Graph API. media_count={data.get('media_count')}.",
    }


def fetch_threads_snapshot(access_token, user_id):
    # Threads' basic profile fields (not the insights endpoint) already
    # carry followers_count -- one call instead of two.
    qs = urllib.parse.urlencode({"fields": "username,threads_biography,followers_count", "access_token": access_token})
    data = fetch_json(f"https://graph.threads.net/v1.0/{user_id}?{qs}")
    return {
        "followers": data.get("followers_count"),
        "notes": "Auto-fetched via Threads API.",
    }


def post_record(record_id, data, passphrase_hash):
    body = json.dumps({"passphraseHash": passphrase_hash, "id": record_id, "data": data}).encode("utf-8")
    req = urllib.request.Request(
        f"{SITE}/api/content?collection=social-analytics",
        data=body, method="POST",
        headers={"Content-Type": "application/json", "User-Agent": UA},
    )
    with urllib.request.urlopen(req, timeout=15) as res:
        return res.read().decode("utf-8")


def main():
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    env = os.environ

    ig_token = env.get("META_IG_ACCESS_TOKEN")
    ig_user_id = env.get("META_IG_USER_ID")
    threads_token = env.get("META_THREADS_ACCESS_TOKEN")
    threads_user_id = env.get("META_THREADS_USER_ID")
    passphrase_hash = env.get("DASHBOARD_PASSPHRASE_HASH")

    # Best-effort refresh, before using either token below.
    if ig_token:
        refreshed = refresh_facebook_token(env.get("META_APP_ID"), env.get("META_APP_SECRET"), ig_token)
        if refreshed and refreshed != ig_token:
            ig_token = refreshed
            persist_refreshed_secret("META_IG_ACCESS_TOKEN", refreshed)
    if threads_token:
        refreshed = refresh_threads_token(threads_token)
        if refreshed and refreshed != threads_token:
            threads_token = refreshed
            persist_refreshed_secret("META_THREADS_ACCESS_TOKEN", refreshed)

    records = {}  # record_id -> data

    if ig_token and ig_user_id:
        try:
            snap = fetch_instagram_snapshot(ig_token, ig_user_id)
            records[f"auto-instagram-snapshot-{today}"] = {
                "platform": "instagram", "kind": "snapshot", "date": today,
                "title": "", "followers": snap["followers"], "views": None,
                "likes": None, "comments": None, "shares": None, "link": "",
                "notes": snap["notes"], "source": "auto",
            }
            print(f"Instagram: {snap['followers']} followers")
        except Exception as e:
            print(f"Instagram fetch FAILED: {e}", file=sys.stderr)
    else:
        print("Instagram: skipped (META_IG_ACCESS_TOKEN / META_IG_USER_ID not set)")

    if threads_token and threads_user_id:
        try:
            snap = fetch_threads_snapshot(threads_token, threads_user_id)
            records[f"auto-threads-snapshot-{today}"] = {
                "platform": "threads", "kind": "snapshot", "date": today,
                "title": "", "followers": snap["followers"], "views": None,
                "likes": None, "comments": None, "shares": None, "link": "",
                "notes": snap["notes"], "source": "auto",
            }
            print(f"Threads: {snap['followers']} followers")
        except Exception as e:
            print(f"Threads fetch FAILED: {e}", file=sys.stderr)
    else:
        print("Threads: skipped (META_THREADS_ACCESS_TOKEN / META_THREADS_USER_ID not set)")

    if not records:
        print("\nNothing fetched successfully -- nothing to post.", file=sys.stderr)
        sys.exit(1)

    if not passphrase_hash:
        print("\nDASHBOARD_PASSPHRASE_HASH not set -- printing result(s) instead of posting.", file=sys.stderr)
        print(json.dumps(records, indent=2, ensure_ascii=False))
        return

    failures = 0
    for record_id, data in records.items():
        try:
            result = post_record(record_id, data, passphrase_hash)
            print(f"Posted {record_id}: {result[:200]}")
        except urllib.error.HTTPError as e:
            failures += 1
            print(f"POST failed for {record_id}: {e.code} {e.read().decode('utf-8', 'replace')[:500]}", file=sys.stderr)

    if failures:
        sys.exit(1)


if __name__ == "__main__":
    main()
