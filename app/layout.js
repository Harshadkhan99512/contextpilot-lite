import "../styles/globals.css";

export const metadata = {
  title: "ContextPilot — Live",
  description: "Streaming demo without keys"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 16px" }}>{children}</div>
      </body>
    </html>
  );
}
