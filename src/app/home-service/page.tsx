"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./home-service.module.css";
import InteractiveBackground from "../../components/InteractiveBackground";

interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  benefits: string[];
  price: number;
  duration: number;
  imageUrl: string;
  isActive: boolean;
}

interface DistanceZone {
  id: string;
  name: string;
  range: string;
  fee: number;
  areas: string;
  recommended: boolean;
}

const DISTANCE_ZONES: DistanceZone[] = [
  {
    id: "zone-1",
    name: "Zone 1 — Nearby",
    range: "0 – 3 km",
    fee: 100,
    areas: "Udhana, Bamroli Road, Sai Jalaram Nagar, Pandesara",
    recommended: true,
  },
  {
    id: "zone-2",
    name: "Zone 2 — Medium",
    range: "3 – 7 km",
    fee: 200,
    areas: "Majura Gate, Ring Road, Khatodra, Bhatar, Althan",
    recommended: false,
  },
  {
    id: "zone-3",
    name: "Zone 3 — Long Distance",
    range: "7 – 12 km",
    fee: 350,
    areas: "Vesu, Adajan, Rander, Varachha, Katargam",
    recommended: false,
  },
  {
    id: "zone-4",
    name: "Zone 4 — Outskirts",
    range: "12+ km",
    fee: 500,
    areas: "Hazira, Palsana, Kamrej, Sarthana, Dindoli Outer",
    recommended: false,
  },
];

export default function HomeServicePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("HAIR");
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedZone, setSelectedZone] = useState<DistanceZone>(DISTANCE_ZONES[0]);
  const [customAreaInput, setCustomAreaInput] = useState<string>("");

  // Drawer / Checkout State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [fullAddress, setFullAddress] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("11:00");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("PAY_AT_HOME");
  const [bookingSuccess, setBookingSuccess] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [holidays, setHolidays] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resServices, resHolidays] = await Promise.all([
          fetch("/api/services").then((r) => r.json()),
          fetch("/api/holidays").then((r) => r.json()),
        ]);

        if (resServices.success) setServices(resServices.services);
        if (resHolidays.success) setHolidays(resHolidays.holidays);
      } catch (err) {
        console.error("Home Service data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const toggleSelectService = (service: Service) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  // Cost Calculations
  const servicesSubtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const travelSurcharge = selectedServices.length > 0 ? selectedZone.fee : 0;
  // Offer ₹100 discount on travel surcharge if order >= ₹1999
  const travelDiscount = servicesSubtotal >= 1999 && travelSurcharge > 0 ? 100 : 0;
  const effectiveTravelFee = Math.max(0, travelSurcharge - travelDiscount);
  const taxAmount = Number(((servicesSubtotal + effectiveTravelFee) * 0.05).toFixed(2));
  const grandTotal = Number((servicesSubtotal + effectiveTravelFee + taxAmount).toFixed(2));

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !fullAddress || !selectedDate || !selectedTime) {
      alert("Please fill in all required address and appointment details.");
      return;
    }

    setSubmitting(true);

    try {
      const combinedNotes = `[HOME SERVICE BOOKING] Address: ${fullAddress}. Zone: ${selectedZone.name} (${selectedZone.range}). Distance Fee: ₹${effectiveTravelFee}. ${specialInstructions ? "Notes: " + specialInstructions : ""}`;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: clientName,
          customerPhone: clientPhone,
          date: selectedDate,
          startTime: selectedTime,
          services: selectedServices.map((s) => ({ id: s.id, name: s.name, price: s.price })),
          notes: combinedNotes,
          paymentMethod: paymentMethod === "PAY_AT_HOME" ? "PAY_AT_SALON" : paymentMethod,
          totalAmount: grandTotal,
          discountAmount: travelDiscount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.booking);
        setIsCheckoutOpen(false);
        setSelectedServices([]);
      } else {
        alert("Home Service booking failed: " + data.error);
      }
    } catch (err: any) {
      alert("Booking error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = Array.from(new Set(services.map((s) => s.category)));
  const filteredServices = services.filter((s) => s.category === activeCategory);

  return (
    <div className={styles.homeServiceContainer}>
      {/* Motto Announcement Banner */}
      <div className={styles.mottoTopBanner}>
        <span>✨ RESULTS ARE GUARANTEED — OUR MOTTO ✨</span>
        <span className={styles.mottoHighlightSpan}>100% Satisfaction or Re-treatment Free</span>
      </div>

      {/* Header Navigation */}
      <header className={styles.header}>
        <div className={`${styles.headerContainer} container`}>
          <Link href="/" className={styles.logoLink}>
            <div>
              <div className={styles.logoMainText}>AROMA</div>
              <div className={styles.logoSubText}>Beauty Salon • Home Service</div>
            </div>
          </Link>

          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>
              ← Back to Main Salon
            </Link>
            <Link href="/#services" className={styles.navLink}>
              Salon Catalog
            </Link>
            <span className={styles.mottoBadgeNav}>
              ⭐ Results Guaranteed
            </span>
          </nav>
        </div>
      </header>

      {/* Hero Header */}
      <section className={styles.hero}>
        <InteractiveBackground absolute={true} theme="dark" />
        <div style={{ position: "relative", zIndex: 2 }}>
          <p className={styles.heroTagline}>Luxury Doorstep Beauty Care</p>
          <h1 className={styles.heroTitle}>Aroma Home Parlour Service</h1>

          <div className={styles.guaranteeBadgeHero}>
            ✨ 100% Results Are Guaranteed — Our Motto ✨
          </div>

          <p className={styles.heroSubtitle}>
            Enjoy signature salon treatments, hair styling, organic facials, & bridal makeup at your home in Surat with our certified experts & hygienic single-use kits.
          </p>
        </div>
      </section>

      {/* Distance Pricing Surcharge Selector */}
      <section className={styles.pricingSection}>
        <div className={styles.distanceCard}>
          <div className={styles.distanceCardHeader}>
            <span style={{ fontSize: "0.8rem", color: "#C5A880", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
              Step 1: Select Your Location Distance
            </span>
            <h2 className={styles.distanceCardTitle}>Home Visit Travel Charges</h2>
            <p style={{ fontSize: "0.9rem", color: "#666", maxWidth: "600px", margin: "0 auto" }}>
              Travel & sanitization charges are dynamically calculated based on distance from our Udhana Surat parlour location.
            </p>
          </div>

          <div className={styles.distanceGrid}>
            {DISTANCE_ZONES.map((zone) => {
              const isSelected = selectedZone.id === zone.id;
              return (
                <div
                  key={zone.id}
                  className={`${styles.zoneBox} ${isSelected ? styles.zoneBoxSelected : ""}`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className={styles.zoneName}>{zone.name}</div>
                  <div className={styles.zoneDistance}>{zone.range} from Parlour</div>
                  <div className={styles.zonePrice}>₹{zone.fee}</div>
                  <div className={styles.zoneAreas}>📍 {zone.areas}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", alignItems: "center", backgroundColor: "#FAF8F5", padding: "12px 18px", borderRadius: "10px", border: "1px solid #EADEC9" }}>
            <span style={{ fontSize: "1.2rem" }}>📍</span>
            <input
              type="text"
              placeholder="Or enter your specific area / landmark in Surat (e.g., Udhana, Vesu, Adajan)..."
              style={{ flex: 1, border: "none", background: "transparent", fontSize: "0.9rem", outline: "none" }}
              value={customAreaInput}
              onChange={(e) => setCustomAreaInput(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Service Catalog */}
      <section className={styles.serviceCatalogSection}>
        <div style={{ textAlign: "center", marginBottom: "15px" }}>
          <span style={{ fontSize: "0.8rem", color: "#C5A880", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>
            Step 2: Choose Treatments for Home Service
          </span>
          <h2 className={styles.sectionTitle}>Select Treatments</h2>
        </div>

        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.tabBtn} ${activeCategory === cat ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat} Care
            </button>
          ))}
        </div>

        {/* Services List Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#7A8B80" }}>
            Loading home treatments...
          </div>
        ) : (
          <div className={styles.serviceGrid}>
            {filteredServices.map((service) => {
              const isSelected = selectedServices.some((s) => s.id === service.id);
              return (
                <div key={service.id} className={styles.serviceCard}>
                  <div>
                    <div className={styles.serviceCardHeader}>
                      <h3 className={styles.serviceName}>{service.name}</h3>
                      <span className={styles.servicePrice}>₹{service.price}</span>
                    </div>

                    <div className={styles.serviceDuration}>
                      ⏱ {service.duration} mins • 100% Organic
                    </div>

                    <p className={styles.serviceDesc}>{service.description}</p>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.75rem", color: "#C5A880", fontWeight: 600, marginBottom: "10px" }}>
                      ✨ Guaranteed Result Included
                    </div>

                    <button
                      className={`${styles.addBtn} ${isSelected ? styles.addBtnSelected : ""}`}
                      onClick={() => toggleSelectService(service)}
                    >
                      {isSelected ? "✓ Added to Home Booking" : "+ Add to Home Service"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Bottom Cart Bar */}
      {selectedServices.length > 0 && (
        <div className={styles.cartSummaryBox}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-gold)", textTransform: "uppercase" }}>
              {selectedServices.length} Treatment{selectedServices.length > 1 ? "s" : ""} Selected
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              Total: ₹{grandTotal} <span style={{ fontSize: "0.75rem", fontWeight: 400, opacity: 0.8 }}>(Incl. ₹{effectiveTravelFee} Home Visit Fee)</span>
            </div>
          </div>

          <button className={styles.checkoutBtn} onClick={() => setIsCheckoutOpen(true)}>
            Book Home Appointment →
          </button>
        </div>
      )}

      {/* Home Service Checkout Modal */}
      {isCheckoutOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "var(--font-serif), serif", fontSize: "1.5rem", color: "#0A2A1E", margin: 0 }}>
                Home Appointment Checkout
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                style={{ background: "none", border: "none", fontSize: "1.5rem", cursor: "pointer", color: "#7A8B80" }}
              >
                ✕
              </button>
            </div>

            {/* Price Summary Breakdown */}
            <div style={{ backgroundColor: "#FAF8F5", padding: "15px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #EADEC9" }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0A2A1E", marginBottom: "8px" }}>
                Order Summary:
              </div>
              {selectedServices.map((s) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#555", marginBottom: "4px" }}>
                  <span>• {s.name}</span>
                  <span>₹{s.price}</span>
                </div>
              ))}
              <hr style={{ border: "none", borderTop: "1px solid #EADEC9", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#555" }}>
                <span>Subtotal</span>
                <span>₹{servicesSubtotal}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#555" }}>
                <span>Home Visit Fee ({selectedZone.name})</span>
                <span>₹{selectedZone.fee}</span>
              </div>
              {travelDiscount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#28a745", fontWeight: 600 }}>
                  <span>High Value Order Discount</span>
                  <span>-₹{travelDiscount}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#555" }}>
                <span>GST (5%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 700, color: "#0A2A1E", marginTop: "8px" }}>
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
            </div>

            <form onSubmit={handleBookingSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pinky Jariwala"
                  className={styles.inputField}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  className={styles.inputField}
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Complete Home Address in Surat *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="House/Flat No., Building Name, Street/Landmark, Area, Pincode..."
                  className={styles.inputField}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Date *</label>
                  <input
                    type="date"
                    required
                    className={styles.inputField}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Time Slot (11 AM – 8 PM) *</label>
                  <select
                    className={styles.inputField}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">01:00 PM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                    <option value="19:00">07:00 PM</option>
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Payment Option</label>
                <select
                  className={styles.inputField}
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="PAY_AT_HOME">💵 Pay at Home after Service</option>
                  <option value="UPI">📱 Pay Online via UPI / QR Code</option>
                  <option value="CARD">💳 Credit / Debit Card</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Special Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Please send senior female beautician"
                  className={styles.inputField}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={styles.checkoutBtn}
                style={{ width: "100%", marginTop: "15px" }}
              >
                {submitting ? "Confirming Booking..." : "Confirm Home Service Booking"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Confirmation Modal */}
      {bookingSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "10px" }}>🎉</div>
            <h2 style={{ fontFamily: "var(--font-serif), serif", color: "#0A2A1E", marginBottom: "10px" }}>
              Home Service Booking Confirmed!
            </h2>
            <div style={{ backgroundColor: "#FAF8F5", padding: "15px", borderRadius: "10px", margin: "20px 0", border: "1px solid #EADEC9" }}>
              <div style={{ fontSize: "0.85rem", color: "#7A8B80" }}>Booking ID:</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#C5A880" }}>{bookingSuccess.bookingId}</div>
              <div style={{ marginTop: "10px", fontSize: "0.9rem", color: "#0A2A1E" }}>
                📅 {bookingSuccess.date} at {bookingSuccess.startTime}
              </div>
              <div style={{ fontSize: "0.9rem", color: "#0A2A1E" }}>
                💰 Total Amount: ₹{bookingSuccess.totalAmount}
              </div>
            </div>
            <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.5 }}>
              Thank you, {bookingSuccess.customerName}! Our professional beauty expert will arrive at your home with sanitized equipment.
            </p>
            <div style={{ marginTop: "15px", fontSize: "0.85rem", color: "#C5A880", fontWeight: 700 }}>
              ✨ 100% Results Are Guaranteed — Our Motto ✨
            </div>
            <button
              onClick={() => setBookingSuccess(null)}
              className={styles.checkoutBtn}
              style={{ marginTop: "25px" }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <p>© 2026 Aroma Beauty Salon • Doorstep Home Services Surat</p>
          <p style={{ marginTop: "5px", fontSize: "0.8rem", color: "var(--color-gold)" }}>
            Shop No. 114, Om Shree Sai Jalaram Nagar, Near/Opposite Sai Samarpan, Opposite Jalaram Samosa, Bamroli Road, Udhana, Surat
          </p>
          <p style={{ marginTop: "5px", fontSize: "0.8rem" }}>
            Business Hours: 11:00 AM to 8:00 PM • ✨ Results Are Guaranteed
          </p>
        </div>
      </footer>
    </div>
  );
}
