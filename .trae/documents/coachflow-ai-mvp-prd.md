## 1. Product Overview
CoachFlow AI MVP is a single-page landing experience that captures leads and notifies you by email.
It also includes an admin-only dashboard at `/admin` to view leads and configure the notification email.

## 2. Core Features

### 2.1 User Roles
| Role | Registration Method | Core Permissions |
|------|---------------------|------------------|
| Visitor | No registration | View landing page; submit lead form |
| Admin | Pre-approved admin email(s) authenticate via Supabase Auth | View leads; update notification email; sign out |

### 2.2 Feature Module
1. **Landing Page**: value proposition, lead capture form, submission confirmation.
2. **Admin Dashboard**: admin authentication gate, leads list/detail, notification email setting.

### 2.3 Page Details
| Page Name | Module Name | Feature description |
|-----------|-------------|---------------------|
| Landing Page | Value proposition | Present product headline, brief benefits, and clear CTA to the form. |
| Landing Page | Lead capture form | Collect lead fields (name, email, short note); validate required fields; submit to Supabase. |
| Landing Page | Submission feedback | Show success state and basic next-steps; handle and display error state. |
| Admin Dashboard (/admin) | Auth gate | Require Supabase Auth session; restrict access to allowlisted admin emails; show sign-in UI when logged out. |
| Admin Dashboard (/admin) | Leads management | List leads (newest first); open a lead detail view; allow copy/export basics (copy email/message). |
| Admin Dashboard (/admin) | Notification settings | View/update the single “Admin notification email” used for alerts. |
| Admin Dashboard (/admin) | Sign out | End admin session and return to logged-out state. |

## 3. Core Process
**Visitor Flow**
1. You open the landing page.
2. You complete the lead form and submit.
3. The lead is saved to Supabase.
4. A notification email is sent to the configured admin email.
5. You see a success confirmation.

**Admin Flow**
1. You open `/admin`.
2. If logged out, you sign in with an allowlisted admin email.
3. You view incoming leads and open details.
4. You update the admin notification email if needed.
5. You sign out.

```mermaid
graph TD
  A["Landing Page (/)"] --> B["Submit Lead Form"]
