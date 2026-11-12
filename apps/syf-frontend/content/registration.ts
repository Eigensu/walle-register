// Copy and options for the player registration form (/register). Event-specific text (rules,
// previous season, fee) lives in site.config.ts under event.registration.

export const registrationSteps = [
  { id: "details", label: "Personal", helper: "You and your firm" },
  { id: "cricket", label: "Cricket", helper: "Your playing profile" },
  { id: "jersey", label: "Jersey", helper: "Name and sizes" },
  { id: "history", label: "History", helper: "Last season" },
  { id: "payment", label: "Payment", helper: "Confirm your slot" },
  { id: "done", label: "Done", helper: "You're registered" },
] as const

export type RegistrationStepId = (typeof registrationSteps)[number]["id"]

export const battingTypes = ["Right-Hand", "Left-Hand"]

export const bowlingTypes = [
  "Right Arm Fast",
  "Left Arm Fast",
  "Right Arm Medium",
  "Left Arm Medium",
  "Right Arm Spin (Off)",
  "Right Arm Spin (Leg)",
  "Left Arm Spin (Orthodox)",
  "Left Arm Spin (Chinaman)",
  "Non-Bowler",
]

export const yesNo = ["Yes", "No"]

export const tshirtSizes = ["S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"]

export const waistSizes = [28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50]

export const photoRules = {
  maxBytes: 10 * 1024 * 1024,
  mimes: ["image/jpeg", "image/png", "image/heic", "image/heif"],
  extensions: [".jpg", ".jpeg", ".png", ".heic", ".heif"],
  hint: "JPG, PNG or HEIC, up to 10 MB",
}

/** The backend validates this length (apps/backend/app/routers/registration.py). */
export const aadharDigits = 16
