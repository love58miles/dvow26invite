import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const WEDDING = {
  brideAndGroom: "Amara & Chidi",
  date: "Saturday, 12 December 2026",
  ceremony: "3:00 PM — The Rose Chapel, Ikoyi, Lagos",
  reception: "6:00 PM — The Gilded Hall, Victoria Island",
  dressCode: "Black tie — lilac, purple or gold accents",
  rsvpBy: "Friday, 20 November 2026",
  schedule: [
    { time: "2:30 PM", title: "Guest arrival & seating" },
    { time: "3:00 PM", title: "Wedding ceremony" },
    { time: "4:30 PM", title: "Cocktails & photographs" },
    { time: "6:00 PM", title: "Reception & dinner" },
    { time: "9:00 PM", title: "First dance & dancing" },
  ],
} as const;

export const MEAL_OPTIONS = ["Jollof & grilled chicken", "Herb-crusted beef", "Seared salmon", "Vegetarian"] as const;

export const codeSchema = z
  .string()
  .trim()
  .min(4, { message: "Access code is too short" })
  .max(32, { message: "Access code is too long" })
  .regex(/^[A-Za-z0-9-\s]+$/, { message: "Codes only contain letters, numbers and dashes" });

export const rsvpSchema = z.object({
  attending: z.boolean(),
  mealChoice: z.string().trim().max(60).optional(),
  plusOneName: z.string().trim().max(100).optional(),
  dietaryNotes: z.string().trim().max(300).optional(),
  message: z.string().trim().max(500).optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

export type Guest = {
  full_name: string;
  seats: number;
  table_assignment: string | null;
  attending: boolean | null;
  meal_choice: string | null;
  plus_one_name: string | null;
  dietary_notes: string | null;
  message: string | null;
  responded_at: string | null;
};

export async function verifyAccessCode(code: string): Promise<Guest | null> {
  const parsed = codeSchema.parse(code);
  const { data, error } = await supabase.rpc("verify_access_code", { _code: parsed });
  if (error) throw new Error("We couldn't check that code right now. Please try again.");
  const rows = (data ?? []) as Guest[];
  return rows[0] ?? null;
}

export async function submitRsvp(code: string, input: RsvpInput): Promise<boolean> {
  const parsedCode = codeSchema.parse(code);
  const values = rsvpSchema.parse(input);
  const args: {
    _code: string;
    _attending: boolean;
    _meal_choice?: string;
    _plus_one_name?: string;
    _dietary_notes?: string;
    _message?: string;
  } = { _code: parsedCode, _attending: values.attending };
  if (values.mealChoice) args._meal_choice = values.mealChoice;
  if (values.plusOneName) args._plus_one_name = values.plusOneName;
  if (values.dietaryNotes) args._dietary_notes = values.dietaryNotes;
  if (values.message) args._message = values.message;

  const { data, error } = await supabase.rpc("submit_rsvp", args);
  if (error) throw new Error("Your RSVP could not be saved. Please try again.");
  return Boolean(data);
}
