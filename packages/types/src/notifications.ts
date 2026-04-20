export type NotifType =
  | 'ASSESSMENT_COMPLETE'
  | 'JOB_MATCH'
  | 'SKILL_MILESTONE'
  | 'BILLING'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotifType;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  emailSent: boolean;
  createdAt: string;
}
