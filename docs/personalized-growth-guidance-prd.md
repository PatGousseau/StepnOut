# Personalized Growth Guidance


*An adaptive, research-informed coaching experience for StepnOut*


Product: StepnOut

Status: Draft for product and technical review

Date: August 9, 2026

Scope: MVP definition and validation plan

Product thesis  A user describes where they feel stuck. StepnOut turns that situation into a provisional growth plan, proposes one real-world step at a time, and adapts the plan using completion reports, optional journal entries, and relevant real-world opportunities.

## 1. Executive summary

StepnOut currently helps users leave their comfort zones through weekly challenges. Personalized Growth Guidance extends that value proposition from a general challenge experience into an ongoing, individualized coaching relationship. The feature uses a narrative intake to understand the user's desired change, proposes a meaningful behavioral goal, identifies provisional blockers, creates a short milestone roadmap, and recommends one active real-world experiment at a time.

The experience is adaptive rather than a fixed curriculum. Guidance is generated after meaningful user interactions, not automatically every day. A minimal structured report records whether the user attempted the current step; optional text or voice journaling gives the model richer context. When useful, verified local events can supply a concrete training ground for the current milestone.

The product is informed by self-determination theory, COM-B, behavioral experiments and exposure principles, implementation intentions, progress monitoring, and just-in-time adaptive intervention design. It is not positioned as psychotherapy and must not diagnose or treat mental-health conditions.

## 2. Problem and opportunity

Users may understand that they want to grow but still struggle to identify what is blocking them, where to practise, what action is appropriately challenging, and how to build on prior attempts. Generic motivational advice leaves the user to translate intention into behavior. A static intake followed by generic daily content is also unlikely to remain relevant as the user's circumstances change.

LLMs create an opportunity to interpret unstructured personal context and generate adaptable guidance. The product challenge is to preserve that flexibility without creating an opaque, overly complex program, allowing the model to fixate on one detail, or requiring engagement levels that most users will not sustain.

## 3. Product definition

**User promise:** Describe where you feel stuck. StepnOut will help clarify what you are working toward, show what progress could look like, give you one practical next step, and adapt based on what happens.

### 3.1 Core experience

The user completes a short narrative intake about their situation, desired change, prior attempts, barriers, opportunities, preferences, and boundaries.

StepnOut proposes a goal, a plain-language blocker formulation, three or four provisional milestones, and a first real-world step.

The user confirms the proposed direction conversationally. They do not need to design their own program or steps.

Only one step is active at a time. It has a clear completion criterion based on an observable behavior within the user's control.

The user reports Did it, Partly, or Didn't do it. A short follow-up captures what happened; text or voice journaling is optional.

StepnOut responds, updates its working interpretation when warranted, and proposes the next step or a revised direction.

Relevant nearby events may be incorporated as an opportunity to practise, but only when they materially improve the guidance.

### 3.2 Product principles

Principle

Implication

One clear thing now

The user should always understand the current step and what counts as attempting it.

Direction without rigidity

Milestones show where the work may lead, but the plan remains provisional and revisable.

Action over content consumption

The feature succeeds when users try meaningful real-world behaviors, not when they read more advice.

Autonomy with expert guidance

StepnOut formulates goals and steps; the user confirms, rejects, or explains what does not fit.

Sparse engagement must still work

One report can improve guidance. Missing days do not create a backlog or broken streak.

The model is a reasoner, not an authority

Its interpretations are hypotheses grounded in user evidence and open to correction.


## 4. Goals and non-goals

### 4.1 Goals

Convert unstructured user situations into understandable, behaviorally useful growth plans.

Help users take contextually relevant actions outside habitual patterns or avoidance loops.

Use minimal reporting and optional journaling to adapt guidance over time.

Make progress legible through milestones and evidence without false precision or rigid levels.

Use real-world events when they reduce the opportunity or planning barrier.

Keep the user experience simple even when the underlying reasoning is nuanced.

### 4.2 Non-goals

Diagnosing, treating, or claiming to treat anxiety, depression, trauma, or another clinical condition.

Creating a fixed multi-week course or daily content feed for every user.

Automatically increasing difficulty after every completion.

Measuring psychological growth with a single score or percentage.

Letting users manually design each milestone or behavioral step.

Becoming a general local-events discovery product.

Replacing StepnOut's existing weekly challenge experience in the MVP.

## 5. Research-informed product model

Foundation

Product role

Application

Self-determination theory

Goal formulation and tone

Elicit what matters, propose rather than impose, offer meaningful choices, and build competence without pressure.

COM-B

Working blocker formulation

Consider capability, opportunity, and motivation as interacting hypotheses rather than permanent labels.

Behavioral experiments / exposure principles

Current step

Recommend safe actions that test expectations and create new learning; success is attempting and learning, not eliminating discomfort.

Implementation intentions

Action planning

Convert an accepted step into a concrete cue and response: if situation X occurs, I will do Y.

Progress monitoring

Reports and reviews

Record attempts, outcomes, and reflections; use evidence to revise the working plan.

JITAI design

Timing

Generate or surface guidance when the user checks in, reports, journals, or has a relevant opportunity.

Social connection research

Content for social goals

Use repeated contact, weak ties, and suitable social settings when relevant to the user's desired change.


**Important boundary:** The feature may be research-informed before it is itself validated. Product claims must distinguish established adjacent evidence from evidence about StepnOut's specific intervention.

## 6. Target user and primary jobs

The initial target is an adult user who wants to change a recurring pattern, is willing to try small real-world actions, and does not need clinical treatment from the product. The system should support both social and non-social goals, while recognizing that some goals will not benefit from local events or exposure-like exercises.

Primary jobs to be done

Help me understand what I am actually trying to change.

Help me identify what may be getting in the way without reducing me to a label.

Show me what progress could realistically look like.

Give me one action that fits my current life rather than generic advice.

Help me learn from what happened and decide what to do next.

When relevant, help me find a real place or occasion to practise.

## 7. End-to-end user experience

### 7.1 Entry and intake

The entry point should explain the value before asking for personal information. The intake should feel like a short conversation, not an assessment. It should collect enough context to formulate a first plan while allowing progressive learning later.

Intake area

Example prompt

Current situation

Where do you feel stuck or limited right now? Tell us about a recent time this showed up.

Desired change

If this improved, what would be different in your life? Why would that matter?

Prior attempts

What have you already tried? What helped or did not help?

Possible blockers

What tends to get in the way: not knowing how, lacking opportunities, discomfort or fear, low energy, competing priorities, or something else?

Available context

Where and when could you realistically practise?

Preferences

How challenging should the first step feel? What kinds of guidance do you dislike?

Boundaries

Are there settings, people, topics, risks, or accessibility constraints we should avoid?

Nearby opportunities

Optional: share an approximate location, radius, availability, and cost preferences.


### 7.2 Initial plan proposal

After intake, StepnOut proposes a single active growth plan. The user does not manually author the goal or roadmap, but must confirm that the proposed direction represents what they want.

Example  You told us that you feel disconnected at university and usually wait for others to initiate. We suggest working toward building a small number of relationships that you actively initiate and maintain. The main barriers may be taking initiative and moving beyond class-related conversation. Does that fit?

That fits

Not quite - let me explain

### 7.3 Milestone roadmap

The system proposes three or four plain-language milestones. Milestones show the likely direction of travel but are not rigid gates and may be reordered, removed, or rewritten as evidence changes.

- Create repeated contact with people the user might genuinely like.

- Become more comfortable initiating and continuing small interactions.

- Turn at least one acquaintance into an ongoing connection.

- Initiate a plan outside the context where they normally meet.

Progress states should remain qualitative: Later, Current focus, Evidence of progress, and Established enough to move forward. Avoid numeric progress percentages.

### 7.4 Current step

Only one step is active. It combines short guidance with a specific behavioral experiment and a visible completion criterion.

Example current step  After your next class, stay for five minutes and ask one person what they thought of the lecture. If class ends and someone is still nearby, you will ask the question before opening your phone. Completion: initiate one short conversation and ask one follow-up question.

Primary actions: I'll try this, Make it easier, Change this, and I have an opportunity right now. Rejecting a step should invite a short explanation rather than silently generating a near-duplicate.

### 7.5 Completion report and journal

A freeform journal is optional, but closing an active step requires a minimal structured signal. The system cannot responsibly claim progress without knowing whether the action was attempted.

Prompt

Responses

Did you try it?

Did it / Partly / Didn't do it

How did it compare with what you expected?

Easier / About the same / Harder / Not sure

If not attempted, what got in the way?

No opportunity / Forgot / Too uncomfortable / Not relevant / Other

Anything you want to add?

Optional text or voice journal


The journal is available at any time, whether or not it relates to the current step. If an entry appears to complete a step or materially change the plan, StepnOut asks for confirmation before updating persistent state.

### 7.6 Progress review

After several meaningful attempts, or when new evidence contradicts the plan, StepnOut summarizes what it has observed and proposes whether to continue, shift milestone, or reconsider the goal. The user confirms the interpretation conversationally.

Example review  You have initiated three conversations, and you described starting as easier than expected. Continuing the interaction still feels difficult. I suggest shifting the current focus to follow-up questions and repeated contact. Continue with that direction?

## 8. Functional requirements

### FR-01 — Narrative intake [MVP]

The system must collect the situation, desired change, recent example, prior attempts, perceived blockers, practical contexts, preferences, and boundaries. Nearby-event preferences are optional and requested only when relevant.

**Acceptance:** A new user can complete the required intake without entering location or writing a formally structured goal.

### FR-02 — System-proposed goal [MVP]

The LLM must translate the intake into a behaviorally meaningful proposed goal. The interface must require user confirmation or conversational correction before the plan becomes active.

**Acceptance:** The user can reject the proposal and explain why; the model returns a materially revised goal rather than a wording-only change.

### FR-03 — Working formulation [MVP]

The plan must include a concise, provisional explanation of what may be blocking progress. It should consider capability, opportunity, and motivation but present them in plain language.

**Acceptance:** The formulation is visibly framed as tentative and can be revised without deleting the user's history.

### FR-04 — Milestones [MVP]

The initial plan must contain three or four goal-specific milestones describing observable or meaningful behavioral changes. They are generated by StepnOut and confirmed as part of the plan.

**Acceptance:** The user can discuss or reject milestones, but cannot manually author the step sequence in the MVP.

### FR-05 — One active step [MVP]

The product must show no more than one active behavioral step per plan. Every step includes a rationale, concrete action, completion criterion, and optional if-then plan.

**Acceptance:** A user can understand what to do and what counts as attempting it without opening a secondary explanation screen.

### FR-06 — Step adjustment [MVP]

Users must be able to request an easier step or explain what should change. The model should use the correction to produce a materially different recommendation.

**Acceptance:** The replacement differs in strategy, context, target behavior, or challenge level rather than only wording.

### FR-07 — Attempt reporting [MVP]

Users must be able to report Did it, Partly, or Didn't do it and answer one short context-sensitive follow-up. Freeform detail remains optional.

**Acceptance:** A report can be completed in under 15 seconds without typing.

### FR-08 — Text and voice journal [MVP]

Users must be able to submit text or voice reflections at any time. Voice input is transcribed for review. The model responds to the content and may propose a plan update.

**Acceptance:** Audio handling, transcript review, deletion, and consent behavior are explicit; persistent inferences require confirmation.

### FR-09 — Adaptive response [MVP]

After a report or journal entry, the system may respond with a next step, clarification, reflection, repetition, changed focus, or proposed plan revision. It is not required to advance difficulty.

**Acceptance:** The response can omit a new step when clarification or reflection is more appropriate.

### FR-10 — Plan revision [MVP]

The system must preserve original intake and chronological evidence separately from the current working plan. A plan can be revised as a whole when meaningful evidence changes the interpretation.

**Acceptance:** The current plan can be replaced without rewriting or losing prior reports and journal entries.

### FR-11 — Progress review [MVP]

The system must periodically or contextually summarize evidence and propose whether to continue, change milestone, or reconsider the goal.

**Acceptance:** A milestone is not marked established without explicit user confirmation.

### FR-12 — Event-supported guidance [MVP]

When enabled, the system may consider verified nearby events as settings for the current step. Event use must be optional, relevant, feasible, and explainable.

**Acceptance:** The model can select no event. Event details include source, time, location, cost when known, and freshness metadata.

### FR-13 — On-demand guidance [MVP]

Users must be able to request guidance for an immediate situation or ask StepnOut to find an opportunity during a specified period.

**Acceptance:** The resulting step uses the user's current plan and stated context rather than replacing the plan with unrelated advice.

### FR-14 — Notifications [MVP]

Notifications must remind users about an accepted step, invite a check-in, or surface a strong event match. They must not create a daily backlog of unseen guidance.

**Acceptance:** Notification frequency is user-controlled and defaults to a low-frequency cadence.

## 9. Local event integration

Nearby events are an optional opportunity layer, not a separate program or discovery feed. They are most valuable when the current blocker involves finding a suitable context, reducing planning friction, or practising in a structured setting.

### 9.1 Event selection criteria

Directly supports the active goal, milestone, or experiment.

Fits the user's distance, timing, cost, accessibility, and age constraints.

Has a credible source and sufficiently fresh availability data.

Matches the desired challenge level and does not introduce disproportionate risk.

Provides more value than a simpler opportunity already present in the user's life.

Can be translated into a specific completion criterion.

### 9.2 Event experience

Example  There is an Italian-English exchange 15 minutes away on Saturday. Because you are working on initiating conversations in unfamiliar settings, it could be useful practice. Your step: attend for at least 30 minutes and introduce yourself to one person before waiting for someone to approach you.

User actions: Use this as my next step, Too much right now, Not relevant, Too far, Bad timing, or Wrong type of event. These responses improve both the opportunity model and the broader blocker formulation.

## 10. Cadence and generation triggers

Guidance is generated in response to meaningful state changes rather than by a daily or weekly content job. The current step remains active until it is attempted, replaced, dismissed, or made irrelevant by a plan revision.

Trigger

System behavior

Intake confirmed

Generate initial plan and first step

Attempt reported

Respond to outcome and determine the next useful action

Journal submitted

Respond; optionally propose a plan or focus update

Step rejected

Ask what is wrong and generate a materially different alternative

Immediate situation

Generate context-specific guidance on demand

Strong event match

Optionally surface as an opportunity, subject to notification preferences

Inactivity

Remind or ask whether the current step still fits; do not silently replace it


## 11. LLM behavior and system design

### 11.1 Design approach

The LLM should retain latitude to interpret unstructured situations and decide whether the appropriate response is an experiment, clarification, reflection, repetition, or change of direction. The application should enforce only the product contract, persistence boundaries, and safety requirements. It should not attempt to encode a comprehensive deterministic progression policy.

### 11.2 Minimal working state

Object

Purpose

Original intake

Immutable primary evidence supplied by the user

Working plan

Situation summary, proposed goal, provisional formulation, milestones, current focus, active step

Chronological history

Steps, attempt reports, journal entries, user corrections, and confirmed plan revisions

Event preferences

Optional practical constraints and prior event feedback


The working plan is versioned and replaceable. LLM-generated guidance never becomes evidence about the user merely because it appears repeatedly. User reports and confirmed interpretations are evidence; model conclusions remain provisional.

### 11.3 Context construction

Do not send the complete accumulated conversation and journal history on every generation.

Provide the confirmed working plan, the current request, the active step, a limited set of recent interactions, and selected older evidence only when relevant.

Frame the current formulation as provisional and instruct the model to consider whether new evidence suggests a different interpretation.

When refreshing the plan summary, regenerate it from primary intake and recent evidence rather than repeatedly editing the previous model summary.

Require user confirmation before inferred journal themes change persistent goals, milestones, or personal context.

### 11.4 Minimal output contract

A lightweight schema supports consistent rendering without constraining the model to a rigid coaching ontology. Fields other than message may be null.

Illustrative schema  { "message": "...", "next_step": "...", "completion_criterion": "...", "suggested_plan_update": null, "event_id": null }

## 12. Safety, privacy, and trust

### 12.1 Recommendation safety

Do not optimize for maximum discomfort. Optimize for meaningful, voluntary, safe action and useful learning.

Exclude illegal, dangerous, coercive, sexual, harassing, substance-related, high-financial-risk, or severe workplace-consequence recommendations.

Do not prescribe exposure around trauma, severe panic, eating disorders, self-harm, or other clinical conditions.

Never frame declining or modifying a step as failure.

Provide appropriate escalation language when user content indicates immediate safety or clinical concerns.

Validate event credibility and avoid directing users into unsafe or private situations.

### 12.2 Journal and location privacy

Explain how voice audio, transcripts, journal text, and approximate location are stored and used.

Allow users to review transcripts, delete entries, and disable nearby opportunities.

Use the minimum location precision necessary for event matching.

Do not convert sensitive journal inferences into persistent profile facts without confirmation.

Provide clear retention and model-training disclosures consistent with the product's actual data practices.

### 12.3 Positioning

Use language such as research-informed guidance, behavioral experiments, and personal growth. Avoid treatment claims, diagnostic labels, guaranteed outcomes, or claims that discomfort necessarily produces growth.

## 13. Measurement and validation

### 13.1 North-star outcome

The feature should be judged primarily by whether it helps users attempt meaningful real-world actions and perceive useful progress toward a confirmed goal, not by daily active use alone.

Area

Measures

Activation

Intake completion; goal confirmation; first-step acceptance; first report within 7 days

Guidance quality

Helpfulness; relevance; too generic; too repetitive; too hard/easy; correction rate

Behavior

Attempt rate; partial attempt rate; time to attempt; repeated practice across contexts

Learning

Easier/same/harder than expected; reported surprise; changed prediction; willingness to repeat

Progress

User-confirmed milestone movement; periodic goal-progress rating; qualitative progress summary

Retention

Return for another step or reflection within 2 and 4 weeks; avoid requiring daily use

Events

Event relevance; adoption; attendance report; stale/incorrect event rate; rejection reasons

Safety and trust

Unsafe recommendation rate; sensitive-memory correction; transcript deletion; user reports


### 13.2 MVP validation plan

- Run a small concierge or closely reviewed beta before broad release. Review intakes, generated plans, reports, journals, and plan revisions with explicit participant consent.

- Test whether users understand the distinction among goal, milestones, current focus, and current step without explanation from the team.

- Compare a system-proposed goal with a simple user-entered goal to determine whether formulation adds perceived value.

- Compare minimal structured reporting alone with structured reporting plus optional journal prompts.

- Measure whether event-supported steps improve relevance and attempted-action rates for opportunity-constrained goals.

- Have a qualified behavioral-health advisor review the intervention logic, safety boundaries, and product claims before public positioning.

## 14. MVP scope

### 14.1 Included

One active personalized growth plan per user.

Narrative intake and system-proposed goal/formulation/milestones.

One active step with completion criterion and adjustment controls.

Did it / Partly / Didn't do it reporting.

Text and voice journal with transcript review.

Adaptive LLM response and versioned plan revisions.

Optional local-event matching through the existing prototype.

Low-frequency, opt-in reminders.

Core analytics, feedback, safety logging, and administrative review tools for the beta.

### 14.2 Deferred

Multiple simultaneously active growth plans.

A universal progress score or gamified levels.

A general event-discovery feed.

Passive sensing, calendar ingestion, or automatic location tracking.

Social accountability, coach marketplaces, or peer communities.

Clinical screening, diagnosis, or therapeutic treatment pathways.

Fully automated optimization of notification timing.

## 15. Key risks and mitigations

Risk

Failure mode

Primary mitigation

Low engagement

The plan cannot adapt if users never report.

Require only a two-tap attempt report; make journaling optional; preserve one active step without daily backlog.

Insufficient intake

The initial plan may be generic or wrong.

Reflect the interpretation for confirmation; use early steps as tests; progressively learn from reports and journals.

LLM fixation

Repeated context may narrow the plan around one detail.

Separate primary evidence from working plan; limit context; treat formulation as provisional; regenerate summaries from source evidence.

Overcomplexity

Too many concepts or hidden states make the system brittle.

Expose only plan, milestones, current focus, current step, and journal; maintain one versioned plan rather than a detailed state machine.

Rigid guardrails

Excessive rules reduce the benefit of LLM reasoning.

Constrain product contract and safety, not the substantive coaching path; allow null next steps and plan reframing.

Unsafe guidance

A personalized step may introduce psychological, physical, or social risk.

Safety policy, exclusions, review tooling, clear boundaries, and professional review before launch.

Event mismatch

Stale or irrelevant events damage trust.

Use verified sources, freshness checks, practical filtering, explicit relevance, and a valid no-event outcome.

Therapeutic overclaiming

Research-informed language may be interpreted as treatment.

Careful positioning, claim review, and explicit non-clinical boundaries.


## 16. Launch acceptance criteria

A new user can complete intake, understand the proposed goal and milestones, and accept a first step without team assistance.

Every active step has an observable completion criterion and can be made easier or changed.

A completion report can be submitted without typing and updates the next response.

Journal entries can be submitted by text or voice, reviewed, deleted, and used without silently creating persistent facts.

The model can maintain a direction, revise it, or ask for clarification without requiring a deterministic progression ladder.

The system can select no local event and can explain why a selected event fits the active focus.

No daily content backlog is created for inactive users.

Safety, privacy, event freshness, and LLM quality instrumentation are operational for the beta.

Product language has been reviewed to avoid diagnosis, treatment, and guaranteed-outcome claims.

## 17. Open questions

What is the minimum viable intake length that still produces a meaningfully better plan than generic guidance?

Should users see the plain-language blocker formulation by default or only when asking why the plan was chosen?

What language should replace milestone if users interpret it as a rigid achievement gate?

How often should StepnOut proactively invite a progress review without creating engagement burden?

Should an optional journal entry appear after every report, or only after surprising, difficult, or partial outcomes?

What event sources and freshness guarantees are sufficient for beta launch?

Should the first release support only selected goal domains where content quality and safety can be evaluated deeply?

What age range will be supported, and what additional consent and safety requirements apply to minors?

What exact evidence and wording are required before marketing the feature as research-informed?

## 18. Research references

1. Craske et al. (2014), Maximizing Exposure Therapy: An Inhibitory Learning Approach

2. Michie, van Stralen & West (2011), The Behaviour Change Wheel and COM-B

3. Sheeran et al. (2020), Self-Determination Theory Interventions for Health Behavior Change

4. Gollwitzer & Sheeran (2006), Implementation Intentions and Goal Achievement

5. Harkin et al. (2016), Does Monitoring Goal Progress Promote Goal Attainment?

6. Nahum-Shani et al. (2017), Just-in-Time Adaptive Interventions in Mobile Health

7. Woolley & Fishbach (2022), Motivating Personal Growth by Seeking Discomfort

8. Russo-Netzer & Cohen (2022), A Behavioral Stretch Intervention

9. Sandstrom & Dunn (2014), Social Interactions and Well-Being: The Power of Weak Ties

These references support the adjacent mechanisms and design rationale. They do not constitute validation of the StepnOut feature described in this PRD.
