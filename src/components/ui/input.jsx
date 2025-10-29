export function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`px-3 py-2 rounded-lg w-full focus:outline-none ${className}`}
    />
  );
}
