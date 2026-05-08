# Client Discovery Question Bank

**Vertical:** Marketing Agency
**Pack ID:** PP-001
**Version:** 1.0.0
**Prompt Count:** 5

## Overview

This prompt pack provides AI-assisted workflows for client discovery question bank in the marketing agency vertical. Use these prompts with ChatGPT, Claude, or any LLM that supports system/user message patterns.

---

## Prompt 1: Context Setup

### Prompt

```
You are an expert marketing agency operations consultant helping a business implement best practices. Your task is to assist with client discovery question bank. Provide actionable, specific guidance that a practitioner can follow immediately. Use industry-standard terminology and reference relevant regulations where applicable.
```

### Example Output

Here's an example of what this prompt produces:

---

# Client Discovery Question Bank: Expert Guidance

## Key Principles
1. **Standardization First** — Before automating, ensure all manual processes are documented and standardized across the team.
2. **Data Integrity** — Every step that touches data must include validation checks.
3. **Client Communication** — Keep clients informed at key milestones.
4. **Compliance by Design** — Build regulatory checks into the process.

## Immediate Next Steps
- Map your current client discovery question bank workflow on a whiteboard before touching any system.
- Identify the 3 biggest pain points in your current process.
- Assign a single owner for each major step.

---

## Prompt 2: Template Generation

### Prompt

```
Generate a professional template for client discovery question bank in the marketing agency industry. Include all standard sections, placeholder text that guides the user, and annotations explaining what goes in each section. Format the output as clean Markdown.
```

### Example Output

Example output structure:

---

# [Document Title]

**Prepared by:** [Name]  
**Date:** [YYYY-MM-DD]  
**Client:** [Client Name]  

## Executive Summary
[2-3 sentence overview of the document's purpose and key findings]

## Section 1: Current State Assessment
[Describe the current situation, including relevant metrics and observations]

## Section 2: Analysis & Findings
[Present your analysis, supported by data and methodology notes]

> **Annotation:** Use tables for numerical comparisons and bullet points for qualitative findings.

## Section 3: Recommendations
[Prioritized list of recommended actions with rationale]

## Section 4: Implementation Timeline
| Phase | Action | Owner | Due Date | Status |
|-------|--------|-------|----------|--------|
| 1     |        |       |          |        |
| 2     |        |       |          |        |

---

## Prompt 3: Troubleshooting Guide

### Prompt

```
A marketing agency professional is experiencing issues with client discovery question bank. They describe the problem as: [INSERT PROBLEM]. Provide a structured troubleshooting approach with: 1) Likely causes (ranked by probability), 2) Diagnostic steps, 3) Resolution procedures, and 4) Prevention measures.
```

### Example Output

Example for a common issue:

---

# Troubleshooting: [Problem Description]

## Likely Causes (by probability)
1. **Configuration mismatch (40%)** — Environment variables or API keys are incorrect or expired.
2. **Data quality issue (30%)** — Input data contains unexpected values or formats.
3. **Dependency failure (20%)** — An upstream service or integration is unavailable.
4. **Resource exhaustion (10%)** — Rate limits, memory, or disk space have been exceeded.

## Diagnostic Steps
1. Check the application logs for error messages (last 15 minutes).
2. Verify all environment variables and credentials.
3. Run the health check script: `./scripts/health-check.sh`
4. Test the affected endpoint with a minimal valid payload.

## Resolution
[Step-by-step fix instructions based on the identified cause]

## Prevention
- Add automated health checks that run every 30 minutes.
- Set up alerts for credential expiration (14 days before expiry).
- Implement input validation at every API boundary.

---

## Prompt 4: Client Communication

### Prompt

```
Draft a professional email to a client about client discovery question bank in the marketing agency context. The tone should be [choose: reassuring / urgent / informational]. Include: subject line, greeting, body with clear next steps, and closing. Keep it concise but thorough.
```

### Example Output

Example email output:

---

**Subject:** Update: Client Discovery Question Bank — Next Steps

Hi [Client Name],

I wanted to share a quick update on client discovery question bank.

We've completed [milestone/phase] and the key outcomes are:
- [Key result 1]
- [Key result 2]
- [Key result 3]

**Next Steps:**
1. [Action item with owner and due date]
2. [Action item with owner and due date]

We're on track to deliver [final deliverable] by [date]. I'll send another update by [next check-in date].

If you have any questions in the meantime, please don't hesitate to reach out.

Best regards,
[Your Name]
[Your Title] | [Company Name]

---

## Prompt 5: Training Module Outline

### Prompt

```
Create a 30-minute training module outline for client discovery question bank targeting new marketing agency team members. Include: learning objectives, key concepts, hands-on exercises, assessment questions, and suggested follow-up resources.
```

### Example Output

Example training module:

---

# Training Module: Client Discovery Question Bank

**Duration:** 30 minutes  
**Audience:** New Marketing Agency team members  
**Prerequisites:** Basic Marketing Agency operations knowledge

## Learning Objectives
By the end of this module, participants will be able to:
1. Explain the purpose and scope of client discovery question bank.
2. Execute the procedure following the SOP checklist.
3. Identify common errors and apply the correct resolution.
4. Document their work according to documentation standards.

## Key Concepts (10 min)
- [Concept 1 with brief explanation]
- [Concept 2 with brief explanation]
- [Concept 3 with brief explanation]

## Hands-On Exercise (15 min)
Participants will execute a simulated client discovery question bank scenario using the sandbox environment. The exercise covers data input and validation, core processing, exception handling, and documentation.

## Assessment (5 min)
1. Q: [Question about a critical step]
2. Q: [Question about an exception scenario]
3. Q: [Question about documentation requirements]

## Follow-Up Resources
- SOP document: [Link]
- Video walkthrough: [Link]
- FAQ: [Link]

---

## Usage Notes

- Replace bracketed placeholders like [INSERT PROBLEM] with actual context before sending.
- The example outputs show you what to expect — adjust tone and detail for your specific situation.
- For best results, provide 1-2 examples of desired output format alongside the prompt.
- These prompts work best with GPT-4o, Claude 3.5 Sonnet, and above.
- Always review AI-generated content before client delivery.
- Store your customized versions of these prompts in your team's shared prompt library.

## Prompt Engineering Tips

1. **Be Specific** — Replace generic placeholders with concrete details about your client, industry, and situation.
2. **Set Constraints** — Add word count limits, formatting requirements, or tone guidelines as needed.
3. **Iterate** — Run the prompt, review the output, tweak the prompt, and repeat until you get the quality you need.
4. **Chain Prompts** — Use the output of one prompt as input to another for complex multi-step workflows.
5. **Version Your Prompts** — Keep track of which prompt version produced which output for auditability.
