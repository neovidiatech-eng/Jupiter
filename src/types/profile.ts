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

export interface TeacherCurrency {
  id: string;
  name_en: string;
  name_ar: string;
  symbol: string;
  code: string;
  default: boolean;
  createdAt: string;
  updatedAt: string;
  exchangeRate: number;
}

export interface TeacherWallet {
  id: string;
  type: string;
  ownerId: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
  currencyId: string;
  userId: string;
  transactions: any[];
  currency: TeacherCurrency;
}

export interface TeacherProfileInfo {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  hourPrice: number;
  status: string;
  active: boolean;
  wallet: TeacherWallet[];
}

export interface TeacherStats {
  totalStudents: number;
  totalSessions: number;
}

export interface TeacherSchedule {
  title: string;
  description: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  link: string;
  notes: string;
  subject: {
    color: string;
  };
  student: {
    name: string;
    email: string;
    country: string;
    status: string;
    sessions: {
      total: number;
      attended: number;
      remaining: number;
    };
  };
}

export interface TeacherStudent {
  id: string;
  user_id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  subject: {
    code: string;
  };
  sessions: string;
}

export interface TeacherProfileData {
  teacher: TeacherProfileInfo;
  stats: TeacherStats;
  schedules: TeacherSchedule[];
  students: TeacherStudent[];
}

export interface TeacherProfileResponse {
  message: string;
  status: number;
  lang: string;
  data: TeacherProfileData;
}
