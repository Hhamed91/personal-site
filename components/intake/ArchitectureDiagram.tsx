export default function ArchitectureDiagram() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
      <svg viewBox="0 0 860 360" className="h-auto w-full">
        <defs>
          <linearGradient id="intakeBg" x1="0" x2="1">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>
        </defs>

        <rect x="20" y="24" width="170" height="86" rx="18" fill="#eff6ff" stroke="#93c5fd" />
        <rect x="20" y="136" width="170" height="86" rx="18" fill="#fefce8" stroke="#facc15" />
        <rect x="20" y="248" width="170" height="86" rx="18" fill="#ecfdf5" stroke="#86efac" />

        <rect x="248" y="80" width="170" height="200" rx="24" fill="url(#intakeBg)" stroke="#cbd5e1" />
        <rect x="472" y="36" width="160" height="88" rx="20" fill="#fff7ed" stroke="#fdba74" />
        <rect x="472" y="140" width="160" height="88" rx="20" fill="#f8fafc" stroke="#94a3b8" />
        <rect x="472" y="244" width="160" height="88" rx="20" fill="#eef2ff" stroke="#a5b4fc" />
        <rect x="688" y="52" width="148" height="72" rx="18" fill="#eff6ff" stroke="#60a5fa" />
        <rect x="688" y="144" width="148" height="72" rx="18" fill="#fef3c7" stroke="#f59e0b" />
        <rect x="688" y="236" width="148" height="72" rx="18" fill="#ecfccb" stroke="#84cc16" />

        <path d="M190 67 H236" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <path d="M190 179 H236" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <path d="M190 291 H236" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <path d="M418 180 H460" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <path d="M632 80 H676" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <path d="M632 184 H676" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <path d="M632 288 H676" stroke="#64748b" strokeWidth="2.5" markerEnd="url(#arrow)" />

        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#64748b" />
          </marker>
        </defs>

        <text x="44" y="56" className="fill-slate-900 text-[14px] font-semibold">
          Webhook Source
        </text>
        <text x="44" y="78" className="fill-slate-600 text-[12px]">
          PM tool payloads
        </text>
        <text x="44" y="100" className="fill-slate-600 text-[12px]">
          Variant keys + formats
        </text>

        <text x="44" y="168" className="fill-slate-900 text-[14px] font-semibold">
          CSV Import
        </text>
        <text x="44" y="190" className="fill-slate-600 text-[12px]">
          Sheet batch uploads
        </text>
        <text x="44" y="212" className="fill-slate-600 text-[12px]">
          Row-level status report
        </text>

        <text x="44" y="280" className="fill-slate-900 text-[14px] font-semibold">
          Native Form
        </text>
        <text x="44" y="302" className="fill-slate-600 text-[12px]">
          Internal structured intake
        </text>
        <text x="44" y="324" className="fill-slate-600 text-[12px]">
          Lowest-friction path
        </text>

        <text x="278" y="120" className="fill-slate-900 text-[16px] font-semibold">
          Intake Pipeline
        </text>
        <text x="278" y="150" className="fill-slate-700 text-[12px]">
          Raw Input
        </text>
        <text x="278" y="177" className="fill-slate-700 text-[12px]">
          Validation
        </text>
        <text x="278" y="204" className="fill-slate-700 text-[12px]">
          Mapping
        </text>
        <text x="278" y="231" className="fill-slate-700 text-[12px]">
          Normalization
        </text>
        <text x="278" y="258" className="fill-slate-700 text-[12px]">
          Deduplication
        </text>

        <text x="500" y="72" className="fill-slate-900 text-[14px] font-semibold">
          Canonical Requests
        </text>
        <text x="500" y="94" className="fill-slate-600 text-[12px]">
          Normalized record
        </text>
        <text x="500" y="106" className="fill-slate-600 text-[12px]">
          Raw + final values preserved
        </text>

        <text x="500" y="176" className="fill-slate-900 text-[14px] font-semibold">
          AI Triage Layer
        </text>
        <text x="500" y="198" className="fill-slate-600 text-[12px]">
          Summary, routing, priority
        </text>
        <text x="500" y="210" className="fill-slate-600 text-[12px]">
          Confidence + rationale
        </text>

        <text x="500" y="280" className="fill-slate-900 text-[14px] font-semibold">
          Audit + Run History
        </text>
        <text x="500" y="302" className="fill-slate-600 text-[12px]">
          Source snapshots
        </text>
        <text x="500" y="314" className="fill-slate-600 text-[12px]">
          Overrides and events
        </text>

        <text x="716" y="82" className="fill-slate-900 text-[14px] font-semibold">
          Team Lead
        </text>
        <text x="716" y="104" className="fill-slate-600 text-[12px]">
          Review queue
        </text>

        <text x="716" y="174" className="fill-slate-900 text-[14px] font-semibold">
          Contributor
        </text>
        <text x="716" y="196" className="fill-slate-600 text-[12px]">
          Assigned work
        </text>

        <text x="716" y="266" className="fill-slate-900 text-[14px] font-semibold">
          Stakeholder
        </text>
        <text x="716" y="288" className="fill-slate-600 text-[12px]">
          Status dashboard
        </text>
      </svg>
    </div>
  );
}
