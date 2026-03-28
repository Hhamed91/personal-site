import { INITIAL_DEMO_STATE } from "@/lib/intake/demo-state";
import { formatDateLabel, getPriorityTone, getSourceTone, summarizeState } from "@/lib/intake/utils";

function toneClass(tone: string) {
  const tones: Record<string, string> = {
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    orange: "bg-orange-50 text-orange-700 ring-orange-200",
    slate: "bg-slate-100 text-slate-700 ring-slate-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };

  return tones[tone] ?? tones.slate;
}

export default function IntakeSnapshot() {
  const summary = summarizeState(INITIAL_DEMO_STATE);
  const featured = INITIAL_DEMO_STATE.requests.slice(0, 3);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-sky-200">Live System Snapshot</p>
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-3xl font-semibold">{summary.totalRequests}</p>
            <p className="mt-1 text-sm text-slate-300">Canonical requests</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-3xl font-semibold">{summary.duplicates}</p>
            <p className="mt-1 text-sm text-slate-300">Duplicates caught</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-3xl font-semibold">{summary.lowConfidence}</p>
            <p className="mt-1 text-sm text-slate-300">Low-confidence triage</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-3xl font-semibold">{summary.urgent}</p>
            <p className="mt-1 text-sm text-slate-300">Urgent or critical</p>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Recent canonical requests</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-900">Before-and-after normalization in context</h3>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {featured.map((request) => (
            <div
              key={request.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClass(getSourceTone(request.source))}`}>
                  {request.source}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClass(getPriorityTone(request.finalPriority))}`}>
                  {request.finalPriority}
                </span>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-medium text-white">
                  {request.finalDepartment}
                </span>
              </div>
              <h4 className="mt-3 text-base font-semibold text-slate-900">{request.title}</h4>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <p>Raw department: {request.normalizedDepartment}</p>
                <p>AI department: {request.aiDepartment}</p>
                <p>Raw type: {request.normalizedRequestType}</p>
                <p>Final type: {request.finalRequestType}</p>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                Submitted {formatDateLabel(request.dateSubmitted)} by {request.submittedByName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
