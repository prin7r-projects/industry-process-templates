/**
 * Lightweight markdown renderer for SOP content.
 * Handles the SOP document format: headings, bold, lists, horizontal rules, paragraphs.
 * Does NOT use a full markdown library to avoid new dependencies per anti-stall rules.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderInline(line: string): string {
  // Bold: **text**
  line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Inline code: `code`
  line = line.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Italic: *text*
  line = line.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return line;
}

export function renderMarkdown(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Blank line — close open list/table
    if (trimmed === "") {
      if (inTable) {
        html.push("</tbody></table>");
        inTable = false;
      }
      if (inList) {
        html.push(inList === "ul" ? "</ul>" : "</ol>");
        inList = null;
      }
      continue;
    }

    // Table row: | col1 | col2 |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Skip separator rows (|---|---|)
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue;

      const cells = trimmed
        .split("|")
        .filter((c) => c.trim() !== "")
        .map((c) => renderInline(escapeHtml(c.trim())));

      if (!inTable) {
        html.push('<table><thead><tr>');
        html.push(cells.map((c) => `<th>${c}</th>`).join(""));
        html.push("</tr></thead><tbody>");
        inTable = true;
      } else {
        html.push(`<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`);
      }
      continue;
    }

    // Close table if non-table line encountered
    if (inTable) {
      html.push("</tbody></table>");
      inTable = false;
    }

    // Separator (horizontal rule): ---
    if (/^-{3,}$/.test(trimmed)) {
      if (inList) {
        html.push(inList === "ul" ? "</ul>" : "</ol>");
        inList = null;
      }
      html.push("<hr />");
      continue;
    }

    // Heading: ### text
    if (trimmed.startsWith("### ")) {
      if (inList) {
        html.push(inList === "ul" ? "</ul>" : "</ol>");
        inList = null;
      }
      html.push(`<h3>${renderInline(escapeHtml(trimmed.slice(4)))}</h3>`);
      continue;
    }
    if (trimmed.startsWith("## ")) {
      if (inList) {
        html.push(inList === "ul" ? "</ul>" : "</ol>");
        inList = null;
      }
      html.push(`<h2>${renderInline(escapeHtml(trimmed.slice(3)))}</h2>`);
      continue;
    }
    if (trimmed.startsWith("# ")) {
      if (inList) {
        html.push(inList === "ul" ? "</ul>" : "</ol>");
        inList = null;
      }
      html.push(`<h1>${renderInline(escapeHtml(trimmed.slice(2)))}</h1>`);
      continue;
    }

    // Ordered list: 1. text
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      if (inList !== "ol") {
        if (inList) html.push(inList === "ul" ? "</ul>" : "</ol>");
        html.push("<ol>");
        inList = "ol";
      }
      html.push(`<li>${renderInline(escapeHtml(olMatch[2]))}</li>`);
      continue;
    }

    // Unordered list: - text
    const ulMatch = trimmed.match(/^-\s+(.+)/);
    if (ulMatch) {
      if (inList !== "ul") {
        if (inList) html.push(inList === "ul" ? "</ul>" : "</ol>");
        html.push("<ul>");
        inList = "ul";
      }
      html.push(`<li>${renderInline(escapeHtml(ulMatch[1]))}</li>`);
      continue;
    }

    // Checkbox: - [ ] text or - [x] text
    const checkboxMatch = trimmed.match(/^- \[( |x)\] (.+)/);
    if (checkboxMatch) {
      const checked = checkboxMatch[1] === "x";
      html.push(
        `<div class="flex items-start gap-2 my-1"><input type="checkbox" ${checked ? "checked" : ""} disabled class="mt-1" /><span class="${checked ? "line-through text-muted-foreground" : ""}">${renderInline(escapeHtml(checkboxMatch[2]))}</span></div>`
      );
      continue;
    }

    // Regular paragraph
    html.push(`<p>${renderInline(escapeHtml(trimmed))}</p>`);
  }

  // Close any open containers
  if (inTable) html.push("</tbody></table>");
  if (inList) html.push(inList === "ul" ? "</ul>" : "</ol>");

  return html.join("\n");
}
