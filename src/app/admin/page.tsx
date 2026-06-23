"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/admin/check-auth");
        if (response.ok) {
          router.push("/admin/dashboard");
        }
      } catch (e) {
        // Not authenticated
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch (e) {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        <div style={logoAreaStyles}>
          <h1 style={{ fontFamily: "var(--font-serif), serif", fontSize: "2rem", letterSpacing: "0.05em", color: "#FFFFFF", margin: 0 }}>
            AROMA ADMIN
          </h1>
          <p style={{ fontSize: "0.75rem", color: "#C5A880", textTransform: "uppercase", letterSpacing: "0.2em", margin: "5px 0 0 0" }}>
            Management Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <div style={formGroupStyles}>
            <label style={labelStyles}>Email Address</label>
            <input
              type="email"
              required
              style={inputStyles}
              placeholder="anju@aroma"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={formGroupStyles}>
            <label style={labelStyles}>Password</label>
            <input
              type="password"
              required
              style={inputStyles}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div style={errorStyles}>{error}</div>}

          <button type="submit" disabled={submitting} style={btnStyles}>
            {submitting ? "Signing in..." : "Enter Portal"}
          </button>
        </form>

        <div style={{ marginTop: "25px", fontSize: "0.75rem", color: "#7A8B80" }}>
          Default: anju@aroma / admin123
        </div>
      </div>
    </div>
  );
}

// Styles
const containerStyles: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#0A2A1E",
  backgroundImage: "radial-gradient(circle at 100% 0%, rgba(197, 168, 128, 0.15) 0%, transparent 60%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px"
};

const cardStyles: React.CSSProperties = {
  width: "100%",
  maxHeight: "600px",
  maxWidth: "440px",
  backgroundColor: "rgba(255, 255, 255, 0.03)",
  border: "1px solid rgba(197, 168, 128, 0.25)",
  borderRadius: "16px",
  padding: "40px 30px",
  boxShadow: "0 30px 60px rgba(0, 0, 0, 0.3)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  backdropFilter: "blur(12px)"
};

const logoAreaStyles: React.CSSProperties = {
  textAlign: "center",
  marginBottom: "35px"
};

const formGroupStyles: React.CSSProperties = {
  marginBottom: "20px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch"
};

const labelStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#C5A880",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  marginBottom: "8px",
  textAlign: "left"
};

const inputStyles: React.CSSProperties = {
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(197, 168, 128, 0.3)",
  padding: "14px",
  borderRadius: "4px",
  color: "#FFFFFF",
  fontSize: "0.95rem",
  outline: "none",
  transition: "all 0.2s"
};

const errorStyles: React.CSSProperties = {
  color: "#d9534f",
  fontSize: "0.85rem",
  marginTop: "10px",
  textAlign: "center"
};

const btnStyles: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#C5A880",
  color: "#0A2A1E",
  padding: "14px",
  border: "none",
  borderRadius: "4px",
  fontSize: "0.95rem",
  fontWeight: 600,
  textTransform: "uppercase",
  cursor: "pointer",
  letterSpacing: "0.05em",
  marginTop: "10px",
  transition: "all 0.2s"
};
