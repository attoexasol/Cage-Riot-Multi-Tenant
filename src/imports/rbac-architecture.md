Role Based Access Control Architecture
1. Platform Level
Platform Owner: Cage Riot
Cage Riot operates the SaaS platform and maintains platform-wide authority.
Platform Super Admin
Scope: Entire platform
Can:
●
●
●
●
●
●
●
Create, suspend, and manage accounts
Provision Enterprise White Label Accounts
Manage platform-wide feature flags, limits, and quotas
Define which connector types are allowed
Audit activity across all accounts
Access system health, delivery metrics, and analytics ingestion logs
Perform support impersonation (must be audit logged)
Rules:
●
●
All privileged actions must be audit logged
No connector secrets are ever exposed in UI
2. Account Types
An Account is the top-level container.
All data is scoped by account identifier.
Two account types exist:
Account Type A: Standard Artist or Small Label Account
(Self-Serve)
Default account type.
Structure:
●
One primary artist identity
●
Self-managed
●
Can invite additional users
●
No multi-artist hierarchy
Roles Inside a Standard Account
Account Owner
Can:
●
Manage users
●
Upload assets
●
Create/edit releases
●
Submit releases into workflow
●
View analytics dashboards
●
View royalty splits assigned to the account
●
View payout statements and earnings reports
●
Export reports
Cannot:
●
Access other accounts
●
Access platform-level configuration
●
Viewer
Can:
●
View release status
●
View analytics dashboards
●
View royalty performance summaries (optional, based on owner settings)
Cannot:
●
Upload
●
Edit releases
●
Access payout configuration
Royalty and Analytics in Standard
Accounts
Royalty Section Includes:
●
Revenue by release
●
Revenue by track
●
Revenue by territory
●
Split visibility (read-only)
●
Statement downloads
Analytics Section Includes:
●
Streams by platform
●
Playlist adds and removals
●
Chart entries
●
Follower growth
●
Historical trends
All analytics data is scoped strictly to the account.
Account Type B: Enterprise White Label Account
(Company or Large Label)
Enterprise-level structure.
Structure:
●
One parent account
●
Multiple child artist accounts
●
Operational role separation
●
Connector and routing control
3. Enterprise Account Roles
Account Admin
Scope: Entire enterprise account
Can:
●
●
●
●
●
●
Manage users
Create and manage artist accounts
Configure connectors and routing
Approve releases
Trigger delivery and retries
Initiate takedowns
●
●
●
●
View all analytics across all artists
View royalty dashboards across all artists
View and export payout reports
Configure split visibility rules
Cannot:
●
●
Access other enterprise accounts
Access platform-level settings
Operations
Scope: Entire enterprise account
Can:
●
Run quality control
●
Trigger delivery and retries
●
View delivery logs
●
View analytics dashboards
●
View release-level revenue summaries
Cannot:
●
Configure connectors
●
Change routing
●
Modify royalty splits
●
Access payout configuration
Legal
Scope: Entire enterprise account
Can:
●
Review licensing
●
Approve or block releases
●
Initiate takedowns
●
View audit logs
Cannot:
●
Access detailed financial statements
●
Configure connectors or routing
Finance
Scope: Entire enterprise account
Can:
●
View all royalty splits
●
Import and reconcile statements
●
Export financial reports
●
View revenue dashboards by artist, release, and territory
●
Access payout history
Cannot:
●
Edit metadata
●
Trigger delivery
●
Configure connectors
4. Artist Accounts Under Enterprise
Each artist account is isolated.
Scoped by:
●
account identifier
●
artist identifier
Artist Owner
Can:
●
Manage users inside that artist account
●
Upload and edit releases
●
Submit for approval
●
View analytics for that artist
●
View royalty splits assigned to that artist
●
View revenue and payout summaries for that artist
Cannot:
●
View other artists
●
Access enterprise-wide reports
●
Configure connectors
●
Access enterprise payout controls
Artist Viewer / Collaborator
Can:
●
View release status
●
View analytics dashboards
●
View revenue summaries (if permitted)
Cannot:
●
Upload
●
Edit
●
Submit
●
Access other artists
5. Royalty Controls and Visibility Rules
1. Royalty splits are defined at the account or enterprise level.
2. Only Account Admin or Finance can edit splits.
3. Artists can view splits but cannot edit them.
4. Payout configuration is restricted to Account Admin and Finance roles.
5. Royalty reports must always be scoped to the correct account and artist identifiers.
6. No cross-artist or cross-account revenue visibility is allowed.
6. Analytics Controls
Analytics data includes:
●
Streaming totals
●
Playlist events
●
Chart entries
●
●
●
Follower growth
Trend history
Optional radio data
Rules:
●
●
●
Analytics are always scoped by account identifier.
In enterprise accounts, cross-artist analytics are only visible to Account Admin,
Operations (optional), and Finance (if needed).
Artist accounts only see their own analytics.
7. Security Enforcement Rules
1. Every request must include account identifier.
2. Artist-level requests must also include artist identifier.
3. No cross-account access.
4. No cross-artist access.
5. Connector credentials remain server-side only.
6. Connector configuration restricted to Enterprise Account Admin and Platform Super
Admin.
7. All privileged actions must be audit logged, including royalty edits and payout changes.