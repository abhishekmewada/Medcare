const STYLES = {
  completed: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  upcoming: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${STYLES[status] || STYLES.upcoming}`}>{status}</span>;
}
