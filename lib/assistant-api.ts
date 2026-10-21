/** The student assistant (backend AssistantController). The backend stores the chats and asks the AI service. */
import { api } from "@/lib/api-client";
import { lessonPath, trackPath } from "@/lib/learning-api";

export type AssistantRole = "Student" | "Assistant";

export interface AssistantMessage {
  id: string;
  orderIndex: number;
  role: AssistantRole;
  text: string;
  createdUtc: string;
}

/** A page a reply points to. */
export interface AssistantLink {
  kind: "lesson" | "track" | "mentor" | "squad" | "discovery" | "achievements" | "jobs" | string;
  /** Lesson id, track code or mentor id; empty for the other pages. */
  ref: string;
  label: string;
  /** Lesson links: the lesson's track, for its page address. */
  trackCode?: string | null;
}

export interface AssistantReply {
  conversationId: string;
  message: AssistantMessage;
  reply: AssistantMessage;
  /** Up to 3 follow-up questions the student can tap to send. */
  suggestions: string[];
  links: AssistantLink[];
  /** The AI service did not answer: the reply is the prepared "try again later" message. */
  isFallback: boolean;
  /** False when this chat is full and a new one must be started. */
  canContinue: boolean;
}

export interface AssistantConversationSummary {
  id: string;
  title: string;
  startedUtc: string;
  lastMessageUtc: string;
  messageCount: number;
}

export interface AssistantConversation {
  id: string;
  title: string;
  startedUtc: string;
  lastMessageUtc: string;
  messages: AssistantMessage[];
  canContinue: boolean;
}

const BASE = "/api/v1/assistant";

/** Without a conversation id a new chat starts. */
export const sendAssistantMessage = (text: string, conversationId?: string | null) =>
  api.post<AssistantReply>(`${BASE}/messages`, { conversationId: conversationId ?? null, text });

export const getAssistantConversations = () => api.get<AssistantConversationSummary[]>(`${BASE}/conversations`);

export const getAssistantConversation = (id: string) => api.get<AssistantConversation>(`${BASE}/conversations/${id}`);

/** Where a link opens, or null for a link this site cannot open. */
export function assistantLinkHref(link: AssistantLink): string | null {
  switch (link.kind) {
    case "lesson":
      return link.trackCode ? lessonPath(link.trackCode, link.ref) : null;
    case "track":
      return link.ref ? trackPath(link.ref) : null;
    case "mentor":
      return "/learner/mentorship";
    case "squad":
      return "/learner/interns";
    case "discovery":
      return "/learner/courses/discovery";
    case "achievements":
      return "/learner/certification";
    case "jobs":
      return "/learner/recruitment-practice";
    default:
      return null;
  }
}
