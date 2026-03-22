

# Remaining Pre-Launch Polish — Implementation Plan

## Overview
Implement all remaining checklist items: cookie consent banner, 404 page polish, widget accessibility, OG image fix, and branded auth email templates.

---

## 1. Cookie Consent Banner (GDPR)
**File**: New `src/components/CookieConsent.tsx`

Create a minimal, non-intrusive banner that:
- Shows at the bottom of the screen on first visit
- Stores consent in `localStorage` so it only shows once
- Has "Accept" and "Decline" buttons
- Matches the app's dark theme styling
- Renders in `App.tsx` outside the router so it appears on all pages

---

## 2. Polish 404 Page
**File**: `src/pages/NotFound.tsx`

- Add Greet branding (logo wordmark)
- Add links to both home (`/`) and dashboard (`/dashboard`)
- Use the app's ambient orb styling for visual consistency
- Add a friendlier message

---

## 3. Widget Accessibility (aria-labels)
**File**: `src/components/embed/ChatPanel.tsx`

Add `aria-label` to all icon-only buttons:
- Close button → `aria-label="Close chat"`
- Phone/call button → `aria-label="Start voice call"`
- Mic button → `aria-label="Toggle voice input"`
- Send button → `aria-label="Send message"`

---

## 4. Fix OG Image URL
**File**: `index.html`

- Change relative `/og-image.png` to absolute URL using the published domain
- Add `<meta name="theme-color" content="#050506">` for mobile browser chrome

---

## 5. Branded Auth Email Templates
**Prerequisite**: No email domain is configured yet. The first step is setting up a sender domain through the email setup dialog. Once configured, I'll scaffold and brand the auth email templates (signup confirmation, password reset, magic link, invite).

This step requires user interaction with the email domain setup dialog before templates can be created.

---

## Implementation Order
1. Cookie consent banner (new component + wire into App.tsx)
2. 404 page polish
3. Widget aria-labels
4. OG image + theme-color fix
5. Email domain setup prompt → then auth email templates

