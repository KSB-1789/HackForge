export default function AuthMessage({ message, type = "error" }) {
  if (!message) return null;

  return (
    <p
      className={`hf-alert ${
        type === "success" ? "hf-alert-success" : "hf-alert-error"
      }`}
      role="alert"
      aria-live="polite"
    >
      {message}
    </p>
  );
}
