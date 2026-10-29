// ===============================
// DOCTORS
// ===============================

export const mockDoctors = [
  {
    id: "doc-001",
    name: "Dr. Aman Sharma",
    specialty: "Cardiology",
    rating: 4.8,
    hospital: "Apollo Hospital",
    avatarLetter: "A",
    image: "/images/imgi_5_photo-1580489944761-15a19d654956.jpg",
    availableDays: [
      "Monday",
      "Wednesday",
      "Friday",
    ],
  },

  {
    id: "doc-002",
    name: "Dr. Priya Mehta",
    specialty: "Dermatology",
    rating: 4.7,
    hospital: "Medanta Hospital",
    avatarLetter: "P",
    availableDays: [
      "Tuesday",
      "Thursday",
      "Saturday",
    ],
  },

  {
    id: "doc-003",
    name: "Dr. Rajesh Verma",
    specialty: "Orthopedics",
    rating: 4.9,
    hospital: "Bombay Hospital",
    avatarLetter: "R",
    availableDays: [
      "Monday",
      "Tuesday",
      "Thursday",
    ],
  },

  {
    id: "doc-004",
    name: "Dr. Neha Gupta",
    specialty: "General Physician",
    rating: 4.6,
    hospital: "Choithram Hospital",
    avatarLetter: "N",
    availableDays: [
      "Monday",
      "Wednesday",
      "Saturday",
    ],
  },

  {
    id: "doc-005",
    name: "Dr. Vikram Patel",
    specialty: "Neurology",
    rating: 4.8,
    hospital: "CARE Hospital",
    avatarLetter: "V",
    availableDays: [
      "Tuesday",
      "Wednesday",
      "Friday",
    ],
  },

  {
    id: "doc-006",
    name: "Dr. Anjali Singh",
    specialty: "Cardiology",
    rating: 4.7,
    hospital: "Shalby Hospital",
    avatarLetter: "A",
    availableDays: [
      "Monday",
      "Thursday",
      "Saturday",
    ],
  },

  {
    id: "doc-007",
    name: "Dr. Rahul Jain",
    specialty: "Orthopedics",
    rating: 4.8,
    hospital: "Bombay Hospital",
    avatarLetter: "R",
    availableDays: [
      "Wednesday",
      "Friday",
      "Saturday",
    ],
  },

  {
    id: "doc-008",
    name: "Dr. Sneha Kapoor",
    specialty: "Dermatology",
    rating: 4.9,
    hospital: "Apollo Hospital",
    avatarLetter: "S",
    availableDays: [
      "Monday",
      "Tuesday",
      "Friday",
    ],
  },

  {
    id: "doc-009",
    name: "Dr. Arjun Malhotra",
    specialty: "General Physician",
    rating: 4.6,
    hospital: "Medanta Hospital",
    avatarLetter: "A",
    availableDays: [
      "Tuesday",
      "Thursday",
      "Saturday",
    ],
  },
];


// ===============================
// APPOINTMENTS
// ===============================

export const mockAppointments = [
  {
    id: "apt-001",

    doctorId: "doc-001",

    doctorName: "Dr. Aman Sharma",

    doctorSpecialty: "Cardiology",

    avatarLetter: "A",

    date: "18 Aug 2026",

    time: "10:30 AM",

    status: "Upcoming",

    reason: "Regular heart checkup",
  },

  {
    id: "apt-002",

    doctorId: "doc-003",

    doctorName: "Dr. Rajesh Verma",

    doctorSpecialty: "Orthopedics",

    avatarLetter: "R",

    date: "12 Aug 2026",

    time: "04:00 PM",

    status: "Completed",

    reason: "Knee pain",
  },

  {
    id: "apt-003",

    doctorId: "doc-002",

    doctorName: "Dr. Priya Mehta",

    doctorSpecialty: "Dermatology",

    avatarLetter: "P",

    date: "05 Aug 2026",

    time: "11:30 AM",

    status: "Cancelled",

    reason: "Skin consultation",
  },
];


// ===============================
// PRESCRIPTIONS
// ===============================

export const mockPrescriptions = [
  {
    id: "pres-001",

    medicationName: "Atorvastatin 10mg",

    dosage: "10mg",

    frequency: "Once daily",

    active: true,

    prescribedBy: "Dr. Aman Sharma",

    prescribedDate: "10 Aug 2026",

    duration: "30 days",
  },

  {
    id: "pres-002",

    medicationName: "Paracetamol 500mg",

    dosage: "500mg",

    frequency: "Twice daily",

    active: false,

    prescribedBy: "Dr. Rajesh Verma",

    prescribedDate: "01 Aug 2026",

    duration: "5 days",
  },
];


// ===============================
// MEDICAL RECORDS
// ===============================

export const mockMedicalRecords = [
  {
    id: "record-001",

    title: "Blood Test Report",

    type: "Lab Report",

    date: "08 Aug 2026",

    doctorName: "Dr. Aman Sharma",

    hospital: "Apollo Hospital",

    description:
      "Complete blood count and lipid profile report.",
  },

  {
    id: "record-002",

    title: "Knee X-Ray",

    type: "Imaging",

    date: "02 Aug 2026",

    doctorName: "Dr. Rajesh Verma",

    hospital: "Bombay Hospital",

    description:
      "X-ray examination of the right knee.",
  },
];


// ===============================
// NOTIFICATIONS
// ===============================

export const mockNotifications = [
  {
    id: 1,

    title: "Appointment confirmed",

    message:
      "Your appointment with Dr. Aman Sharma is confirmed.",

    time: "10 min ago",

    read: false,
  },

  {
    id: 2,

    title: "Prescription updated",

    message:
      "Your prescription has been updated by Dr. Aman Sharma.",

    time: "2 hours ago",

    read: false,
  },

  {
    id: 3,

    title: "Appointment reminder",

    message:
      "You have an appointment tomorrow at 10:30 AM.",

    time: "Yesterday",

    read: true,
  },
];