"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface BookingDetails {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  discountAmount: number;
  services: { id: string; name: string; price: number }[];
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingIdParam = searchParams.get("id");

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!bookingIdParam) {
      setLoading(false);
      return;
    }

    async function fetchBooking() {
      try {
        const response = await fetch("/api/bookings");
        const data = await response.json();
        if (data.success) {
          const matched = data.bookings.find((b: any) => b.id === bookingIdParam || b.bookingId === bookingIdParam);
          if (matched) {
            setBooking(matched);
          }
        }
      } catch (error) {
        console.error("Error loading confirmation booking:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingIdParam]);

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={cardStyles}>
          <p style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.4rem", color: "var(--color-accent-text)" }}>
            Loading your booking receipt...
          </p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={containerStyles}>
        <div style={cardStyles}>
          <h2 style={{ fontFamily: "var(--font-serif), serif", color: "#d9534f", marginBottom: "15px" }}>
            Receipt Not Found
          </h2>
          <p style={{ marginBottom: "20px" }}>We couldn't locate this booking ID. It may have expired or is incorrect.</p>
          <button style={btnStyles} onClick={() => router.push("/")}>Return to Homepage</button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyles}>
      <div style={cardStyles}>
        {/* Brand Header */}
        <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px" }}>
          <span style={{
            fontFamily: "var(--font-serif), 'Playfair Display', serif",
            fontSize: "2.6rem",
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "var(--color-accent-text, #c5a880)",
            lineHeight: 1,
            textTransform: "uppercase",
          }}>AROMA</span>
          <span style={{
            fontFamily: "var(--font-body), 'Lato', sans-serif",
            fontSize: "0.82rem",
            fontWeight: 400,
            letterSpacing: "0.28em",
            color: "var(--color-gray-muted, #999)",
            textTransform: "uppercase",
            lineHeight: 1,
          }}>Beauty Salon</span>
        </div>

        {/* Success Icon */}
        <div style={iconStyles}>✦</div>

        <h1 style={{ fontFamily: "var(--font-serif), serif", fontSize: "2.2rem", color: "var(--color-accent-text)", margin: "15px 0 5px 0" }}>
          Appointment Confirmed
        </h1>
        <p style={{ color: "var(--color-gray-muted)", fontSize: "0.95rem", marginBottom: "30px" }}>
          Thank you for choosing AROMA. We have saved your details.
        </p>

        {/* Receipt Container */}
        <div style={receiptStyles}>
          <div style={receiptRowStyles}>
            <span style={labelStyles}>Booking Reference</span>
            <span style={{ fontWeight: 600, color: "var(--color-accent-text)", letterSpacing: "0.05em" }}>
              {booking.bookingId}
            </span>
          </div>

          <div style={receiptRowStyles}>
            <span style={labelStyles}>Client Name</span>
            <span>{booking.customerName}</span>
          </div>

          <div style={receiptRowStyles}>
            <span style={labelStyles}>Mobile Number</span>
            <span>{booking.customerPhone}</span>
          </div>

          <div style={receiptRowStyles}>
            <span style={labelStyles}>Assigned Expert</span>
            <span>{booking.staffName}</span>
          </div>

          <div style={receiptRowStyles}>
            <span style={labelStyles}>Appointment Date</span>
            <span>{booking.date}</span>
          </div>

          <div style={receiptRowStyles}>
            <span style={labelStyles}>Time Window</span>
            <span style={{ fontWeight: 500 }}>{booking.startTime} — {booking.endTime}</span>
          </div>

          <div style={{ margin: "20px 0 10px 0", borderBottom: "1px dashed rgba(197, 168, 128, 0.3)" }}></div>

          <div style={{ marginBottom: "15px" }}>
            <span style={{ ...labelStyles, display: "block", marginBottom: "8px" }}>Selected Treatments</span>
            {booking.services.map((s, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "between", fontSize: "0.9rem", marginBottom: "4px" }}>
                <span style={{ flex: 1, textAlign: "left" }}>• {s.name}</span>
                <span style={{ fontWeight: 500 }}>₹{s.price.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ margin: "20px 0 10px 0", borderBottom: "1px dashed rgba(197, 168, 128, 0.3)" }}></div>

          {booking.discountAmount > 0 && (
            <div style={receiptRowStyles}>
              <span style={{ color: "#28a745" }}>Promo Discount</span>
              <span style={{ color: "#28a745" }}>-₹{booking.discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div style={receiptRowStyles}>
            <span style={labelStyles}>Payment Method</span>
            <span style={{ textTransform: "uppercase", fontSize: "0.8rem", fontWeight: 500 }}>
              {booking.paymentMethod.replace(/_/g, " ")}
            </span>
          </div>

          <div style={receiptRowStyles}>
            <span style={labelStyles}>Payment Status</span>
            <span style={{ 
              color: booking.paymentStatus === "PAID" ? "#28a745" : "#A58B64", 
              fontWeight: 600,
              fontSize: "0.8rem",
              textTransform: "uppercase"
            }}>
              {booking.paymentStatus}
            </span>
          </div>

          <div style={{ ...receiptRowStyles, marginTop: "15px", paddingTop: "15px", borderTop: "1px solid rgba(10, 42, 30, 0.1)", fontSize: "1.2rem", fontWeight: 600 }}>
            <span style={{ color: "var(--color-accent-text)" }}>Total Paid / Due</span>
            <span style={{ color: "var(--color-accent-text)" }}>₹{booking.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Notices */}
        <div style={noticeBoxStyles}>
          <p style={{ fontWeight: 500, color: "var(--color-accent-text)", marginBottom: "4px" }}>🔔 Helpful Reminders</p>
          <p>• A booking confirmation has been generated and queued for SMS alerts.</p>
          <p>• If you need to reschedule or cancel, please contact us at least 2 hours prior.</p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button style={btnSecStyles} onClick={() => window.print()}>🖨 Print Invoice</button>
          <button style={btnStyles} onClick={() => router.push("/")}>Return to Home</button>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  return (
    <Suspense fallback={
      <div style={containerStyles}>
        <div style={cardStyles}>
          <p style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.4rem", color: "var(--color-accent-text)" }}>
            Loading your booking receipt...
          </p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}

// Styling Object
const containerStyles: React.CSSProperties = {
  minHeight: "100vh",
  backgroundColor: "#FAF8F5", // Warm cream
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px 20px"
};

const cardStyles: React.CSSProperties = {
  width: "100%",
  maxWidth: "560px",
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(197, 168, 128, 0.3)",
  borderRadius: "16px",
  padding: "40px 30px",
  boxShadow: "0 20px 50px rgba(10, 42, 30, 0.05)",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center"
};

const iconStyles: React.CSSProperties = {
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  backgroundColor: "rgba(10, 42, 30, 0.05)",
  border: "1px solid #C5A880",
  color: "#C5A880",
  fontSize: "2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "10px"
};

const receiptStyles: React.CSSProperties = {
  width: "100%",
  backgroundColor: "#FAF8F5",
  border: "1px solid #EADEC9",
  borderRadius: "8px",
  padding: "25px",
  marginBottom: "25px"
};

const receiptRowStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "8px",
  fontSize: "0.95rem"
};

const labelStyles: React.CSSProperties = {
  color: "#7A8B80",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em"
};

const noticeBoxStyles: React.CSSProperties = {
  width: "100%",
  backgroundColor: "rgba(197, 168, 128, 0.1)",
  borderLeft: "4px solid #C5A880",
  borderRadius: "4px",
  padding: "15px",
  textAlign: "left",
  fontSize: "0.85rem",
  lineHeight: "1.5",
  color: "#3D4A41",
  marginBottom: "30px"
};

const btnStyles: React.CSSProperties = {
  backgroundColor: "#C5A880",
  color: "#0A2A1E",
  padding: "12px 24px",
  border: "none",
  borderRadius: "4px",
  fontSize: "0.9rem",
  fontWeight: 600,
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all 0.2s"
};

const btnSecStyles: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "#0A2A1E",
  border: "1px solid #0A2A1E",
  padding: "12px 24px",
  borderRadius: "4px",
  fontSize: "0.9rem",
  fontWeight: 500,
  textTransform: "uppercase",
  cursor: "pointer",
  transition: "all 0.2s"
};
