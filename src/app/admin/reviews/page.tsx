"use client";

import React, { useEffect, useState } from "react";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  reply?: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Reply active state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reply: replyText.trim() })
      });
      const data = await response.json();
      if (data.success) {
        setActiveReplyId(null);
        setReplyText("");
        fetchReviews();
      } else {
        alert("Failed to save response.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div style={{ fontSize: "1.1rem", color: "var(--color-emerald-deep)" }}>Loading reviews moderation list...</div>;
  }

  return (
    <div style={cardStyles}>
      <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.3rem", color: "#0A2A1E", marginBottom: "25px", marginTop: 0 }}>
        Moderating Client Testimonials
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {reviews.map(r => (
          <div key={r.id} style={reviewItemStyles}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
              <div>
                <span style={{ fontWeight: 600, color: "#0A2A1E" }}>{r.customerName}</span>
                {r.isVerified && <span style={badgeStyles}>Verified Appointment</span>}
                <div style={starStyles}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</div>
              </div>
              <span style={{ fontSize: "0.8rem", color: "#7A8B80" }}>
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p style={{ margin: "10px 0", fontSize: "0.95rem", fontStyle: "italic", color: "#3D4A41", lineHeight: "1.5" }}>
              "{r.comment}"
            </p>

            {/* Owner Reply Block */}
            {r.reply ? (
              <div style={replyBlockStyles}>
                <div style={{ fontWeight: 600, color: "#C5A880", fontSize: "0.8rem", textTransform: "uppercase", marginBottom: "2px" }}>
                  Aroma Team Response:
                </div>
                <p style={{ margin: 0, fontSize: "0.9rem" }}>{r.reply}</p>
                <button 
                  style={{ background: "none", border: "none", color: "#7A8B80", fontSize: "0.75rem", textDecoration: "underline", cursor: "pointer", marginTop: "8px", padding: 0 }}
                  onClick={() => {
                    setActiveReplyId(r.id);
                    setReplyText(r.reply || "");
                  }}
                >
                  Edit Response
                </button>
              </div>
            ) : (
              <div>
                {activeReplyId === r.id ? (
                  <div style={{ marginTop: "10px" }}>
                    <textarea
                      style={textareaStyles}
                      placeholder="Write your response to the customer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <button style={btnStyles} onClick={() => handleSendReply(r.id)}>
                        Send Response
                      </button>
                      <button style={btnCancelStyles} onClick={() => setActiveReplyId(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    style={replyLinkStyles}
                    onClick={() => {
                      setActiveReplyId(r.id);
                      setReplyText("");
                    }}
                  >
                    💬 Response to Review
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
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

const reviewItemStyles: React.CSSProperties = {
  borderBottom: "1px solid rgba(10, 42, 30, 0.05)",
  paddingBottom: "20px"
};

const badgeStyles: React.CSSProperties = {
  marginLeft: "10px",
  backgroundColor: "rgba(20, 75, 54, 0.1)",
  color: "#0A2A1E",
  fontSize: "0.7rem",
  padding: "2px 6px",
  borderRadius: "4px",
  fontWeight: 600,
  textTransform: "uppercase"
};

const starStyles: React.CSSProperties = {
  color: "#D4AF37",
  marginTop: "2px",
  fontSize: "0.9rem"
};

const replyBlockStyles: React.CSSProperties = {
  backgroundColor: "#FAF8F5",
  borderLeft: "3px solid #C5A880",
  borderRadius: "4px",
  padding: "12px 15px",
  marginTop: "10px"
};

const replyLinkStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#C5A880",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer",
  marginTop: "5px",
  padding: 0
};

const textareaStyles: React.CSSProperties = {
  width: "100%",
  height: "70px",
  padding: "10px",
  border: "1px solid #EADEC9",
  borderRadius: "4px",
  fontSize: "0.85rem",
  fontFamily: "inherit",
  resize: "none"
};

const btnStyles: React.CSSProperties = {
  backgroundColor: "#0A2A1E",
  color: "#FFFFFF",
  padding: "8px 16px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 600,
  textTransform: "uppercase"
};

const btnCancelStyles: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#7A8B80",
  border: "1px solid #7A8B80",
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: 600,
  textTransform: "uppercase"
};
