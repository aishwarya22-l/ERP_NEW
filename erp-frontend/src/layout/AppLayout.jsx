import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div style={{ padding: "20px", width: "100%" }}>  {children}
      </div>
    </div>
  );
}