export function Button({ children, className = '', asChild, ...props }) {
  const Comp = asChild ? 'span' : 'button';
  return (
    <Comp
      {...props}
      className={`px-4 py-2 rounded-2xl transition font-medium ${className}`}
    >
      {children}
    </Comp>
  );
}
