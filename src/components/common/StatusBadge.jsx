import { STATUS } from "../../utils/format";

export default function StatusBadge({ status }) {
  return <span className={`status s-${status}`}>{STATUS[status] || status}</span>;
}
