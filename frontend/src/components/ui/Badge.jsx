export default function Badge({ children, variant = 'info' }) {
  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}