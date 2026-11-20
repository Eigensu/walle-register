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
  { value: "right_arm", label: "Right Arm Bowler" },
  { value: "left_arm", label: "Left Arm Bowler" },
  { value: "none", label: "None of the above" },
] as const

export const yesNo = ["Yes", "No"]

export const tshirtSizes = [
  { value: "XS", label: "34 - XS" },
  { value: "S", label: "36 - S" },
  { value: "M", label: "38 - M" },
  { value: "L", label: "40 - L" },
  { value: "XL", label: "42 - XL" },
  { value: "XXL", label: "44 - XXL" },
  { value: "XXXL", label: "46 - XXXL" },
  { value: "XXXXL", label: "48 - XXXXL" },
] as const

export const waistSizes = [28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50]

export const photoRules = {
  maxBytes: 10 * 1024 * 1024,
  mimes: ["image/jpeg", "image/png", "image/heic", "image/heif"],
  extensions: [".jpg", ".jpeg", ".png", ".heic", ".heif"],
  hint: "JPG, PNG or HEIC, up to 10 MB",
}

/** Aadhaar input length used by the registration form. */
export const aadharDigits = 12
