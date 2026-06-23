"use client";

import React, { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string[];
  price: number;
  offerPrice?: number;
  duration: number;
  isActive: boolean;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("HAIR");
  const [description, setDescription] = useState("");
  const [benefitsInput, setBenefitsInput] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      const data = await response.json();
      if (data.success) {
        setServices(data.services);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !duration) {
      alert("Please fill in all required fields.");
      return;
    }

    const benefits = benefitsInput
      .split("\n")
      .map(b => b.trim())
      .filter(b => b.length > 0);

    const payload = {
      id: editingId || undefined,
      name,
      category,
      description,
      benefits,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : undefined,
      duration: Number(duration)
    };

    try {
      const method = editingId ? "PUT" : "POST";
      const response = await fetch("/api/services", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.success) {
        resetForm();
        fetchServices();
      } else {
        alert("Operation failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setName(service.name);
    setCategory(service.category);
    setDescription(service.description);
    setBenefitsInput(service.benefits.join("\n"));
    setPrice(service.price.toString());
    setOfferPrice(service.offerPrice?.toString() || "");
    setDuration(service.duration.toString());
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this service?")) return;

    try {
      const response = await fetch(`/api/services?id=${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        fetchServices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("HAIR");
    setDescription("");
    setBenefitsInput("");
    setPrice("");
    setOfferPrice("");
    setDuration("");
  };

  if (loading) {
    return <div style={{ fontSize: "1.1rem", color: "var(--color-emerald-deep)" }}>Loading services catalog...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "30px" }}>
      
      {/* Form Column */}
      <div style={cardStyles}>
        <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", color: "#0A2A1E", marginBottom: "20px", marginTop: 0 }}>
          {editingId ? "Edit Treatment Details" : "Add New Treatment"}
        </h3>
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={labelStyles}>Service Name *</label>
            <input
              type="text"
              style={inputStyles}
              required
              placeholder="e.g. Keratin Smooth Therapy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyles}>Category *</label>
            <select
              style={inputStyles}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="HAIR">Hair Care</option>
              <option value="SKIN">Skin Care / Facial</option>
              <option value="NAILS">Nails / Pedicure</option>
              <option value="BRIDAL">Bridal & Makeup</option>
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyles}>Base Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                style={inputStyles}
                placeholder="99.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyles}>Offer Price (₹)</label>
              <input
                type="number"
                step="0.01"
                style={inputStyles}
                placeholder="e.g. 79.00"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={labelStyles}>Duration (minutes) *</label>
            <input
              type="number"
              required
              style={inputStyles}
              placeholder="e.g. 60"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyles}>Description</label>
            <textarea
              style={{ ...inputStyles, height: "80px", resize: "none" }}
              placeholder="Describe what the service entails..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyles}>Benefits (one per line)</label>
            <textarea
              style={{ ...inputStyles, height: "80px", resize: "none" }}
              placeholder="e.g. Cuts styling time by 50%"
              value={benefitsInput}
              onChange={(e) => setBenefitsInput(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button type="submit" style={btnStyles}>
              {editingId ? "Save Changes" : "Create Service"}
            </button>
            {editingId && (
              <button type="button" style={btnCancelStyles} onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Services List Column */}
      <div style={cardStyles}>
        <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", color: "#0A2A1E", marginBottom: "20px", marginTop: 0 }}>
          Active Catalog ({services.length} items)
        </h3>

        <table style={tableStyles}>
          <thead>
            <tr style={tableHeaderRowStyles}>
              <th>Treatment</th>
              <th>Category</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map(s => (
              <tr key={s.id} style={{ ...tableRowStyles, opacity: s.isActive ? 1 : 0.5 }}>
                <td style={{ fontWeight: 500 }}>
                  <div>{s.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#7A8B80", fontWeight: 400 }}>
                    {s.description.slice(0, 50)}...
                  </div>
                </td>
                <td>{s.category}</td>
                <td>⏱ {s.duration} min</td>
                <td>
                  {s.offerPrice ? (
                    <div>
                      <span style={{ textDecoration: "line-through", color: "#7A8B80", fontSize: "0.8rem", marginRight: "5px" }}>
                        ₹{s.price}
                      </span>
                      <span style={{ fontWeight: 600, color: "var(--color-emerald-deep)" }}>
                        ₹{s.offerPrice}
                      </span>
                    </div>
                  ) : (
                    <span style={{ fontWeight: 500 }}>₹{s.price}</span>
                  )}
                </td>
                <td>
                  <span style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: s.isActive ? "#28a745" : "#d9534f"
                  }}>
                    {s.isActive ? "ACTIVE" : "INACTIVE"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <button style={actionEditBtnStyles} onClick={() => handleEdit(s)}>✏️ Edit</button>
                    {s.isActive && (
                      <button style={actionDeleteBtnStyles} onClick={() => handleDelete(s.id)}>✕ Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

// Inline Styles
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

const btnCancelStyles: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#7A8B80",
  border: "1px solid #7A8B80",
  padding: "10px 20px",
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

const actionEditBtnStyles: React.CSSProperties = {
  backgroundColor: "#FAF8F5",
  border: "1px solid #EADEC9",
  color: "#0A2A1E",
  padding: "5px 10px",
  borderRadius: "4px",
  fontSize: "0.75rem",
  cursor: "pointer"
};

const actionDeleteBtnStyles: React.CSSProperties = {
  backgroundColor: "rgba(217, 83, 79, 0.1)",
  border: "none",
  color: "#d9534f",
  padding: "5px 10px",
  borderRadius: "4px",
  fontSize: "0.75rem",
  cursor: "pointer"
};
