import type { Department, Priority, RequestType, TriageResult } from "@/lib/intake/types";

function pickDepartment(text: string): { value: Department; rationale: string } {
  if (/translation|german|japanese|localized|regional/i.test(text)) {
    return {
      value: "Localization",
      rationale: "Detected localization keywords such as translation or language references.",
    };
  }

  if (/api docs|oauth|code sample|developer|authentication/i.test(text)) {
    return {
      value: "Engineering",
      rationale: "Detected technical documentation language tied to engineering workflows.",
    };
  }

  if (/compliance|soc 2|legal review|procurement|policy/i.test(text)) {
    return {
      value: "Compliance",
      rationale: "Detected compliance and legal review terms.",
    };
  }

  if (/mockup|dashboard|visual|screenshots|design/i.test(text)) {
    return {
      value: "Design",
      rationale: "Detected design and mockup language.",
    };
  }

  if (/case study|blog post|webinar|social|announcement|battlecard/i.test(text)) {
    return {
      value: "Marketing",
      rationale: "Detected content marketing language such as blog, webinar, or announcement.",
    };
  }

  if (/renewal|customer|adoption|qbr|help center/i.test(text)) {
    return {
      value: "Customer Success",
      rationale: "Detected customer-facing lifecycle terms such as renewal, QBR, or adoption.",
    };
  }

  return {
    value: "Operations",
    rationale: "No strong domain cues were found, so the request falls back to operations review.",
  };
}

function pickRequestType(text: string): { value: RequestType; rationale: string } {
  if (/case study/i.test(text)) return { value: "Case Study", rationale: "Contains case study language." };
  if (/translation|german|japanese/i.test(text)) return { value: "Translation", rationale: "Contains language localization terms." };
  if (/webinar/i.test(text)) return { value: "Webinar Copy", rationale: "References webinar copy or promotion." };
  if (/announcement|customer win/i.test(text)) return { value: "Announcement", rationale: "References an announcement or customer win." };
  if (/mockup|dashboard/i.test(text)) return { value: "Dashboard Mockup", rationale: "References dashboard visual work." };
  if (/compliance|checklist|legal/i.test(text)) return { value: "Compliance Review", rationale: "References compliance review work." };
  if (/api docs|oauth|documentation|code sample/i.test(text)) return { value: "Documentation", rationale: "References documentation work." };
  if (/changelog|release|update/i.test(text)) return { value: "Product Update", rationale: "References a release or changelog update." };
  if (/design asset/i.test(text)) return { value: "Design Asset", rationale: "References a design asset." };
  return { value: "Blog Post", rationale: "Defaulted to a content creation request." };
}

function pickPriority(text: string): { value: Priority; rationale: string } {
  if (/critical|blocking|blocker|launch timeline|urgent|legal review/i.test(text)) {
    return {
      value: "Critical",
      rationale: "Urgency and blocker language indicates a critical request.",
    };
  }

  if (/customer integration|renewal|next week|before launch|approved quotes yesterday/i.test(text)) {
    return {
      value: "High",
      rationale: "Time-sensitive business context suggests high priority.",
    };
  }

  if (/qbr|reseller training|dashboard rollout/i.test(text)) {
    return {
      value: "Medium",
      rationale: "Important but not explicitly blocking language suggests medium priority.",
    };
  }

  return {
    value: "Low",
    rationale: "No strong urgency signals were found.",
  };
}

function buildSummary(title: string, description: string, notes: string) {
  const sentence = `${title}. ${description}`.trim();
  const compact = sentence.replace(/\s+/g, " ");
  if (compact.length <= 140) return compact;
  return `${compact.slice(0, 137)}...`;
}

export function runMockTriage(input: { title: string; description: string; notes: string }): TriageResult {
  const combined = `${input.title} ${input.description} ${input.notes}`.trim();
  const department = pickDepartment(combined);
  const requestType = pickRequestType(combined);
  const priority = pickPriority(combined);

  let confidence = 0.62;
  if (department.value !== "Operations") confidence += 0.08;
  if (requestType.value !== "Blog Post") confidence += 0.08;
  if (priority.value === "Critical" || priority.value === "High") confidence += 0.05;
  confidence = Math.min(confidence, 0.94);

  return {
    summary: buildSummary(input.title, input.description, input.notes),
    department: department.value,
    requestType: requestType.value,
    priority: priority.value,
    confidence,
    rationale: `${department.rationale} ${requestType.rationale} ${priority.rationale}`,
  };
}
