#!/usr/bin/env node
/**
 * Bundle content generator — creates realistic SOPs, automations, n8n flows,
 * and prompt packs for all 3 Phase 0 bundles.
 *
 * Usage: node scripts/generate-bundle-content.js
 */

const fs = require("fs");
const path = require("path");

const BUNDLES_DIR = path.join(__dirname, "..", "bundles");

// ── Helper ──────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// ── SOP step definitions (12 detailed steps per SOP) ────────────────────────

function generateSOPSteps(name, index, vertical) {
  const pad = String(index + 1).padStart(3, "0");
  return [
    {
      title: "Preparation & Documentation Review",
      detail: `Before beginning the ${name.toLowerCase()} procedure, gather all relevant documentation including previous period reports, client files, regulatory updates, and internal process documents. Verify that you have the current versions of all templates and checklists. Log into all required systems and confirm access credentials are active. Notify your supervisor that you are beginning this SOP and confirm there are no conflicting priorities or urgent escalations that would interrupt the workflow.`,
    },
    {
      title: "Stakeholder Notification",
      detail: `Send a brief notification to all stakeholders affected by this procedure. Use the standard stakeholder communication template (TMP-COM-004). Include: the procedure name, expected duration, any system downtime or access restrictions, and a point of contact for questions. For client-facing procedures, ensure the client's preferred communication channel is used and that the message is reviewed by the account manager before sending.`,
    },
    {
      title: "System Readiness Check",
      detail: `Perform a systematic check of all tools and platforms required for this procedure. Verify: (1) All integrations are operational and API keys are valid, (2) Database backups have completed within the last 24 hours, (3) Required third-party services are responsive (run the health check script if available), (4) Local workstation has sufficient disk space (>10GB recommended) and stable internet connectivity. Document any issues found in the pre-flight checklist (CHK-${pad}-PRE).`,
    },
    {
      title: "Data Collection & Validation",
      detail: `Collect all data inputs required for ${name.toLowerCase()}. Sources may include: CRM exports, financial system reports, time tracking data, client-submitted documents, automated data feeds, and manual data entry forms. For each data source: (a) verify the export date/time is within the acceptable window, (b) check record counts against expected ranges, (c) validate key fields for completeness (no nulls in required columns), (d) flag any anomalies in the data quality report (RPT-DQ-${pad}). If data quality issues are found, follow the Data Exception Handling protocol (SOP-900).`,
    },
    {
      title: "Core Execution — Phase 1: Setup",
      detail: `Begin the core execution of ${name.toLowerCase()} by establishing the working environment: (1) Create a new working directory with today's date and procedure name, (2) Copy all input files into the working directory (never work on originals), (3) Initialize the tracking spreadsheet with baseline metrics, (4) Set up any required virtual environments, database connections, or API sessions, (5) Take a system state snapshot using the provided diagnostic tool. Record the start time in the procedure log (LOG-${pad}).`,
    },
    {
      title: "Core Execution — Phase 2: Processing",
      detail: `Execute the primary processing steps for ${name.toLowerCase()}: (1) Apply the transformation rules as defined in the processing specification (SPEC-${pad}), (2) Process data in batches of 500 records to maintain performance, (3) Monitor system resource usage (CPU should stay below 80%, memory below 75%), (4) Log progress after each batch with record counts, success/failure rates, and timing metrics, (5) If a batch fails, pause processing and investigate before continuing — do not skip failed records without explicit supervisor approval.`,
    },
    {
      title: "Core Execution — Phase 3: Verification",
      detail: `After processing completes, verify the results: (1) Run the automated verification script (verify-${slugify(name)}.sh) which checks record counts, hash integrity, and business rule compliance, (2) Manually review a random sample of 5% of records (minimum 25 records) for accuracy, (3) Compare key metrics against the previous period's results — investigate any variance >10%, (4) Generate the verification report (RPT-VRF-${pad}) and attach it to the procedure log.`,
    },
    {
      title: "Exception Handling & Escalation",
      detail: `If any exceptions were encountered during execution: (1) Categorize each exception by severity (Critical/High/Medium/Low) using the severity matrix in the Quality Manual, (2) For Critical exceptions: immediately notify the Operations Manager and pause all dependent workflows, (3) For High exceptions: document in the issue tracker, notify team lead within 1 hour, and implement the prescribed mitigation, (4) For Medium/Low exceptions: document and continue — these will be reviewed in the weekly quality meeting. All exceptions must be tracked in the Exceptions Register (EXC-REG) with a unique ID, timestamp, description, severity, resolution status, and owner.`,
    },
    {
      title: "Quality Assurance Review",
      detail: `Conduct a thorough QA review before finalizing: (1) Complete the QA checklist (QA-${pad}) covering completeness, accuracy, compliance, and presentation, (2) Have a peer reviewer (someone not involved in the execution) perform an independent review of at least 10% of the output, (3) Address all findings from peer review — re-execute affected steps if necessary, (4) Obtain formal sign-off from the QA reviewer in the procedure log. No procedure is complete without documented QA sign-off.`,
    },
    {
      title: "Client/Market Deliverable Preparation",
      detail: `Prepare final deliverables for the intended audience: (1) Format outputs according to the ${vertical} Style Guide (templates, branding, terminology), (2) Prepare an executive summary highlighting key findings, metrics, and recommendations, (3) Create a detailed appendix with methodology notes, assumptions, and data sources, (4) Package all files into a single distributable format (PDF portfolio preferred), (5) Have the account manager or client lead review the package before delivery, (6) Upload the final package to the document management system with appropriate retention tags.`,
    },
    {
      title: "Documentation & Knowledge Capture",
      detail: `Complete all documentation requirements: (1) Update the procedure log with final status, actual duration vs. estimated, and any deviations from the standard procedure, (2) File all generated reports, checklists, and verification artifacts in the designated archive location with consistent naming conventions, (3) If you discovered any process improvements, shortcuts, or pitfalls during execution, document them in the Lessons Learned register (LL-REG), (4) Update any relevant knowledge base articles or FAQs that were referenced during this procedure, (5) Tag all documentation with the procedure ID (SOP-${pad}) for traceability.`,
    },
    {
      title: "Follow-Up Actions & Scheduling",
      detail: `Before closing out this procedure: (1) Identify all follow-up actions required — these may include client check-ins, data updates, recurring tasks, or dependent procedures, (2) Create tasks in the project management system for each follow-up with clear owners, due dates, and priority levels, (3) Schedule any recurring tasks that need to repeat on a defined cadence (daily, weekly, monthly, quarterly), (4) Set calendar reminders for key milestone reviews (e.g., 7-day post-procedure check, 30-day outcomes review), (5) If this procedure triggers downstream workflows, verify that those workflows have been properly initiated and the next responsible party has acknowledged the handoff.`,
    },
  ];
}

// ── Content generators ──────────────────────────────────────────────────────

function generateSOP(name, index, vertical) {
  const pad = String(index + 1).padStart(3, "0");
  const steps = generateSOPSteps(name, index, vertical);

  const tools = [
    "Digital checklist in the operations platform",
    "Calibrated measurement equipment (if applicable)",
    "Secure client portal for document exchange",
    "Internal communication channel (Slack/Teams)",
    "Project management dashboard",
    "Document management system with version control",
  ];

  let doc = "";
  doc += `# ${name}\n\n`;
  doc += `**Vertical:** ${vertical}\n`;
  doc += `**SOP ID:** SOP-${pad}\n`;
  doc += `**Version:** 1.0.0\n`;
  doc += `**Last Updated:** 2026-05-08\n`;
  doc += `**Owner:** Operations Manager\n`;
  doc += `**Review Cycle:** Quarterly\n\n`;
  doc += `## Purpose\n\n`;
  doc += `This Standard Operating Procedure defines the step-by-step process for ${name.toLowerCase()}. `;
  doc += `Following this SOP ensures consistency, quality, and compliance across all engagements in the ${vertical.toLowerCase()} vertical.\n\n`;
  doc += `## Scope\n\n`;
  doc += `This SOP applies to all team members involved in ${vertical.toLowerCase()} operations. `;
  doc += `Contractors and temporary staff must also follow this procedure unless an approved exception is documented.\n\n`;
  doc += `## Prerequisites\n\n`;
  tools.forEach((t) => (doc += `- ${t}\n`));
  doc += `\n## Procedure\n\n`;

  steps.forEach((step, i) => {
    doc += `### Step ${i + 1}: ${step.title}\n\n`;
    doc += `${step.detail}\n\n`;
    doc += `**Expected Outcome:** Step ${i + 1} is completed successfully with all required data captured, verified, and logged.\n\n`;
    doc += `**Exception Handling:** If this step cannot be completed as specified, follow the exception escalation procedure `;
    doc += `defined in Step 8 (Exception Handling & Escalation). Document the issue in the Exceptions Register within 15 minutes.\n\n`;
    doc += `---\n\n`;
  });

  doc += `## Quality Assurance\n\n`;
  doc += `- [ ] All steps completed in sequence\n`;
  doc += `- [ ] Required approvals obtained\n`;
  doc += `- [ ] Documentation archived\n`;
  doc += `- [ ] Follow-up tasks scheduled\n\n`;
  doc += `## Related SOPs\n\n`;
  doc += `- Quality Control: Post-Execution Inspection\n`;
  doc += `- Client Communication Protocol\n`;
  doc += `- Issue Escalation Procedure\n`;
  doc += `- Documentation Standards & Archiving\n\n`;
  doc += `## Revision History\n\n`;
  doc += `| Date | Version | Author | Changes |\n`;
  doc += `|------|---------|--------|--------|\n`;
  doc += `| 2026-05-08 | 1.0.0 | VerticalPlaybook | Initial release |\n`;

  return doc;
}

function generateAutomation(name, index, vertical) {
  return JSON.stringify(
    {
      name,
      id: `AUT-${String(index + 1).padStart(3, "0")}`,
      version: "1.0.0",
      vertical,
      trigger: {
        type: ["schedule", "webhook", "form_submission", "database_change"][index % 4],
        description: `Triggers when conditions for "${name}" are met.`,
        schedule: index % 4 === 0 ? "0 8 * * 1-5" : null,
        webhookPath: index % 4 === 1 ? `/api/automations/${slugify(name)}` : null,
      },
      actions: [
        {
          order: 1,
          type: "notification",
          target: "assigned_user",
          template: `Automation "${name}" has been triggered.`,
        },
        {
          order: 2,
          type: "task_create",
          target: "project_management",
          template: `Complete action for: ${name}`,
          assignee: "role:operator",
          dueInHours: 24,
        },
        {
          order: 3,
          type: "log_event",
          target: "audit_log",
          data: {
            automation: name,
            timestamp: "{{trigger.timestamp}}",
            triggeredBy: "{{trigger.source}}",
          },
        },
      ],
      conditions: [
        { field: "business_hours", operator: "equals", value: true },
        { field: "client_active", operator: "equals", value: true },
      ],
      errorHandling: {
        retryCount: 3,
        retryDelayMinutes: 5,
        escalationEmail: "ops@company.com",
        fallbackAction: "create_manual_task",
      },
    },
    null,
    2,
  );
}

function generateN8nFlow(name, index, vertical) {
  const id = `N8N-${String(index + 1).padStart(3, "0")}`;
  const route = slugify(name);

  const validateCode = [
    "// Validate incoming payload",
    "const required = ['clientId', 'timestamp', 'action', 'payload'];",
    "const missing = [];",
    "for (const field of required) {",
    "  if (!item.json[field]) missing.push(field);",
    "}",
    "if (missing.length > 0) {",
    "  throw new Error('Missing required fields: ' + missing.join(', '));",
    "}",
    "const ts = new Date(item.json.timestamp);",
    "if (isNaN(ts.getTime())) throw new Error('Invalid timestamp');",
    "const allowed = ['create', 'update', 'delete', 'query', 'process'];",
    "if (!allowed.includes(item.json.action)) {",
    "  throw new Error('Invalid action: ' + item.json.action);",
    "}",
    "return item;",
  ].join("\n");

  const logCode = [
    "// Log workflow entry",
    "const logEntry = {",
    `  workflow: "${name}",`,
    `  workflowId: "${id}",`,
    "  clientId: item.json.clientId,",
    "  action: item.json.action,",
    "  timestamp: new Date().toISOString(),",
    "  nodeVersion: '1.0.0',",
    "  environment: process.env.NODE_ENV || 'production',",
    "  correlationId: item.json.correlationId || crypto.randomUUID(),",
    "};",
    "console.log('[Workflow Start]', JSON.stringify(logEntry));",
    "item.json._logEntry = logEntry;",
    "return item;",
  ].join("\n");

  const processCode = [
    "// Core processing logic",
    "const { clientId, action, payload, _logEntry } = item.json;",
    "let result;",
    "switch (action) {",
    "  case 'create':",
    "    result = { status: 'created', id: crypto.randomUUID(), data: payload };",
    "    break;",
    "  case 'update':",
    "    result = { status: 'updated', id: payload.id || clientId, changes: payload };",
    "    break;",
    "  case 'delete':",
    "    result = { status: 'deleted', id: payload.id || clientId };",
    "    break;",
    "  case 'query':",
    "    result = { status: 'queried', filters: payload, timestamp: new Date().toISOString() };",
    "    break;",
    "  default:",
    `    result = { status: 'processed', workflow: "${name}", processedAt: new Date().toISOString(), clientId, correlationId: _logEntry.correlationId };`,
    "}",
    "return { json: { ...result, _logEntry } };",
  ].join("\n");

  const enrichCode = [
    "// Enrich with business context",
    "const enriched = {",
    "  ...item.json,",
    "  enrichedAt: new Date().toISOString(),",
    "  businessHours: (() => {",
    "    const h = new Date().getHours();",
    "    const d = new Date().getDay();",
    "    return d >= 1 && d <= 5 && h >= 8 && h <= 18;",
    "  })(),",
    "  fiscalQuarter: Math.ceil((new Date().getMonth() + 1) / 3),",
    "  processingDuration: Date.now() - new Date(item.json._logEntry.timestamp).getTime(),",
    "  retryCount: 0,",
    "  slaStatus: 'within_target',",
    "};",
    "return { json: enriched };",
  ].join("\n");

  const errorCode = [
    "// Global error handler",
    "const error = {",
    `  workflow: "${name}",`,
    `  workflowId: "${id}",`,
    "  errorMessage: $input.first().json.message || 'Unknown error',",
    "  timestamp: new Date().toISOString(),",
    "  nodeVersion: '1.0.0',",
    "};",
    "console.error('[Workflow Error]', JSON.stringify(error));",
    "return { json: error };",
  ].join("\n");

  const flow = {
    name,
    id,
    version: "1.0.0",
    vertical,
    description: `Automated workflow for ${name} in the ${vertical} vertical. Handles end-to-end processing with validation, transformation, notification, and logging.`,
    settings: {
      saveManualExecutions: true,
      callerPolicy: "workflowsFromSameOwner",
      timezone: "America/Chicago",
      saveDataErrorExecution: "all",
      saveDataSuccessExecution: "all",
      saveExecutionProgress: true,
    },
    nodes: [
      {
        name: "Trigger",
        type: "n8n-nodes-base.webhook",
        position: [250, 300],
        parameters: { path: route, responseMode: "responseNode", authentication: "none", httpMethod: "POST", responseContentType: "application/json" },
      },
      {
        name: "Validate Input",
        type: "n8n-nodes-base.function",
        position: [450, 300],
        parameters: { functionCode: validateCode },
      },
      {
        name: "Log Entry",
        type: "n8n-nodes-base.function",
        position: [650, 300],
        parameters: { functionCode: logCode },
      },
      {
        name: "Process Data",
        type: "n8n-nodes-base.function",
        position: [850, 300],
        parameters: { functionCode: processCode },
      },
      {
        name: "Data Enrichment",
        type: "n8n-nodes-base.function",
        position: [1050, 300],
        parameters: { functionCode: enrichCode },
      },
      {
        name: "Notify Stakeholders",
        type: "n8n-nodes-base.emailSend",
        position: [1250, 200],
        parameters: {
          fromEmail: "workflows@verticalplaybook.com",
          toEmail: '={{$node["Trigger"].json.stakeholderEmail}}',
          subject: "[VerticalPlaybook] " + name + " — Action Completed",
          text: 'The workflow "' + name + '" has completed for client {{$node["Trigger"].json.clientId}}.',
          options: { appendAttribution: false },
        },
      },
      {
        name: "Slack Notification",
        type: "n8n-nodes-base.slack",
        position: [1250, 400],
        parameters: {
          resource: "message",
          operation: "post",
          channel: "#operations",
          text: ':white_check_mark: Workflow "' + name + '" completed for client {{$node["Trigger"].json.clientId}}',
          otherOptions: { username: "VerticalPlaybook Bot" },
        },
      },
      {
        name: "Log & Respond",
        type: "n8n-nodes-base.respondToWebhook",
        position: [1450, 300],
        parameters: {
          respondWith: "json",
          responseBody: '{"success":true,"workflow":"' + name + '"}',
          responseCode: 200,
        },
      },
      {
        name: "Error Handler",
        type: "n8n-nodes-base.function",
        position: [250, 500],
        parameters: { functionCode: errorCode },
      },
    ],
    connections: {
      Trigger: { main: [[{ node: "Validate Input", type: "main", index: 0 }]] },
      "Validate Input": { main: [[{ node: "Log Entry", type: "main", index: 0 }]] },
      "Log Entry": { main: [[{ node: "Process Data", type: "main", index: 0 }]] },
      "Process Data": { main: [[{ node: "Data Enrichment", type: "main", index: 0 }]] },
      "Data Enrichment": {
        main: [[{ node: "Notify Stakeholders", type: "main", index: 0 }, { node: "Slack Notification", type: "main", index: 0 }]],
      },
      "Notify Stakeholders": { main: [[{ node: "Log & Respond", type: "main", index: 0 }]] },
      "Slack Notification": { main: [[{ node: "Log & Respond", type: "main", index: 0 }]] },
      "Error Handler": { main: [[]] },
    },
  };

  return JSON.stringify(flow, null, 2);
}

function generatePromptPack(name, index, vertical) {
  const pad = String(index + 1).padStart(3, "0");

  let doc = "";
  doc += `# ${name}\n\n`;
  doc += `**Vertical:** ${vertical}\n`;
  doc += `**Pack ID:** PP-${pad}\n`;
  doc += `**Version:** 1.0.0\n`;
  doc += `**Prompt Count:** 5\n\n`;
  doc += `## Overview\n\n`;
  doc += `This prompt pack provides AI-assisted workflows for ${name.toLowerCase()} in the ${vertical.toLowerCase()} vertical. `;
  doc += `Use these prompts with ChatGPT, Claude, or any LLM that supports system/user message patterns.\n\n`;
  doc += `---\n\n`;

  const prompts = [
    {
      title: "Context Setup",
      prompt: `You are an expert ${vertical.toLowerCase()} operations consultant helping a business implement best practices. Your task is to assist with ${name.toLowerCase()}. Provide actionable, specific guidance that a practitioner can follow immediately. Use industry-standard terminology and reference relevant regulations where applicable.`,
      example: `Here's an example of what this prompt produces:\n\n---\n\n# ${name}: Expert Guidance\n\n## Key Principles\n1. **Standardization First** — Before automating, ensure all manual processes are documented and standardized across the team.\n2. **Data Integrity** — Every step that touches data must include validation checks.\n3. **Client Communication** — Keep clients informed at key milestones.\n4. **Compliance by Design** — Build regulatory checks into the process.\n\n## Immediate Next Steps\n- Map your current ${name.toLowerCase()} workflow on a whiteboard before touching any system.\n- Identify the 3 biggest pain points in your current process.\n- Assign a single owner for each major step.`,
    },
    {
      title: "Template Generation",
      prompt: `Generate a professional template for ${name.toLowerCase()} in the ${vertical.toLowerCase()} industry. Include all standard sections, placeholder text that guides the user, and annotations explaining what goes in each section. Format the output as clean Markdown.`,
      example: `Example output structure:\n\n---\n\n# [Document Title]\n\n**Prepared by:** [Name]  \n**Date:** [YYYY-MM-DD]  \n**Client:** [Client Name]  \n\n## Executive Summary\n[2-3 sentence overview of the document's purpose and key findings]\n\n## Section 1: Current State Assessment\n[Describe the current situation, including relevant metrics and observations]\n\n## Section 2: Analysis & Findings\n[Present your analysis, supported by data and methodology notes]\n\n> **Annotation:** Use tables for numerical comparisons and bullet points for qualitative findings.\n\n## Section 3: Recommendations\n[Prioritized list of recommended actions with rationale]\n\n## Section 4: Implementation Timeline\n| Phase | Action | Owner | Due Date | Status |\n|-------|--------|-------|----------|--------|\n| 1     |        |       |          |        |\n| 2     |        |       |          |        |`,
    },
    {
      title: "Troubleshooting Guide",
      prompt: `A ${vertical.toLowerCase()} professional is experiencing issues with ${name.toLowerCase()}. They describe the problem as: [INSERT PROBLEM]. Provide a structured troubleshooting approach with: 1) Likely causes (ranked by probability), 2) Diagnostic steps, 3) Resolution procedures, and 4) Prevention measures.`,
      example: `Example for a common issue:\n\n---\n\n# Troubleshooting: [Problem Description]\n\n## Likely Causes (by probability)\n1. **Configuration mismatch (40%)** — Environment variables or API keys are incorrect or expired.\n2. **Data quality issue (30%)** — Input data contains unexpected values or formats.\n3. **Dependency failure (20%)** — An upstream service or integration is unavailable.\n4. **Resource exhaustion (10%)** — Rate limits, memory, or disk space have been exceeded.\n\n## Diagnostic Steps\n1. Check the application logs for error messages (last 15 minutes).\n2. Verify all environment variables and credentials.\n3. Run the health check script: \`./scripts/health-check.sh\`\n4. Test the affected endpoint with a minimal valid payload.\n\n## Resolution\n[Step-by-step fix instructions based on the identified cause]\n\n## Prevention\n- Add automated health checks that run every 30 minutes.\n- Set up alerts for credential expiration (14 days before expiry).\n- Implement input validation at every API boundary.`,
    },
    {
      title: "Client Communication",
      prompt: `Draft a professional email to a client about ${name.toLowerCase()} in the ${vertical.toLowerCase()} context. The tone should be [choose: reassuring / urgent / informational]. Include: subject line, greeting, body with clear next steps, and closing. Keep it concise but thorough.`,
      example: `Example email output:\n\n---\n\n**Subject:** Update: ${name} — Next Steps\n\nHi [Client Name],\n\nI wanted to share a quick update on ${name.toLowerCase()}.\n\nWe've completed [milestone/phase] and the key outcomes are:\n- [Key result 1]\n- [Key result 2]\n- [Key result 3]\n\n**Next Steps:**\n1. [Action item with owner and due date]\n2. [Action item with owner and due date]\n\nWe're on track to deliver [final deliverable] by [date]. I'll send another update by [next check-in date].\n\nIf you have any questions in the meantime, please don't hesitate to reach out.\n\nBest regards,\n[Your Name]\n[Your Title] | [Company Name]`,
    },
    {
      title: "Training Module Outline",
      prompt: `Create a 30-minute training module outline for ${name.toLowerCase()} targeting new ${vertical.toLowerCase()} team members. Include: learning objectives, key concepts, hands-on exercises, assessment questions, and suggested follow-up resources.`,
      example: `Example training module:\n\n---\n\n# Training Module: ${name}\n\n**Duration:** 30 minutes  \n**Audience:** New ${vertical} team members  \n**Prerequisites:** Basic ${vertical} operations knowledge\n\n## Learning Objectives\nBy the end of this module, participants will be able to:\n1. Explain the purpose and scope of ${name.toLowerCase()}.\n2. Execute the procedure following the SOP checklist.\n3. Identify common errors and apply the correct resolution.\n4. Document their work according to documentation standards.\n\n## Key Concepts (10 min)\n- [Concept 1 with brief explanation]\n- [Concept 2 with brief explanation]\n- [Concept 3 with brief explanation]\n\n## Hands-On Exercise (15 min)\nParticipants will execute a simulated ${name.toLowerCase()} scenario using the sandbox environment. The exercise covers data input and validation, core processing, exception handling, and documentation.\n\n## Assessment (5 min)\n1. Q: [Question about a critical step]\n2. Q: [Question about an exception scenario]\n3. Q: [Question about documentation requirements]\n\n## Follow-Up Resources\n- SOP document: [Link]\n- Video walkthrough: [Link]\n- FAQ: [Link]`,
    },
  ];

  prompts.forEach((p, i) => {
    doc += `## Prompt ${i + 1}: ${p.title}\n\n`;
    doc += `### Prompt\n\n\`\`\`\n${p.prompt}\n\`\`\`\n\n`;
    doc += `### Example Output\n\n${p.example}\n\n---\n\n`;
  });

  doc += `## Usage Notes\n\n`;
  doc += `- Replace bracketed placeholders like [INSERT PROBLEM] with actual context before sending.\n`;
  doc += `- The example outputs show you what to expect — adjust tone and detail for your specific situation.\n`;
  doc += `- For best results, provide 1-2 examples of desired output format alongside the prompt.\n`;
  doc += `- These prompts work best with GPT-4o, Claude 3.5 Sonnet, and above.\n`;
  doc += `- Always review AI-generated content before client delivery.\n`;
  doc += `- Store your customized versions of these prompts in your team's shared prompt library.\n\n`;
  doc += `## Prompt Engineering Tips\n\n`;
  doc += `1. **Be Specific** — Replace generic placeholders with concrete details about your client, industry, and situation.\n`;
  doc += `2. **Set Constraints** — Add word count limits, formatting requirements, or tone guidelines as needed.\n`;
  doc += `3. **Iterate** — Run the prompt, review the output, tweak the prompt, and repeat until you get the quality you need.\n`;
  doc += `4. **Chain Prompts** — Use the output of one prompt as input to another for complex multi-step workflows.\n`;
  doc += `5. **Version Your Prompts** — Keep track of which prompt version produced which output for auditability.\n`;

  return doc;
}

// ── Bundle definitions ──────────────────────────────────────────────────────

const bundles = {
  "hvac-fall-startup": {
    vertical: "HVAC",
    sops: [
      "Pre-Season Equipment Inventory Audit",
      "Furnace Heat Exchanger Inspection",
      "Thermostat Calibration & Programming",
      "Ductwork Leakage Test Procedure",
      "Refrigerant Charge Verification",
      "Condensate Drain Cleaning & Treatment",
      "Blower Motor Amperage Draw Test",
      "Gas Valve Pressure Check & Adjustment",
      "Flame Sensor Cleaning Protocol",
      "Carbon Monoxide Safety Test",
      "Air Filter Replacement Schedule Setup",
      "Customer Fall Maintenance Agreement Presentation",
      "Dispatch Route Optimization for Fall Season",
      "Technician Truck Stock Checklist — Fall Edition",
      "After-Hours Emergency Call Protocol",
      "Customer Communication: Fall Readiness Email",
      "Seasonal Promotion: Furnace Tune-Up Special",
      "Warranty Registration Tracking Process",
      "Parts Ordering & Inventory Replenishment",
      "Quality Control: Post-Service Inspection",
      "Technician Training: New Fall Procedures",
      "Customer Satisfaction Follow-Up Call Script",
      "Google Business Profile Review Request Flow",
      "Fall Season KPI Dashboard Setup",
      "Equipment Replacement Lead Qualification",
      "Financing Option Presentation for Replacements",
      "Subcontractor Management for Overflow Work",
      "End-of-Season Wrap-Up & Lessons Learned",
    ],
    automations: [
      "Fall Tune-Up Campaign Trigger",
      "Appointment Confirmation SMS",
      "Technician Arrival Notification",
      "Service Report Auto-Generation",
      "Maintenance Agreement Renewal Reminder",
      "Parts Low-Stock Alert",
      "Google Review Request After Service",
      "Customer Reactivation for Lapsed Clients",
      "Technician Performance Weekly Digest",
      "Invoice Follow-Up for Unpaid Invoices",
      "Seasonal Email Nurture Sequence",
      "New Lead Auto-Assignment",
      "Warranty Expiration Alert",
      "Emergency Call Routing",
    ],
    n8nFlows: [
      "Fall Tune-Up Campaign Orchestrator",
      "Service Dispatch to Technician Sync",
      "Customer Communication Hub",
      "Invoice Generation & Delivery",
      "Review Collection & Reputation Monitor",
      "Inventory Reorder Trigger",
      "Technician Scorecard Generator",
      "Lead Intake from Website Form",
      "Maintenance Agreement Lifecycle Manager",
    ],
    promptPacks: [
      "Fall Maintenance Email Copy",
      "Customer Reactivation Scripts",
      "Technician Training Quiz Generator",
      "Social Media Seasonal Content Calendar",
    ],
  },
  "marketing-agency-d1-30": {
    vertical: "Marketing Agency",
    sops: [
      "Pre-Onboarding Client Questionnaire",
      "Kickoff Call Agenda & Facilitation Guide",
      "Brand Asset Collection Checklist",
      "Competitive Landscape Analysis Template",
      "Client Goal Setting & KPI Framework",
      "Tools & Platform Access Setup",
      "Creative Brief Template & Process",
      "Content Calendar Creation Protocol",
      "Ad Account Audit & Restructuring",
      "SEO Technical Audit Procedure",
      "Analytics & Tracking Implementation",
      "Week 1 Internal Team Alignment",
      "Client Reporting Dashboard Setup",
      "D7 Checkpoint: Strategy Approval",
      "D14 Campaign Launch Checklist",
      "D21 Performance Review & Optimization",
      "D30 QBR Preparation & Delivery",
      "Client Handoff to Account Management",
      "Onboarding Feedback Survey",
      "Internal Retrospective: What Went Well",
      "Failed Onboarding Recovery Protocol",
      "Multi-Location Client Onboarding Addendum",
    ],
    automations: [
      "Welcome Email Sequence Trigger",
      "Client Portal Account Provisioning",
      "Reporting Dashboard Auto-Generation",
      "Task Assignment from Onboarding Template",
      "Client Approval Reminder Escalation",
      "Campaign Launch Countdown Notifications",
      "D7/14/21/30 Checkpoint Reminders",
      "Asset Collection Status Tracker",
      "Client Satisfaction Pulse Survey",
      "Internal Resource Allocation Alert",
      "Tools Access Audit Log",
      "Onboarding Completion Certificate Generator",
    ],
    n8nFlows: [
      "Client Onboarding Orchestrator",
      "Asset Collection & Validation Pipeline",
      "Reporting Data Aggregator",
      "Multi-Platform Campaign Launch",
      "Client Communication Cadence Manager",
      "Internal Team Notification Router",
      "QBR Deck Auto-Population",
    ],
    promptPacks: [
      "Client Discovery Question Bank",
      "Campaign Strategy One-Pager Templates",
      "QBR Executive Summary Generator",
    ],
  },
  "accounting-year-end": {
    vertical: "Accounting",
    sops: [
      "Year-End Close Timeline & Calendar",
      "Trial Balance Review & Reconciliation",
      "Bank Reconciliation — All Accounts",
      "Accounts Receivable Aging Review",
      "Accounts Payable Accrual Check",
      "Fixed Assets Depreciation Schedule",
      "Inventory Valuation & Adjustment",
      "Prepaid Expenses Amortization",
      "Accrued Liabilities Estimate",
      "Payroll Tax Reconciliation",
      "Sales Tax Liability Verification",
      "Intercompany Transaction Elimination",
      "Adjusting Journal Entry Preparation",
      "Financial Statement Draft Review",
      "Tax Provision Calculation",
      "Client Deliverable Packaging",
      "Year-End Client Meeting Agenda",
      "Tax Season Handoff to Preparer",
      "Engagement Letter Renewal Process",
    ],
    automations: [
      "Year-End Checklist Task Generator",
      "Missing Document Client Reminder",
      "Reconciliation Flag Escalation",
      "Trial Balance Variance Alert",
      "Financial Statement Draft Notification",
      "Client Portal Document Request",
      "Tax Return Status Tracker",
      "Engagement Letter Renewal Reminder",
    ],
    n8nFlows: [
      "Year-End Close Orchestrator",
      "Client Document Collection Pipeline",
      "Financial Statement Generator",
      "Tax Prep Handoff Workflow",
      "Client Communication Scheduler",
    ],
    promptPacks: [
      "Client Year-End Letter Templates",
      "Financial Statement Notes Generator",
      "Tax Planning Memo Templates",
      "Internal Review Checklist Prompts",
      "Client Meeting Agenda Builder",
    ],
  },
};

// ── Main ────────────────────────────────────────────────────────────────────

function main() {
  for (const [slug, bundle] of Object.entries(bundles)) {
    const base = path.join(BUNDLES_DIR, slug);
    console.log(`Generating content for ${slug}...`);

    // SOPs
    for (let i = 0; i < bundle.sops.length; i++) {
      const content = generateSOP(bundle.sops[i], i, bundle.vertical);
      const filename = `SOP-${String(i + 1).padStart(3, "0")}-${slugify(bundle.sops[i])}.md`;
      fs.writeFileSync(path.join(base, "sops", filename), content);
    }

    // Automations
    for (let i = 0; i < bundle.automations.length; i++) {
      const content = generateAutomation(bundle.automations[i], i, bundle.vertical);
      const filename = `AUT-${String(i + 1).padStart(3, "0")}-${slugify(bundle.automations[i])}.json`;
      fs.writeFileSync(path.join(base, "automations", filename), content);
    }

    // n8n Flows
    for (let i = 0; i < bundle.n8nFlows.length; i++) {
      const content = generateN8nFlow(bundle.n8nFlows[i], i, bundle.vertical);
      const filename = `N8N-${String(i + 1).padStart(3, "0")}-${slugify(bundle.n8nFlows[i])}.json`;
      fs.writeFileSync(path.join(base, "n8n-flows", filename), content);
    }

    // Prompt Packs
    for (let i = 0; i < bundle.promptPacks.length; i++) {
      const content = generatePromptPack(bundle.promptPacks[i], i, bundle.vertical);
      const filename = `PP-${String(i + 1).padStart(3, "0")}-${slugify(bundle.promptPacks[i])}.md`;
      fs.writeFileSync(path.join(base, "prompt-packs", filename), content);
    }

    const countFiles = (dir) => fs.readdirSync(dir).length;
    console.log(`  ${slug}:`);
    console.log(`    sops: ${countFiles(path.join(base, "sops"))} files`);
    console.log(`    automations: ${countFiles(path.join(base, "automations"))} files`);
    console.log(`    n8n-flows: ${countFiles(path.join(base, "n8n-flows"))} files`);
    console.log(`    prompt-packs: ${countFiles(path.join(base, "prompt-packs"))} files`);
  }

  console.log("\nDone generating bundle content.");
}

main();
