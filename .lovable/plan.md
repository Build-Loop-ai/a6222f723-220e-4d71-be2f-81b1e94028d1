

# Pre-Launch: Update OG Image URLs to Production Domain

## What
Update the Open Graph and Twitter image URLs in `index.html` from the Lovable staging domain to `https://greet.chat`.

## Why
Social sharing previews (Facebook, Twitter/X, LinkedIn, Slack) will fetch these URLs. The staging URL works but looks unprofessional and will break if the staging subdomain changes.

## Change

**File: `index.html`** (lines 15, 19)
- Change `https://a6222f723-220e-4d71-be2f-81b1e94028d1.lovable.app/og-image.png` → `https://greet.chat/og-image.png` (2 occurrences)

## Post-Code Checklist (Your Action)

| Task | Where |
|------|-------|
| Connect `greet.chat` domain | Settings → Domains |
| Test hero voice agent | Landing page → Voice tab → Start Call |
| Set Stripe webhook URL to production | Stripe Dashboard → Webhooks |
| Set up branded email domain | Cloud → Emails |
| Publish frontend | Publish button → Update |

