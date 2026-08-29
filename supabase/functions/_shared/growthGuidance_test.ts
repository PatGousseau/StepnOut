import {
  assertEquals,
  assertThrows,
} from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { validateGrowthModelResult } from './growthGuidance.ts';
import { getEvidenceClarification } from './growthGuidance.ts';

const validPlan = {
  goal: 'Initiate one useful contribution earlier in recurring meetings.',
  formulation: 'It may be that uncertainty about timing makes waiting feel safer.',
  milestones: [
    { title: 'Prepare', description: 'Choose one useful point.' },
    { title: 'Contribute', description: 'Share it earlier.' },
    { title: 'Repeat', description: 'Try in another meeting.' },
  ],
  current_focus: 'Choose a safe early opening.',
  first_step: {
    title: 'Share one prepared point',
    rationale: 'This tests whether an early contribution can be brief and useful.',
    action: 'Share one prepared point in the first half of the next recurring meeting.',
    completion_criterion: 'Say the point before the meeting is halfway over.',
    if_then_plan: 'If the agenda reaches my topic, I will share my prepared point.',
  },
};

Deno.test('accepts a complete proposal with three milestones', () => {
  const result = validateGrowthModelResult({
    result_type: 'proposal',
    clarification_question: null,
    plan: validPlan,
  });
  assertEquals(result.result_type, 'proposal');
  assertEquals(result.plan?.milestones.length, 3);
});

Deno.test('accepts a clarification with no plan', () => {
  const result = validateGrowthModelResult({
    result_type: 'clarification',
    clarification_question: 'What specific part of daily life do you most want to change?',
    plan: null,
  });
  assertEquals(result.result_type, 'clarification');
});

Deno.test('rejects proposals outside the milestone contract', () => {
  assertThrows(() =>
    validateGrowthModelResult({
      result_type: 'proposal',
      clarification_question: null,
      plan: { ...validPlan, milestones: validPlan.milestones.slice(0, 2) },
    })
  );
});

Deno.test('rejects a clarification that also asserts a plan', () => {
  assertThrows(() =>
    validateGrowthModelResult({
      result_type: 'clarification',
      clarification_question: 'What would change?',
      plan: validPlan,
    })
  );
});

Deno.test('asks for concrete context when required fields remain vague', () => {
  const question = getEvidenceClarification({
    current_situation: 'Everything feels stuck.',
    recent_example: 'It happened yesterday.',
    desired_change: 'I want things better.',
    why_it_matters: 'It matters.',
    likely_barriers: 'Not sure.',
    practice_context: 'Sometimes.',
    boundaries: 'None.',
  }, 'en');
  assertEquals(
    question,
    'What is one recent, specific situation where you felt stuck, and what did you do in that moment?',
  );
});

Deno.test('allows a sufficiently specific intake through to model generation', () => {
  assertEquals(getEvidenceClarification({
    current_situation: 'I prepare useful ideas for meetings but wait too long to share them.',
    recent_example: 'Yesterday I stayed quiet until my manager raised the same launch concern near the end.',
    desired_change: 'I want to contribute relevant ideas earlier while staying thoughtful and professional.',
    why_it_matters: 'My work would be more useful and decisions might improve.',
    likely_barriers: 'I worry about interrupting or being wrong in front of senior colleagues.',
    practice_context: 'Two recurring video meetings where I know the agenda in advance.',
    boundaries: 'Keep it within safe professional behavior and existing meetings.',
  }, 'en'), null);
});

Deno.test('advances sparse evidence through distinct clarification categories', () => {
  const sparse = {
    current_situation: 'Everything feels stuck.',
    recent_example: 'It happened yesterday.',
    desired_change: 'I want things better.',
    why_it_matters: 'It matters.',
    likely_barriers: 'Not sure.',
    practice_context: 'Sometimes.',
    boundaries: 'None.',
    clarifications: [] as Array<{ question: string; answer: string }>,
  };

  const situationQuestion = getEvidenceClarification(sparse, 'en');
  sparse.clarifications.push({
    question: situationQuestion || '',
    answer: 'I stayed silent during a team discussion even though I had prepared an idea.',
  });
  const directionQuestion = getEvidenceClarification(sparse, 'en');
  assertEquals(
    directionQuestion,
    'If this situation improved, what would concretely change in your life, and why would that matter?',
  );

  sparse.clarifications.push({
    question: directionQuestion || '',
    answer: 'I would share useful ideas earlier and feel that my work contributes to decisions.',
  });
  const practicalQuestion = getEvidenceClarification(sparse, 'en');
  assertEquals(
    practicalQuestion,
    'What is the main thing getting in the way, and where could a small attempt realistically fit in your week?',
  );

  sparse.clarifications.push({
    question: practicalQuestion || '',
    answer: 'I fear interrupting, but I can try in a recurring Tuesday meeting with a known agenda.',
  });
  assertEquals(getEvidenceClarification(sparse, 'en'), null);
});
