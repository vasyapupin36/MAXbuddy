export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`px-3 py-2 rounded-lg w-full focus:outline-none ${className}`}
    />
  );
}
