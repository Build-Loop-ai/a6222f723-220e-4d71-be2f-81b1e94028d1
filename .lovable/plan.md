

# Fix: Crawl-Site Auth Failure + Missing Asia Timezones

## Problem 1: Crawl always fails for regular users
The `crawl-site` edge function uses `supabase.auth.getClaims(token)` (line 38), which **does not exist** in supabase-js v2. This causes a runtime error, returning 401 Unauthorized for every non-service-role call. Since the frontend calls it with a normal user JWT, the crawl always fails.

**Fix**: Replace `getClaims` with `supabase.auth.getUser()` which is the correct v2 method.

## Problem 2: No Asia/Singapore timezone
The timezone dropdown in `BusinessSettings.tsx` (lines 581-589) only lists 6 timezones — all European/American. No Asian timezones at all.

**Fix**: Add a comprehensive set of global timezones including Asia/Singapore, Asia/Tokyo, Asia/Hong_Kong, Asia/Dubai, Australia/Sydney, etc.

## Changes

### 1. `supabase/functions/crawl-site/index.ts` (lines 31-46)
Replace the broken `getClaims` auth block with:
```typescript
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  return unauthorized response;
}
const userId = user.id;
```

### 2. `src/components/settings/BusinessSettings.tsx` (lines 581-589)
Expand the timezone `<SelectContent>` to include ~20 global timezones grouped by region:
- **Americas**: New York, Chicago, Denver, Los Angeles, Sao Paulo
- **Europe**: London, Amsterdam, Paris, Berlin, Moscow
- **Asia**: Dubai, Kolkata, Bangkok, Singapore, Hong Kong, Tokyo, Seoul
- **Oceania**: Sydney, Auckland

