TITLE: Refactor Enterprise Artist Viewer / Collaborator Portal to Match RBAC Specification

Context

We are building an Enterprise Artist Portal using a Role-Based Access Control (RBAC) architecture. The current UI contains features that exceed the allowed permissions for the role "Enterprise Artist Viewer / Collaborator".

Update the UI to strictly follow the RBAC rules defined in the architecture document.

Role Scope

Role = Enterprise Artist Viewer / Collaborator

This user belongs to an enterprise account but is scoped to ONE artist account only.

All UI and data must be filtered by:

* accountId
* artistId

The user must NEVER see cross-artist data or enterprise-level data.

---

PERMISSIONS (ALLOWED FEATURES)

The Artist Viewer role is VIEW ONLY.

They can ONLY:

1. View Release Status

Users must be able to:

* View list of releases
* See release status (Draft, Submitted, Approved, Distributed)
* View basic release information

UI Requirements:

Releases Page
Show:

* Release title
* Cover artwork
* Release date
* Status badge
* Track list preview

IMPORTANT:
Viewer cannot edit or modify anything.

---

2. View Analytics Dashboards

Users can view analytics dashboards for their artist only.

Analytics dashboard may include:

* Streaming totals
* Trend charts
* Playlist activity
* Top tracks
* Follower growth
* Platform performance overview

UI Requirements:

Analytics Dashboard

Components:

* Stream trend chart
* Top tracks table
* Playlist activity summary
* Platform breakdown cards

All analytics queries must be filtered by artistId.

Analytics must be view-only.

---

3. View Revenue Summaries (If Permitted)

Artist Viewer can see revenue summary information for their artist only.

Allowed UI:

Revenue Overview Dashboard showing:

* Total earnings summary
* Monthly revenue trend
* Revenue by release (summary level)

IMPORTANT:

Financial information must be READ ONLY.

Hide all financial editing controls.

---

ADD MISSING FEATURE

Add a clearly visible:

"Release Status" component

This component must allow the viewer to easily track the status of releases in the pipeline.

Example UI:

Release Table Columns

* Release Title
* Artwork
* Release Date
* Status
* Last Updated

---

REMOVE FEATURES THAT DO NOT MATCH RBAC

Delete or hide any UI related to the following:

Release Editing Features

Remove:

* Edit release metadata
* Upload artwork
* Upload audio files
* Create new releases
* Submit releases for approval

Artist Viewer cannot upload, edit, or submit releases.

---

REMOVE EXCESSIVE ANALYTICS FEATURES

Delete the following if present:

* Listener demographics (age/gender)
* City-level geographic analytics
* Detailed audience segmentation
* Export analytics reports
* Download analytics CSV/PDF

Analytics must remain view-only without export capabilities.

---

REMOVE EXCESSIVE FINANCIAL FEATURES

Delete:

* Royalty statement downloads
* Earnings exports
* Detailed platform revenue breakdown
* Territory-level revenue breakdown
* Payment history tracking
* Bank/payment configuration
* Withdrawal controls

Viewer should only see simple revenue summaries.

---

REMOVE NON-RBAC FEATURES

Remove UI pages or components for:

* Press kit downloads
* Promotional asset downloads
* Artist profile editing
* Social link management
* Distribution monitoring dashboards
* DSP delivery pipeline tracking
* Notification management systems

These features are not defined in the RBAC permissions.

---

FINAL NAVIGATION STRUCTURE

Left sidebar should contain ONLY:

1. Dashboard
2. Releases
3. Analytics
4. Revenue

No other sections.

---

DATA SECURITY RULE

Every API request must include:

{
accountId: "enterprise-account-id",
artistId: "artist-id",
role: "artist-viewer"
}

All queries must enforce:

artistId filtering.

Viewer must NEVER access:

* other artists
* enterprise dashboards
* admin features
* financial configuration tools.

---

GOAL

Create a simplified Artist Viewer Portal that:

* strictly follows RBAC permissions
* removes excessive or non-compliant features
* adds the required Release Status visibility
* ensures all UI is read-only
* restricts access to a single artist account.
