import { z } from "zod";

const FILE_MAX_BYTES = 10 * 1024 * 1024;
const PHOTO_MIMES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
] as const;
const CARD_MIMES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

const bowlingValues = ["right_arm", "left_arm", "none"] as const;
const tshirtValues = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"] as const;
const legacyBowlingValues = [
  "Right Arm Fast", "Left Arm Fast", "Right Arm Medium", "Left Arm Medium",
  "Right Arm Spin (Off)", "Right Arm Spin (Leg)", "Left Arm Spin (Orthodox)",
  "Left Arm Spin (Chinaman)", "Non-Bowler",
] as const;


const fileSchema = (allowed: readonly string[]) =>
  z
    .instanceof(File)
    .refine((file) => file.size > 0, "File is required")
    .refine((file) => file.size <= FILE_MAX_BYTES, "File must be under 10MB")
    .refine(
      (file) => allowed.includes(file.type),
      `Unsupported file type. Allowed: ${allowed.join(", ")}`
    );

// Extremely permissive schema so UI validation controls the flow; prevents RHF
// resolver from blocking submit when any optional field is empty.
export const playerSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string(),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  residential_area: z.string(),
  firm_name: z.string(),
  gst_number: z
    .string()
    .regex(/^$|^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Enter a valid 15-character GST number, or leave it blank"),
  designation: z.string(),
  aadhar_number: z
    .string()
    .regex(/^\d{16}$/, "Aadhar must be exactly 16 digits"),
  city: z.string(),
  village: z.string(),
  batting_type: z.string(),
  bowling_type: z.string().refine(
    (value) => !value || bowlingValues.includes(value as (typeof bowlingValues)[number]) || legacyBowlingValues.includes(value as (typeof legacyBowlingValues)[number]),
    "Choose a supported bowling option",
  ),
  wicket_keeper: z.string(),
  name_on_jersey: z.string(),
  tshirt_size: z.string().refine(
    (value) => !value || tshirtValues.includes(value as (typeof tshirtValues)[number]) || value === "4XL" || value === "5XL",
    "Choose a supported T-shirt size",
  ),
  waist_size: z.coerce.number(),
  played_JMCL_S2: z.string(),
  JMCL_S2_team: z.string(),
  photo: z.union([z.instanceof(File), z.string()]).nullable(),
});

export type PlayerFormValues = z.infer<typeof playerSchema>;

export const fileConstraints = {
  maxBytes: FILE_MAX_BYTES,
  photoMimes: PHOTO_MIMES,
  cardMimes: CARD_MIMES,
};
