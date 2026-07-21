import fs from "fs";
import path from "path";
import prisma from "./db";
import {
  initialServices,
  initialStaff,
  initialOffers,
  initialPackages,
  initialReviews,
  initialGallery,
  ServiceItem,
  StaffItem,
  OfferItem,
  PackageItem,
  ReviewItem,
  GalleryItem
} from "./mockData";

const FALLBACK_FILE_PATH = path.join(process.cwd(), "prisma", "db-fallback.json");

interface FallbackDatabase {
  services: ServiceItem[];
  staff: StaffItem[];
  offers: OfferItem[];
  packages: PackageItem[];
  reviews: ReviewItem[];
  gallery: GalleryItem[];
  bookings: any[];
  holidays: any[];
  settings: {
    businessHours: {
      open: string;
      close: string;
    };
    razorpayKeyId: string;
    razorpayKeySecret: string;
    twilioSid: string;
    twilioAuthToken: string;
    twilioFromNumber: string;
    ownerPhoneNumber: string;
    whatsappNumber: string;
  };
}

const defaultFallbackData: FallbackDatabase = {
  services: initialServices,
  staff: initialStaff,
  offers: initialOffers,
  packages: initialPackages,
  reviews: initialReviews,
  gallery: initialGallery,
  bookings: [],
  holidays: [],
  settings: {
    businessHours: {
      open: "11:00",
      close: "20:00"
    },
    razorpayKeyId: "",
    razorpayKeySecret: "",
    twilioSid: "",
    twilioAuthToken: "",
    twilioFromNumber: "",
    ownerPhoneNumber: "",
    whatsappNumber: ""
  }
};

// Helper: Ensure the fallback JSON file exists and read it
function getFallbackDb(): FallbackDatabase {
  try {
    if (!fs.existsSync(FALLBACK_FILE_PATH)) {
      // Ensure directory exists
      const dir = path.dirname(FALLBACK_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(defaultFallbackData, null, 2), "utf-8");
      return defaultFallbackData;
    }
    const content = fs.readFileSync(FALLBACK_FILE_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Fallback DB read error:", error);
    return defaultFallbackData;
  }
}

// Helper: Write updates to the fallback JSON file
function saveFallbackDb(data: FallbackDatabase) {
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Fallback DB write error:", error);
  }
}

// Check if database is connected (runs a simple select/query)
let isPrismaConnected = false;
let connectionChecked = false;

async function checkPrismaConnection(): Promise<boolean> {
  if (connectionChecked) return isPrismaConnected;
  try {
    // Timeout check after 1.5s so it doesn't hang
    const timer = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
    const query = prisma.admin.findFirst();
    await Promise.race([query, timer]);
    isPrismaConnected = true;
  } catch (e) {
    console.log("⚠️ PostgreSQL via Prisma is not active or configured. Using local JSON fallback database at:", FALLBACK_FILE_PATH);
    isPrismaConnected = false;
  }
  connectionChecked = true;
  return isPrismaConnected;
}

// SERVICES
export async function getServices(): Promise<ServiceItem[]> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const items = await prisma.service.findMany({ where: { isActive: true } });
      if (items.length > 0) {
        return items.map(item => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          category: item.category,
          description: item.description,
          benefits: item.benefits,
          price: Number(item.price),
          offerPrice: item.offerPrice ? Number(item.offerPrice) : undefined,
          duration: item.duration,
          imageUrl: item.imageUrl,
          isActive: item.isActive
        }));
      }
    } catch (e) {
      console.error("Prisma getServices error:", e);
    }
  }
  return getFallbackDb().services.filter(s => s.isActive);
}

export async function addService(service: Omit<ServiceItem, "id">): Promise<ServiceItem> {
  const connected = await checkPrismaConnection();
  const id = `s-${Date.now()}`;
  const newItem = { id, ...service };

  if (connected) {
    try {
      const item = await prisma.service.create({
        data: {
          name: service.name,
          slug: service.slug,
          category: service.category,
          description: service.description,
          benefits: service.benefits,
          price: service.price,
          offerPrice: service.offerPrice ?? null,
          duration: service.duration,
          imageUrl: service.imageUrl,
          isActive: service.isActive
        }
      });
      return {
        ...newItem,
        id: item.id,
        price: Number(item.price),
        offerPrice: item.offerPrice ? Number(item.offerPrice) : undefined
      };
    } catch (e) {
      console.error("Prisma addService error:", e);
    }
  }

  const db = getFallbackDb();
  db.services.push(newItem);
  saveFallbackDb(db);
  return newItem;
}

export async function updateService(id: string, updates: Partial<ServiceItem>): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const prismaData: any = {};
      if (updates.name !== undefined) prismaData.name = updates.name;
      if (updates.slug !== undefined) prismaData.slug = updates.slug;
      if (updates.category !== undefined) prismaData.category = updates.category;
      if (updates.description !== undefined) prismaData.description = updates.description;
      if (updates.benefits !== undefined) prismaData.benefits = updates.benefits;
      if (updates.price !== undefined) prismaData.price = updates.price;
      if (updates.offerPrice !== undefined) prismaData.offerPrice = updates.offerPrice ?? null;
      if (updates.duration !== undefined) prismaData.duration = updates.duration;
      if (updates.imageUrl !== undefined) prismaData.imageUrl = updates.imageUrl;
      if (updates.isActive !== undefined) prismaData.isActive = updates.isActive;

      await prisma.service.update({ where: { id }, data: prismaData });
      return true;
    } catch (e) {
      console.error("Prisma updateService error:", e);
    }
  }

  const db = getFallbackDb();
  const index = db.services.findIndex(s => s.id === id);
  if (index !== -1) {
    db.services[index] = { ...db.services[index], ...updates };
    saveFallbackDb(db);
    return true;
  }
  return false;
}

export async function deleteService(id: string): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      await prisma.service.update({ where: { id }, data: { isActive: false } });
      return true;
    } catch (e) {
      console.error("Prisma deleteService error:", e);
    }
  }

  const db = getFallbackDb();
  const index = db.services.findIndex(s => s.id === id);
  if (index !== -1) {
    db.services[index].isActive = false; // soft delete
    saveFallbackDb(db);
    return true;
  }
  return false;
}

// STAFF
export async function getStaff(): Promise<StaffItem[]> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const items = await prisma.staff.findMany({ where: { isActive: true } });
      if (items.length > 0) {
        return items.map(item => ({
          id: item.id,
          name: item.name,
          role: item.role,
          imageUrl: item.imageUrl || "/images/default-avatar.jpg",
          isActive: item.isActive
        }));
      }
    } catch (e) {
      console.error("Prisma getStaff error:", e);
    }
  }
  return getFallbackDb().staff.filter(s => s.isActive);
}

export async function addStaff(staff: Omit<StaffItem, "id">): Promise<StaffItem> {
  const connected = await checkPrismaConnection();
  const id = `e-${Date.now()}`;
  const newItem = { id, ...staff };

  if (connected) {
    try {
      const item = await prisma.staff.create({
        data: {
          name: staff.name,
          role: staff.role,
          imageUrl: staff.imageUrl,
          isActive: staff.isActive
        }
      });
      return { ...newItem, id: item.id };
    } catch (e) {
      console.error("Prisma addStaff error:", e);
    }
  }

  const db = getFallbackDb();
  db.staff.push(newItem);
  saveFallbackDb(db);
  return newItem;
}

export async function getOffers(all: boolean = false): Promise<OfferItem[]> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const items = await prisma.offer.findMany({ where: { isActive: true } });
      if (items.length > 0) {
        return items.map(item => ({
          id: item.id,
          title: item.title,
          code: item.code,
          description: item.description || "",
          discountType: item.discountType as any,
          discountValue: Number(item.discountValue),
          startDate: item.startDate.toISOString().split("T")[0],
          endDate: item.endDate.toISOString().split("T")[0],
          isActive: item.isActive
        }));
      }
    } catch (e) {
      console.error("Prisma getOffers error:", e);
    }
  }
  const dbOffers = getFallbackDb().offers.filter(o => o.isActive);
  if (all) {
    return dbOffers;
  }
  return dbOffers.filter(o => {
    const today = new Date().toISOString().split("T")[0];
    return today >= o.startDate && today <= o.endDate;
  });
}

export async function addOffer(offer: Omit<OfferItem, "id">): Promise<OfferItem> {
  const connected = await checkPrismaConnection();
  const id = `o-${Date.now()}`;
  const newItem = { id, ...offer };

  if (connected) {
    try {
      const item = await prisma.offer.create({
        data: {
          title: offer.title,
          code: offer.code,
          description: offer.description,
          discountType: offer.discountType,
          discountValue: offer.discountValue,
          startDate: new Date(offer.startDate),
          endDate: new Date(offer.endDate),
          isActive: offer.isActive
        }
      });
      return { ...newItem, id: item.id };
    } catch (e) {
      console.error("Prisma addOffer error:", e);
    }
  }

  const db = getFallbackDb();
  db.offers.push(newItem);
  saveFallbackDb(db);
  return newItem;
}

export async function updateOffer(id: string, updates: Partial<OfferItem>): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const prismaData: any = {};
      if (updates.title !== undefined) prismaData.title = updates.title;
      if (updates.code !== undefined) prismaData.code = updates.code;
      if (updates.description !== undefined) prismaData.description = updates.description;
      if (updates.discountType !== undefined) prismaData.discountType = updates.discountType;
      if (updates.discountValue !== undefined) prismaData.discountValue = Number(updates.discountValue);
      if (updates.startDate !== undefined) prismaData.startDate = new Date(updates.startDate);
      if (updates.endDate !== undefined) prismaData.endDate = new Date(updates.endDate);
      if (updates.isActive !== undefined) prismaData.isActive = updates.isActive;

      await prisma.offer.update({ where: { id }, data: prismaData });
      return true;
    } catch (e) {
      console.error("Prisma updateOffer error:", e);
    }
  }

  const db = getFallbackDb();
  const index = db.offers.findIndex(o => o.id === id);
  if (index !== -1) {
    db.offers[index] = { ...db.offers[index], ...updates };
    saveFallbackDb(db);
    return true;
  }
  return false;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      await prisma.offer.update({ where: { id }, data: { isActive: false } });
      return true;
    } catch (e) {
      console.error("Prisma deleteOffer error:", e);
    }
  }

  const db = getFallbackDb();
  const index = db.offers.findIndex(o => o.id === id);
  if (index !== -1) {
    db.offers[index].isActive = false; // soft delete
    saveFallbackDb(db);
    return true;
  }
  return false;
}

// PACKAGES
export async function getPackages(): Promise<PackageItem[]> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const items = await prisma.package.findMany({
        where: { isActive: true },
        include: { services: { include: { service: true } } }
      });
      if (items.length > 0) {
        return items.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: Number(item.price),
          validityDays: item.validityDays,
          includedServices: item.services.map(s => s.service.name),
          isActive: item.isActive
        }));
      }
    } catch (e) {
      console.error("Prisma getPackages error:", e);
    }
  }
  return getFallbackDb().packages.filter(p => p.isActive);
}

// REVIEWS
export async function getReviews(): Promise<ReviewItem[]> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const items = await prisma.review.findMany({ orderBy: { createdAt: "desc" } });
      if (items.length > 0) {
        return items.map(item => ({
          id: item.id,
          customerName: item.customerName,
          rating: item.rating,
          comment: item.comment,
          reply: item.reply || undefined,
          isVerified: item.isVerified,
          createdAt: item.createdAt.toISOString()
        }));
      }
    } catch (e) {
      console.error("Prisma getReviews error:", e);
    }
  }
  return getFallbackDb().reviews;
}

export async function addReview(review: Omit<ReviewItem, "id" | "createdAt">): Promise<ReviewItem> {
  const connected = await checkPrismaConnection();
  const id = `r-${Date.now()}`;
  const createdAt = new Date().toISOString();
  const newItem = { id, createdAt, ...review };

  if (connected) {
    try {
      const item = await prisma.review.create({
        data: {
          customerName: review.customerName,
          rating: review.rating,
          comment: review.comment,
          isVerified: review.isVerified
        }
      });
      return { ...newItem, id: item.id, createdAt: item.createdAt.toISOString() };
    } catch (e) {
      console.error("Prisma addReview error:", e);
    }
  }

  const db = getFallbackDb();
  db.reviews.unshift(newItem);
  saveFallbackDb(db);
  return newItem;
}

export async function replyToReview(id: string, replyText: string): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      await prisma.review.update({ where: { id }, data: { reply: replyText } });
      return true;
    } catch (e) {
      console.error("Prisma replyToReview error:", e);
    }
  }

  const db = getFallbackDb();
  const index = db.reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    db.reviews[index].reply = replyText;
    saveFallbackDb(db);
    return true;
  }
  return false;
}

// BOOKINGS
export async function getBookings(): Promise<any[]> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const items = await prisma.booking.findMany({
        include: {
          customer: true,
          staff: true,
          services: { include: { service: true } },
          offer: true
        },
        orderBy: { date: "asc" }
      });
      return items.map(b => ({
        id: b.id,
        bookingId: b.bookingId,
        customerName: b.customer.name,
        customerPhone: b.customer.phone,
        staffId: b.staffId,
        staffName: b.staff?.name || "Any Expert",
        date: b.date.toISOString().split("T")[0],
        startTime: b.startTime,
        endTime: b.endTime,
        notes: b.notes,
        status: b.status,
        paymentMethod: b.paymentMethod,
        paymentStatus: b.paymentStatus,
        totalAmount: Number(b.totalAmount),
        discountAmount: Number(b.discountAmount),
        services: b.services.map(bs => ({
          id: bs.service.id,
          name: bs.service.name,
          price: Number(bs.priceAtBooking)
        }))
      }));
    } catch (e) {
      console.error("Prisma getBookings error:", e);
    }
  }
  return getFallbackDb().bookings;
}

export async function createBooking(booking: {
  customerName: string;
  customerPhone: string;
  staffId?: string;
  date: string;
  startTime: string;
  services: { id: string; name: string; price: number; duration: number }[];
  notes?: string;
  paymentMethod: string;
  totalAmount: number;
  discountAmount: number;
  offerCode?: string;
}): Promise<any> {
  const connected = await checkPrismaConnection();
  
  // Calculate end time
  const totalDuration = booking.services.reduce((acc, s) => acc + s.duration, 0);
  const [startHour, startMin] = booking.startTime.split(":").map(Number);
  const endMinTotal = startMin + totalDuration;
  const endHour = startHour + Math.floor(endMinTotal / 60);
  const endMin = endMinTotal % 60;
  const endTime = `${String(endHour).padStart(2, "0")}:${String(endMin).padStart(2, "0")}`;

  const generatedId = `ARM-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const bookingDetails = {
    id: `b-${Date.now()}`,
    bookingId: generatedId,
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    staffId: booking.staffId || null,
    staffName: booking.staffId 
      ? (await getStaff()).find(s => s.id === booking.staffId)?.name || "Miss Anjana Gotawala"
      : "Any Expert",
    date: booking.date,
    startTime: booking.startTime,
    endTime: endTime,
    notes: booking.notes || null,
    status: "CONFIRMED",
    paymentMethod: booking.paymentMethod,
    paymentStatus: booking.paymentMethod === "PAY_AT_SALON" ? "PENDING" : "PAID",
    totalAmount: booking.totalAmount,
    discountAmount: booking.discountAmount,
    services: booking.services.map(s => ({ id: s.id, name: s.name, price: s.price })),
    createdAt: new Date().toISOString()
  };

  if (connected) {
    try {
      // Find or create customer
      let dbCustomer = await prisma.customer.findUnique({
        where: { phone: booking.customerPhone }
      });
      if (!dbCustomer) {
        dbCustomer = await prisma.customer.create({
          data: { name: booking.customerName, phone: booking.customerPhone }
        });
      }

      // Check if offer exists
      let dbOffer = null;
      if (booking.offerCode) {
        dbOffer = await prisma.offer.findUnique({ where: { code: booking.offerCode } });
      }

      const dbBooking = await prisma.booking.create({
        data: {
          bookingId: generatedId,
          customerId: dbCustomer.id,
          staffId: booking.staffId || null,
          date: new Date(booking.date),
          startTime: booking.startTime,
          endTime: endTime,
          notes: booking.notes || null,
          status: "CONFIRMED",
          paymentMethod: booking.paymentMethod as any,
          paymentStatus: booking.paymentMethod === "PAY_AT_SALON" ? "PENDING" : "PAID",
          totalAmount: booking.totalAmount,
          discountAmount: booking.discountAmount,
          offerId: dbOffer ? dbOffer.id : null,
          services: {
            create: booking.services.map(s => ({
              serviceId: s.id,
              priceAtBooking: s.price
            }))
          }
        }
      });

      return {
        ...bookingDetails,
        id: dbBooking.id
      };
    } catch (e) {
      console.error("Prisma createBooking error:", e);
    }
  }

  const db = getFallbackDb();
  db.bookings.push(bookingDetails);
  saveFallbackDb(db);
  return bookingDetails;
}

export async function updateBookingStatus(id: string, status: string): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      await prisma.booking.update({ where: { id }, data: { status: status as any } });
      return true;
    } catch (e) {
      console.error("Prisma updateBookingStatus error:", e);
    }
  }

  const db = getFallbackDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    db.bookings[index].status = status;
    saveFallbackDb(db);
    return true;
  }
  return false;
}

export async function rescheduleBooking(id: string, date: string, startTime: string): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      await prisma.booking.update({
        where: { id },
        data: { date: new Date(date), startTime }
      });
      return true;
    } catch (e) {
      console.error("Prisma rescheduleBooking error:", e);
    }
  }

  const db = getFallbackDb();
  const index = db.bookings.findIndex(b => b.id === id);
  if (index !== -1) {
    db.bookings[index].date = date;
    db.bookings[index].startTime = startTime;
    saveFallbackDb(db);
    return true;
  }
  return false;
}

// HOLIDAYS
export async function getHolidays(): Promise<string[]> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const items = await prisma.holiday.findMany();
      return items.map(h => h.date.toISOString().split("T")[0]);
    } catch (e) {
      console.error("Prisma getHolidays error:", e);
    }
  }
  return getFallbackDb().holidays;
}

export async function addHoliday(date: string, reason?: string): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      await prisma.holiday.create({ data: { date: new Date(date), reason } });
      return true;
    } catch (e) {
      console.error("Prisma addHoliday error:", e);
    }
  }

  const db = getFallbackDb();
  if (!db.holidays.includes(date)) {
    db.holidays.push(date);
    saveFallbackDb(db);
  }
  return true;
}

export async function removeHoliday(date: string): Promise<boolean> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      await prisma.holiday.delete({ where: { date: new Date(date) } });
      return true;
    } catch (e) {
      console.error("Prisma removeHoliday error:", e);
    }
  }

  const db = getFallbackDb();
  db.holidays = db.holidays.filter(h => h !== date);
  saveFallbackDb(db);
  return true;
}

// GALLERY
export async function getGallery(): Promise<GalleryItem[]> {
  const connected = await checkPrismaConnection();
  if (connected) {
    try {
      const items = await prisma.gallery.findMany();
      if (items.length > 0) {
        return items.map(item => ({
          id: item.id,
          imageUrl: item.imageUrl,
          category: item.category,
          isBeforeAfter: item.isBeforeAfter,
          afterImageUrl: item.afterImageUrl || undefined
        }));
      }
    } catch (e) {
      console.error("Prisma getGallery error:", e);
    }
  }
  return getFallbackDb().gallery;
}

export async function addGalleryItem(item: Omit<GalleryItem, "id">): Promise<GalleryItem> {
  const connected = await checkPrismaConnection();
  const id = `g-${Date.now()}`;
  const newItem = { id, ...item };

  if (connected) {
    try {
      const dbItem = await prisma.gallery.create({
        data: {
          imageUrl: item.imageUrl,
          category: item.category,
          isBeforeAfter: item.isBeforeAfter,
          afterImageUrl: item.afterImageUrl ?? null
        }
      });
      return { ...newItem, id: dbItem.id };
    } catch (e) {
      console.error("Prisma addGalleryItem error:", e);
    }
  }

  const db = getFallbackDb();
  db.gallery.push(newItem);
  saveFallbackDb(db);
  return newItem;
}

export async function getSettings(): Promise<FallbackDatabase["settings"]> {
  return getFallbackDb().settings;
}

export async function updateSettings(newSettings: Partial<FallbackDatabase["settings"]>): Promise<boolean> {
  const db = getFallbackDb();
  db.settings = { ...db.settings, ...newSettings };
  saveFallbackDb(db);
  return true;
}
