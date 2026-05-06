export interface DashboardUser {
    name: string;
    email: string;
    phone: string;
    gender: string | null;
    age: number;
}

export interface DashboardPlanCurrency {
    symbol: string;
}

export interface DashboardPlan {
    id: string;
    name: string;
    sessionsCount: number;
    rescheduleCount: number;
    price: string;
    currency: DashboardPlanCurrency;
}

export interface DashboardMetadata {
    id: string;
    birth_date: string;
    country: string;
    sessions: number;
    sessions_attended: number;
    sessions_remaining: number;
    avgRating: number;
    totalReviews: number;
    rank: any | null;
    user: DashboardUser;
    plan: DashboardPlan;
    joindate: string;
}

export interface DashboardTeacherUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    image: string | null;
}

export interface DashboardTeacher {
    id: string;
    user: DashboardTeacherUser;
}

export interface DashboardSubject {
    id: string;
    name: string;
}

export interface DashboardNextSchedule {
    id: string;
    title: string;
    description: string;
    notes: string;
    link: string;
    status: string;
    createdAt: string;
    platform: string;
    type: string;
    end_time: string;
    start_time: string;
    is_recurring: boolean;
    rescheduledFromId: string | null;
    rescheduledToId: string | null;
    teacher: DashboardTeacher;
    subject: DashboardSubject;
}

export interface StudentDashboardData {
    metadata: DashboardMetadata;
    nextSchedule: DashboardNextSchedule | null;
}

export interface StudentDashboardResponse {
    message: string;
    status: number;
    lang: string;
    data: StudentDashboardData;
}
