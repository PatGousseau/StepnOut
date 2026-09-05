// Synthetic content only. Shared by the offline visual preview and interaction tests.
export const step = {
  id: "step-preview", plan_id: "plan-preview", user_id: "preview", sequence: 1,
  status: "active", created_at: new Date().toISOString(), ended_at: null, accepted_at: null,
  title: "Start with one familiar face",
  action: "Next time you see a neighbour in the courtyard, say hello and ask how their week is going.",
  rationale: "A familiar setting keeps the first conversation small and gives you a natural starting point.",
  completion_criterion: "Say hello and ask one question. The conversation doesn't need to go anywhere else.",
  if_then_plan: "If I see someone while taking out the recycling, I'll pause and say hello.",
};
export const plan = {
  id: "plan-preview", intake_id: "intake-preview", user_id: "preview", version: 1, status: "active",
  goal: "Feel more connected in my neighbourhood",
  formulation: "You want connection, but starting a conversation can feel like it needs a perfect reason. Small, familiar moments may make it easier to begin.",
  current_focus: "Make a little room for everyday conversations.",
  milestones: [
    { title: "Break the ice", description: "Try brief greetings in places you already go.", status: "current" },
    { title: "Find a familiar rhythm", description: "Notice which conversations feel comfortable enough to repeat.", status: "later" },
    { title: "Let a connection grow", description: "Explore a longer conversation when it feels welcome.", status: "later" },
  ],
  first_step: step, created_at: step.created_at, confirmed_at: step.created_at,
};
export const entry = {
  id: "entry-preview", plan_id: plan.id, step_id: step.id, user_id: "preview", kind: "journal",
  report_outcome: null, follow_up: null, voice_journal_id: null, request_kind: null,
  journal_text: "I saw the same neighbour again today. We only waved, but it felt a little less awkward than last week. I'd like to try saying something next time.",
  step_snapshot: step, created_at: step.created_at,
};
export const eventPreferences = {
  enabled: true, approximate_location: "Example neighbourhood", latitude: 45.46, longitude: 9.19,
  travel_radius: "5", availability: "Saturday afternoons", max_cost_eur: 10,
  wheelchair_required: false, accessibility_needs: "", event_types: "Small creative workshops", cost_preference: "",
};
export const eventOpportunity = {
  id: "event-preview", title: "A relaxed afternoon at the community garden", location: "Example Community Garden",
  starts_at: null, availability: "Check opening hours with the organiser", timezone: "Europe/Rome",
  cost_eur: 0, accessibility: "Step-free entrance. Ask the organiser about paths.", wheelchair_accessible: null,
  verified_at: new Date().toISOString(), source_url: "https://example.com/garden", provenance: [],
};
export const eventSelection = {
  id: "selection-preview", event_id: eventOpportunity.id, status: "proposed", event_snapshot: eventOpportunity,
  explanation: "A shared activity could give you something natural to talk about. Only try it if this setting appeals to you.",
  proposed_step: { ...step, title: "Ask one small question at the garden", action: "If you visit during a public session, ask a volunteer what they're growing this season.", completion_criterion: "Ask one question. Staying for the whole session isn't necessary." },
};
