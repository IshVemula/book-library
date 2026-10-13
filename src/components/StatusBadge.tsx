import { STATUSES, type Status } from "@/lib/types";

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status}`}>{STATUSES[status]}</span>;
}
