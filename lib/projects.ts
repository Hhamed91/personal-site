export type Project = {
  id: string;
  name: string;
  description: string;
  route: string;
  type: "technical" | "fun";
  tags?: string[];
  createdAt?: string;
};

// Source of truth for public project data.
export const projects: Project[] = [
  {
    id: "text-to-sql-in-progress",
    name: "Text-to-SQL RFT Demo - In progress",
    description:
      "Follow Fireworks AI's reinforcement fine-tuning playbook to turn natural language prompts into production-ready SQL.",
    route: "/projects/text-to-sql-in-progress",
    type: "technical",
    tags: ["Reinforcement FT", "DuckDB + MCP", "Synthetic data"],
    createdAt: "2025-02-10",
  },
  {
    id: "sql-validator",
    name: "SQL Validator",
    description:
      "A developer-friendly SQL syntax playground with sample data context, instant validation, and copy-ready results.",
    route: "/projects/sql-validator",
    type: "technical",
    tags: ["SQL validation", "Sample datasets", "Copyable output"],
    createdAt: "2025-01-20",
  },
  {
    id: "postman-collection",
    name: "Personal Site Public API + Postman Collection",
    description:
      "A clean, read-only API paired with a Postman collection that makes it easy to explore blogs and projects without authentication.",
    route: "/projects/postman-collection",
    type: "technical",
    tags: ["Public API", "Postman collection", "Documentation"],
    createdAt: "2024-12-15",
  },
  {
    id: "csv-report-pdf",
    name: "CSV → Clean Report PDF",
    description:
      "A Python pipeline that turns messy CSVs into a polished PDF with stats, warnings, and a cleaned export.",
    route: "/projects/csv-report-pdf",
    type: "technical",
    tags: ["ReportLab PDF", "Data validation", "Python + CSV"],
    createdAt: "2024-11-20",
  },
  {
    id: "toddler-funpage",
    name: "Toddler Funpage",
    description:
      "Multi-card playground for toddler-friendly interactions with a hosted demo.",
    route: "/projects/toddler-funpage",
    type: "fun",
    tags: ["Next.js", "Playful UI", "Micro-interaction"],
    createdAt: "2024-07-01",
  },
  {
    id: "snow-particle-lab",
    name: "Snow Particle Lab",
    description:
      "A snowflake generator playground that mixes randomized geometry, motion controls, and shareable presets.",
    route: "/projects/snow-particle-lab",
    type: "fun",
    tags: ["Particles", "Generative UI", "Interactive controls"],
    createdAt: "2024-06-10",
  },
];
