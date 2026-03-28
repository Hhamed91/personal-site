import type { RequestRecord } from "@/lib/intake/types";
import { slugify } from "@/lib/intake/utils";

function dateKey(value: string) {
  return value.slice(0, 10);
}

export function findDuplicateRequest(candidate: {
  title: string;
  submittedByEmail: string;
  dateSubmitted: string;
}, existing: RequestRecord[]) {
  const candidateTitle = slugify(candidate.title);
  const candidateEmail = candidate.submittedByEmail.toLowerCase();
  const candidateDate = dateKey(candidate.dateSubmitted);

  return (
    existing.find((request) => {
      return (
        slugify(request.title) === candidateTitle &&
        request.submittedByEmail.toLowerCase() === candidateEmail &&
        dateKey(request.dateSubmitted) === candidateDate
      );
    }) ?? null
  );
}
