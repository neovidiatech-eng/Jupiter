export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  provider: string;
  googleId: string | null;
  createdAt: string;
  code_country: string;
  status: string;
  gender: string | null;
  age: number | null;
}

export interface ProfilePlanCurrency {
  id: string;
  name_en: string;
  symbol: string;
}

export interface ProfilePlan {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: number;
  features: string[];
  sessionsCount: number;
  rescheduleCount: number;
  currency: ProfilePlanCurrency;
}

export interface ProfileData {
  id: string;
  user_id: string;
  birth_date: string;
  active: boolean;
  planId: string;
  country: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sessions: number;
  sessions_attended: number;
  sessions_remaining: number;
  avgRating: number;
  totalReviews: number;
  rankId: string | null;
  user: ProfileUser;
  schedules: any[];
  plan: ProfilePlan;
}

export interface StudentProfileResponse {
  message: string;
  status: number;
  data: ProfileData;
}

export interface UpdateProfile {
  name?: string;
  email?: string;
  age?: string;
}
