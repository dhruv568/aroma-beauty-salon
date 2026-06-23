import { getSettings } from "./dataService";

interface BookingNotificationData {
  bookingId: string;
  customerName: string;
  customerPhone: string;
  staffName: string;
  date: string;
  startTime: string;
  totalAmount: number;
  paymentMethod: string;
  services: { name: string }[];
}

export async function sendTwilioMessage(to: string, body: string, isWhatsApp: boolean = false) {
  try {
    const settings = await getSettings();
    const { twilioSid, twilioAuthToken, twilioFromNumber } = settings;

    if (twilioSid && twilioAuthToken && twilioFromNumber) {
      const from = isWhatsApp ? `whatsapp:${twilioFromNumber}` : twilioFromNumber;
      const formattedTo = isWhatsApp ? `whatsapp:${to}` : to;

      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString("base64");

      const params = new URLSearchParams();
      params.append("From", from);
      params.append("To", formattedTo);
      params.append("Body", body);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Twilio send failed:", errorText);
        return false;
      }
      return true;
    } else {
      console.log(`[MOCK ${isWhatsApp ? "WHATSAPP" : "SMS"}] Sending to ${to}:\n${body}`);
      return true;
    }
  } catch (error) {
    console.error("Error in sendTwilioMessage:", error);
    return false;
  }
}

export async function notifyBookingCreated(booking: BookingNotificationData) {
  const serviceListStr = booking.services.map(s => s.name).join(", ");
  
  // 1. Send SMS/WhatsApp Confirmation to Customer
  const customerMessage = `Hello ${booking.customerName},\n\nYour appointment at Aroma Beauty Salon is confirmed!\n📅 Date: ${booking.date}\n⏱ Time: ${booking.startTime}\n💅 Services: ${serviceListStr}\n💵 Amount: ₹${booking.totalAmount.toFixed(2)}\nBooking ID: ${booking.bookingId}\n\nThank you for choosing Aroma!`;
  
  await sendTwilioMessage(booking.customerPhone, customerMessage);
  
  // Try sending WhatsApp copy if client has whatsappNumber set in settings
  const settings = await getSettings();
  if (settings.whatsappNumber) {
    await sendTwilioMessage(booking.customerPhone, customerMessage, true);
  }

  // 2. Send SMS Alert to Owner
  if (settings.ownerPhoneNumber) {
    const ownerMessage = `New Booking Alert!\nClient: ${booking.customerName} (${booking.customerPhone})\nServices: ${serviceListStr}\nDate: ${booking.date}\nTime: ${booking.startTime}\nTotal: ₹${booking.totalAmount.toFixed(2)}\nMethod: ${booking.paymentMethod.replace(/_/g, " ")}\nID: ${booking.bookingId}`;
    
    await sendTwilioMessage(settings.ownerPhoneNumber, ownerMessage);
  }
}
