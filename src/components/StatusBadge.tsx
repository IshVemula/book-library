import { STATUSES, type Status } from "@/lib/books";

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status}`}>{STATUSES[status]}</span>;
}
