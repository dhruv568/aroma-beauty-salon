"use client";

import React, { useEffect, useState } from "react";

export default function AdminSettings() {
  const [holidays, setHolidays] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Holiday Form State
  const [holidayDate, setHolidayDate] = useState("");
  const [holidayReason, setHolidayReason] = useState("");

  // Gateway Settings State
  const [razorpayKeyId, setRazorpayKeyId] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [twilioSid, setTwilioSid] = useState("");
  const [twilioAuthToken, setTwilioAuthToken] = useState("");
  const [twilioFromNumber, setTwilioFromNumber] = useState("");
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  
  // Hours State
  const [openTime, setOpenTime] = useState("09:00");
  const [closeTime, setCloseTime] = useState("20:00");
  
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [resHolidays, resSettings] = await Promise.all([
        fetch("/api/holidays").then(r => r.json()),
        fetch("/api/settings").then(r => r.json())
      ]);

      if (resHolidays.success) setHolidays(resHolidays.holidays);
      if (resSettings.success && resSettings.settings) {
        const s = resSettings.settings;
        setRazorpayKeyId(s.razorpayKeyId || "");
        setRazorpayKeySecret(s.razorpayKeySecret || "");
        setTwilioSid(s.twilioSid || "");
        setTwilioAuthToken(s.twilioAuthToken || "");
        setTwilioFromNumber(s.twilioFromNumber || "");
        setOwnerPhoneNumber(s.ownerPhoneNumber || "");
        setWhatsappNumber(s.whatsappNumber || "");
        if (s.businessHours) {
          setOpenTime(s.businessHours.open || "09:00");
          setCloseTime(s.businessHours.close || "20:00");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayDate) return;

    try {
      const response = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: holidayDate, reason: holidayReason })
      });
      const data = await response.json();
      if (data.success) {
        setHolidayDate("");
        setHolidayReason("");
        fetchInitialData();
      } else {
        alert("Failed to block holiday.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveHoliday = async (hDate: string) => {
    if (!confirm(`Are you sure you want to open booking slots for ${hDate}?`)) return;

    try {
      const response = await fetch(`/api/holidays?date=${hDate}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        fetchInitialData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessHours: { open: openTime, close: closeTime },
          razorpayKeyId,
          razorpayKeySecret,
          twilioSid,
          twilioAuthToken,
          twilioFromNumber,
          ownerPhoneNumber,
          whatsappNumber
        })
      });
      const data = await response.json();
      if (data.success) {
        alert("Configurations saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return <div style={{ fontSize: "1.1rem", color: "var(--color-emerald-deep)" }}>Loading settings manager...</div>;
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
      
      {/* Left Column: Holiday Block List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        
        {/* Block Holiday Card */}
        <div style={cardStyles}>
          <h3 style={sectionHeaderStyles}>Block Holiday Date</h3>
          <p style={{ fontSize: "0.85rem", color: "#7A8B80", marginBottom: "15px" }}>
            Block dates where the salon is fully closed. Clients cannot book slots on blocked holidays.
          </p>
          
          <form onSubmit={handleAddHoliday} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={labelStyles}>Holiday Date *</label>
              <input
                type="date"
                style={inputStyles}
                required
                min={new Date().toISOString().split("T")[0]}
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyles}>Closure Reason (Optional)</label>
              <input
                type="text"
                style={inputStyles}
                placeholder="e.g. Christmas Celebration"
                value={holidayReason}
                onChange={(e) => setHolidayReason(e.target.value)}
              />
            </div>

            <button type="submit" style={btnStyles}>
              Block Date
            </button>
          </form>
        </div>

        {/* Blocked Dates List */}
        <div style={cardStyles}>
          <h3 style={sectionHeaderStyles}>Blocked Dates ({holidays.length})</h3>
          {holidays.length === 0 ? (
            <p style={{ color: "#7A8B80", fontSize: "0.95rem" }}>No holidays configured yet.</p>
          ) : (
            <div style={holidayListStyles}>
              {holidays.map(hDate => (
                <div key={hDate} style={holidayItemStyles}>
                  <span style={{ fontWeight: 600, color: "#0A2A1E" }}>📅 {hDate}</span>
                  <button style={actionDeleteBtnStyles} onClick={() => handleRemoveHoliday(hDate)}>
                    ✕ Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Gateway Settings (Twilio, Razorpay, Hours) */}
      <div style={cardStyles}>
        <h3 style={sectionHeaderStyles}>Gateways & Business Configuration</h3>
        <p style={{ fontSize: "0.85rem", color: "#7A8B80", marginBottom: "20px" }}>
          Configure API credentials. If left empty, the booking flow will automatically run in sandbox/mock simulation mode.
        </p>

        <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* Business Hours */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyles}>Opening Time</label>
              <input
                type="text"
                style={inputStyles}
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                placeholder="09:00"
              />
            </div>
            <div>
              <label style={labelStyles}>Closing Time</label>
              <input
                type="text"
                style={inputStyles}
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                placeholder="20:00"
              />
            </div>
          </div>

          <div style={{ borderBottom: "1px solid rgba(10, 42, 30, 0.05)", margin: "10px 0" }}></div>

          {/* Razorpay Credentials */}
          <h4 style={subHeaderStyles}>💳 Razorpay Integration (India)</h4>
          <div>
            <label style={labelStyles}>Razorpay Key ID</label>
            <input
              type="text"
              style={inputStyles}
              placeholder="rzp_test_..."
              value={razorpayKeyId}
              onChange={(e) => setRazorpayKeyId(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyles}>Razorpay Key Secret</label>
            <input
              type="password"
              style={inputStyles}
              placeholder="••••••••"
              value={razorpayKeySecret}
              onChange={(e) => setRazorpayKeySecret(e.target.value)}
            />
          </div>

          <div style={{ borderBottom: "1px solid rgba(10, 42, 30, 0.05)", margin: "10px 0" }}></div>

          {/* Twilio Credentials */}
          <h4 style={subHeaderStyles}>💬 SMS & WhatsApp (Twilio Notifications)</h4>
          <div>
            <label style={labelStyles}>Twilio Account SID</label>
            <input
              type="text"
              style={inputStyles}
              placeholder="AC..."
              value={twilioSid}
              onChange={(e) => setTwilioSid(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyles}>Twilio Auth Token</label>
            <input
              type="password"
              style={inputStyles}
              placeholder="••••••••"
              value={twilioAuthToken}
              onChange={(e) => setTwilioAuthToken(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyles}>Twilio From Number (SMS Sender)</label>
            <input
              type="text"
              style={inputStyles}
              placeholder="+1415XXXXXXX"
              value={twilioFromNumber}
              onChange={(e) => setTwilioFromNumber(e.target.value)}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyles}>Owner Phone (Alerts) *</label>
              <input
                type="text"
                style={inputStyles}
                placeholder="+919876543210"
                value={ownerPhoneNumber}
                onChange={(e) => setOwnerPhoneNumber(e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyles}>Client WhatsApp (Alerts)</label>
              <input
                type="text"
                style={inputStyles}
                placeholder="+919876543210"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={savingSettings} style={{ ...btnStyles, marginTop: "15px", backgroundColor: "#C5A880", color: "#0A2A1E" }}>
            {savingSettings ? "Saving Settings..." : "Save Configuration Keys"}
          </button>
        </form>
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

const sectionHeaderStyles: React.CSSProperties = {
  fontFamily: "var(--font-serif), serif",
  fontSize: "1.3rem",
  color: "#0A2A1E",
  marginBottom: "15px",
  marginTop: 0
};

const subHeaderStyles: React.CSSProperties = {
  fontFamily: "var(--font-serif), serif",
  fontSize: "1rem",
  color: "#0A2A1E",
  margin: "0 0 5px 0"
};

const holidayListStyles: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const holidayItemStyles: React.CSSProperties = {
  backgroundColor: "#FAF8F5",
  border: "1px solid #EADEC9",
  borderRadius: "6px",
  padding: "12px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const actionDeleteBtnStyles: React.CSSProperties = {
  backgroundColor: "rgba(217, 83, 79, 0.1)",
  border: "none",
  color: "#d9534f",
  padding: "6px 12px",
  borderRadius: "4px",
  fontSize: "0.75rem",
  fontWeight: 500,
  cursor: "pointer"
};
