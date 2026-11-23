import type { SignupSurvey, SignupSurveyRole } from "@rakazo/contracts";

/** The answers to send, blanks left out; a follow-up or need only counts with its role. */
export function signupSurveyAnswers(form: {
  role?: SignupSurveyRole;
  roleDetail?: string;
  brain?: SignupSurvey["brain"];
  needs: (string | undefined)[];
  source: string;
}): SignupSurvey {
  const source = form.source.trim();
  const needs = [...new Set(form.needs.filter((need): need is string => Boolean(need)))];
  return {
    ...(form.role ? { role: form.role } : {}),
    ...(form.role && form.roleDetail ? { roleDetail: form.roleDetail } : {}),
    ...(form.brain ? { brain: form.brain } : {}),
    ...(form.role && needs.length ? { needs } : {}),
    ...(source ? { source } : {}),
  };
}
