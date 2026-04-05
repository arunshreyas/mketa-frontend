export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001/api";

export type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
};

export type Campaign = {
  _id: string;
  client_id: string;
  campaignName: string;
  objective: string;
  status: "planned" | "active" | "paused" | "completed";
  duration: number;
  product: string;
  clientIndustry?: string;
  brandName?: string;
  employeeId?: string;
  brandProfile?: {
    positioning?: string;
    voice?: string;
    visualDirection?: string;
    differentiators?: string[];
  } | null;
  websiteBrief?: {
    targetAudience?: string;
    offerSummary?: string;
    keyBenefits?: string[];
    primaryCTA?: string;
    websiteGoal?: string;
    desiredSections?: string[];
  } | null;
  generatedFunnel?: Record<string, unknown> | null;
  generatedWebsite?: Record<string, unknown> | null;
  generatedFlyer?: Record<string, unknown> | null;
  generatedAccountOptimization?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Client = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  industry: string;
};

export type CreateClientPayload = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  industry: string;
};

export type CreateCampaignPayload = {
  client_id: string;
  campaignName: string;
  objective: string;
  status: "planned" | "active" | "paused" | "completed";
  duration: number;
  product: string;
  clientIndustry?: string;
  brandName: string;
};

export type CampaignIdea = {
  id?: string;
  day: number;
  idea?: string;
  platform?: string;
  status?: string;
  hook?: string;
  body?: string;
  cta?: string;
  angle?: string;
  rationale?: string;
};

export type CampaignLead = {
  _id: string;
  name?: string;
  handle?: string;
  email?: string;
  phone?: string;
  source: string;
  platform?: string;
  message?: string;
  intentSignal?: string;
  notes?: string;
  status: string;
  temperature: string;
  qualificationScore: number;
  qualificationSummary?: string;
  nextStep?: string;
};

export type CampaignChatMessage = {
  role: "user" | "assistant";
  content: string;
};

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed with ${response.status}`);
  }

  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return parseJson<AuthResponse>(response);
}

export async function authorizedFetch(path: string, token: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });
}

export async function fetchCampaigns(token: string) {
  const response = await authorizedFetch("/campaigns", token);
  return parseJson<Campaign[]>(response);
}

export async function fetchClients(token: string) {
  const response = await authorizedFetch("/clients", token);
  return parseJson<Client[]>(response);
}

export async function createClient(payload: CreateClientPayload, token: string) {
  const response = await authorizedFetch("/clients", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return parseJson<Client>(response);
}

export async function fetchCampaign(campaignId: string, token: string) {
  const response = await authorizedFetch(`/campaigns/${campaignId}`, token);
  return parseJson<Campaign>(response);
}

export async function createCampaign(payload: CreateCampaignPayload, token: string) {
  const response = await authorizedFetch("/campaigns", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return parseJson<Campaign>(response);
}

export async function fetchCampaignIdeas(campaignId: string, token: string) {
  const response = await authorizedFetch(`/campaigns/${campaignId}/ideas`, token);
  return parseJson<CampaignIdea[]>(response);
}

export async function askCampaignChat(
  campaignId: string,
  token: string,
  messages: CampaignChatMessage[],
) {
  const response = await authorizedFetch(`/campaigns/${campaignId}/chat`, token, {
    method: "POST",
    body: JSON.stringify({ messages }),
  });

  return parseJson<{ reply?: string; message?: string; content?: string }>(response);
}

export async function fetchCampaignLeads(campaignId: string, token: string) {
  const response = await authorizedFetch(`/campaigns/${campaignId}/leads`, token);
  return parseJson<CampaignLead[]>(response);
}
