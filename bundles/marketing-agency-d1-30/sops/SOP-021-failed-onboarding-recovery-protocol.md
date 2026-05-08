# Failed Onboarding Recovery Protocol

**Vertical:** Marketing Agency
**SOP ID:** SOP-021
**Version:** 1.0.0
**Last Updated:** 2026-05-08
**Owner:** Operations Manager
**Review Cycle:** Quarterly

## Purpose

This Standard Operating Procedure defines the step-by-step process for failed onboarding recovery protocol. Following this SOP ensures consistency, quality, and compliance across all engagements in the marketing agency vertical.

## Scope

This SOP applies to all team members involved in marketing agency operations. Contractors and temporary staff must also follow this procedure unless an approved exception is documented.

## Prerequisites

- Digital checklist in the operations platform
- Calibrated measurement equipment (if applicable)
- Secure client portal for document exchange
- Internal communication channel (Slack/Teams)
- Project management dashboard
- Document management system with version control

## Procedure

### Step 1: Preparation & Documentation Review

Before beginning the failed onboarding recovery protocol procedure, gather all relevant documentation including previous period reports, client files, regulatory updates, and internal process documents. Verify that you have the current versions of all templates and checklists. Log into all required systems and confirm access credentials are active. Notify your supervisor that you are beginning this SOP and confirm there are no conflicting priorities or urgent escalations that would interrupt the workflow.

**Expected Outcome:** Step 1 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 2: Stakeholder Notification

Send a brief notification to all stakeholders affected by this procedure. Use the standard stakeholder communication template (TMP-COM-004). Include: the procedure name, expected duration, any system downtime or access restrictions, and a point of contact for questions. For client-facing procedures, ensure the client's preferred communication channel is used and that the message is reviewed by the account manager before sending.

**Expected Outcome:** Step 2 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 3: System Readiness Check

Perform a systematic check of all tools and platforms required for this procedure. Verify: (1) All integrations are operational and API keys are valid, (2) Database backups have completed within the last 24 hours, (3) Required third-party services are responsive (run the health check script if available), (4) Local workstation has sufficient disk space (>10GB recommended) and stable internet connectivity. Document any issues found in the pre-flight checklist (CHK-021-PRE).

**Expected Outcome:** Step 3 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 4: Data Collection & Validation

Collect all data inputs required for failed onboarding recovery protocol. Sources may include: CRM exports, financial system reports, time tracking data, client-submitted documents, automated data feeds, and manual data entry forms. For each data source: (a) verify the export date/time is within the acceptable window, (b) check record counts against expected ranges, (c) validate key fields for completeness (no nulls in required columns), (d) flag any anomalies in the data quality report (RPT-DQ-021). If data quality issues are found, follow the Data Exception Handling protocol (SOP-900).

**Expected Outcome:** Step 4 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 5: Core Execution — Phase 1: Setup

Begin the core execution of failed onboarding recovery protocol by establishing the working environment: (1) Create a new working directory with today's date and procedure name, (2) Copy all input files into the working directory (never work on originals), (3) Initialize the tracking spreadsheet with baseline metrics, (4) Set up any required virtual environments, database connections, or API sessions, (5) Take a system state snapshot using the provided diagnostic tool. Record the start time in the procedure log (LOG-021).

**Expected Outcome:** Step 5 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 6: Core Execution — Phase 2: Processing

Execute the primary processing steps for failed onboarding recovery protocol: (1) Apply the transformation rules as defined in the processing specification (SPEC-021), (2) Process data in batches of 500 records to maintain performance, (3) Monitor system resource usage (CPU should stay below 80%, memory below 75%), (4) Log progress after each batch with record counts, success/failure rates, and timing metrics, (5) If a batch fails, pause processing and investigate before continuing — do not skip failed records without explicit supervisor approval.

**Expected Outcome:** Step 6 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 7: Core Execution — Phase 3: Verification

After processing completes, verify the results: (1) Run the automated verification script (verify-failed-onboarding-recovery-protocol.sh) which checks record counts, hash integrity, and business rule compliance, (2) Manually review a random sample of 5% of records (minimum 25 records) for accuracy, (3) Compare key metrics against the previous period's results — investigate any variance >10%, (4) Generate the verification report (RPT-VRF-021) and attach it to the procedure log.

**Expected Outcome:** Step 7 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 8: Exception Handling & Escalation

If any exceptions were encountered during execution: (1) Categorize each exception by severity (Critical/High/Medium/Low) using the severity matrix in the Quality Manual, (2) For Critical exceptions: immediately notify the Operations Manager and pause all dependent workflows, (3) For High exceptions: document in the issue tracker, notify team lead within 1 hour, and implement the prescribed mitigation, (4) For Medium/Low exceptions: document and continue — these will be reviewed in the weekly quality meeting. All exceptions must be tracked in the Exceptions Register (EXC-REG) with a unique ID, timestamp, description, severity, resolution status, and owner.

**Expected Outcome:** Step 8 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 9: Quality Assurance Review

Conduct a thorough QA review before finalizing: (1) Complete the QA checklist (QA-021) covering completeness, accuracy, compliance, and presentation, (2) Have a peer reviewer (someone not involved in the execution) perform an independent review of at least 10% of the output, (3) Address all findings from peer review — re-execute affected steps if necessary, (4) Obtain formal sign-off from the QA reviewer in the procedure log. No procedure is complete without documented QA sign-off.

**Expected Outcome:** Step 9 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 10: Client/Market Deliverable Preparation

Prepare final deliverables for the intended audience: (1) Format outputs according to the Marketing Agency Style Guide (templates, branding, terminology), (2) Prepare an executive summary highlighting key findings, metrics, and recommendations, (3) Create a detailed appendix with methodology notes, assumptions, and data sources, (4) Package all files into a single distributable format (PDF portfolio preferred), (5) Have the account manager or client lead review the package before delivery, (6) Upload the final package to the document management system with appropriate retention tags.

**Expected Outcome:** Step 10 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 11: Documentation & Knowledge Capture

Complete all documentation requirements: (1) Update the procedure log with final status, actual duration vs. estimated, and any deviations from the standard procedure, (2) File all generated reports, checklists, and verification artifacts in the designated archive location with consistent naming conventions, (3) If you discovered any process improvements, shortcuts, or pitfalls during execution, document them in the Lessons Learned register (LL-REG), (4) Update any relevant knowledge base articles or FAQs that were referenced during this procedure, (5) Tag all documentation with the procedure ID (SOP-021) for traceability.

**Expected Outcome:** Step 11 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

### Step 12: Follow-Up Actions & Scheduling

Before closing out this procedure: (1) Identify all follow-up actions required — these may include client check-ins, data updates, recurring tasks, or dependent procedures, (2) Create tasks in the project management system for each follow-up with clear owners, due dates, and priority levels, (3) Schedule any recurring tasks that need to repeat on a defined cadence (daily, weekly, monthly, quarterly), (4) Set calendar reminders for key milestone reviews (e.g., 7-day post-procedure check, 30-day outcomes review), (5) If this procedure triggers downstream workflows, verify that those workflows have been properly initiated and the next responsible party has acknowledged the handoff.

**Expected Outcome:** Step 12 is completed successfully with all required data captured, verified, and logged.

**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.

---

## Quality Assurance

- [ ] All steps completed in sequence
- [ ] Required approvals obtained
- [ ] Documentation archived
- [ ] Follow-up tasks scheduled

## Related SOPs

- Quality Control: Post-Execution Inspection
- Client Communication Protocol
- Issue Escalation Procedure
- Documentation Standards & Archiving

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|--------|
| 2026-05-08 | 1.0.0 | VerticalPlaybook | Initial release |
