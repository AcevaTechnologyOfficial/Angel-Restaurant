"use client";
import { useActionState, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { sendEnquiry } from "@/app/private-dining/actions";
import { idleEnquiryState, OCCASIONS, ENQUIRY_FIELDS, validateEnquiry, type EnquiryField } from "@/lib/enquiry";
import { restaurant } from "@/lib/restaurant";
import { Words } from "@/components/split-text";

type StepId = 1 | 2 | 3;
type Step = { id: StepId; title: string; fields: EnquiryField[] };

// A stable no-op subscription: the client/server snapshots never change after
// mount, so this only exists to give useSyncExternalStore the hydration-safe
// "has the client taken over yet" flag without a setState-in-effect render.
const noopSubscribe = () => () => {};

const STEPS: Step[] = [
  { id: 1, title: "The occasion", fields: ["Occasion", "Date", "Guests"] },
  { id: 2, title: "About you", fields: ["Name", "Email", "Phone"] },
  { id: 3, title: "Your vision", fields: ["Message"] },
];

function mailtoFallback(values: Partial<Record<EnquiryField, string>> | undefined) {
  const body = [
    "Private dining enquiry",
    ...(["Name", "Email", "Phone", "Guests", "Date", "Occasion", "Message"] as const).map(
      (key) => `${key}: ${values?.[key] || "Not specified"}`
    ),
  ].join("\n\n");
  return `mailto:${restaurant.email}?subject=${encodeURIComponent("Private dining enquiry — Angel")}&body=${encodeURIComponent(body)}`;
}

function formatGuests(value?: string) {
  const n = Number(value);
  return value && Number.isFinite(n) && n > 0 ? `${n} guest${n === 1 ? "" : "s"}` : undefined;
}

function formatDate(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? undefined
    : parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function EnquiryForm() {
  const [state, formAction, pending] = useActionState(sendEnquiry, idleEnquiryState);
  // Set once the client has mounted, by mutating the hidden input directly
  // rather than via setState. Doing this with React state instead (a value
  // from Date.now() in the initial state, or a setState call inside the
  // effect) would either mismatch the server-rendered markup at hydration or
  // trigger an avoidable extra render — see react-hooks/set-state-in-effect.
  // A no-JS submission simply never gets this field filled in, and the server
  // action treats an absent/zero timestamp as "skip this check".
  const startedAtRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now());
  }, []);

  const formRef = useRef<HTMLFormElement>(null);
  const panelRefs = useRef<Partial<Record<StepId, HTMLDivElement | null>>>({});
  const focusOnOpenRef = useRef(false);

  // Steps stay fully expanded until this flips true, matching Motion's
  // data-motion-ready gate: the no-JS render is the same markup a JS-enabled
  // browser paints before hydration, so every field is reachable either way.
  const enhanced = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const [openStep, setOpenStep] = useState<StepId>(1);
  const [maxStepReached, setMaxStepReached] = useState<StepId>(1);
  const [localErrors, setLocalErrors] = useState<Partial<Record<EnquiryField, string>>>({});
  const [snapshot, setSnapshot] = useState<Partial<Record<EnquiryField, string>>>({});

  const values = state.status === "error" ? state.values : undefined;

  // A failed submission can carry an error for a field on a step the visitor
  // already collapsed — jump back to it so the message is actually visible.
  // Adjusted during render (React's documented pattern for reacting to a prop
  // change) rather than in an effect, so it doesn't cost an extra commit.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "error") {
      const erroredField = ENQUIRY_FIELDS.find((field) => state.fieldErrors?.[field]);
      const step = STEPS.find((candidate) => erroredField && candidate.fields.includes(erroredField));
      setMaxStepReached(3);
      if (step) setOpenStep(step.id);
    }
  }

  useEffect(() => {
    if (!enhanced || !focusOnOpenRef.current) return;
    focusOnOpenRef.current = false;
    panelRefs.current[openStep]?.querySelector<HTMLElement>("input, select, textarea")?.focus();
  }, [openStep, enhanced]);

  function fieldError(field: EnquiryField) {
    return (state.status === "error" ? state.fieldErrors?.[field] : undefined) ?? localErrors[field];
  }

  function goToStep(id: StepId) {
    if (id === openStep || id > maxStepReached) return;
    focusOnOpenRef.current = true;
    setOpenStep(id);
  }

  function handleContinue(step: Step) {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const result = validateEnquiry(formData);
    const stepErrors: Partial<Record<EnquiryField, string>> = {};
    if (!result.ok) {
      for (const field of step.fields) if (result.fieldErrors[field]) stepErrors[field] = result.fieldErrors[field];
    }
    setLocalErrors((prev) => {
      const next = { ...prev };
      for (const field of step.fields) delete next[field];
      return { ...next, ...stepErrors };
    });
    if (Object.keys(stepErrors).length > 0) return;

    setSnapshot((prev) => ({
      ...prev,
      ...Object.fromEntries(step.fields.map((field) => [field, String(formData.get(field) ?? "")])),
    }));

    const next = step.id + 1;
    if (next > 3) return;
    const nextStep = next as StepId;
    setMaxStepReached((current) => (nextStep > current ? nextStep : current));
    focusOnOpenRef.current = true;
    setOpenStep(nextStep);
  }

  function stepSummary(step: Step) {
    if (step.id === 1) {
      return [snapshot.Occasion, formatDate(snapshot.Date), formatGuests(snapshot.Guests)].filter(Boolean).join(" · ") || undefined;
    }
    if (step.id === 2) return [snapshot.Name, snapshot.Email].filter(Boolean).join(" · ") || undefined;
    return undefined;
  }

  return (
    <form id="enquiry" className="enquiry-form frame frame-strong spotlight" data-spotlight action={formAction} noValidate ref={formRef}>
      <span className="form-glow" aria-hidden="true" />
      <div className="form-intro" data-reveal="words">
        <p className="eyebrow eyebrow-rule rise">Private dining</p>
        <h2><Words text="Make it" /> <em><Words text="an occasion." from={2} /></em></h2>
        <p className="rise rise-late">Tell us about your celebration and we’ll create something unforgettable.</p>
      </div>

      {/* Honeypot: hidden from sighted and screen-reader users alike (see .enquiry-hp
          in app/site.css), left unfilled by real visitors, and checked in the
          server action. Not a substitute for the rate limit below, just cheap
          and effective against unsophisticated bots. */}
      <div className="enquiry-hp" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="_t" ref={startedAtRef} defaultValue={0} />

      <div
        className="enquiry-steps"
        data-reveal
        data-stagger-children
        style={{ "--progress": (maxStepReached - 1) / (STEPS.length - 1) } as CSSProperties}
      >
        {STEPS.map((step) => {
          const isOpen = !enhanced || openStep === step.id;
          const isReachable = step.id <= maxStepReached;
          const isDone = step.id < maxStepReached;
          const summary = enhanced && !isOpen ? stepSummary(step) : undefined;
          return (
            <div className={`enquiry-step${isOpen ? " is-open" : ""}${isDone ? " is-done" : ""}`} key={step.id}>
              <button
                type="button"
                className="enquiry-step-header"
                aria-expanded={isOpen}
                aria-controls={`enquiry-step-panel-${step.id}`}
                disabled={enhanced && !isReachable}
                onClick={() => goToStep(step.id)}
              >
                <span className={`enquiry-step-num${isDone ? " is-done" : ""}`}>{`0${step.id}`}</span>
                <span className="enquiry-step-title">{step.title}</span>
                {summary && <span className="enquiry-step-summary">{summary}</span>}
              </button>
              <div
                id={`enquiry-step-panel-${step.id}`}
                className="enquiry-step-panel"
                ref={(el) => {
                  panelRefs.current[step.id] = el;
                }}
                inert={enhanced && !isOpen}
              >
                <div className="enquiry-step-panel-inner">
                  {step.id === 1 && (
                    <div className="form-grid">
                      <label>
                        Occasion
                        <select name="Occasion" defaultValue={values?.Occasion ?? ""}>
                          <option value="" disabled>Select an occasion</option>
                          {OCCASIONS.map((occasion) => <option key={occasion}>{occasion}</option>)}
                        </select>
                      </label>
                      <label>
                        Date
                        <input name="Date" type="date" required defaultValue={values?.Date} aria-invalid={Boolean(fieldError("Date"))} aria-describedby={fieldError("Date") ? "err-Date" : undefined} />
                        {fieldError("Date") && <span className="field-error" id="err-Date" role="alert">{fieldError("Date")}</span>}
                      </label>
                      <label>
                        Guests
                        <input name="Guests" type="number" min="1" max="1000" required defaultValue={values?.Guests} aria-invalid={Boolean(fieldError("Guests"))} aria-describedby={fieldError("Guests") ? "err-Guests" : undefined} />
                        {fieldError("Guests") && <span className="field-error" id="err-Guests" role="alert">{fieldError("Guests")}</span>}
                      </label>
                    </div>
                  )}

                  {step.id === 2 && (
                    <div className="form-grid">
                      <label>
                        Your name
                        <input name="Name" autoComplete="name" required maxLength={100} defaultValue={values?.Name} aria-invalid={Boolean(fieldError("Name"))} aria-describedby={fieldError("Name") ? "err-Name" : undefined} />
                        {fieldError("Name") && <span className="field-error" id="err-Name" role="alert">{fieldError("Name")}</span>}
                      </label>
                      <label>
                        Email
                        <input name="Email" type="email" autoComplete="email" required defaultValue={values?.Email} aria-invalid={Boolean(fieldError("Email"))} aria-describedby={fieldError("Email") ? "err-Email" : undefined} />
                        {fieldError("Email") && <span className="field-error" id="err-Email" role="alert">{fieldError("Email")}</span>}
                      </label>
                      <label>
                        Phone
                        <input name="Phone" type="tel" autoComplete="tel" defaultValue={values?.Phone} aria-invalid={Boolean(fieldError("Phone"))} aria-describedby={fieldError("Phone") ? "err-Phone" : undefined} />
                        {fieldError("Phone") && <span className="field-error" id="err-Phone" role="alert">{fieldError("Phone")}</span>}
                      </label>
                    </div>
                  )}

                  {step.id === 3 && (
                    <>
                      <label className="full-width">
                        Tell us your vision
                        <textarea name="Message" rows={4} maxLength={2000} placeholder="Share your ideas, preferences, dietary needs, or special requests…" defaultValue={values?.Message} />
                      </label>
                      <div className="form-actions">
                        <label className="consent">
                          <input type="checkbox" name="Consent" required />
                          <span>I agree to be contacted about this enquiry</span>
                        </label>
                        <button className="button button-primary" type="submit" disabled={pending}>
                          {pending ? "Sending…" : "Book your occasion"}
                        </button>
                      </div>
                    </>
                  )}

                  {enhanced && step.id !== 3 && (
                    <div className="enquiry-step-nav">
                      <button type="button" className="button button-primary" onClick={() => handleContinue(step)}>
                        Continue
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {state.status === "success" && (
        <div className="form-status" role="status">
          <p><strong>Your enquiry is on its way.</strong> Our team will be in touch shortly.</p>
          <p>Or contact us directly: <a href={`mailto:${restaurant.email}`}>{restaurant.email}</a> · <a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a></p>
        </div>
      )}

      {state.status === "error" && state.code === "rate_limit" && (
        <div className="form-status" role="status">
          <p><strong>Too many enquiries at once.</strong> Please try again in a few minutes, or call us at <a href={`tel:${restaurant.phoneHref}`}>{restaurant.phone}</a>.</p>
        </div>
      )}

      {state.status === "error" && (state.code === "delivery" || state.code === "config") && (
        <div className="form-status" role="status">
          <p><strong>We couldn’t send this automatically.</strong> Please send it by email instead — we’ve prepared it for you.</p>
          <p><a href={mailtoFallback(state.values)}>Open a prepared email to {restaurant.email} ↗</a></p>
        </div>
      )}

      {state.status === "error" && state.code === "validation" && (
        <div className="form-status" role="status">
          <p>Please check the highlighted fields above and try again.</p>
        </div>
      )}
    </form>
  );
}
