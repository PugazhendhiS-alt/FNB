export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`${hover ? 'card-hover' : 'card-base'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
