

# Dashboard Redesign for Greet.ai SaaS

## Current State
The dashboard currently has a basic layout: a greeting + status card with 4 metrics, a recent conversations list, and a simple insights panel. It works, but feels like a prototype rather than a polished SaaS product. The sidebar has only 4 items and there's no quick access to key actions.

## Vision
Transform the dashboard into a command center that gives business owners everything they need at a glance: what's happening now, what happened recently, how their AI is performing, and what needs attention. The design should feel like a premium SaaS tool (think: Intercom, Crisp, or HubSpot dashboard).

---

## Changes Overview

### 1. Redesigned Main Dashboard Page (`Dashboard.tsx`)
The new dashboard home will have these sections from top to bottom:

**A. Smart Greeting Bar** - Time-aware greeting with the user's name, a "Widget Live" status badge, and quick-action buttons (open settings, view widget, copy embed code).

**B. Metric Cards Row** - 6 compact metric cards in a horizontal grid:
- Conversations Today (with sparkline trend vs yesterday)
- Active Visitors Now (live count with pulse indicator)
- Messages Sent Today
- Avg Response Time (how fast the AI replies)
- Pages Recommended
- Satisfaction indicator (based on conversation length / engagement)

**C. Two-Column Layout:**
- **Left (wider):** Live Activity Feed - Real-time conversation stream with visitor ID, channel icon (chat/voice), page URL, message preview, and time. Each row is clickable. Includes a "View All" link.
- **Right:** Two stacked cards:
  - **AI Performance Card** - Donut chart showing conversation outcomes (resolved, escalated, abandoned) with a "resolution rate" percentage in the center.
  - **Quick Actions Card** - Buttons for: "Test Your Widget", "Invite Team Member", "View Analytics", "Edit Knowledge Base".

**D. Setup Checklist** (only shown if onboarding steps are incomplete) - Collapsible banner at the top showing remaining setup steps. Disappears once all steps are done.

### 2. Enhanced Sidebar (`DashboardSidebar.tsx`)
Add a user profile avatar and email at the bottom (above sign-out), and group navigation more logically:
- Dashboard (home icon)
- Conversations (message icon)
- Analytics (chart icon)
- Knowledge Base (book icon) -- new shortcut to settings/knowledge tab
- Settings (gear icon)

Also add a small "status dot" next to Conversations showing count of active conversations.

### 3. New Component: `QuickActions.tsx`
A card with 4 action tiles that link to common tasks. Each tile has an icon, label, and navigates to the relevant page/tab.

### 4. New Component: `PerformanceCard.tsx`
A compact card with a donut chart (using recharts) showing conversation outcomes breakdown and a central "resolution rate" number.

### 5. Updated `StatusHero.tsx` -> `DashboardHeader.tsx`
Simplified to just the greeting, live status badge, and action buttons. Metrics move to their own row of cards.

### 6. Updated `ActivityStream.tsx`
Enhanced with message previews (fetch last message per conversation), better empty state, and real-time updates via database subscriptions.

### 7. New Component: `MetricCardsRow.tsx`
A row of 6 small metric cards replacing the old StatusHero metrics grid. Each card is its own component with icon, label, value, and optional comparison indicator.

---

## Technical Details

### Files to Create
- `src/components/dashboard/DashboardHeader.tsx` - Greeting + status + quick actions bar
- `src/components/dashboard/MetricCardsRow.tsx` - 6 metric cards in a responsive grid
- `src/components/dashboard/PerformanceCard.tsx` - Donut chart for conversation outcomes
- `src/components/dashboard/QuickActions.tsx` - Quick action tiles card

### Files to Modify
- `src/pages/Dashboard.tsx` - Complete rewrite of layout composition using new components
- `src/components/dashboard/ActivityStream.tsx` - Add message previews, improve empty state
- `src/components/dashboard/DashboardSidebar.tsx` - Add user avatar/email, active conversation badge
- `src/components/dashboard/BottomNav.tsx` - No major changes needed

### Files to Remove/Deprecate
- `src/components/dashboard/StatusHero.tsx` - Replaced by DashboardHeader + MetricCardsRow
- `src/components/dashboard/InsightsPanel.tsx` - Replaced by PerformanceCard + QuickActions

### Data Fetching
All data comes from existing tables (conversations, chat_messages, profiles, widget_configs, organization_settings). No new database tables needed. The dashboard will:
1. Fetch profile + org ID
2. Parallel fetch: conversations (last 50), widget config, subscription, org settings
3. Compute metrics client-side from conversation data
4. Fetch last message per recent conversation for previews

### No Database Changes Required
All needed data already exists in the schema. We just present it better.

