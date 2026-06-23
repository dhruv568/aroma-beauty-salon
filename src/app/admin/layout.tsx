"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  useEffect(() => {
    // Skip checking on the login root path /admin itself
    if (pathname === "/admin") {
      setIsAuthenticated(false);
      setCheckingAuth(false);
      return;
    }

    async function checkAuth() {
      try {
        const response = await fetch("/api/admin/check-auth");
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          router.push("/admin");
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.push("/admin");
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (response.ok) {
        router.push("/admin");
      }
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  if (pathname === "/admin") {
    return <>{children}</>;
  }

  if (checkingAuth) {
    return (
      <div style={fullScreenCenterStyles}>
        <div style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.5rem", color: "var(--color-emerald-deep)" }}>
          Verifying Admin Credentials...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirecting
  }

  const navItems = [
    { label: "Dashboard Overview", path: "/admin/dashboard", icon: "📊" },
    { label: "Booking Calendar", path: "/admin/calendar", icon: "📅" },
    { label: "Service Catalog", path: "/admin/services", icon: "✂" },
    { label: "Staff & Schedule", path: "/admin/staff", icon: "👥" },
    { label: "Offers & Coupons", path: "/admin/offers", icon: "🏷" },
    { label: "Reviews Manager", path: "/admin/reviews", icon: "★" },
    { label: "Holidays & Hours", path: "/admin/settings", icon: "⚙" }
  ];

  return (
    <div style={layoutGridStyles}>
      {/* Sidebar Navigation */}
      <aside style={sidebarStyles}>
        <div>
          <div style={sidebarHeaderStyles}>
            <div style={sidebarLogoStyles}>Aroma Admin</div>
            <div style={sidebarSubStyles}>Premium Management</div>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {navItems.map(item => {
              const active = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  style={{
                    ...navLinkStyles,
                    backgroundColor: active ? "rgba(197, 168, 128, 0.15)" : "transparent",
                    color: active ? "#C5A880" : "rgba(255,255,255,0.75)"
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <button style={logoutBtnStyles} onClick={handleLogout}>
          <span>🚪</span> Logout Session
        </button>
      </aside>

      {/* Main Administrative Workspace */}
      <main style={mainWorkspaceStyles}>
        <header style={workspaceHeaderStyles}>
          <div>
            <h2 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.6rem", color: "var(--color-emerald-deep)", margin: 0 }}>
              {navItems.find(item => item.path === pathname)?.label || "Administration"}
            </h2>
            <span style={{ fontSize: "0.8rem", color: "#7A8B80" }}>Logged in as Store Owner</span>
          </div>
          <Link href="/" target="_blank" style={previewBtnStyles}>
            👁 View Live Site
          </Link>
        </header>

        <div style={contentBodyStyles}>
          {children}
        </div>
      </main>
    </div>
  );
}

// Inline Styles
const fullScreenCenterStyles: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#FAF8F5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const layoutGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  minHeight: "100vh",
  backgroundColor: "#FBF9F6"
};

const sidebarStyles: React.CSSProperties = {
  backgroundColor: "#0A2A1E",
  borderRight: "1px solid rgba(197, 168, 128, 0.15)",
  padding: "25px 15px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  color: "#FFFFFF",
  position: "sticky",
  top: 0,
  height: "100vh"
};

const sidebarHeaderStyles: React.CSSProperties = {
  marginBottom: "30px",
  paddingLeft: "10px"
};

const sidebarLogoStyles: React.CSSProperties = {
  fontFamily: "var(--font-serif), serif",
  fontSize: "1.4rem",
  fontWeight: "500",
  letterSpacing: "0.05em",
  color: "#FFFFFF"
};

const sidebarSubStyles: React.CSSProperties = {
  fontSize: "0.7rem",
  textTransform: "uppercase",
  color: "#C5A880",
  letterSpacing: "0.15em",
  marginTop: "2px"
};

const navLinkStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 15px",
  borderRadius: "8px",
  fontSize: "0.9rem",
  transition: "all 0.2s"
};

const logoutBtnStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "12px 15px",
  borderRadius: "8px",
  width: "100%",
  textAlign: "left",
  fontSize: "0.9rem",
  color: "#d9534f",
  backgroundColor: "rgba(217, 83, 79, 0.05)",
  border: "none",
  cursor: "pointer"
};

const mainWorkspaceStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  overflowY: "auto"
};

const workspaceHeaderStyles: React.CSSProperties = {
  height: "80px",
  backgroundColor: "#FFFFFF",
  borderBottom: "1px solid rgba(10, 42, 30, 0.05)",
  padding: "0 30px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const previewBtnStyles: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#C5A880",
  border: "1px solid #C5A880",
  padding: "8px 16px",
  borderRadius: "4px",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  fontWeight: 500,
  letterSpacing: "0.05em"
};

const contentBodyStyles: React.CSSProperties = {
  padding: "30px",
  flex: 1
};
