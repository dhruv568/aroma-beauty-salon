"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
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
  services: { id: string; name: string; price: number }[];
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [kpis, setKpis] = useState({
    todayCount: 0,
    upcomingCount: 0,
    totalRevenue: 0,
    averageTicket: 0
  });

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
        calculateKpis(data.bookings);
      }
    } catch (error) {
      console.error("Error loading dashboard bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const calculateKpis = (list: Booking[]) => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    const today = list.filter(b => b.date === todayStr);
    const upcoming = list.filter(b => b.date >= todayStr && b.status === "CONFIRMED");
    const totalRev = list.filter(b => b.status === "COMPLETED" || b.paymentStatus === "PAID").reduce((sum, b) => sum + b.totalAmount, 0);
    const paidBookingsCount = list.filter(b => b.status === "COMPLETED" || b.paymentStatus === "PAID").length;
    const avgTicket = paidBookingsCount > 0 ? totalRev / paidBookingsCount : 0;

    setKpis({
      todayCount: today.length,
      upcomingCount: upcoming.length,
      totalRevenue: totalRev,
      averageTicket: avgTicket
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/bookings/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchBookings();
      } else {
        alert("Failed to update booking status.");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating status.");
    }
  };

  if (loading) {
    return <div style={{ fontSize: "1.1rem", color: "var(--color-emerald-deep)" }}>Loading metrics dashboard...</div>;
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const otherBookings = bookings.filter(b => b.date !== todayStr);

  return (
    <div>
      {/* KPI Cards Row */}
      <div style={kpiGridStyles}>
        <div style={kpiCardStyles}>
          <div style={kpiTitleStyles}>Today's Bookings</div>
          <div style={kpiValueStyles}>{kpis.todayCount}</div>
          <div style={kpiSubStyles}>appointments today</div>
        </div>

        <div style={kpiCardStyles}>
          <div style={kpiTitleStyles}>Pending Slots</div>
          <div style={kpiValueStyles}>{kpis.upcomingCount}</div>
          <div style={kpiSubStyles}>scheduled confirmations</div>
        </div>

        <div style={kpiCardStyles}>
          <div style={kpiTitleStyles}>Gross Revenue</div>
          <div style={{ ...kpiValueStyles, color: "var(--color-emerald-light)" }}>
            ₹{kpis.totalRevenue.toFixed(2)}
          </div>
          <div style={kpiSubStyles}>completed or paid online</div>
        </div>

        <div style={kpiCardStyles}>
          <div style={kpiTitleStyles}>Average Ticket</div>
          <div style={kpiValueStyles}>₹{kpis.averageTicket.toFixed(2)}</div>
          <div style={kpiSubStyles}>per serviced client</div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "30px", marginTop: "30px" }}>
        
        {/* Left Column: Today's Schedule */}
        <div style={sectionCardStyles}>
          <h3 style={sectionHeaderStyles}>Today's Appointments</h3>
          {todayBookings.length === 0 ? (
            <p style={{ color: "#7A8B80", fontSize: "0.95rem" }}>No bookings scheduled for today.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyles}>
                <thead>
                  <tr style={tableHeaderRowStyles}>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Services</th>
                    <th>Staff</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todayBookings.map(b => (
                    <tr key={b.id} style={tableRowStyles}>
                      <td style={{ fontWeight: 600 }}>{b.startTime}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{b.customerName}</div>
                        <div style={{ fontSize: "0.75rem", color: "#7A8B80" }}>{b.customerPhone}</div>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>
                        {b.services.map(s => s.name).join(", ")}
                      </td>
                      <td>{b.staffName}</td>
                      <td style={{ fontWeight: 500 }}>₹{b.totalAmount.toFixed(2)}</td>
                      <td>
                        <span style={{
                          ...badgeStyles,
                          backgroundColor: 
                            b.status === "COMPLETED" ? "rgba(40, 167, 69, 0.1)" :
                            b.status === "CONFIRMED" ? "rgba(197, 168, 128, 0.15)" :
                            "rgba(217, 83, 79, 0.1)",
                          color: 
                            b.status === "COMPLETED" ? "#28a745" :
                            b.status === "CONFIRMED" ? "#C5A880" :
                            "#d9534f"
                        }}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "5px" }}>
                          {b.status === "CONFIRMED" && (
                            <>
                              <button 
                                style={actionSuccessBtnStyles} 
                                onClick={() => handleUpdateStatus(b.id, "COMPLETED")}
                              >
                                ✓ Done
                              </button>
                              <button 
                                style={actionDangerBtnStyles} 
                                onClick={() => handleUpdateStatus(b.id, "CANCELLED")}
                              >
                                ✕ Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Column: Mini Stats */}
        <div style={sectionCardStyles}>
          <h3 style={sectionHeaderStyles}>Overview Metrics</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div style={statBarRowStyles}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Paid Transactions</span>
                <div style={barBgStyles}>
                  <div style={{ 
                    ...barFillStyles, 
                    width: `${Math.min(100, (bookings.filter(b => b.paymentStatus === "PAID").length / Math.max(1, bookings.length)) * 100)}%` 
                  }}></div>
                </div>
              </div>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, marginLeft: "10px" }}>
                {bookings.filter(b => b.paymentStatus === "PAID").length}
              </span>
            </div>

            <div style={statBarRowStyles}>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>Completed Treatments</span>
                <div style={barBgStyles}>
                  <div style={{ 
                    ...barFillStyles, 
                    backgroundColor: "var(--color-emerald-light)",
                    width: `${Math.min(100, (bookings.filter(b => b.status === "COMPLETED").length / Math.max(1, bookings.length)) * 100)}%` 
                  }}></div>
                </div>
              </div>
              <span style={{ fontSize: "0.95rem", fontWeight: 600, marginLeft: "10px" }}>
                {bookings.filter(b => b.status === "COMPLETED").length}
              </span>
            </div>

            <div style={{ marginTop: "20px", paddingTop: "20px", borderTop: "1px solid rgba(10, 42, 30, 0.05)", textAlign: "center" }}>
              <Link href="/admin/calendar" style={actionBtnStyles}>
                📅 Go to Booking Calendar
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: All Bookings Database */}
      <div style={{ ...sectionCardStyles, marginTop: "30px" }}>
        <h3 style={sectionHeaderStyles}>Historical Appointments Registry</h3>
        {otherBookings.length === 0 ? (
          <p style={{ color: "#7A8B80", fontSize: "0.95rem" }}>No other historical bookings found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={tableStyles}>
              <thead>
                <tr style={tableHeaderRowStyles}>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Services</th>
                  <th>Staff</th>
                  <th>Total Due</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>
              <tbody>
                {otherBookings.map(b => (
                  <tr key={b.id} style={tableRowStyles}>
                    <td>{b.date}</td>
                    <td>{b.startTime}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.customerName}</div>
                      <div style={{ fontSize: "0.75rem", color: "#7A8B80" }}>{b.customerPhone}</div>
                    </td>
                    <td style={{ fontSize: "0.85rem" }}>{b.services.map(s => s.name).join(", ")}</td>
                    <td>{b.staffName}</td>
                    <td style={{ fontWeight: 500 }}>₹{b.totalAmount.toFixed(2)}</td>
                    <td>
                      <span style={{
                        ...badgeStyles,
                        backgroundColor: b.paymentStatus === "PAID" ? "rgba(40, 167, 69, 0.1)" : "rgba(217, 83, 79, 0.1)",
                        color: b.paymentStatus === "PAID" ? "#28a745" : "#d9534f"
                      }}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        ...badgeStyles,
                        backgroundColor: 
                          b.status === "COMPLETED" ? "rgba(40, 167, 69, 0.1)" :
                          b.status === "CONFIRMED" ? "rgba(197, 168, 128, 0.15)" :
                          "rgba(217, 83, 79, 0.1)",
                        color: 
                          b.status === "COMPLETED" ? "#28a745" :
                          b.status === "CONFIRMED" ? "#C5A880" :
                          "#d9534f"
                      }}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      {b.status === "CONFIRMED" && (
                        <select
                          style={{ padding: "4px", fontSize: "0.8rem", borderRadius: "4px" }}
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateStatus(b.id, e.target.value);
                            }
                          }}
                        >
                          <option value="" disabled>Change Status</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="CANCELLED">Cancelled</option>
                          <option value="NOSHOW">No Show</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Inline Styles
const kpiGridStyles: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px"
};

const kpiCardStyles: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(10, 42, 30, 0.05)",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
};

const kpiTitleStyles: React.CSSProperties = {
  fontSize: "0.8rem",
  textTransform: "uppercase",
  color: "#7A8B80",
  letterSpacing: "0.05em",
  marginBottom: "10px"
};

const kpiValueStyles: React.CSSProperties = {
  fontSize: "2rem",
  fontWeight: "600",
  color: "#0A2A1E",
  marginBottom: "5px"
};

const kpiSubStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#7A8B80"
};

const sectionCardStyles: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(10, 42, 30, 0.05)",
  borderRadius: "12px",
  padding: "25px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
};

const sectionHeaderStyles: React.CSSProperties = {
  fontFamily: "var(--font-serif), serif",
  fontSize: "1.3rem",
  color: "#0A2A1E",
  marginBottom: "20px",
  marginTop: 0
};

const tableStyles: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left"
};

const tableHeaderRowStyles: React.CSSProperties = {
  borderBottom: "2px solid rgba(10, 42, 30, 0.05)",
  fontSize: "0.85rem",
  color: "#7A8B80",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  height: "40px"
};

const tableRowStyles: React.CSSProperties = {
  borderBottom: "1px solid rgba(10, 42, 30, 0.05)",
  height: "55px",
  fontSize: "0.9rem"
};

const badgeStyles: React.CSSProperties = {
  padding: "4px 8px",
  borderRadius: "4px",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase"
};

const actionSuccessBtnStyles: React.CSSProperties = {
  backgroundColor: "#28a745",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "4px",
  padding: "6px 12px",
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer"
};

const actionDangerBtnStyles: React.CSSProperties = {
  backgroundColor: "#d9534f",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "4px",
  padding: "6px 12px",
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer"
};

const actionBtnStyles: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#0A2A1E",
  color: "#FFFFFF",
  padding: "10px 20px",
  borderRadius: "4px",
  fontSize: "0.85rem",
  textTransform: "uppercase",
  fontWeight: 600,
  letterSpacing: "0.05em"
};

const statBarRowStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between"
};

const barBgStyles: React.CSSProperties = {
  height: "8px",
  backgroundColor: "#FAF8F5",
  borderRadius: "4px",
  marginTop: "5px",
  overflow: "hidden"
};

const barFillStyles: React.CSSProperties = {
  height: "100%",
  backgroundColor: "#C5A880",
  borderRadius: "4px"
};
