

# Pre-Launch Checklist for Greet SaaS

Your app is well-built with solid architecture. Here's what I'd recommend addressing before launch, grouped by priority.

---

## Critical (Must-Have)

### 1. Custom OG Image / Favicon
- `index.html` uses a generic Unsplash stock photo for `og:image` and has no favicon set
- Create a branded OG image (1200x630) and favicon for professional social sharing

### 2. Email Confirmation UX
- Signups require email confirmation but there's no resend-confirmation option on the login page if a user tries to sign in before confirming
- Add a "Resend confirmation email" flow

### 3. Error Handling on Stripe Checkout
- Verify Stripe checkout and webhook flows work end-to-end with test keys before going live
- Ensure failed payments show user-friendly messages

### 4. Loading / Empty States Audit
- Some dashboard pages (Analytics, Conversations) should be checked for proper empty states when there's no data yet, so new users aren't confused

---

## Important (Should-Have)

### 5. Mobile Responsiveness Pass
- The dashboard layout, onboarding flow, and widget settings page should be tested on mobile viewports
- The landing page likely works but the dashboard sidebar navigation on small screens needs verification

### 6. Rate Limiting on Auth Endpoints
- The widget-chat has rate limiting, but login/signup forms don't have client-side throttling to prevent brute-force or spam

### 7. Cookie Consent / GDPR Banner
- No cookie consent banner exists; if targeting EU users this is legally required
- The Privacy page exists but doesn't mention cookie usage

### 8. Transactional Email Templates
- Verify that signup confirmation, password reset, and invitation emails have branded templates (not default Supabase emails)

---

## Nice-to-Have (Polish)

### 9. 404 Page Polish
- Verify the NotFound page is branded and helpful (links back to home/dashboard)

### 10. Accessibility
- Add `aria-label` attributes to icon-only buttons (close, send, voice) in the chat widget
- Ensure keyboard navigation works through the main flows

### 11. Performance
- Add `loading="lazy"` to images on the landing page
- Consider code-splitting the Admin page since it's heavy and rarely accessed

### 12. Analytics / Tracking
- No analytics integration (e.g., Plausible, PostHog, or Google Analytics) for tracking landing page conversions and signup funnels

---

## Summary of Suggested Implementation Order

| Priority | Item | Effort |
|----------|------|--------|
| Critical | Custom OG image + favicon | Small |
| Critical | Resend confirmation email | Medium |
| Critical | Stripe end-to-end test | Manual |
| Important | Mobile responsiveness pass | Medium |
| Important | Cookie consent banner | Medium |
| Important | Branded email templates | Medium |
| Nice | Accessibility improvements | Small |
| Nice | Analytics integration | Small |

Would you like me to start implementing any of these?

