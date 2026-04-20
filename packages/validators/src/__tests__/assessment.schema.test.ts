import { describe, it, expect } from 'vitest';
import {
  AssessmentAnswerSchema,
  SaveAssessmentAnswersSchema,
  SubmitAssessmentSchema,
} from '../assessment.schema.js';

describe('AssessmentAnswerSchema', () => {
  it('accepts string answer', () => {
    const result = AssessmentAnswerSchema.safeParse({ questionId: 'q1', answer: 'my answer' });
    expect(result.success).toBe(true);
  });

  it('accepts array answer', () => {
    const result = AssessmentAnswerSchema.safeParse({
      questionId: 'q1',
      answer: ['option1', 'option2'],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty questionId', () => {
    const result = AssessmentAnswerSchema.safeParse({ questionId: '', answer: 'x' });
    expect(result.success).toBe(false);
  });
});

describe('SaveAssessmentAnswersSchema', () => {
  const validAnswer = { questionId: 'q1', answer: 'ans' };

  it('accepts valid step and answers', () => {
    const result = SaveAssessmentAnswersSchema.safeParse({
      step: 1,
      answers: [validAnswer],
    });
    expect(result.success).toBe(true);
  });

  it('rejects step 0', () => {
    const result = SaveAssessmentAnswersSchema.safeParse({ step: 0, answers: [validAnswer] });
    expect(result.success).toBe(false);
  });

  it('rejects step 9', () => {
    const result = SaveAssessmentAnswersSchema.safeParse({ step: 9, answers: [validAnswer] });
    expect(result.success).toBe(false);
  });

  it('rejects empty answers array', () => {
    const result = SaveAssessmentAnswersSchema.safeParse({ step: 1, answers: [] });
    expect(result.success).toBe(false);
  });
});

describe('SubmitAssessmentSchema', () => {
  const answers = Array.from({ length: 8 }, (_, i) => ({
    questionId: `q${i + 1}`,
    answer: `answer ${i + 1}`,
  }));

  it('accepts exactly 8 answers', () => {
    const result = SubmitAssessmentSchema.safeParse({ answers });
    expect(result.success).toBe(true);
  });

  it('rejects fewer than 8 answers', () => {
    const result = SubmitAssessmentSchema.safeParse({ answers: answers.slice(0, 7) });
    expect(result.success).toBe(false);
  });

  it('rejects more than 8 answers', () => {
    const result = SubmitAssessmentSchema.safeParse({
      answers: [...answers, { questionId: 'q9', answer: 'extra' }],
    });
    expect(result.success).toBe(false);
  });
});
