"use client";

import React, { useEffect, useState } from "react";

interface Booking {
  id: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  services: { id: string; name: string; price: number }[];
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

export default function AdminCalendar() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Selected booking modal state
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [newStaffId, setNewStaffId] = useState<string>("");
  const [newTime, setNewTime] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const fetchData = async () => {
    try {
      const [resBookings, resStaff] = await Promise.all([
        fetch("/api/bookings").then(r => r.json()),
        fetch("/api/staff").then(r => r.json())
      ]);

      if (resBookings.success) setBookings(resBookings.bookings);
      if (resStaff.success) setStaff(resStaff.staff);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch("/api/bookings/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBooking || !newTime) return;

    try {
      const response = await fetch("/api/bookings/reschedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeBooking.id,
          date: selectedDate,
          startTime: newTime
        })
      });
      const data = await response.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchData();
      } else {
        alert("Rescheduling failed.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div style={{ fontSize: "1.1rem", color: "var(--color-emerald-deep)" }}>Loading appointment calendar scheduler...</div>;
  }

  const hours = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  // Filter bookings for the selected date
  const filteredBookings = bookings.filter(b => b.date === selectedDate);

  const openBookingDetails = (booking: Booking) => {
    setActiveBooking(booking);
    setNewStaffId(booking.staffId || "");
    setNewTime(booking.startTime);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Date controls header */}
      <div style={headerControlStyles}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button 
            style={dateArrowBtnStyles}
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split("T")[0]);
            }}
          >
            ◀
          </button>
          <input
            type="date"
            style={dateInputStyles}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button 
            style={dateArrowBtnStyles}
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split("T")[0]);
            }}
          >
            ▶
          </button>
          <button 
            style={todayBtnStyles}
            onClick={() => setSelectedDate(new Date().toISOString().split("T")[0])}
          >
            Today
          </button>
        </div>

        <span style={{ fontSize: "0.9rem", color: "#7A8B80", fontWeight: 500 }}>
          {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Visual Schedule Grid */}
      <div style={gridContainerStyles}>
        <table style={calendarTableStyles}>
          <thead>
            <tr>
              <th style={timeHeaderStyles}>Time</th>
              <th style={staffHeaderStyles}>Any Expert</th>
              {staff.map(s => (
                <th key={s.id} style={staffHeaderStyles}>
                  <div>{s.name}</div>
                  <div style={{ fontSize: "0.7rem", color: "#C5A880", fontWeight: 400 }}>{s.role.split(" & ")[0]}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map(hour => {
              return (
                <tr key={hour} style={{ height: "80px" }}>
                  <td style={timeColStyles}>{hour}</td>
                  
                  {/* Any Expert Column */}
                  <td style={cellStyles}>
                    {filteredBookings
                      .filter(b => !b.staffId && b.startTime.startsWith(hour.slice(0, 3)))
                      .map(b => (
                        <div 
                          key={b.id} 
                          style={{
                            ...bookingCardStyles,
                            borderLeftColor: b.status === "COMPLETED" ? "#28a745" : "#C5A880"
                          }}
                          onClick={() => openBookingDetails(b)}
                        >
                          <div style={bTitleStyles}>{b.customerName}</div>
                          <div style={bDescStyles}>{b.services.map(s => s.name).join(", ")}</div>
                          <div style={bTimeStyles}>{b.startTime} - {b.endTime}</div>
                        </div>
                      ))}
                  </td>

                  {/* Specific Staff Columns */}
                  {staff.map(s => {
                    const matchedBookings = filteredBookings.filter(b => 
                      b.staffId === s.id && 
                      b.startTime.startsWith(hour.slice(0, 3))
                    );

                    const isLunch = hour === "13:00";

                    return (
                      <td key={s.id} style={{ ...cellStyles, backgroundColor: isLunch ? "rgba(10, 42, 30, 0.02)" : "transparent" }}>
                        {isLunch && (
                          <div style={lunchBlockStyles}>🍽 Lunch Break</div>
                        )}
                        {matchedBookings.map(b => (
                          <div 
                            key={b.id} 
                            style={{
                              ...bookingCardStyles,
                              borderLeftColor: b.status === "COMPLETED" ? "#28a745" : b.status === "CANCELLED" ? "#d9534f" : "#0A2A1E"
                            }}
                            onClick={() => openBookingDetails(b)}
                          >
                            <div style={bTitleStyles}>{b.customerName}</div>
                            <div style={bDescStyles}>{b.services.map(s => s.name).join(", ")}</div>
                            <div style={bTimeStyles}>{b.startTime} - {b.endTime}</div>
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Appointment Edit Modal */}
      {isModalOpen && activeBooking && (
        <div style={modalOverlayStyles} onClick={() => setIsModalOpen(false)}>
          <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyles}>
              <h3 style={{ margin: 0, fontFamily: "var(--font-serif), serif", color: "#0A2A1E" }}>
                Appointment Details
              </h3>
              <button style={closeBtnStyles} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <span style={labelStyles}>Client Details</span>
                <div style={{ fontWeight: 500 }}>{activeBooking.customerName} ({activeBooking.customerPhone})</div>
                {activeBooking.notes && (
                  <div style={{ fontSize: "0.85rem", fontStyle: "italic", marginTop: "5px", color: "#5A5A5A" }}>
                    "Notes: {activeBooking.notes}"
                  </div>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <span style={labelStyles}>Services Booked</span>
                <div style={{ fontSize: "0.9rem" }}>
                  {activeBooking.services.map(s => `${s.name} (₹{s.price})`).join(", ")}
                </div>
                <div style={{ fontWeight: 600, marginTop: "2px", color: "var(--color-emerald-deep)" }}>
                  Total: ₹{activeBooking.totalAmount.toFixed(2)}
                </div>
              </div>

              <div style={{ borderBottom: "1px solid rgba(10, 42, 30, 0.05)", margin: "15px 0" }}></div>

              {/* Reschedule form */}
              <form onSubmit={handleReschedule} style={{ marginBottom: "20px" }}>
                <span style={labelStyles}>Reschedule Appointment</span>
                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.75rem", display: "block" }}>Start Time</label>
                    <input
                      type="text"
                      className="formInput"
                      style={smallInputStyles}
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="e.g. 10:30"
                    />
                  </div>
                </div>
                <button type="submit" style={{ ...btnStyles, marginTop: "10px" }}>Update Schedule</button>
              </form>

              <div style={{ borderBottom: "1px solid rgba(10, 42, 30, 0.05)", margin: "15px 0" }}></div>

              {/* Status Update Options */}
              <div>
                <span style={labelStyles}>Update Booking Status</span>
                <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                  <button 
                    style={statusBtnSuccessStyles}
                    onClick={() => handleUpdateStatus(activeBooking.id, "COMPLETED")}
                  >
                    ✓ Mark Completed
                  </button>
                  <button 
                    style={statusBtnWarningStyles}
                    onClick={() => handleUpdateStatus(activeBooking.id, "NOSHOW")}
                  >
                    ⚠ No Show
                  </button>
                  <button 
                    style={statusBtnDangerStyles}
                    onClick={() => handleUpdateStatus(activeBooking.id, "CANCELLED")}
                  >
                    ✕ Cancel Booking
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styling definitions
const headerControlStyles: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
  backgroundColor: "#FFFFFF",
  padding: "15px 20px",
  borderRadius: "8px",
  border: "1px solid rgba(10, 42, 30, 0.05)"
};

const dateInputStyles: React.CSSProperties = {
  padding: "8px 12px",
  border: "1px solid #EADEC9",
  borderRadius: "4px",
  fontFamily: "inherit",
  fontSize: "0.9rem"
};

const dateArrowBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "1rem",
  color: "#C5A880",
  cursor: "pointer",
  padding: "0 10px"
};

const todayBtnStyles: React.CSSProperties = {
  backgroundColor: "#FAF8F5",
  border: "1px solid #EADEC9",
  padding: "8px 15px",
  borderRadius: "4px",
  fontSize: "0.85rem",
  fontWeight: 500,
  cursor: "pointer"
};

const gridContainerStyles: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid rgba(10, 42, 30, 0.05)",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.02)"
};

const calendarTableStyles: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  tableLayout: "fixed"
};

const timeHeaderStyles: React.CSSProperties = {
  width: "100px",
  backgroundColor: "#FAF8F5",
  borderBottom: "2px solid rgba(10, 42, 30, 0.05)",
  padding: "15px 10px",
  fontSize: "0.8rem",
  textTransform: "uppercase",
  color: "#7A8B80",
  fontWeight: 600,
  textAlign: "center"
};

const staffHeaderStyles: React.CSSProperties = {
  borderBottom: "2px solid rgba(10, 42, 30, 0.05)",
  padding: "15px",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#0A2A1E",
  backgroundColor: "#FFFFFF",
  textAlign: "center",
  borderLeft: "1px solid rgba(10, 42, 30, 0.05)"
};

const timeColStyles: React.CSSProperties = {
  textAlign: "center",
  fontWeight: 600,
  fontSize: "0.85rem",
  color: "#7A8B80",
  backgroundColor: "#FAF8F5",
  borderBottom: "1px solid rgba(10, 42, 30, 0.05)"
};

const cellStyles: React.CSSProperties = {
  borderLeft: "1px solid rgba(10, 42, 30, 0.05)",
  borderBottom: "1px solid rgba(10, 42, 30, 0.05)",
  padding: "5px",
  verticalAlign: "top",
  position: "relative"
};

const bookingCardStyles: React.CSSProperties = {
  backgroundColor: "#FAF8F5",
  borderLeft: "4px solid #0A2A1E",
  borderRadius: "4px",
  padding: "8px",
  fontSize: "0.75rem",
  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
  cursor: "pointer",
  marginBottom: "4px",
  transition: "transform 0.15s"
};

const bTitleStyles: React.CSSProperties = {
  fontWeight: 600,
  color: "#0A2A1E",
  marginBottom: "2px"
};

const bDescStyles: React.CSSProperties = {
  color: "#3D4A41",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  marginBottom: "3px"
};

const bTimeStyles: React.CSSProperties = {
  color: "#7A8B80",
  fontSize: "0.7rem",
  fontWeight: 500
};

const lunchBlockStyles: React.CSSProperties = {
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#7A8B80",
  fontSize: "0.8rem",
  fontWeight: 500,
  backgroundColor: "rgba(197, 168, 128, 0.05)",
  borderRadius: "4px"
};

// Modal styles
const modalOverlayStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(4px)",
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px"
};

const modalStyles: React.CSSProperties = {
  width: "100%",
  maxWidth: "520px",
  backgroundColor: "#FFFFFF",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 20px 50px rgba(0,0,0,0.15)"
};

const modalHeaderStyles: React.CSSProperties = {
  padding: "20px",
  borderBottom: "1px solid rgba(10, 42, 30, 0.05)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const closeBtnStyles: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "1.2rem",
  color: "#7A8B80",
  cursor: "pointer"
};

const labelStyles: React.CSSProperties = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: "#C5A880",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "3px"
};

const smallInputStyles: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  border: "1px solid #EADEC9",
  borderRadius: "4px",
  fontSize: "0.85rem"
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

const statusBtnSuccessStyles: React.CSSProperties = {
  backgroundColor: "#28a745",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "4px",
  padding: "10px 15px",
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer",
  flex: 1
};

const statusBtnWarningStyles: React.CSSProperties = {
  backgroundColor: "#f0ad4e",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "4px",
  padding: "10px 15px",
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer",
  flex: 1
};

const statusBtnDangerStyles: React.CSSProperties = {
  backgroundColor: "#d9534f",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "4px",
  padding: "10px 15px",
  fontSize: "0.8rem",
  fontWeight: 500,
  cursor: "pointer",
  flex: 1
};
