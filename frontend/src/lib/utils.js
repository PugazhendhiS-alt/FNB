export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(date));
}

export function getStatusStyle(status) {
  const styles = {
    PENDING_PAYMENT: 'badge-warning',
    PAYMENT_FAILED: 'badge-danger',
    PAID: 'badge-info',
    PREPARING: 'badge-purple',
    COMPLETED: 'badge-success',
    DELIVERED: 'badge-success',
    CANCELLED: 'badge-danger',
  };
  return styles[status] || 'badge-warning';
}

export function getStatusLabel(status) {
  const labels = {
    PENDING_PAYMENT: 'Pending Payment',
    PAYMENT_FAILED: 'Payment Failed',
    PAID: 'Paid',
    PREPARING: 'Preparing',
    COMPLETED: 'Completed',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  return labels[status] || status;
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}