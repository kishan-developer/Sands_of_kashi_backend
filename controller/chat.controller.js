// 🏦 THE GRAND KNOWLEDGE BASE of Sands of Kashi & Masala Mist (100+ Data Points)
const KNOWLEDGE_BASE = {
  hotel: {
    name: "Sands Of Kashi Hotel & Resort (Unit of Coral Group)",
    address: "C 19/27-14-A-C, Opposite Sigra P.S., Gulab Bagh Colony, Varanasi 221002",
    pincode: "221002",
    city: "Varanasi (Kashi)",
    landmark: "Opposite Sigra Police Station",
    experience: "10+ years experienced hospitality team",
    starRating: "3-Star Boutique Experience",
    contact: {
      phoneHotel: "+91-5423533526",
      phoneRest: "+91-7522801563",
      whatsappHotel: "+91-5423533526",
      whatsappRest: "+91-7522801563",
      email: "info@sandsofkashi.in, sandsofkashi@gmail.com",
    },
    timings: {
      checkIn: "12:00 PM",
      checkOut: "11:00 AM",
      reception: "24/7 Hours",
      roomService: "07:00 AM - 11:00 PM",
      breakfast: "08:00 AM - 10:30 AM",
    },
    facilities: [
      "Free High-Speed Wi-Fi",
      "24-Hour Hot Water",
      "Centralized AC & Deluxe Unit AC",
      "Power Backup (Genset)",
      "Daily Housekeeping",
      "Flat Screen TVs with Cable",
      "Parking (Safe and Private)",
      "Travel Desk for Kashi Darshan",
      "Doctor on Call",
      "Laundry Services",
      "Safe Deposit Box",
      "Airport/Station Pick-up & Drop",
    ],
    rooms: [
      { 
        name: "Standard Room", 
        price: "₹3500.00", 
        size: "130 sq.ft", 
        view: "City View", 
        occupancy: "Max 3 (2 Adults + 1 Child/Adult)", 
        bed: "Double/King Bed",
        features: ["Clean linens", "attached bathroom", "AC", "TV", "Hot water"]
      },
      { 
        name: "Executive Room", 
        price: "₹4500.00", 
        size: "200 sq.ft", 
        view: "Colony View", 
        occupancy: "Max 3 (2 Adults + 1 Child/Adult extra bed)", 
        bed: "King Size Bed",
        features: ["Spacious", "Work Desk", "Sofa Seating", "Premium Toiletries"]
      },
      { 
        name: "Royal Suite Room", 
        price: "₹5500.00", 
        size: "282 sq.ft", 
        view: "Premium View", 
        occupancy: "Max 4 with extra beds", 
        bed: "Grand King Size Bed",
        features: ["Luxury Suite", "Large Living Area", "Premium Decor", "Best for Families"]
      }
    ],
  },
  restaurant: {
    name: "Masala Mist",
    cuisine: "Multi-cuisine (Indian, Tandoor, Chinese, Fusion)",
    timings: "12:00 PM - 11:00 PM",
    ambience: "Premium Dark-Themed Luxury Dining",
    swiggyUrl: "https://www.swiggy.com/city/varanasi/masala-mist-sigra-rest1133630",
    zomatoUrl: "https://www.zomato.com/varanasi/masala-mist-sands-of-kashi-shastri-nagar",
    menuHighlights: {
      vegStarters: ["Paneer Tikka (₹425)", "Paneer Malai Tikka (₹435)", "Hariyali Paneer (₹425)", "Veg Platter (Coming Soon)"],
      nonVegStarters: ["Classic Chicken Tikka (₹465)", "Chicken Malai Tikka (₹475)", "Tandoori Chicken Full (₹645)"],
      specialKebabs: ["Mutton Galawati Kebab (₹475) - SIGNATURE", "Mutton Seekh Kebab (₹475)", "Dahi Ke Sholey"],
      mainCourse: ["Paneer Butter Masala", "Dal Makhani", "Chicken Curry", "Mutton Rara"],
      chinese: ["Veg Hakka Noodles (₹265)", "Chilli Chicken (₹435)", "Honey Chilli Potato (₹225)"],
    },
    offers: {
      directBooking: "20% OFF using code **LUMINA2024**",
      happyHours: "4 PM - 7 PM Daily (Buy 2 Get 1 on select beverages)",
    }
  },
  sightseeing: {
    darshan: [
      { temple: "Kashi Vishwanath Temple", distance: "01 KM", mode: "Toto/Auto/Walk" },
      { temple: "Dashashwamedh Ghat (Evening Aarti)", distance: "01 KM", significance: "Main Ghat for Aarti" },
      { temple: "Bharat Mata Mandir", distance: "0.05 KM", mode: "Just 2 mins walk" },
      { temple: "Sankat Mochan Temple", distance: "03 KM", mode: "15 mins by Auto" },
      { temple: "Durga Mandir/Tulsi Manas", distance: "03 KM", mode: "15 mins by Auto" },
      { temple: "BHU (New Vishwanath Temple)", distance: "04 KM", mode: "20 mins" },
      { temple: "Assi Ghat", distance: "03.5 KM", mode: "20 mins" },
      { temple: "Sarnath (Buddhist Hub)", distance: "10 KM", mode: "30-40 mins" },
      { location: "Cantt Railway Station", distance: "01 KM" },
      { location: "Varanasi Airport (LBS)", distance: "24 KM", driveTime: "45-60 mins" },
    ]
  },
  policies: {
    booking: "Advacance token for confirmation recommended.",
    cancellation: "Refundable if informed 48hrs prior to check-in.",
    children: "Under 6 years stay free (w/o extra bed).",
    extraBed: "Charged at ₹500 - ₹800 per night depending on room.",
    pets: "Pets are NOT allowed (for hygiene reasons).",
    idProof: "Aadhar/Driving License/Voter ID required for all guests. Pan Card NOT valid as ID proof.",
    foreignGuests: "Passport and C-Form required."
  }
};

// 🤖 SMART MATCHING ENGINE
const getSmartChatResponse = (query) => {
  const q = (query || "").toLowerCase();

  // HELLO QUERIES
  if (q.match(/\b(hi|hello|hey|namaste|ola|greetings)\b/)) {
    return "Namaste! 🙏 Welcome to **Sands Of Kashi** & **Masala Mist Restaurant**. I am your SOK Ai Assistant. How can I guide you with your stay, dining, or Kashi Darshan today?";
  }

  // PRICING QUERIES (ROOMS)
  if (q.includes("price") || q.includes("cost") || q.includes("rent") || q.includes("available")) {
    if (q.includes("standard")) return `Our **Standard Room** is priced at **${KNOWLEDGE_BASE.hotel.rooms[0].price}** per night. It includes AC, TV, and breakfast!`;
    if (q.includes("executive")) return `Our **Executive Room** is priced at **${KNOWLEDGE_BASE.hotel.rooms[1].price}** per night. It’s more spacious and premium.`;
    if (q.includes("royal") || q.includes("suite")) return `The **Royal Suite** is our top-tier room at **${KNOWLEDGE_BASE.hotel.rooms[2].price}** per night. Luxurious Kashi stay experience!`;
    return "We have 3 categories:\n• **Standard**: ₹3500\n• **Executive**: ₹4500\n• **Royal Suite**: ₹5500\nAll prices include Wi-Fi and modern amenities.";
  }

  // FOOD / RESTAURANT QUERIES
  if (q.includes("food") || q.includes("eat") || q.includes("menu") || q.includes("restaurant") || q.includes("masala mist") || q.includes("dinner") || q.includes("lunch")) {
    if (q.includes("paneer")) return "We have delightful Paneer options: Tikka (₹425), Malai Tikka (₹435), and Hariyali (₹425). Melt-in-your-mouth experience!";
    if (q.includes("chicken") || q.includes("non veg") || q.includes("non-veg")) return "Tandoori Chicken is our star (₹445/₹645). We also have Classics like Tikka (₹465) and Malai Tikka (₹475).";
    if (q.includes("kebab") || q.includes("mutton") || q.includes("galawati")) return "You MUST try our **Mutton Galawati Kebab (₹475)**. It's the signature dish of Masala Mist!";
    if (q.includes("chinese") || q.includes("noodle")) return "Our Chinese menu features Veg Hakka Noodles (₹265), Fried Rice (₹375), and Honey Chilli Potato (₹225).";
    if (q.includes("time") || q.includes("open")) return `Our restaurant **Masala Mist** opens at **${KNOWLEDGE_BASE.restaurant.timings}** every day.`;
    if (q.includes("offer") || q.includes("discount")) return `Yes, enjoy **20% OFF** with code **LUMINA2024** or join us for **Happy Hours (4PM-7PM)** for Buy 2 Get 1 offers!`;
    if (q.includes("zomato") || q.includes("swiggy") || q.includes("online")) return "Yes! We are on Swiggy and Zomato. Search for 'Masala Mist Sigra' to order online.";
    
    // FULL MENU RESPONSE
    return `🍽️ **FULL MENU - MASALA MIST**\n\n**INDIAN VEG STARTERS**\n• Paneer Tikka - ₹425\n• Paneer Malai Tikka - ₹435\n• Paneer Makhmali Tikka - ₹435\n• Paneer Hariyali Tikka - ₹425\n\n**NON-VEG TANDOOR**\n• Classic Chicken Tikka - ₹465\n• Chicken Malai Tikka - ₹475\n• Tandoori Chicken - ₹445 (Half) / ₹645 (Full)\n• Chilli Chicken - ₹435\n\n**SIGNATURE KEBABS**\n• Mutton Galawati Kebab - ₹475\n• Mutton Shami Kebab - ₹425\n• Mutton Seekh Kebab - ₹475\n\n**CHINESE BITES**\n• Veg Hakka Noodles - ₹265\n• Fried Rice - ₹375\n• Honey Chilli Potato - ₹225\n• Spring Roll - ₹325\n\n**PROMO**: Use code **LUMINA2024** for a 20% discount on your next visit!`;
  }

  // DISTANCE / DARSHAN QUERIES
  if (q.includes("distance") || q.includes("km") || q.includes("far") || q.includes("how far") || q.includes("temple") || q.includes("aarti")) {
    if (q.includes("airport")) return "The **Varanasi (LBS) Airport to our Hotel/Restaurant** distance is **24 KM**. It usually takes 45-60 minutes by car. We can arrange a pick-up/drop for you!";
    if (q.includes("station") || q.includes("railway")) return "The **Cantt Railway Station to our Hotel/Restaurant** is very close—only **1 KM** away (about 5 mins by Toto/Auto).";
    if (q.includes("vishwanath") || q.includes("temple") || q.includes("aarti")) return "Excellent news! We are just **1 KM** from Kashi Vishwanath Temple and the main Ghats. You can reach in 5-10 mins by Toto or enjoy a walk.";
    if (q.includes("ghat")) return "Assi Ghat is 3.5 KM away, and the main Dashashwamedh Ghat (Aarti place) is just **1 KM** away.";
    if (q.includes("sarnath")) return "Sarnath is **10 KM** from here. We recommend a 4-hour visit to see the Buddhist shrines.";
    if (q.includes("mandir")) return "The famous Bharat Mata Mandir is just **0.05 KM** (2 mins walk) from our gate!";

    return "We are centrally located! 1 KM from Kashi Vishwanath, 1 KM from Cantt Station, and 50 meters from Bharat Mata Mandir. Best location in Sigra!";
  }

  // FACILITIES & AMENITIES
  if (q.includes("wifi") || q.includes("parking") || q.includes("hot water") || q.includes("facility") || q.includes("amenity") || q.includes("ac")) {
    if (q.includes("parking")) return "Yes, we have **private and safe parking** available for our guests inside the colony premises.";
    if (q.includes("wifi")) return "Complimentary high-speed Wi-Fi is available in all rooms and common areas.";
    if (q.includes("ac") || q.includes("cooler")) return "All our rooms are fully Air-Conditioned with individual controls.";
    if (q.includes("water") || q.includes("geyser") || q.includes("shower")) return "We provide 24-hour hot and cold water in all room bathrooms.";
    
    return `We offer: ${KNOWLEDGE_BASE.hotel.facilities.slice(0, 6).join(", ")} and more!`;
  }

  // TIMING / POLICIES
  if (q.includes("check in") || q.includes("check out") || q.includes("time") || q.includes("policy")) {
    if (q.includes("check in") || q.includes("check-in")) return `Standard Check-in is **${KNOWLEDGE_BASE.hotel.timings.checkIn}**. Early check-in depends on room availability.`;
    if (q.includes("check out") || q.includes("check-out")) return `Standard Check-out is **${KNOWLEDGE_BASE.hotel.timings.checkOut}**.`;
    if (q.includes("breakfast")) return "Breakfast is served from 8:00 AM to 10:30 AM in our restaurant.";
    
    return `Check-in: ${KNOWLEDGE_BASE.hotel.timings.checkIn} | Check-out: ${KNOWLEDGE_BASE.hotel.timings.checkOut}. ID proof is mandatory.`;
  }

  // CONTACT & BOOKING
  if (q.includes("book") || q.includes("contact") || q.includes("phone") || q.includes("whatsapp") || q.includes("call") || q.includes("number")) {
    if (q.includes("restaurant") || q.includes("table") || q.includes("food")) return `Contact Masala Mist Restaurant: **${KNOWLEDGE_BASE.hotel.contact.phoneRest}** (Call/WA).`;
    return `Direct Hotel Booking: **${KNOWLEDGE_BASE.hotel.contact.phoneHotel}**\nWhatsApp Support: **${KNOWLEDGE_BASE.hotel.contact.whatsappHotel}**\nEmail: **${KNOWLEDGE_BASE.hotel.contact.email}**`;
  }

  // LOCATION QUERIES
  if (q.includes("address") || q.includes("where") || q.includes("locate") || q.includes("landmark")) {
    return `We are located at: **${KNOWLEDGE_BASE.hotel.address}**. Just opposite Sigra Police Station.`;
  }

  // ID PROOF / FOREIGNERS
  if (q.includes("id") || q.includes("proof") || q.includes("passport") || q.includes("foreigner") || q.includes("card")) {
    return "All guests must carry a valid ID (Aadhar/License/Voter ID/Passport). Foreign guests must provide a Passport and Visa. **Pan Card is not valid** as address proof.";
  }

  // PETS / SMOKING / FAMILY
  if (q.includes("pet")) return "Sorry, we have a **No Pets Allowed** policy to ensure comfort for all guests.";
  if (q.includes("smoke") || q.includes("alcohol")) return "Smoking is allowed in designated areas only. Alcohol is not served in the restaurant.";
  if (q.includes("family") || q.includes("couple")) return "We are very family-oriented and couple-friendly. We ensure a safe and respectful environment for everyone.";

  // THANK YOU
  if (q.includes("thank") || q.includes("good") || q.includes("nice") || q.includes("ok")) {
    return "My pleasure! If you have any more questions about your trip to the holy city of Kashi, feel free to ask. 🙏";
  }

  // DEFAULT HANDLER
  return "I'm not quite sure about that specific detail. However, I can help you with:\n• **Room Prices** & Check-in times\n• **Masala Mist Menu** & Signature Dishes\n• **Distances** to Temples, Ghats & Airport\n• **Kashi Darshan** tips & Local landmarks\n\nPlease try asking about one of these topics! 🙏";
};

const handleChatRequest = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const reply = getSmartChatResponse(message);
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat Controller Error:", error);
    return res.status(500).json({ error: "Failed to process chat message" });
  }
};

module.exports = {
  handleChatRequest
};
