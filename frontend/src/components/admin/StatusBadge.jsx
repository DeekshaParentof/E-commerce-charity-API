const styles = {
  live: "bg-brand-100 text-brand-800",
  active: "bg-brand-100 text-brand-800",
  approved: "bg-blue-100 text-blue-800",
  pending: "bg-amber-100 text-amber-800",
  closed: "bg-gray-200 text-gray-700",
  inactive: "bg-gray-200 text-gray-700",
  sold: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {status || "unset"}
    </span>
  );
}

export default StatusBadge;
