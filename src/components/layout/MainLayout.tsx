
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`app-shell ${collapsed ? "app-shell-collapsed" : ""}`}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
      />

      <div className="app-main">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="page-content">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}
