"use client";

import React, { useEffect, useState } from "react";

interface Staff {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  isActive: boolean;
}

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      const data = await response.json();
      if (data.success) {
        setStaff(data.staff);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) {
      alert("Name and role are required.");
      return;
    }

    try {
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, imageUrl })
      });
      const data = await response.json();
      if (data.success) {
        setName("");
        setRole("");
        setImageUrl("");
        fetchStaff();
      } else {
        alert("Failed to add staff: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ fontSize: "1.1rem", color: "var(--color-emerald-deep)" }}>Loading staff directories...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
      
      {/* Form Card */}
      <div style={cardStyles}>
        <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", color: "#0A2A1E", marginBottom: "20px", marginTop: 0 }}>
          Add Beauty Expert
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={labelStyles}>Stylist Name *</label>
            <input
              type="text"
              style={inputStyles}
              required
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyles}>Role / Specialty *</label>
            <input
              type="text"
              style={inputStyles}
              required
              placeholder="e.g. Master Bridal Makeup Artist"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyles}>Avatar Image URL (Optional)</label>
            <input
              type="text"
              style={inputStyles}
              placeholder="/images/priya.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <button type="submit" style={{ ...btnStyles, marginTop: "10px" }}>
            Register Stylist
          </button>
        </form>
      </div>

      {/* Staff Grid */}
      <div style={cardStyles}>
        <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", color: "#0A2A1E", marginBottom: "20px", marginTop: 0 }}>
          Active Specialists Registry
        </h3>

        <div style={gridStyles}>
          {staff.map(s => (
            <div key={s.id} style={staffCardStyles}>
              <div style={avatarStyles}>
                {s.name[0]}
              </div>
              <h4 style={{ margin: "10px 0 2px 0", fontFamily: "var(--font-serif), serif", fontSize: "1.2rem", color: "#0A2A1E" }}>
                {s.name}
              </h4>
              <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#C5A880", letterSpacing: "0.05em", margin: 0 }}>
                {s.role}
              </p>
              <div style={{ marginTop: "15px", fontSize: "0.8rem", color: "#7A8B80" }}>
                🟢 Online & Scheduling
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Styles
const cardStyles: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(10, 42, 30, 0.05)",
  borderRadius: "12px",
  padding: "25px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
};

const labelStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: "#C5A880",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "5px"
};

const inputStyles: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  border: "1px solid #EADEC9",
  borderRadius: "4px",
  fontSize: "0.9rem",
  fontFamily: "inherit"
};

const btnStyles: React.CSSProperties = {
  backgroundColor: "#0A2A1E",
  color: "#FFFFFF",
  padding: "10px 20px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.85rem",
  fontWeight: 600,
  textTransform: "uppercase"
};

const gridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "20px"
};

const staffCardStyles: React.CSSProperties = {
  backgroundColor: "#FAF8F5",
  border: "1px solid #EADEC9",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center"
};

const avatarStyles: React.CSSProperties = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  backgroundColor: "#0A2A1E",
  color: "#FFFFFF",
  fontSize: "1.6rem",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto"
};
