# Updates and Maintenance Guide

**See also:** [PROJECT_STRUCTURE_GUIDE.md](../PROJECT_STRUCTURE_GUIDE.md) for codebase organisation and [CODEBASE_QUALITY.md](../CODEBASE_QUALITY.md) for code standards.

This guide describes how THEIA is maintained over time, covering package updates, release processes, security auditing and incident response. Each section builds on the previous, so the guide can be read top to bottom or used as a reference for a specific task.

---

## Version Updates

### Package Updates

Dependencies are kept up to date using the commands below. Minor and patch updates are applied regularly, while major version updates are handled through a dedicated feature branch to allow for careful review.

```bash
# Check for outdated packages
npm outdated

# Update minor and patch versions
npm update

# Update a specific package to its latest version
npm install package@latest

# Check for known vulnerabilities
npm audit
npm audit fix
```

### Breaking Changes

When a dependency introduces breaking changes, the following steps are taken before the update is merged.

1. The package changelog is reviewed carefully.
2. Any affected components and type definitions are updated.
3. The full test suite is run to confirm nothing is broken.
4. Relevant documentation is updated to reflect the change.
5. A separate feature branch is created for the upgrade so it can be reviewed in isolation.

With packages maintained, the release process below describes how new versions of THEIA are published.

---

## Release Process

### Creating a New Release

Releases follow a structured branch-and-tag workflow. Each step below is run in sequence.

```bash
# Create a release branch from main
git checkout -b release/v1.x.x

# Update the version field in package.json
# "version": "1.x.x"

# Update CHANGELOG.md with new features, bug fixes and breaking changes

# Commit the changes
git commit -m "chore: release v1.x.x"

# Push the branch and open a pull request for review
git push origin release/v1.x.x

# After the pull request is merged, tag the release
git tag -a v1.x.x -m "Release version 1.x.x"
git push origin v1.x.x
```

Releases are only tagged after the pull request has been reviewed and merged. This ensures that every tagged version represents a fully reviewed and tested state of the codebase. Change management for ongoing development is covered in the next section.

---

## Change Management

### Feature Development

New features are developed on branches named `feature/description`. Commit messages are linked to the relevant issue or task and the PRD is updated if the scope of the feature changes. A review is requested before any feature branch is merged into main.

### Bug Fixes

Bug fix branches follow the naming convention `fix/issue-description`. Each commit references the relevant issue number using the format `fixes #123` and a regression test is added to prevent the same issue from recurring. Bugs are tagged with an appropriate severity level at the time of reporting.

### Hotfixes

Where a critical issue arises in production, a hotfix branch is created directly from main and merged as soon as the fix is verified.

```bash
git checkout -b hotfix/issue-name main
# Apply the fix
git commit -m "fix: description (fixes #123)"
# Open an urgent pull request and merge immediately after review
```

Once merged, hotfixes are tagged and released following the same process described in the release section above. Documentation updates related to any of these changes are handled as described below.

---

## Documentation Updates

Documentation is updated whenever behaviour changes in the codebase. The PRD is kept synchronised with the current implementation and new components are documented in the `docs/` directory as they are introduced. Examples are provided for complex features, and API references are updated whenever endpoints change.

Keeping documentation current reduces the risk of confusion during onboarding and makes it easier to audit the system during a security review, which is covered in the next section.

---

## Dependency Security

### Regular Audits

Security audits are conducted on a regular schedule to ensure that known vulnerabilities are identified and resolved promptly.

| Frequency | Activity |
|---|---|
| Weekly | `npm audit` |
| Monthly | Full security review |
| Quarterly | Major dependency evaluation |

### Vulnerability Response

When a vulnerability is identified, it is addressed through the steps below.

1. `npm audit` is run to identify all affected packages.
2. Issues are prioritised by severity, from critical down to low.
3. Vulnerable packages are updated using `npm audit fix`.
4. The application is tested thoroughly before the fix is deployed.
5. The resolution is documented in the release notes.

Where a backend database schema change is also required, the process described below is followed.

---

## Database Migrations

When a change to the backend database schema is needed, all developers are notified before any migration is applied. The change is coordinated with the backend team, migration scripts are tested locally before deployment and rollback procedures are prepared in advance. All changes are documented in the changelog.

---

## Performance Monitoring

Bundle size is tracked on each production build using `npm run build`. Core Web Vitals are monitored in the live environment and alerts are configured to flag any degradation in load time or responsiveness.

### Optimisation Tasks

The following tasks are carried out periodically to maintain performance.

- Unused imports are identified using `npm run lint`.
- Component render times are reviewed and compared against baseline values.
- Caching strategy is reviewed to ensure assets are served efficiently.
- Images and static assets are audited for compression opportunities.

Monitoring feeds directly into the communication process described below, particularly where performance issues require team-wide notification.

---

## Communication

### Update Announcements

The team is notified at least 24 hours before any planned deployment. A summary of the changes is posted in the relevant team channel, along with the rollback plan and any expected downtime.

### Incident Response

Critical issues are communicated immediately upon detection. A post-incident review is conducted within 24 hours and the documentation is updated to reflect any learnings. Monitoring configuration is adjusted as needed to catch similar issues earlier in future.

---

## Backup and Recovery

The following backup mechanisms are in place across the system.

| Area | Approach |
|---|---|
| Code | Git with multiple remote backups |
| State | Persisted through `signals/storage.ts` |
| User data | Backend database backups |
| Configuration | `.env.example` template maintained in the repository |

---

## Support and Troubleshooting

### Common Issues

**Black screen on load**

The browser console is checked first (F12). If no errors are visible, environment variables are verified, the browser cache is cleared and API connectivity is tested.

**Performance degradation**

Streaming data volume is monitored alongside concurrent user counts. Agent processing times are reviewed and any long-running queries are identified through the analytics dashboard.

**Deployment issues**

All environment variables are verified as set. Disk space on the server is checked, deployment logs are reviewed and the rollback procedure is tested if the issue cannot be resolved quickly.

---

## Future Roadmap

The following improvements are planned for future releases.

- Automated testing coverage improvements
- Performance optimisation initiatives
- Enhanced monitoring dashboards
- Advanced reporting features
- API versioning strategy

---

## Support Contacts

| Role | Contact |
|---|---|
| Technical Lead | [Contact info] |
| DevOps | [Contact info] |
| Security | [Contact info] |
