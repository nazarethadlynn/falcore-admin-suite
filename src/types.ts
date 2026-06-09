/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Person {
  id: string;
  email: string;
  full_name: string | null;
  source: string | null;
  deployment_key: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  region: string | null;
  timezone: string | null;
  user_agent: string | null;
  browser: string | null;
  os: string | null;
  device_type: string | null;
  referrer_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  consent_given: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailJob {
  id: string;
  person_id: string;
  email: string;
  provider: string | null;
  job_type: string;
  email_type: string | null;
  status: string;
  priority: number;
  scheduled_for: string;
  attempts: number;
  max_attempts: number;
  last_error: string | null;
  locked_at: string | null;
  locked_by: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailEvent {
  id: string;
  person_id: string;
  email_job_id: string | null;
  email: string;
  email_type: string;
  provider: string;
  provider_message_id: string | null;
  status: string;
  error_message: string | null;
  attempts: number;
  sent_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  person_id: string;
  unsubscribe_token_version: number;
  is_waitlist: boolean;
  waitlist_joined_at: string | null;
  waitlist_unsubscribed_at: string | null;
  waitlist_unsubscribe_reason: string | null;
  waitlist_unsubscribe_feedback: string | null;
  is_newsletter: boolean;
  newsletter_joined_at: string | null;
  newsletter_unsubscribed_at: string | null;
  newsletter_unsubscribe_reason: string | null;
  newsletter_unsubscribe_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteSubmission {
  id: string;
  name: string;
  email: string;
  type: "contact" | "support" | "newsletter" | "feedback";
  subject: string;
  message: string;
  status: "new" | "in_progress" | "replied" | "archived";
  notes?: string;
  rating?: number; // feedback rating
  createdAt: number;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: "welcome" | "auto_responder" | "support_resolution" | "newsletter" | "follow_up";
  createdAt: number;
  lastModified: number;
}

export interface AnalyticsSummary {
  totalSubmissions: number;
  repliedCount: number;
  pendingCount: number;
  typeDistribution: { name: string; value: number }[];
  statusDistribution: { name: string; value: number }[];
  dailyTrends: { date: string; count: number }[];
}
