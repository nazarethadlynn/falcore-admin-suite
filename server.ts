import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Interfaces
interface WebsiteSubmission {
  id: string;
  name: string;
  email: string;
  type: "contact" | "support" | "newsletter" | "feedback";
  subject: string;
  message: string;
  status: "new" | "in_progress" | "replied" | "archived";
  notes?: string;
  rating?: number;
  createdAt: number;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: "welcome" | "auto_responder" | "support_resolution" | "newsletter" | "follow_up";
  createdAt: number;
  lastModified: number;
}

// Initial Seed Data
const initialSubmissions: WebsiteSubmission[] = [
  {
    id: "sub-1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@techcorp.com",
    type: "contact",
    subject: "Bulk Enterprise Licensing Query",
    message: "Hi, our engineering team is looking to purchase 50 bulk licenses of the Falcore suite. Could your sales representative send over some pricing brackets and compliance info? Much appreciated!",
    status: "new",
    createdAt: Date.now() - 3 * 3600 * 1000 // 3 hours ago
  },
  {
    id: "sub-2",
    name: "David Miller",
    email: "david.m@cybersec.io",
    type: "support",
    subject: "Webhook signature authentication failing",
    message: "We keep getting 403 response codes when attempting to parse Webhook payloads on our local staging system. The secret hashes don't align with the docs signature guidelines. Please assist.",
    status: "in_progress",
    notes: "Assigned ticket to Dev-Ops team. Awaiting debug log results.",
    createdAt: Date.now() - 14 * 3600 * 1000 // 14 hours ago
  },
  {
    id: "sub-3",
    name: "Liam Patterson",
    email: "patterson.liam@cloudnet.net",
    type: "feedback",
    subject: "Superb responsive dashboard UI latencies",
    message: "Just wanted to let you guys know that your core dashboard latency feels incredibly fast. Smooth Transitions are great and styling is flawless! Love the custom themes.",
    status: "replied",
    rating: 5,
    notes: "Sent a thank you note, offered beta preview enrollment.",
    createdAt: Date.now() - 2 * 24 * 3600 * 1000 // 2 days ago
  },
  {
    id: "sub-4",
    name: "Emily Watson",
    email: "emily.watson@dailyread.com",
    type: "newsletter",
    subject: "Newsletter Subscription Request",
    message: "Requesting immediate entry into Falcore Labs engineering standard publication digests.",
    status: "replied",
    createdAt: Date.now() - 5 * 24 * 3600 * 1000 // 5 days ago
  },
  {
    id: "sub-5",
    name: "Marcus Aurelius",
    email: "marcus@rome.org",
    type: "feedback",
    subject: "Product suggestions & clarity standards",
    message: "Excellent focus on engineering principles. It would be beautiful if we could easily export layouts directly into Figma styles. Keep up the high engineering discipline.",
    status: "new",
    rating: 4,
    createdAt: Date.now() - 4 * 3600 * 1000 // 4 hours ago
  }
];

const initialTemplates: EmailTemplate[] = [
  {
    id: "tpl-1",
    name: "Standard Inquiry Greeting",
    subject: "Regarding your inquiry to Falcore Labs - {{subject}}",
    body: "Hi {{name}},\n\nThank you for reaching out to Falcore Labs. We have received your inquiry regarding '{{subject}}'.\n\nOne of our team representatives will review your request:\n\"{{message}}\"\n\nWe will get back to you within 24 business hours.\n\nBest regards,\nThe Falcore Labs Team // Customer Relations Unit",
    category: "auto_responder",
    createdAt: Date.now() - 10 * 24 * 3600 * 1000,
    lastModified: Date.now() - 10 * 24 * 3600 * 1000
  },
  {
    id: "tpl-2",
    name: "Technical Support Resolution Intake",
    subject: "[Support Ticket #{{id}}] {{subject}}",
    body: "Dear {{name}},\n\nOur system has successfully logged your engineering support ticket under Ref #{{id}}.\n\nSummary of issues:\n- Subject: {{subject}}\n- Contact Address: {{email}}\n\nOur DevOps engineers are active. Please supply full shell logs if possible by replying directly to this mail.\n\nSincerely,\nFalcore Technical Operations & Security",
    category: "support_resolution",
    createdAt: Date.now() - 10 * 24 * 3600 * 1000,
    lastModified: Date.now() - 10 * 24 * 3600 * 1000
  },
  {
    id: "tpl-3",
    name: "Newsletter Welcome",
    subject: "Welcome to Falcore Engineering Quarterly Digest!",
    body: "Hi {{name}},\n\nYour active email address ({{email}}) is now enrolled in Falcore Engineering Quarterly digests!\n\nExpect clean updates concerning:\n- Standardized modular patterns (< 300 lines rule!)\n- Secure full-stack environment setups\n- Developer utilities\n\nWelcome on board,\nFalcore Labs Publishing",
    category: "welcome",
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
    lastModified: Date.now() - 5 * 24 * 3600 * 1000
  }
];

const initialPersons: any[] = [
  {
    id: "person-1",
    email: "alex.rivera@gmail.com",
    full_name: "Alex Rivera",
    source: "Google Ads",
    deployment_key: "dep-key-9281",
    ip_address: "192.168.1.45",
    country: "United States",
    city: "San Francisco",
    region: "California",
    timezone: "America/Los_Angeles",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    browser: "Chrome",
    os: "macOS",
    device_type: "desktop",
    referrer_url: "https://www.google.com/search?q=falcore+admin",
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "growth_q2",
    utm_term: "email analytics tool",
    utm_content: "responsive_preview_image",
    consent_given: true,
    notes: "Converted lead from Q2 search marketing sweep.",
    created_at: "2026-06-01T10:00:00Z",
    updated_at: "2026-06-01T10:15:00Z"
  },
  {
    id: "person-2",
    email: "sarah.jenkins@techcorp.com",
    full_name: "Sarah Jenkins",
    source: "Direct URL",
    deployment_key: null,
    ip_address: "84.140.23.111",
    country: "Germany",
    city: "Berlin",
    region: "Berlin State",
    timezone: "Europe/Berlin",
    user_agent: "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/113.0",
    browser: "Firefox",
    os: "Linux",
    device_type: "desktop",
    referrer_url: "https://falcore.com/docs",
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    consent_given: true,
    notes: "Developer seeking bulk API pricing schedules.",
    created_at: "2026-06-02T12:00:00Z",
    updated_at: "2026-06-02T12:00:00Z"
  },
  {
    id: "person-3",
    email: "david.m@cybersec.io",
    full_name: "David Miller",
    source: "Twitter Referrer",
    deployment_key: "dep-key-7345",
    ip_address: "109.224.51.89",
    country: "United Kingdom",
    city: "London",
    region: "England",
    timezone: "Europe/London",
    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
    browser: "Safari",
    os: "iOS",
    device_type: "mobile",
    referrer_url: "https://t.co/zXy8W816",
    utm_source: "twitter",
    utm_medium: "social",
    utm_campaign: "launch_day",
    utm_term: null,
    utm_content: "promo_tweet_1",
    consent_given: true,
    notes: "Security head inquiring on Webhook hashing algorithms.",
    created_at: "2026-06-03T15:30:00Z",
    updated_at: "2026-06-03T16:00:00Z"
  },
  {
    id: "person-4",
    email: "emily.watson@dailyread.com",
    full_name: "Emily Watson",
    source: "Blog Referral",
    deployment_key: null,
    ip_address: "198.54.120.30",
    country: "Canada",
    city: "Toronto",
    region: "Ontario",
    timezone: "America/Toronto",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.43",
    browser: "Edge",
    os: "Windows",
    device_type: "desktop",
    referrer_url: "https://techcrunch.com/best-email-engines",
    utm_source: "brand_pr",
    utm_medium: "referral",
    utm_campaign: "tech_blogs",
    utm_term: null,
    utm_content: "top_editorial",
    consent_given: true,
    notes: "Newsletter lead seeking custom daily content feed integrations.",
    created_at: "2026-06-04T08:15:00Z",
    updated_at: "2026-06-04T08:15:00Z"
  },
  {
    id: "person-5",
    email: "patterson.liam@cloudnet.net",
    full_name: "Liam Patterson",
    source: "ProductHunt",
    deployment_key: "dep-key-8374",
    ip_address: "1.124.96.25",
    country: "Australia",
    city: "Sydney",
    region: "New South Wales",
    timezone: "Australia/Sydney",
    user_agent: "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
    browser: "Chrome",
    os: "Android",
    device_type: "mobile",
    referrer_url: "https://www.producthunt.com/products/falcore-labs",
    utm_source: "producthunt",
    utm_medium: "referral",
    utm_campaign: "featured_today",
    utm_term: null,
    utm_content: "standard_bento_image",
    consent_given: true,
    notes: "Excited dev stating latency feels extremely fast.",
    created_at: "2026-06-05T09:45:00Z",
    updated_at: "2026-06-05T10:00:00Z"
  },
  {
    id: "person-6",
    email: "marcus@rome.org",
    full_name: "Marcus Aurelius",
    source: "Word of Mouth",
    deployment_key: null,
    ip_address: "151.10.244.5",
    country: "Italy",
    city: "Rome",
    region: "Lazio",
    timezone: "Europe/Rome",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15",
    browser: "Safari",
    os: "macOS",
    device_type: "desktop",
    referrer_url: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    consent_given: true,
    notes: "Advising export to Figma tools directly.",
    created_at: "2026-06-06T14:20:00Z",
    updated_at: "2026-06-06T14:20:00Z"
  },
  {
    id: "person-7",
    email: "sofia.martinez@latamtech.co",
    full_name: "Sofia Martinez",
    source: "LinkedIn Network",
    deployment_key: null,
    ip_address: "187.190.144.12",
    country: "Mexico",
    city: "Mexico City",
    region: "Distrito Federal",
    timezone: "America/Mexico_City",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    browser: "Chrome",
    os: "macOS",
    device_type: "desktop",
    referrer_url: "https://mx.linkedin.com/in/sofia-martinez",
    utm_source: "linkedin",
    utm_medium: "organic",
    utm_campaign: "sales_reach",
    utm_term: null,
    utm_content: "profile_link",
    consent_given: false,
    notes: "Unsubscribed waitlist. Found alternative server solutions.",
    created_at: "2026-06-07T11:10:00Z",
    updated_at: "2026-06-07T11:15:00Z"
  },
  {
    id: "person-8",
    email: "yuki.tanaka@tokyolabs.jp",
    full_name: "Yuki Tanaka",
    source: "Google Organic",
    deployment_key: "dep-key-1092",
    ip_address: "122.211.35.40",
    country: "Japan",
    city: "Tokyo",
    region: "Tokyo Prefecture",
    timezone: "Asia/Tokyo",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    browser: "Chrome",
    os: "Windows",
    device_type: "desktop",
    referrer_url: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    consent_given: true,
    notes: "Seeking low latency verification systems.",
    created_at: "2026-06-08T16:00:00Z",
    updated_at: "2026-06-08T16:00:00Z"
  }
];

const initialSubscriptions: any[] = [
  {
    id: "sub-s1",
    person_id: "person-1",
    unsubscribe_token_version: 1,
    is_waitlist: true,
    waitlist_joined_at: "2026-06-01T10:05:00Z",
    waitlist_unsubscribed_at: null,
    waitlist_unsubscribe_reason: null,
    waitlist_unsubscribe_feedback: null,
    is_newsletter: true,
    newsletter_joined_at: "2026-06-01T10:05:00Z",
    newsletter_unsubscribed_at: null,
    newsletter_unsubscribe_reason: null,
    newsletter_unsubscribe_feedback: null,
    created_at: "2026-06-01T10:05:00Z",
    updated_at: "2026-06-01T10:05:00Z"
  },
  {
    id: "sub-s2",
    person_id: "person-2",
    unsubscribe_token_version: 2,
    is_waitlist: true,
    waitlist_joined_at: "2026-06-02T12:02:00Z",
    waitlist_unsubscribed_at: null,
    waitlist_unsubscribe_reason: null,
    waitlist_unsubscribe_feedback: null,
    is_newsletter: false,
    newsletter_joined_at: "2026-06-02T12:02:00Z",
    newsletter_unsubscribed_at: "2026-06-03T18:00:00Z",
    newsletter_unsubscribe_reason: "Too many emails",
    newsletter_unsubscribe_feedback: "Prefer a single weekly digest instead of instant communications.",
    created_at: "2026-06-02T12:02:00Z",
    updated_at: "2026-06-03T18:00:00Z"
  },
  {
    id: "sub-s3",
    person_id: "person-3",
    unsubscribe_token_version: 1,
    is_waitlist: false,
    waitlist_joined_at: null,
    waitlist_unsubscribed_at: null,
    waitlist_unsubscribe_reason: null,
    waitlist_unsubscribe_feedback: null,
    is_newsletter: true,
    newsletter_joined_at: "2026-06-03T15:32:00Z",
    newsletter_unsubscribed_at: null,
    newsletter_unsubscribe_reason: null,
    newsletter_unsubscribe_feedback: null,
    created_at: "2026-06-03T15:32:00Z",
    updated_at: "2026-06-03T15:32:00Z"
  },
  {
    id: "sub-s4",
    person_id: "person-4",
    unsubscribe_token_version: 1,
    is_waitlist: true,
    waitlist_joined_at: "2026-06-04T08:16:00Z",
    waitlist_unsubscribed_at: null,
    waitlist_unsubscribe_reason: null,
    waitlist_unsubscribe_feedback: null,
    is_newsletter: true,
    newsletter_joined_at: "2026-06-04T08:16:00Z",
    newsletter_unsubscribed_at: null,
    newsletter_unsubscribe_reason: null,
    newsletter_unsubscribe_feedback: null,
    created_at: "2026-06-04T08:16:00Z",
    updated_at: "2026-06-04T08:16:00Z"
  },
  {
    id: "sub-s5",
    person_id: "person-5",
    unsubscribe_token_version: 1,
    is_waitlist: true,
    waitlist_joined_at: "2026-06-05T09:47:00Z",
    waitlist_unsubscribed_at: null,
    waitlist_unsubscribe_reason: null,
    waitlist_unsubscribe_feedback: null,
    is_newsletter: true,
    newsletter_joined_at: "2026-06-05T09:47:00Z",
    newsletter_unsubscribed_at: null,
    newsletter_unsubscribe_reason: null,
    newsletter_unsubscribe_feedback: null,
    created_at: "2026-06-05T09:47:00Z",
    updated_at: "2026-06-05T09:47:00Z"
  },
  {
    id: "sub-s6",
    person_id: "person-6",
    unsubscribe_token_version: 1,
    is_waitlist: false,
    waitlist_joined_at: null,
    waitlist_unsubscribed_at: null,
    waitlist_unsubscribe_reason: null,
    waitlist_unsubscribe_feedback: null,
    is_newsletter: true,
    newsletter_joined_at: "2026-06-06T14:21:00Z",
    newsletter_unsubscribed_at: null,
    newsletter_unsubscribe_reason: null,
    newsletter_unsubscribe_feedback: null,
    created_at: "2026-06-06T14:21:00Z",
    updated_at: "2026-06-06T14:21:00Z"
  },
  {
    id: "sub-s7",
    person_id: "person-7",
    unsubscribe_token_version: 1,
    is_waitlist: false,
    waitlist_joined_at: "2026-06-07T11:10:00Z",
    waitlist_unsubscribed_at: "2026-06-07T11:15:00Z",
    waitlist_unsubscribe_reason: "Found alternative",
    waitlist_unsubscribe_feedback: "Found self-hosted system that suits our local standards better.",
    is_newsletter: false,
    newsletter_joined_at: null,
    newsletter_unsubscribed_at: null,
    newsletter_unsubscribe_reason: null,
    newsletter_unsubscribe_feedback: null,
    created_at: "2026-06-07T11:10:00Z",
    updated_at: "2026-06-07T11:15:00Z"
  },
  {
    id: "sub-s8",
    person_id: "person-8",
    unsubscribe_token_version: 1,
    is_waitlist: true,
    waitlist_joined_at: "2026-06-08T16:01:00Z",
    waitlist_unsubscribed_at: null,
    waitlist_unsubscribe_reason: null,
    waitlist_unsubscribe_feedback: null,
    is_newsletter: false,
    newsletter_joined_at: null,
    newsletter_unsubscribed_at: null,
    newsletter_unsubscribe_reason: null,
    newsletter_unsubscribe_feedback: null,
    created_at: "2026-06-08T16:01:00Z",
    updated_at: "2026-06-08T16:01:00Z"
  }
];

const initialEmailJobs: any[] = [
  {
    id: "job-j1",
    person_id: "person-1",
    email: "alex.rivera@gmail.com",
    provider: "SendGrid",
    job_type: "welcome_onboarding",
    email_type: "html_rich",
    status: "success",
    priority: 1,
    scheduled_for: "2026-06-01T10:01:00Z",
    attempts: 1,
    max_attempts: 3,
    last_error: null,
    locked_at: "2026-06-01T10:01:10Z",
    locked_by: "worker_node_a",
    processed_by: "worker_node_a",
    processed_at: "2026-06-01T10:02:15Z",
    created_at: "2026-06-01T10:00:30Z",
    updated_at: "2026-06-01T10:02:15Z"
  },
  {
    id: "job-j2",
    person_id: "person-2",
    email: "sarah.jenkins@techcorp.com",
    provider: "Postmark",
    job_type: "newsletter_broadcast",
    email_type: "html_rich",
    status: "success",
    priority: 0,
    scheduled_for: "2026-06-15T09:00:00Z",
    attempts: 1,
    max_attempts: 3,
    last_error: null,
    locked_at: "2026-06-15T09:00:15Z",
    locked_by: "worker_node_b",
    processed_by: "worker_node_b",
    processed_at: "2026-06-15T09:01:30Z",
    created_at: "2026-06-14T12:00:00Z",
    updated_at: "2026-06-15T09:01:30Z"
  },
  {
    id: "job-j3",
    person_id: "person-3",
    email: "david.m@cybersec.io",
    provider: "AWS SES",
    job_type: "verification_code",
    email_type: "text_plain",
    status: "failed",
    priority: 2,
    scheduled_for: "2026-06-03T15:31:00Z",
    attempts: 3,
    max_attempts: 3,
    last_error: "SMTP Error: 554 Host Unreachable",
    locked_at: "2026-06-03T15:31:10Z",
    locked_by: "worker_node_a",
    processed_by: "worker_node_a",
    processed_at: "2026-06-03T15:35:45Z",
    created_at: "2026-06-03T15:30:15Z",
    updated_at: "2026-06-03T15:35:45Z"
  },
  {
    id: "job-j4",
    person_id: "person-4",
    email: "emily.watson@dailyread.com",
    provider: null,
    job_type: "news_update",
    email_type: "html_rich",
    status: "pending",
    priority: 0,
    scheduled_for: "2026-06-12T12:00:00Z",
    attempts: 0,
    max_attempts: 3,
    last_error: null,
    locked_at: null,
    locked_by: null,
    processed_by: null,
    processed_at: null,
    created_at: "2026-06-04T08:16:00Z",
    updated_at: "2026-06-04T08:16:00Z"
  },
  {
    id: "job-j5",
    person_id: "person-5",
    email: "patterson.liam@cloudnet.net",
    provider: "SendGrid",
    job_type: "welcome_onboarding",
    email_type: "html_rich",
    status: "success",
    priority: 1,
    scheduled_for: "2026-06-05T09:46:00Z",
    attempts: 1,
    max_attempts: 3,
    last_error: null,
    locked_at: "2026-06-05T09:46:10Z",
    locked_by: "worker_node_b",
    processed_by: "worker_node_b",
    processed_at: "2026-06-05T09:47:11Z",
    created_at: "2026-06-05T09:45:30Z",
    updated_at: "2026-06-05T09:47:11Z"
  },
  {
    id: "job-j6",
    person_id: "person-8",
    email: "yuki.tanaka@tokyolabs.jp",
    provider: null,
    job_type: "priority_alert",
    email_type: "text_plain",
    status: "pending",
    priority: 3,
    scheduled_for: "2026-06-10T08:00:00Z",
    attempts: 0,
    max_attempts: 5,
    last_error: null,
    locked_at: null,
    locked_by: null,
    processed_by: null,
    processed_at: null,
    created_at: "2026-06-08T16:02:00Z",
    updated_at: "2026-06-08T16:02:00Z"
  }
];

const initialEmailEvents: any[] = [
  {
    id: "ev-e1",
    person_id: "person-1",
    email_job_id: "job-j1",
    email: "alex.rivera@gmail.com",
    email_type: "welcome_onboarding",
    provider: "SendGrid",
    provider_message_id: "sg_msg_98240ad8f8",
    status: "sent",
    error_message: null,
    attempts: 1,
    sent_at: "2026-06-01T10:02:15Z",
    created_at: "2026-06-01T10:01:15Z"
  },
  {
    id: "ev-e2",
    person_id: "person-2",
    email_job_id: "job-j2",
    email: "sarah.jenkins@techcorp.com",
    email_type: "newsletter_broadcast",
    provider: "Postmark",
    provider_message_id: "pm_msg_22340b99ac",
    status: "sent",
    error_message: null,
    attempts: 1,
    sent_at: "2026-06-15T09:01:30Z",
    created_at: "2026-06-15T09:00:20Z"
  },
  {
    id: "ev-e3",
    person_id: "person-3",
    email_job_id: "job-j3",
    email: "david.m@cybersec.io",
    email_type: "verification_code",
    provider: "AWS SES",
    provider_message_id: null,
    status: "failed",
    error_message: "Bounced: Address does not exist or host is unreachable.",
    attempts: 3,
    sent_at: null,
    created_at: "2026-06-03T15:31:10Z"
  },
  {
    id: "ev-e4",
    person_id: "person-5",
    email_job_id: "job-j5",
    email: "patterson.liam@cloudnet.net",
    email_type: "welcome_onboarding",
    provider: "SendGrid",
    provider_message_id: "sg_msg_77120bc9ff",
    status: "sent",
    error_message: null,
    attempts: 1,
    sent_at: "2026-06-05T09:47:11Z",
    created_at: "2026-06-05T09:46:12Z"
  },
  {
    id: "ev-e5",
    person_id: "person-6",
    email_job_id: null,
    email: "marcus@rome.org",
    email_type: "weekly_digest",
    provider: "Postmark",
    provider_message_id: null,
    status: "queued",
    error_message: null,
    attempts: 0,
    sent_at: null,
    created_at: "2026-06-06T14:22:00Z"
  }
];

// Read/Write helper
function readDB() {
  let defaultData: any = { 
    submissions: initialSubmissions, 
    templates: initialTemplates,
    persons: initialPersons,
    email_jobs: initialEmailJobs,
    email_events: initialEmailEvents,
    subscriptions: initialSubscriptions
  };
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      let migrated = false;
      if (!parsed.submissions) { parsed.submissions = initialSubmissions; migrated = true; }
      if (!parsed.templates) { parsed.templates = initialTemplates; migrated = true; }
      if (!parsed.persons) { parsed.persons = initialPersons; migrated = true; }
      if (!parsed.email_jobs) { parsed.email_jobs = initialEmailJobs; migrated = true; }
      if (!parsed.email_events) { parsed.email_events = initialEmailEvents; migrated = true; }
      if (!parsed.subscriptions) { parsed.subscriptions = initialSubscriptions; migrated = true; }
      
      if (migrated) {
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
      }
      return parsed;
    }
  } catch (err) {
    console.error("DB reading failed, resetting file storage:", err);
  }
  
  // Write initial structure
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
  return defaultData;
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Failed to write persistence database file:", err);
  }
}


// API Routes

// 1. Health Status Endpoints
app.get("/api/health", (req, res) => {
  const isKeyAvailable = !!process.env.GEMINI_API_KEY;
  res.json({
    status: "ok",
    hasApiKey: isKeyAvailable,
    databaseFile: DB_FILE,
    timestamp: new Date().toISOString()
  });
});

// 2. Fetch submissions
app.get("/api/submissions", (req, res) => {
  const db = readDB();
  res.json(db.submissions);
});

// 3. Add website submission (Simulating public website contact form)
app.post("/api/submissions", (req, res) => {
  const { name, email, type, subject, message, rating } = req.body;
  if (!name || !email || !type || !subject || !message) {
    return res.status(400).json({ error: "Required fields (name, email, type, subject, message) missing." });
  }

  const newSub: WebsiteSubmission = {
    id: `sub-${Date.now()}`,
    name,
    email,
    type,
    subject,
    message,
    status: "new",
    rating: rating ? Number(rating) : undefined,
    createdAt: Date.now()
  };

  const db = readDB();
  db.submissions.unshift(newSub); // insert at top
  writeDB(db);

  res.status(201).json(newSub);
});

// 4. Update status & feedback notes of submission
app.put("/api/submissions/:id", (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const db = readDB();
  const subIdx = db.submissions.findIndex(s => s.id === id);

  if (subIdx === -1) {
    return res.status(404).json({ error: "Submission ID not found." });
  }

  if (status) db.submissions[subIdx].status = status;
  if (notes !== undefined) db.submissions[subIdx].notes = notes;

  writeDB(db);
  res.json(db.submissions[subIdx]);
});

// 5. Delete submission
app.delete("/api/submissions/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  
  const originalLen = db.submissions.length;
  db.submissions = db.submissions.filter(s => s.id !== id);
  
  if (db.submissions.length === originalLen) {
    return res.status(404).json({ error: "Submission ID not found." });
  }

  writeDB(db);
  res.json({ success: true, message: "Submission removed from database." });
});

// SQLite Schema Analytica API routes
// A. Fetch persons
app.get("/api/persons", (req, res) => {
  const db = readDB();
  res.json(db.persons || []);
});

// B. Save / create person
app.post("/api/persons", (req, res) => {
  const { email, full_name, source, country, city, browser, os, consent_given, notes } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email target is required." });
  }

  const db = readDB();
  const existingIndex = db.persons.findIndex((p: any) => p.email.toLowerCase() === email.toLowerCase());

  let targetPerson;
  if (existingIndex !== -1) {
    // Update existing person
    targetPerson = {
      ...db.persons[existingIndex],
      full_name: full_name !== undefined ? full_name : db.persons[existingIndex].full_name,
      source: source !== undefined ? source : db.persons[existingIndex].source,
      notes: notes !== undefined ? notes : db.persons[existingIndex].notes,
      updated_at: new Date().toISOString()
    };
    db.persons[existingIndex] = targetPerson;
  } else {
    // Create new person matching the relational schema
    const newId = `person-${Date.now()}`;
    targetPerson = {
      id: newId,
      email,
      full_name: full_name || null,
      source: source || "Admin Input",
      deployment_key: `dep-key-${Math.floor(1000 + Math.random() * 9000)}`,
      ip_address: "127.0.0.1",
      country: country || "United States",
      city: city || "New York",
      region: "New York State",
      timezone: "America/New_York",
      user_agent: "Mozilla/5.0 AdminConsole/1.0 Web",
      browser: browser || "Chrome",
      os: os || "macOS",
      device_type: "desktop",
      referrer_url: null,
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      consent_given: consent_given !== undefined ? !!consent_given : true,
      notes: notes || "Direct administrator-created subscriber entry",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.persons.unshift(targetPerson);

    // Auto-create initial subscription state
    const newSub = {
      id: `sub-s${Date.now()}`,
      person_id: newId,
      unsubscribe_token_version: 1,
      is_waitlist: true,
      waitlist_joined_at: new Date().toISOString(),
      waitlist_unsubscribed_at: null,
      waitlist_unsubscribe_reason: null,
      waitlist_unsubscribe_feedback: null,
      is_newsletter: true,
      newsletter_joined_at: new Date().toISOString(),
      newsletter_unsubscribed_at: null,
      newsletter_unsubscribe_reason: null,
      newsletter_unsubscribe_feedback: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    db.subscriptions.unshift(newSub);
  }

  writeDB(db);
  res.status(201).json(targetPerson);
});

// C. Update Person Detail
app.put("/api/persons/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const db = readDB();
  const idx = db.persons.findIndex((p: any) => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ error: "Person record not identified." });
  }

  db.persons[idx] = {
    ...db.persons[idx],
    ...updates,
    updated_at: new Date().toISOString()
  };

  writeDB(db);
  res.json(db.persons[idx]);
});

// D. Delete Person (Cascading deletes)
app.delete("/api/persons/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();
  db.persons = db.persons.filter((p: any) => p.id !== id);
  db.subscriptions = db.subscriptions.filter((s: any) => s.person_id !== id);
  db.email_jobs = db.email_jobs.filter((j: any) => j.person_id !== id);
  db.email_events = db.email_events.filter((e: any) => e.person_id !== id);

  writeDB(db);
  res.json({ success: true, message: `Cascaded deletion completed for person: ${id}` });
});

// E. Read email_jobs
app.get("/api/email_jobs", (req, res) => {
  const db = readDB();
  res.json(db.email_jobs || []);
});

// F. Create manual email job
app.post("/api/email_jobs", (req, res) => {
  const { person_id, job_type, priority } = req.body;
  if (!person_id || !job_type) {
    return res.status(400).json({ error: "Required fields (person_id, job_type) missing." });
  }

  const db = readDB();
  const person = db.persons.find((p: any) => p.id === person_id);
  if (!person) {
    return res.status(404).json({ error: "Person reference not found." });
  }

  const newJob = {
    id: `job-j${Date.now()}`,
    person_id,
    email: person.email,
    provider: null,
    job_type,
    email_type: "html_rich",
    status: "pending",
    priority: priority !== undefined ? Number(priority) : 0,
    scheduled_for: new Date().toISOString(),
    attempts: 0,
    max_attempts: 3,
    last_error: null,
    locked_at: null,
    locked_by: null,
    processed_by: null,
    processed_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.email_jobs.unshift(newJob);
  writeDB(db);

  res.status(201).json(newJob);
});

// G. Read email_events
app.get("/api/email_events", (req, res) => {
  const db = readDB();
  res.json(db.email_events || []);
});

// H. Read subscriptions
app.get("/api/subscriptions", (req, res) => {
  const db = readDB();
  res.json(db.subscriptions || []);
});

// I. Simulate Background SMTP Worker Thread
app.post("/api/simulate-background-queue", (req, res) => {
  const db = readDB();
  const pendingJobs = db.email_jobs.filter((j: any) => j.status === "pending");

  if (pendingJobs.length === 0) {
    return res.json({
      success: true,
      message: "Worker thread processed complete. Queue currently empty.",
      processedCount: 0
    });
  }

  let processedCount = 0;
  const providers = ["SendGrid", "Postmark", "AWS SES"];

  pendingJobs.forEach((job: any) => {
    processedCount++;
    const outcomeSuccess = Math.random() >= 0.22; // 78% success rate
    const selectedProvider = providers[Math.floor(Math.random() * providers.length)];

    job.attempts += 1;
    job.provider = selectedProvider;
    job.locked_at = new Date().toISOString();
    job.locked_by = "worker_node_simulated";
    job.processed_by = "worker_node_simulated";
    job.processed_at = new Date().toISOString();
    job.updated_at = new Date().toISOString();

    if (outcomeSuccess) {
      job.status = "success";
      job.last_error = null;

      // Append real transaction deliver event logs
      db.email_events.unshift({
        id: `ev-e${Date.now()}-${processedCount}`,
        person_id: job.person_id,
        email_job_id: job.id,
        email: job.email,
        email_type: job.job_type,
        provider: selectedProvider,
        provider_message_id: `provider_rx_sig_${Math.random().toString(36).substr(2, 9)}`,
        status: "sent",
        error_message: null,
        attempts: job.attempts,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    } else {
      job.status = "failed";
      job.last_error = `Simulated delivery issue: SMTP 550 Relay Access Denied`;

      db.email_events.unshift({
        id: `ev-e${Date.now()}-${processedCount}`,
        person_id: job.person_id,
        email_job_id: job.id,
        email: job.email,
        email_type: job.job_type,
        provider: selectedProvider,
        provider_message_id: null,
        status: "failed",
        error_message: job.last_error,
        attempts: job.attempts,
        sent_at: null,
        created_at: new Date().toISOString()
      });
    }
  });

  writeDB(db);

  res.json({
    success: true,
    message: `Successfully processed queue tasks of database schema!`,
    processedCount,
    jobs: db.email_jobs,
    events: db.email_events
  });
});

// 6. Fetch templates
app.get("/api/templates", (req, res) => {
  const db = readDB();
  res.json(db.templates);
});

// 7. Save / update custom email template
app.post("/api/templates", (req, res) => {
  const { id, name, subject, body, category } = req.body;
  if (!name || !subject || !body || !category) {
    return res.status(400).json({ error: "Missing template fields." });
  }

  const db = readDB();

  if (id) {
    // Edit existing template
    const tplIdx = db.templates.findIndex(t => t.id === id);
    if (tplIdx === -1) {
      return res.status(404).json({ error: "Template not found." });
    }
    
    db.templates[tplIdx] = {
      ...db.templates[tplIdx],
      name,
      subject,
      body,
      category,
      lastModified: Date.now()
    };
    writeDB(db);
    res.json(db.templates[tplIdx]);
  } else {
    // Add new template
    const newTpl: EmailTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      subject,
      body,
      category,
      createdAt: Date.now(),
      lastModified: Date.now()
    };
    db.templates.push(newTpl);
    writeDB(db);
    res.status(201).json(newTpl);
  }
});

// 8. Delete email template
app.delete("/api/templates/:id", (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const originalLen = db.templates.length;
  db.templates = db.templates.filter(t => t.id !== id);

  if (db.templates.length === originalLen) {
    return res.status(404).json({ error: "Template not found." });
  }

  writeDB(db);
  res.json({ success: true, message: "Template removed." });
});

// 9. Gemini-powered SMART Template Draft recommendation (Bonus feature)
app.post("/api/gemini/draft-ai-reply", async (req, res) => {
  try {
    const { submissionId, templateId } = req.body;
    if (!submissionId) {
      return res.status(400).json({ error: "Submission context required." });
    }

    const db = readDB();
    const sub = db.submissions.find(s => s.id === submissionId);
    if (!sub) {
      return res.status(404).json({ error: "Submission context not found." });
    }

    const template = db.templates.find(t => t.id === templateId);
    const api = getGeminiClient();

    if (!api) {
      return res.status(400).json({ error: "Gemini API key not configured." });
    }

    let prompt = `You are an executive customer liaison assistant at Falcore Labs. 
We received a website form submission of type "${sub.type}" by ${sub.name} (${sub.email}).
Message details:
Subject: "${sub.subject}"
Body: "${sub.message}"

We want you to construct a custom polished response email. `;

    if (template) {
      prompt += `Please adapt our standard corporate email template schema:
Subject Template: "${template.subject}"
Body Template: "${template.body}"

Fill in all template variable placeholders (like {{name}}, {{subject}}, {{message}} etc) and feel free to polish, refine, expand, or adjust the draft so that it answers their exact inquiry specifically, professionally, and warmly. No markdown blocks inside the body, keep it plain text ready for email client delivery. Always keep a professional corporate tone.`;
    } else {
      prompt += `Draft a fully customized, professional, warm, and corporate response to this query from scratch. Include high quality greeting and clear signatures.`;
    }

    const response = await api.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING, description: "The drafted polished subject line." },
            body: { type: Type.STRING, description: "The drafted complete plain-text email body." }
          },
          required: ["subject", "body"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Gemini AI Reply drafting failure:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI auto responder reply." });
  }
});


// Boot up routine
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Dev with Vite serving middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production statics
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Falcore Admin Portal] Express server running at system host port ${PORT}`);
  });
}

startServer();
