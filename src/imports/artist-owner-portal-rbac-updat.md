TITLE: Update Enterprise Artist Owner Portal UI to Match RBAC Architecture

Context:
We are building an Enterprise Artist Portal based on a Role Based Access Control (RBAC) architecture. The current UI contains extra features that are not allowed for the "Artist Owner" role. Update the UI so it strictly follows the RBAC permissions defined below.

Role Scope:
Role = Enterprise Artist Owner

The user belongs to an enterprise account but only manages ONE artist account.
All UI, navigation, and data must be scoped by:

* accountId
* artistId

The user must NEVER see cross-artist or enterprise-wide data.

---

PERMISSIONS: WHAT ARTIST OWNER CAN DO

1. User Management (Artist Scope Only)
   Allow the Artist Owner to:

* Manage users inside their own artist account
* Invite collaborators
* Assign "Artist Viewer / Collaborator" role
* Remove users from their artist account

UI Requirements:

* Artist Team Management page
* Invite User modal
* Role dropdown (Viewer / Collaborator)

---

2. Release Management

Artist Owner can:

* Upload releases
* Edit releases
* Manage metadata
* Upload artwork and audio
* Submit releases for approval

UI Requirements:

* Releases list page
* Release editor page
* Upload workflow
* Submit for Approval button

Workflow:
Draft → Submit for Approval → Admin/Legal Review → Distribution

---

3. Analytics Access (Artist Scoped)

Artist Owner can only view analytics for their own artist.

Analytics includes:

* Streaming totals
* Playlist events
* Chart entries
* Follower growth
* Historical trends
* Platform analytics (Spotify, Apple Music etc.)

UI Requirements:

* Analytics dashboard
* Charts for streams, followers, playlists
* Platform filter

All analytics queries must be filtered by artistId.

---

4. Royalty Visibility (Read Only)

Artist Owner can view but NOT edit financial data.

They can view:

* Royalty splits assigned to their artist
* Revenue summaries
* Payout summaries

UI Requirements:

Royalty Dashboard showing:

* Revenue overview
* Royalty split table (read-only)
* Payout summary section

IMPORTANT:
Add a dedicated "Payout Summary" component since it was missing in the current UI.

---

RESTRICTIONS: WHAT ARTIST OWNER CANNOT DO

Remove or hide any UI related to:

1. Cross-Artist Access

Artist Owner must NOT see:

* Other artists in the enterprise
* Other artists’ releases
* Other artists’ analytics
* Other artists’ revenue data

Navigation must NOT contain any multi-artist switching.

---

2. Enterprise-Level Data

Artist Owner must NOT see:

* Enterprise dashboards
* Company financial reports
* Aggregated analytics across all artists
* Enterprise administration tools

---

3. Technical Configuration

Remove UI for:

* Connector configuration
* API integrations
* Routing rules
* Delivery settings
* DSP integration management

These belong to Enterprise Admin only.

---

4. Financial Controls

Remove UI for:

* Editing royalty splits
* Changing split percentages
* Enterprise payout configuration
* Payment setup
* Financial administration tools

All financial data must be read-only.

---

REMOVE THESE EXISTING FEATURES FROM THE CURRENT UI

Delete the following if present:

* Delivery monitoring dashboards
* DSP delivery status tracking
* Release delivery progress pages
* Analytics export reports
* Revenue export downloads
* Statement downloads
* Detailed revenue breakdown by territory/platform if editable

These are not defined in the RBAC permissions for Artist Owner.

---

FINAL PORTAL STRUCTURE

Left Navigation should contain ONLY:

1. Dashboard
2. Releases
3. Analytics
4. Royalties
5. Team
6. Settings

---

DATA SECURITY RULE

Every API request must include:

{
accountId: "enterprise-account-id",
artistId: "artist-id",
role: "artist-owner"
}

The UI must enforce strict filtering so that:

* All releases
* All analytics
* All royalties
* All users

are scoped ONLY to the artistId.

---

GOAL

Update the UI/UX to create a clean Artist Owner Portal that:

* strictly follows RBAC rules
* removes excessive features
* adds the missing payout summary section
* prevents cross-artist or enterprise access
* simplifies navigation to artist-level management only.
