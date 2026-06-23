"use client";

import React, { useEffect, useState } from "react";

interface Offer {
  id: string;
  title: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchOffers = async () => {
    try {
      const response = await fetch("/api/offers");
      const data = await response.json();
      if (data.success) {
        setOffers(data.offers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !code || !discountValue || !startDate || !endDate) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          code,
          description,
          discountType,
          discountValue: Number(discountValue),
          startDate,
          endDate
        })
      });
      const data = await response.json();
      if (data.success) {
        setTitle("");
        setCode("");
        setDescription("");
        setDiscountValue("");
        setStartDate("");
        setEndDate("");
        fetchOffers();
      } else {
        alert("Failed to add offer: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div style={{ fontSize: "1.1rem", color: "var(--color-emerald-deep)" }}>Loading promotional offers...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
      
      {/* Form Card */}
      <div style={cardStyles}>
        <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", color: "#0A2A1E", marginBottom: "20px", marginTop: 0 }}>
          Create Campaign Code
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={labelStyles}>Offer Title *</label>
            <input
              type="text"
              style={inputStyles}
              required
              placeholder="e.g. Festival Face Glow Discount"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyles}>Coupon Promo Code *</label>
            <input
              type="text"
              style={inputStyles}
              required
              placeholder="e.g. GLOW20"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyles}>Description</label>
            <input
              type="text"
              style={inputStyles}
              placeholder="e.g. Get 20% off on Gold Facial"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyles}>Discount Type *</label>
              <select
                style={inputStyles}
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Price (₹)</option>
              </select>
            </div>
            <div>
              <label style={labelStyles}>Discount Value *</label>
              <input
                type="number"
                required
                style={inputStyles}
                placeholder="20"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyles}>Start Date *</label>
              <input
                type="date"
                required
                style={inputStyles}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyles}>End Date *</label>
              <input
                type="date"
                required
                style={inputStyles}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" style={{ ...btnStyles, marginTop: "10px" }}>
            Launch Campaign
          </button>
        </form>
      </div>

      {/* Offers Table Card */}
      <div style={cardStyles}>
        <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", color: "#0A2A1E", marginBottom: "20px", marginTop: 0 }}>
          Launched Campaigns
        </h3>

        <table style={tableStyles}>
          <thead>
            <tr style={tableHeaderRowStyles}>
              <th>Campaign</th>
              <th>Coupon Code</th>
              <th>Discount</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {offers.map(o => (
              <tr key={o.id} style={tableRowStyles}>
                <td style={{ fontWeight: 500 }}>
                  <div>{o.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "#7A8B80" }}>{o.description}</div>
                </td>
                <td>
                  <span style={codeBadgeStyles}>{o.code}</span>
                </td>
                <td style={{ fontWeight: 500 }}>
                  {o.discountType === "PERCENTAGE" ? `${o.discountValue}%` : `₹${o.discountValue}`}
                </td>
                <td style={{ fontSize: "0.8rem", color: "#3D4A41" }}>
                  <div>From: {o.startDate}</div>
                  <div>To: {o.endDate}</div>
                </td>
                <td>
                  <span style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: o.isActive ? "#28a745" : "#d9534f"
                  }}>
                    {o.isActive ? "ACTIVE" : "EXPIRED"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

const tableStyles: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left"
};

const tableHeaderRowStyles: React.CSSProperties = {
  borderBottom: "2px solid rgba(10, 42, 30, 0.05)",
  fontSize: "0.8rem",
  color: "#7A8B80",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  height: "35px"
};

const tableRowStyles: React.CSSProperties = {
  borderBottom: "1px solid rgba(10, 42, 30, 0.05)",
  height: "55px",
  fontSize: "0.85rem"
};

const codeBadgeStyles: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: "0.9rem",
  fontWeight: 600,
  backgroundColor: "rgba(197, 168, 128, 0.15)",
  color: "#0A2A1E",
  padding: "4px 8px",
  borderRadius: "4px"
};
