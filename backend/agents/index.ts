/**
 * Agents Module Index
 * Reusable agent roles mapping parameters to state analysis workflows
 */

export const AGENT_ROLES = {
  SAFETY_AUDITOR: {
    name: "Zone Safety Audit Agent",
    objective: "Scrutinize hard-hat helmet counts against workers detected, and flag PPE violations.",
    capabilities: ["image_processing", "safety_issue_detection", "ppe_audit"]
  },
  MATERIAL_INSPECTOR: {
    name: "Site Resources Inspector",
    objective: "Identify construction material items lying visible on site and audit aggregate supplies.",
    capabilities: ["materials_classification", "inventory_logging"]
  },
  CROSS_CHANNEL_COMPARATOR: {
    name: "Telemetry Integration Node",
    objective: "Compare counts across WhatsApp user photos, CCTV live feeds, and uploaded mp4 videos.",
    capabilities: ["variance_scoring", "confidence_weighting", "report_generation"]
  }
};
