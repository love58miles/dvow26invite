import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, MapPin, Shirt, Users, LogOut } from "lucide-react";
import heroImage from "@/assets/wedding-hero.jpg";
import { CodeGate } from "@/components/invite/CodeGate";
import { RsvpForm } from "@/components/invite/RsvpForm";
import { WEDDING, submitRsvp, verifyAccessCode, type Guest, type RsvpInput } from "@/lib/invite";

const title = `${WEDDING.brideAndGroom} — Private Wedding Invitation`;
const description = `Enter your personal access code to view the invitation for ${WEDDING.brideAndGroom} on ${WEDDING.date} and RSVP.`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [gateError, setGateError] = useState<string | null>(null);
  const [gatePending, setGatePending] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [rsvpPending, setRsvpPending] = useState(false);
  const [saved, setSaved] = useState(false);

  const unlock = async (value: string) => {
    setGatePending(true);
    setGateError(null);
    try {
      const found = await verifyAccessCode(value);
      if (!found) {
        setGateError("That access code isn't on our guest list. Please check your invitation.");
        return;
      }
      setGuest(found);
      setCode(value);
      setSaved(Boolean(found.responded_at));
    } catch (err) {
      setGateError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setGatePending(false);
    }
  };

  const sendRsvp = async (input: RsvpInput) => {
    if (!code) return;
    setRsvpPending(true);
    setRsvpError(null);
    try {
      const ok = await submitRsvp(code, input);
      if (!ok) {
        setRsvpError("We couldn't match your access code. Please re-enter it.");
        return;
      }
      setSaved(true);
      const refreshed = await verifyAccessCode(code);
      if (refreshed) setGuest(refreshed);
    } catch (err) {
      setRsvpError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setRsvpPending(false);
    }
  };

  const lock = () => {
    setGuest(null);
    setCode(null);
    setSaved(false);
    setRsvpError(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src={heroImage}
        alt="Lilac orchids and gold leaves on a black background"
        width={1600}
        height={1200}
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-60"
      />
      <div className="veil pointer-events-none absolute inset-0" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center px-5 py-14 sm:px-8">
        <header className="text-center">
          <p className="text-[11px] tracking-luxe uppercase text-gold">The wedding of</p>
          <h1 className="mt-4 text-5xl leading-tight text-gilded sm:text-6xl">{WEDDING.brideAndGroom}</h1>
          <p className="mt-3 text-sm tracking-[0.25em] text-lilac">{WEDDING.hashtag}</p>
          <div className="rule-gold mx-auto mt-6 w-40" />
          <p className="mt-5 text-sm text-muted-foreground">{WEDDING.date}</p>

        </header>

        <section className="mt-12 flex w-full flex-1 flex-col items-center">
          {!guest || !code ? (
            <CodeGate onSubmit={unlock} error={gateError} pending={gatePending} />
          ) : (
            <div className="w-full animate-rise space-y-6">
              <div className="rounded-xl border border-border bg-card/80 p-7 shadow-panel backdrop-blur-md sm:p-9">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] tracking-luxe uppercase text-gold">Reserved for</p>
                    <h2 className="mt-2 text-3xl">{guest.full_name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {guest.seats} {guest.seats === 1 ? "seat" : "seats"} reserved
                      {guest.table_assignment ? ` · ${guest.table_assignment}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={lock}
                    className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs tracking-widest uppercase text-muted-foreground transition hover:text-foreground"
                  >
                    <LogOut className="size-3.5" aria-hidden="true" /> Lock
                  </button>
                </div>

                <div className="rule-gold my-7 w-full" />

                <dl className="grid gap-5 sm:grid-cols-2">
                  <Detail icon={<CalendarDays className="size-4" />} label="Ceremony" value={WEDDING.ceremony} />
                  <Detail icon={<MapPin className="size-4" />} label="Reception" value={WEDDING.reception} />
                  <Detail icon={<Shirt className="size-4" />} label="Dress code" value={WEDDING.dressCode} />
                  <Detail icon={<Users className="size-4" />} label="RSVP by" value={WEDDING.rsvpBy} />
                </dl>
              </div>

              <div className="rounded-xl border border-border bg-card/80 p-7 shadow-panel backdrop-blur-md sm:p-9">
                <h3 className="text-2xl">Order of the day</h3>
                <ul className="mt-5 space-y-4">
                  {WEDDING.schedule.map((item) => (
                    <li key={item.time} className="flex gap-5 text-sm">
                      <span className="w-20 shrink-0 text-gold">{item.time}</span>
                      <span className="text-muted-foreground">{item.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card/80 p-7 shadow-panel backdrop-blur-md sm:p-9">
                <h3 className="text-2xl">RSVP</h3>
                <p className="mt-2 mb-6 text-sm text-muted-foreground">
                  {saved
                    ? "You've already responded — you can change your answer any time before the RSVP date."
                    : `Kindly respond by ${WEDDING.rsvpBy}.`}
                </p>
                <RsvpForm
                  guest={guest}
                  onSubmit={sendRsvp}
                  pending={rsvpPending}
                  error={rsvpError}
                  saved={saved}
                />
              </div>
            </div>
          )}
        </section>

        <footer className="mt-14 text-center text-xs text-muted-foreground">
          <div className="rule-gold mx-auto mb-5 w-24" />
          With love, {WEDDING.brideAndGroom} · {WEDDING.hashtag}
        </footer>
      </div>
    </main>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-gold" aria-hidden="true">
        {icon}
      </span>
      <div>
        <dt className="text-[11px] tracking-luxe uppercase text-gold">{label}</dt>
        <dd className="mt-1 text-sm text-foreground/90">{value}</dd>
      </div>
    </div>
  );
}
