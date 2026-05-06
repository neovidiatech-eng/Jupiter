import { Role } from "./roles";
import { Schedule } from "./scheduales";

export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'canceled';
export type RequestType = 'new_session' | 'reschedule' | 'cancel';
export type RequesterRole = 'student' | 'teacher';

export interface NewSessionRequestedData {
    subject: string;
    preferred_time: string;
}

export interface RescheduleRequestedData {
    new_start_time: string;
}

export type RequestedData = NewSessionRequestedData | RescheduleRequestedData | null;

export interface RequesterInfo {
    name: string;
    email: string;
    role: Role;
}

export interface UserRequest {
    id: string;
    sessionId: string | null;
    requesterId: string;
    requesterRole: RequesterRole;
    type: RequestType;
    status: RequestStatus;
    reason: string;
    requestedData: RequestedData;
    adminId: string | null;
    adminNotes: string | null;
    attachments: any | null;
    createdAt: string;
    updatedAt: string;
    requester: RequesterInfo;
    schedule: Schedule | null;
}

export interface GetRequestsResponse {
    message: string;
    status: number;
    lang: string;
    data: {
        student_requests: UserRequest[];
        teachers_requests: UserRequest[];
    };
}

export interface CreateRequestType {
    sessionId?: string;
    type: RequestType;
    reason: string;
    requestedData: {
        new_start_time?: string;
        new_end_time?: string;
        suggested_notes?: string;
        subject?: string;
        preferred_time?: string;
    };
}
