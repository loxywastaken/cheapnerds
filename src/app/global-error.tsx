"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: "#0b0b0f", color: "#f4f4f7", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
          <p style={{ color: "#a3a3b2" }}>The site hit an unexpected error.</p>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 16, padding: "10px 20px", borderRadius: 999, border: 0, background: "#fff", color: "#0b0b0f", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
