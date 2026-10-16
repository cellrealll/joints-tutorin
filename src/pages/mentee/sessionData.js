const calendarDate = new Date();
calendarDate.setDate(calendarDate.getDate() + 1);
const calendarMonth = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, "0")}`;
export function bookingDateLabel(day) {
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${calendarMonth}-${String(day).padStart(2, "0")}T00:00:00`));
}
export const tutor = {
  name: "Angela Wilkins",
  subjects: "Matematika - Fisika",
  rating: "4.9",
  reviews: "124",
  credits: 10,
  sessionDurationMinutes: 60,
  badge: "Tutor Pro",
  availability: [
    ["Sen", "09:00 - 17:00"],
    ["Sel", "09:00 - 17:00"],
    ["Rab", "09:00 - 17:00"],
    ["Kam", "09:00 - 17:00"],
    ["Jum", "09:00 - 16:00"],
  ],
};

export const booking = {
  month: calendarMonth,
  monthLabel: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(calendarDate),
  availableDate: bookingDateLabel(calendarDate.getDate()),
  selectedDay: String(calendarDate.getDate()),
  initialTime: "08:00 - 10:00",
  userCredits: 20,
  code: "TTR-140525-1024",
  status: "Menunggu Konfirmasi",
  adminPhone: "0812-3456-7890",
  timezone: "WIB",
  topic: "Aljabar Linear",
  notePlaceholder: "Tulis catatan untuk tutor.",
  emptyNote: "Belum ada catatan untuk tutor.",
  preTest: {
    title: "Placement Test",
    description: "Kerjakan tes awal sebelum sesi dimulai",
  },
  postTest: {
    title: "Post-test",
    description: "Kerjakan tes akhir setelah sesi selesai",
  },
};

const monthStart = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1);
const firstOffset = (monthStart.getDay() + 6) % 7;
const monthLength = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
export const calendarDays = Array.from({ length: Math.ceil((firstOffset + monthLength) / 7) * 7 }, (_, index) => {
  const day = index - firstOffset + 1;
  return { label: day >= 1 && day <= monthLength ? String(day) : "", muted: day < calendarDate.getDate() || day > monthLength };
});

export const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export const timeSlots = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "12:00 - 14:00",
  "14:00 - 16:00",
  "16:00 - 18:00",
  "18:00 - 20:00",
  "20:00 - 22:00",
];
