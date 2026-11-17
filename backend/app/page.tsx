
export default function BackendStatusPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0b0b0b",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          width: "100%",
          padding: "40px",
          border: "1px solid #303030",
          borderRadius: "16px",
          background: "#151515",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "42px", marginBottom: "16px" }}>
          🚀
        </div>

        <h1 style={{ fontSize: "30px", marginBottom: "12px" }}>
          CrewConnect Backend
        </h1>

        <p style={{ color: "#22c55e", fontWeight: "bold" }}>
          ● Backend is running
        </p>

        <p style={{ color: "#a3a3a3", lineHeight: 1.7 }}>
          Your CrewConnect API server is online and ready
          to receive requests.
        </p>

        <p style={{ color: "#777777", fontSize: "12px" }}>
          CREWCONNECT • GUJARAT
        </p>
      </div>
    </main>
  );
}
