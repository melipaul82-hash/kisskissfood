"use client";

/** Delete button that asks for confirmation before the form is sent. */
export function ConfirmButton({ message, children }: { message: string; children: React.ReactNode }) {
  return (
    <button
      className="a-btn a-btn-danger"
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
