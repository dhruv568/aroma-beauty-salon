"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
import InteractiveBackground from "../components/InteractiveBackground";

interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  benefits: string[];
  price: number;
  offerPrice?: number;
  duration: number;
  imageUrl: string;
  isActive: boolean;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
}

interface Offer {
  id: string;
  title: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  startDate: string;
  endDate: string;
}

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  validityDays: number;
  includedServices: string[];
}

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  reply?: string;
  isVerified: boolean;
  createdAt: string;
}

export default function Home() {
  const router = useRouter();

  // Data State
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  // Navigation / UI State
  const [activeCategory, setActiveCategory] = useState<string>("HAIR");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");

  // Booking Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(""); // empty = Any Expert
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("PAY_AT_SALON");
  
  // Promo code state
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(null);
  const [promoError, setPromoError] = useState<string>("");
  const [promoSuccess, setPromoSuccess] = useState<string>("");

  // Loading and feedback
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);

  // Theme & Mobile Menu State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Load and apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("aroma_theme") || "light";
    setIsDarkMode(savedTheme === "dark");
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    setIsDarkMode(!isDarkMode);
    localStorage.setItem("aroma_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const smoothScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };



  // Fetch initial data & load Razorpay Checkout Script
  useEffect(() => {
    // Dynamically insert Razorpay standard checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    async function fetchData() {
      try {
        const [resServices, resStaff, resOffers, resPackages, resReviews, resHolidays, resBookings] = await Promise.all([
          fetch("/api/services").then(r => r.json()),
          fetch("/api/staff").then(r => r.json()),
          fetch("/api/offers").then(r => r.json()),
          fetch("/api/packages").then(r => r.json()),
          fetch("/api/reviews").then(r => r.json()),
          fetch("/api/holidays").then(r => r.json()),
          fetch("/api/bookings").then(r => r.json())
        ]);

        if (resServices.success) setServices(resServices.services);
        if (resStaff.success) setStaff(resStaff.staff);
        if (resOffers.success) setOffers(resOffers.offers);
        if (resPackages.success) setPackages(resPackages.packages);
        if (resReviews.success) setReviews(resReviews.reviews);
        if (resHolidays.success) setHolidays(resHolidays.holidays);
        if (resBookings.success) setExistingBookings(resBookings.bookings);
      } catch (error) {
        console.error("Error loading salon data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Check zero-login local storage
    const storedName = localStorage.getItem("aroma_client_name");
    const storedPhone = localStorage.getItem("aroma_client_phone");
    if (!storedName || !storedPhone) {
      const timer = setTimeout(() => setShowPopup(true), 1500);
      return () => {
        clearTimeout(timer);
        document.body.removeChild(script);
      };
    } else {
      setClientName(storedName);
      setClientPhone(storedPhone);
    }

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Save guest client popup information
  const handleSaveClientDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    localStorage.setItem("aroma_client_name", clientName.trim());
    localStorage.setItem("aroma_client_phone", clientPhone.trim());
    setShowPopup(false);
  };

  // Open booking flow with a service preselected
  const handleOpenBooking = (service: Service) => {
    // Check if client info exists
    const storedName = localStorage.getItem("aroma_client_name");
    const storedPhone = localStorage.getItem("aroma_client_phone");
    if (!storedName || !storedPhone) {
      setShowPopup(true);
      return;
    }

    setSelectedServices([service]);
    setSelectedStaffId("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedTime("");
    setSpecialInstructions("");
    setAppliedOffer(null);
    setCouponCode("");
    setPromoError("");
    setPromoSuccess("");
    setIsDrawerOpen(true);
  };

  // Add extra service to booking list
  const handleAddExtraService = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) return;
    setSelectedServices([...selectedServices, service]);
  };

  // Remove service from booking list
  const handleRemoveService = (serviceId: string) => {
    if (selectedServices.length <= 1) return; // must book at least one
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  // Apply Coupon Code
  const handleApplyPromo = () => {
    setPromoError("");
    setPromoSuccess("");
    if (!couponCode.trim()) return;

    const codeUpper = couponCode.trim().toUpperCase();
    const matchedOffer = offers.find(o => o.code === codeUpper);

    if (!matchedOffer) {
      setPromoError("Invalid coupon code.");
      setAppliedOffer(null);
      return;
    }

    setAppliedOffer(matchedOffer);
    setPromoSuccess(`Coupon "${matchedOffer.code}" applied successfully!`);
  };

  // Calculate pricing summary
  const subtotal = selectedServices.reduce((sum, s) => sum + (s.offerPrice || s.price), 0);
  let discount = 0;
  if (appliedOffer) {
    if (appliedOffer.discountType === "PERCENTAGE") {
      discount = (subtotal * appliedOffer.discountValue) / 100;
    } else {
      discount = Math.min(appliedOffer.discountValue, subtotal);
    }
  }
  const tax = Number(((subtotal - discount) * 0.05).toFixed(2));
  const totalAmount = Number((subtotal - discount + tax).toFixed(2));

  // Time slot generator check
  const generateTimeSlots = () => {
    if (!selectedDate) return [];

    // If date is a holiday
    if (holidays.includes(selectedDate)) {
      return [];
    }

    const slots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
      "18:00", "18:30", "19:00", "19:30"
    ];

    // Filter already booked times for the chosen staff on this date
    // (If staff is "Any Expert", slot is available if AT LEAST ONE staff is free)
    return slots.map(time => {
      const isLunchTime = time >= "13:00" && time < "14:00";
      
      if (selectedStaffId) {
        // Check if staff has lunch or is already booked
        const isBooked = existingBookings.some(b => 
          b.date === selectedDate && 
          b.startTime === time && 
          b.staffId === selectedStaffId &&
          b.status !== "CANCELLED"
        );
        return {
          time,
          available: !isLunchTime && !isBooked
        };
      } else {
        // Any expert selected: check if at least one staff is not booked
        const availableStaffCount = staff.filter(s => {
          const isBooked = existingBookings.some(b => 
            b.date === selectedDate && 
            b.startTime === time && 
            b.staffId === s.id &&
            b.status !== "CANCELLED"
          );
          return !isLunchTime && !isBooked;
        }).length;

        return {
          time,
          available: availableStaffCount > 0
        };
      }
    });
  };

  // Submit appointment booking
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time slot.");
      return;
    }

    setSubmittingBooking(true);

    const executeBooking = async (razorpayDetails?: { orderId: string; paymentId: string }) => {
      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerName: clientName,
            customerPhone: clientPhone,
            staffId: selectedStaffId || undefined,
            date: selectedDate,
            startTime: selectedTime,
            services: selectedServices.map(s => ({
              id: s.id,
              name: s.name,
              price: s.offerPrice || s.price,
              duration: s.duration
            })),
            notes: specialInstructions + (razorpayDetails ? ` | Razorpay Payment ID: ${razorpayDetails.paymentId}` : ""),
            paymentMethod,
            totalAmount,
            discountAmount: discount,
            offerCode: appliedOffer?.code
          })
        });

        const data = await response.json();
        if (data.success) {
          setIsDrawerOpen(false);
          // Refresh local bookings list
          const resBookings = await fetch("/api/bookings").then(r => r.json());
          if (resBookings.success) setExistingBookings(resBookings.bookings);
          
          // Redirect to booking confirmation screen
          router.push(`/booking-confirmation?id=${data.booking.id}`);
        } else {
          alert("Booking failed: " + data.error);
        }
      } catch (e) {
        console.error(e);
        alert("An error occurred during booking.");
      } finally {
        setSubmittingBooking(false);
      }
    };

    if (paymentMethod === "ONLINE_UPI") {
      try {
        const payResponse = await fetch("/api/payments/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totalAmount })
        });
        const payData = await payResponse.json();
        if (!payData.success) {
          alert("Razorpay order creation failed: " + payData.error);
          setSubmittingBooking(false);
          return;
        }

        const options = {
          key: payData.keyId,
          amount: payData.amount,
          currency: "INR",
          name: "Aroma Beauty Salon",
          description: "Luxury Treatment Checkout",
          order_id: payData.orderId,
          handler: async function (response: any) {
            // Payment successful, finalize the booking!
            await executeBooking({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id
            });
          },
          prefill: {
            name: clientName,
            contact: clientPhone
          },
          theme: {
            color: "#0A2A1E"
          },
          modal: {
            ondismiss: function() {
              setSubmittingBooking(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error("Razorpay error:", err);
        alert("Payment gateway failed to load. Please try again.");
        setSubmittingBooking(false);
      }
    } else {
      await executeBooking();
    }
  };

  const filteredServices = services.filter(s => {
    const matchesCategory = s.category === activeCategory;
    const matchesSearch = searchQuery.trim() === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.benefits.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ minHeight: "100vh", position: "relative" }}>
      {/* Sticky Header */}
      <header className={styles.header}>
        <div className={`${styles.headerContainer} container`}>
          <a href="#" className={styles.logoLink}>
            <div className={styles.logoTextWrapper}>
              <span className={styles.logoMainText}>AROMA</span>
              <span className={styles.logoSubText}>Beauty Salon</span>
            </div>
          </a>
          <nav className={styles.nav}>
            <a href="#offers" className={styles.navLink} onClick={(e) => smoothScrollTo(e, "offers")}>Offers</a>
            <a href="#services" className={styles.navLink} onClick={(e) => smoothScrollTo(e, "services")}>Services</a>
            <a href="#packages" className={styles.navLink} onClick={(e) => smoothScrollTo(e, "packages")}>Packages</a>
            <a href="#reviews" className={styles.navLink} onClick={(e) => smoothScrollTo(e, "reviews")}>Reviews</a>
            <a href="#contact" className={styles.navLink} onClick={(e) => smoothScrollTo(e, "contact")}>Hours & Map</a>
            {clientName && (
              <span style={{ fontSize: "0.85rem", color: "var(--color-gold)", borderLeft: "1px solid rgba(255,255,255,0.2)", paddingLeft: "15px" }}>
                Hello, {clientName.split(" ")[0]}
              </span>
            )}
          </nav>

          <div className={styles.headerActionsRight}>
            {/* Theme Toggle Button */}
            <button 
              className={styles.themeToggleBtn} 
              onClick={toggleTheme}
              aria-label="Toggle dark/light theme"
            >
              {isDarkMode ? "☀" : "🌙"}
            </button>

            {/* Book Now Button */}
            <button 
              className={styles.bookBtn} 
              onClick={() => {
                if (services.length > 0) {
                  handleOpenBooking(services[0]);
                }
              }}
            >
              Book Now
            </button>

            {/* Mobile Hamburger Button */}
            <button 
              className={styles.burgerBtn} 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`${styles.mobileMenuDrawer} ${isMobileMenuOpen ? styles.mobileMenuDrawerActive : ""}`}>
        <a href="#offers" className={styles.mobileMenuLink} onClick={(e) => { setIsMobileMenuOpen(false); smoothScrollTo(e, "offers"); }}>Offers</a>
        <a href="#services" className={styles.mobileMenuLink} onClick={(e) => { setIsMobileMenuOpen(false); smoothScrollTo(e, "services"); }}>Services</a>
        <a href="#packages" className={styles.mobileMenuLink} onClick={(e) => { setIsMobileMenuOpen(false); smoothScrollTo(e, "packages"); }}>Packages</a>
        <a href="#reviews" className={styles.mobileMenuLink} onClick={(e) => { setIsMobileMenuOpen(false); smoothScrollTo(e, "reviews"); }}>Reviews</a>
        <a href="#contact" className={styles.mobileMenuLink} onClick={(e) => { setIsMobileMenuOpen(false); smoothScrollTo(e, "contact"); }}>Hours & Map</a>
        
        {/* On small mobile viewport, Book Now shows inside drawer */}
        <button 
          className={styles.confirmBookingBtn} 
          style={{ marginTop: "15px" }}
          onClick={() => {
            setIsMobileMenuOpen(false);
            if (services.length > 0) {
              handleOpenBooking(services[0]);
            }
          }}
        >
          Book Appointment
        </button>
      </div>

      {/* Hero Banner Section */}
      <section className={styles.hero}>
        <InteractiveBackground absolute={true} theme="dark" />
        <div className={`${styles.heroContainer} container`} style={{ position: "relative", zIndex: 2 }}>
          <div className={styles.heroContent}>
            <p className={styles.heroTagline}>Aroma Beauty Salon</p>
            <h1 className={styles.heroTitle}>Enhancing Your Natural Beauty</h1>
            <p className={styles.heroDesc}>
              Enter a world of luxurious pampering. Discover state-of-the-art treatments designed by award-winning specialists, strictly using organic products.
            </p>
            <div className={styles.heroActions}>
              <a href="#services" className={styles.primaryBtn}>Explore Services</a>
              <button 
                className={styles.secondaryBtn}
                onClick={() => {
                  if (services.length > 0) handleOpenBooking(services[0]);
                }}
              >
                Quick Book
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Offers Section */}
      <section id="offers" className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>Exclusive Campaigns</span>
          <h2 className={styles.sectionTitle}>Ongoing Offers & Combos</h2>
        </div>
        
        {loading ? (
          <div className="text-center">Loading luxurious experiences...</div>
        ) : (
          <div className={styles.offersGrid}>
            {offers.map(offer => (
              <div key={offer.id} className={styles.offerCard}>
                <span className={styles.offerBadge}>Offer</span>
                <div>
                  <h3 className={styles.offerTitle}>{offer.title}</h3>
                  <p className={styles.offerDesc}>{offer.description}</p>
                </div>
                <div className={styles.couponContainer}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-gray-muted)", display: "block" }}>Use Code</span>
                    <span className={styles.couponCode}>{offer.code}</span>
                  </div>
                  <button 
                    className={styles.copyBtn} 
                    onClick={() => {
                      navigator.clipboard.writeText(offer.code);
                      alert(`Coupon code "${offer.code}" copied to clipboard!`);
                    }}
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Services Section */}
      <section id="services" className={styles.section} style={{ backgroundColor: "var(--color-cream-base)" }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Premium Catalog</span>
            <h2 className={styles.sectionTitle}>Our Curated Services</h2>
          </div>

          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search for services (e.g., haircut, facial, waxing...)"
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className={styles.tabs}>
            {["HAIR", "SKIN", "NAILS", "BRIDAL"].map(cat => (
              <button
                key={cat}
                className={`${styles.tabBtn} ${activeCategory === cat ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredServices.length === 0 ? (
            <div className={styles.noResults}>
              <span className={styles.noResultsIcon}>✨</span>
              <h3 className={styles.noResultsTitle}>No services found</h3>
              <p className={styles.noResultsText}>We couldn't find any services matching "{searchQuery}" in the {activeCategory} category.</p>
              {searchQuery && (
                <button 
                  className={styles.secondaryBtn}
                  onClick={() => setSearchQuery("")}
                  style={{ marginTop: "1.5rem", padding: "0.8rem 2rem" }}
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className={styles.servicesGrid}>
              {filteredServices.map(service => (
                <div key={service.id} className={styles.serviceCard}>
                  <div className={styles.serviceImgContainer}>
                    {/* Fallback to luxury background gradient since files aren't uploaded */}
                    <div className={styles.serviceImgPlaceholder}>
                      {service.category === "HAIR" ? "✂" : service.category === "SKIN" ? "✦" : service.category === "NAILS" ? "💅" : "💄"}
                    </div>
                  </div>
                  <div className={styles.serviceBody}>
                    <div>
                      <div className={styles.serviceMeta}>
                        <span className={styles.serviceDuration}>⏱ {service.duration} mins</span>
                        <span>
                          {service.category === "HAIR" ? "💇" : service.category === "SKIN" ? "🌸" : service.category === "NAILS" ? "💅" : "✨"} {service.category}
                        </span>
                      </div>
                      <h3 className={styles.serviceTitle}>
                        <span className={styles.titleSymbol}>✦</span>{service.name}
                      </h3>
                      <p className={styles.serviceDesc}>{service.description}</p>
                      
                      <ul className={styles.benefitsList}>
                        {service.benefits.map((b, idx) => (
                          <li key={idx}>{b}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className={styles.priceContainer}>
                        {service.offerPrice ? (
                          <>
                            <span className={styles.originalPrice}>₹{service.price}</span>
                            <span className={styles.currentPrice}>₹{service.offerPrice}</span>
                          </>
                        ) : (
                          <span className={styles.currentPrice}>₹{service.price}</span>
                        )}
                      </div>
                      <button 
                        className={styles.primaryBtn} 
                        style={{ width: "100%", padding: "var(--space-sm) 0" }}
                        onClick={() => handleOpenBooking(service)}
                      >
                        Book Service
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>Value Rituals</span>
          <h2 className={styles.sectionTitle}>Featured Memberships & Combos</h2>
        </div>

        <div className={styles.packageGrid}>
          {packages.map((pkg, idx) => (
            <div key={pkg.id} className={`${styles.packageCard} ${idx === 1 ? styles.packageCardFeatured : ""}`}>
              <div>
                <h3 className={styles.packageTitle}>{pkg.name}</h3>
                <p style={{ fontSize: "0.85rem", opacity: 0.8, marginBottom: "var(--space-md)" }}>{pkg.description}</p>
                <div className={styles.packagePrice}>₹{pkg.price}</div>
                <span style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "var(--space-sm)" }}>
                  Included Services:
                </span>
                <ul className={styles.packageServices}>
                  {pkg.includedServices.map((srv, sIdx) => (
                    <li key={sIdx}>{srv}</li>
                  ))}
                </ul>
              </div>
              <button 
                className={styles.primaryBtn} 
                style={{ width: "100%" }}
                onClick={() => {
                  // Preselect first service of the package
                  const firstSrvName = pkg.includedServices[0];
                  const match = services.find(s => s.name === firstSrvName);
                  if (match) {
                    handleOpenBooking(match);
                  } else if (services.length > 0) {
                    handleOpenBooking(services[0]);
                  }
                }}
              >
                Purchase Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Experts Section */}
      <section className={styles.section} style={{ backgroundColor: "var(--color-emerald-deep)", color: "var(--color-white)", position: "relative", overflow: "hidden" }}>
        <InteractiveBackground absolute={true} theme="dark" />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Our Specialists</span>
            <h2 className={styles.sectionTitle} style={{ color: "var(--color-white)" }}>Meet Our Beauty Experts</h2>
          </div>

          <div className={styles.expertsGrid}>
            {staff.map(expert => (
              <div key={expert.id} className={styles.expertCard}>
                <div className={styles.expertAvatarContainer}>
                  <div className={styles.expertAvatarPlaceholder}>
                    {expert.name[0]}
                  </div>
                </div>
                <h3 className={styles.expertName}>{expert.name}</h3>
                <p className={styles.expertRole}>{expert.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className={`${styles.section} container`}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionSubtitle}>Verified Testimonials</span>
          <h2 className={styles.sectionTitle}>What Our Guests Say</h2>
        </div>

        <div className={styles.reviewsGrid}>
          {reviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div>
                <div className={styles.stars}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                <p className={styles.reviewComment}>"{review.comment}"</p>
              </div>
              <div>
                <div className={styles.reviewAuthor}>
                  <span className={styles.authorName}>{review.customerName}</span>
                  {review.isVerified && <span className={styles.verifiedBadge}>Verified Visit</span>}
                </div>
                {review.reply && (
                  <div className={styles.ownerReply}>
                    <p className={styles.ownerReplyTitle}>Aroma Team Response</p>
                    <p>{review.reply}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hours, Map & Contact Section */}
      <section id="contact" className={styles.section} style={{ backgroundColor: "var(--color-cream-base)" }}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSubtitle}>Find Aroma</span>
            <h2 className={styles.sectionTitle}>Business Hours & Location</h2>
          </div>

          <div className={styles.contactGrid}>
            {/* Map Column */}
            <div className={styles.mapContainer}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3501.99999!2d77.200000!3d28.600000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDM2JzAwLjAiTiA3N8KwMTInMDAuMCJF!5e0!3m2!1sen!2sin!4v1620000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
              ></iframe>
            </div>

            {/* Info Card Column */}
            <div className={styles.contactInfoCard}>
              <div className={styles.infoBlock}>
                <h4>Business Hours</h4>
                <p>Monday — Sunday: 9:00 AM — 8:00 PM</p>
                <p style={{ fontSize: "0.85rem", color: "var(--color-gold-dark)", marginTop: "5px" }}>
                  *Open on all public holidays except Diwali & Christmas.
                </p>
              </div>

              <div className={styles.infoBlock}>
                <h4>Salon Address</h4>
                <p>12, Luxury Boulevard, Sector 5,</p>
                <p>New Delhi, Delhi 110001</p>
              </div>

              <div className={styles.contactButtons}>
                <a href="tel:+919876543210" className={styles.btnCall}>
                  📞 Call Us: +91 9099908886
                </a>
                <a href="https://wa.me/919099908886" target="_blank" rel="noopener noreferrer" className={styles.btnWhatsapp}>
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={`${styles.footerGrid} container`}>
          <div className={styles.footerBrand}>
            <h3>AROMA</h3>
            <p>"Enhancing Your Natural Beauty"</p>
            <p style={{ marginTop: "15px", fontSize: "0.85rem" }}>
              Experience state-of-the-art organic pampering in New Delhi. No appointments should be missed!
            </p>
          </div>
          <div className={styles.footerColumn}>
            <h4>Services</h4>
            <ul>
              <li><a href="#services">Hair Care</a></li>
              <li><a href="#services">Skin Care</a></li>
              <li><a href="#services">Nail Art</a></li>
              <li><a href="#services">Bridal Rituals</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>Information</h4>
            <ul>
              <li><a href="#offers">Active Offers</a></li>
              <li><a href="#packages">Memberships</a></li>
              <li><a href="#contact">Location Address</a></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h4>Administrative</h4>
            <ul>
              <li><a href="/admin">Owner Dashboard</a></li>
            </ul>
          </div>
        </div>
        <div className={`${styles.footerBottom} container`}>
          <p>© 2026 AROMA. All rights reserved.</p>
          <p>Designed with Luxury & Care</p>
        </div>
      </footer>

      {/* FIRST TIME VISITOR POPUP (Zero-Login Step) */}
      {showPopup && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <h3 className={styles.popupLogo}>AROMA</h3>
            <p className={styles.popupTagline}>Enhancing Your Natural Beauty</p>
            <h4 className={styles.popupTitle}>Luxury Guest Registry</h4>
            <p className={styles.popupDesc}>
              Welcome! Register once to unlock fast, direct bookings without usernames or passwords.
            </p>
            <form onSubmit={handleSaveClientDetails}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Full Name</label>
                <input
                  type="text"
                  className={styles.formInput}
                  required
                  placeholder="e.g. Jane Doe"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Mobile Number</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.primaryBtn} style={{ width: "100%", marginTop: "15px" }}>
                Register & Enter
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING SLIDE-OUT DRAWER */}
      {isDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h3 className={styles.drawerTitle}>Book Appointment</h3>
              <button className={styles.closeDrawerBtn} onClick={() => setIsDrawerOpen(false)}>✕</button>
            </div>

            <div className={styles.drawerBody}>
              {/* Selected Services */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>Selected Services</span>
                {selectedServices.map(srv => (
                  <div key={srv.id} className={styles.selectedServiceListItem}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{srv.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-gray-muted)" }}>⏱ {srv.duration} mins</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontWeight: 600 }}>₹{srv.offerPrice || srv.price}</span>
                      <button className={styles.removeServiceBtn} onClick={() => handleRemoveService(srv.id)}>✕</button>
                    </div>
                  </div>
                ))}
                
                {/* Option to add more services */}
                <div style={{ marginTop: "10px" }}>
                  <label className={styles.formLabel} style={{ marginBottom: "5px" }}>Add more services:</label>
                  <select
                    className={styles.dateInput}
                    defaultValue=""
                    onChange={(e) => {
                      const match = services.find(s => s.id === e.target.value);
                      if (match) handleAddExtraService(match);
                      e.target.value = "";
                    }}
                  >
                    <option value="" disabled>-- Select Service to Add --</option>
                    {services
                      .filter(s => !selectedServices.find(ss => ss.id === s.id))
                      .map(s => (
                        <option key={s.id} value={s.id}>{s.name} (₹{s.offerPrice || s.price})</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Select Staff */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>Select Staff (Optional)</span>
                <div className={styles.staffGrid}>
                  <div 
                    className={`${styles.staffOptionCard} ${selectedStaffId === "" ? styles.staffOptionCardActive : ""}`}
                    onClick={() => setSelectedStaffId("")}
                  >
                    <div className={styles.staffOptionAvatar} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 600 }}>
                      ANY
                    </div>
                    <div className={styles.staffOptionName}>Any Expert</div>
                  </div>
                  
                  {staff.map(s => (
                    <div 
                      key={s.id}
                      className={`${styles.staffOptionCard} ${selectedStaffId === s.id ? styles.staffOptionCardActive : ""}`}
                      onClick={() => setSelectedStaffId(s.id)}
                    >
                      <div className={styles.staffOptionAvatar} style={{ display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", fontWeight: 600, backgroundColor: "var(--color-emerald-deep)", color: "var(--color-white)" }}>
                        {s.name[0]}
                      </div>
                      <div className={styles.staffOptionName}>{s.name.split(" ")[0]}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date & Time slots */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>Select Date & Slot</span>
                <div className={styles.dateInputGroup}>
                  <input
                    type="date"
                    className={styles.dateInput}
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setSelectedTime("");
                    }}
                  />
                </div>

                {generateTimeSlots().length === 0 ? (
                  <p style={{ color: "#d9534f", fontSize: "0.9rem" }}>No slots available or salon is closed on this date.</p>
                ) : (
                  <>
                    <h5 className={styles.slotsGroupTitle}>Available Slots</h5>
                    <div className={styles.slotsGrid}>
                      {generateTimeSlots().map(slot => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          className={`${styles.slotChip} ${selectedTime === slot.time ? styles.slotChipActive : ""} ${!slot.available ? styles.slotChipDisabled : ""}`}
                          onClick={() => setSelectedTime(slot.time)}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Instructions */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>Special Requests</span>
                <textarea
                  className={styles.dateInput}
                  style={{ height: "80px", resize: "none" }}
                  placeholder="e.g. hair allergies, specific stylist requests, pressure preferences..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>

              {/* Coupon Codes */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>Apply Promo Code</span>
                <div className={styles.promoGroup}>
                  <input
                    type="text"
                    className={styles.promoInput}
                    placeholder="e.g. GLOW20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button className={styles.promoBtn} onClick={handleApplyPromo}>Apply</button>
                </div>
                {promoError && <p className={styles.promoMessage} style={{ color: "#d9534f" }}>{promoError}</p>}
                {promoSuccess && <p className={styles.promoMessage} style={{ color: "#28a745" }}>{promoSuccess}</p>}
              </div>

              {/* Payment Method */}
              <div className={styles.drawerSection}>
                <span className={styles.drawerSectionTitle}>Payment Method</span>
                <div 
                  className={`${styles.paymentOption} ${paymentMethod === "PAY_AT_SALON" ? styles.paymentOptionActive : ""}`}
                  onClick={() => setPaymentMethod("PAY_AT_SALON")}
                >
                  <input type="radio" checked={paymentMethod === "PAY_AT_SALON"} readOnly />
                  <div>
                    <div style={{ fontWeight: 500 }}>Pay at Salon</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-gray-muted)" }}>Pay by Cash/Card/UPI after service</div>
                  </div>
                </div>

                <div 
                  className={`${styles.paymentOption} ${paymentMethod === "ONLINE_UPI" ? styles.paymentOptionActive : ""}`}
                  onClick={() => setPaymentMethod("ONLINE_UPI")}
                >
                  <input type="radio" checked={paymentMethod === "ONLINE_UPI"} readOnly />
                  <div>
                    <div style={{ fontWeight: 500 }}>Instant UPI / Razorpay</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-gray-muted)" }}>Secure checkout via UPI or Card</div>
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className={styles.summaryBox}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className={styles.summaryRow} style={{ color: "#28a745" }}>
                    <span>Promo Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className={styles.summaryRow}>
                  <span>Tax (5% GST)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className={styles.summaryTotalRow}>
                  <span>Total Amount</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button 
                className={styles.confirmBookingBtn} 
                disabled={submittingBooking || !selectedDate || !selectedTime}
                onClick={handleConfirmBooking}
              >
                {submittingBooking ? "Booking..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Ambient Background */}
      <InteractiveBackground theme={isDarkMode ? "dark" : "light"} />
    </div>
  );
}
