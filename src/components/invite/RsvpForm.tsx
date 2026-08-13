import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { MEAL_OPTIONS, rsvpSchema, type Guest, type RsvpInput } from "@/lib/invite";

export function RsvpForm({
  guest,
  onSubmit,
  pending,
  error,
  saved,
}: {
  guest: Guest;
  onSubmit: (input: RsvpInput) => void;
  pending: boolean;
  error: string | null;
  saved: boolean;
}) {
  const [attending, setAttending] = useState<boolean | null>(guest.attending);
  const [mealChoice, setMealChoice] = useState(guest.meal_choice ?? "");
  const [plusOneName, setPlusOneName] = useState(guest.plus_one_name ?? "");
  const [dietaryNotes, setDietaryNotes] = useState(guest.dietary_notes ?? "");
  const [message, setMessage] = useState(guest.message ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (attending === null) {
      setLocalError("Please let us know if you can make it.");
      return;
    }
    const parsed = rsvpSchema.safeParse({ attending, mealChoice, plusOneName, dietaryNotes, message });
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message ?? "Please check your answers.");
      return;
    }
    setLocalError(null);
    onSubmit(parsed.data);
  };

  const shown = localError ?? error;
  const fieldClass =
    "w-full rounded-md border border-input bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <form onSubmit={handle} className="space-y-6">
      <div>
        <span className="mb-3 block text-[11px] tracking-luxe uppercase text-gold">Will you be joining us?</span>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: true, label: "Joyfully accept" },
            { value: false, label: "Regretfully decline" },
          ].map((option) => (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => setAttending(option.value)}
              aria-pressed={attending === option.value}
              className={`rounded-md border px-4 py-3 text-sm transition ${
                attending === option.value
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-background/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {attending ? (
        <>
          <div>
            <label htmlFor="meal" className="mb-2 block text-[11px] tracking-luxe uppercase text-gold">
              Meal preference
            </label>
            <select id="meal" value={mealChoice} onChange={(e) => setMealChoice(e.target.value)} className={fieldClass}>
              <option value="">Select a dish</option>
              {MEAL_OPTIONS.map((meal) => (
                <option key={meal} value={meal}>
                  {meal}
                </option>
              ))}
            </select>
          </div>

          {guest.seats > 1 ? (
            <div>
              <label htmlFor="plus-one" className="mb-2 block text-[11px] tracking-luxe uppercase text-gold">
                Name of your guest
              </label>
              <input
                id="plus-one"
                value={plusOneName}
                onChange={(e) => setPlusOneName(e.target.value)}
                maxLength={100}
                placeholder="Full name"
                className={fieldClass}
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="dietary" className="mb-2 block text-[11px] tracking-luxe uppercase text-gold">
              Allergies or dietary needs
            </label>
            <input
              id="dietary"
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              maxLength={300}
              placeholder="Optional"
              className={fieldClass}
            />
          </div>
        </>
      ) : null}

      <div>
        <label htmlFor="message" className="mb-2 block text-[11px] tracking-luxe uppercase text-gold">
          A note for the couple
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Optional"
          className={fieldClass}
        />
      </div>

      {shown ? (
        <p role="alert" className="text-sm text-destructive">
          {shown}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-medium tracking-widest uppercase text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
        {saved ? "Update my RSVP" : "Send my RSVP"}
      </button>

      {saved && !pending ? (
        <p className="flex items-center justify-center gap-2 text-sm text-gold">
          <Check className="size-4" aria-hidden="true" /> Your RSVP has been recorded.
        </p>
      ) : null}
    </form>
  );
}
