import api from "../lib/axios";
import { 
    RequestDashboardResponse, 
    CreateUnifiedRequestInput,
    CreateRequestType,
    GetRequestsResponse
} from "../types/requests";

// Unified Dashboard
export const getRequestDashboard = async (): Promise<RequestDashboardResponse> => {
    const res = await api.get<RequestDashboardResponse>('/requests/dashboard');
    return res.data;
};

// Unified Create (Multipart)
export const createUnifiedRequest = async (data: CreateUnifiedRequestInput): Promise<any> => {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('priority', data.priority);
    formData.append('title', data.title);
    formData.append('reason', data.reason);
    
    if (data.sessionId) formData.append('sessionId', data.sessionId);

    if (data.attachments) {
        data.attachments.forEach((file) => {
            formData.append('attachments', file);
        });
    }

    const res = await api.post('/requests', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return res.data;
};

// Legacy Compatibility
export const createRequest = async (data: CreateRequestType | any): Promise<any> => {
    // If it's the old session-requests logic, we still send it as JSON
    const res = await api.post('/requests', data);
    return res.data;
};

export const getMyRequests = async (): Promise<GetRequestsResponse> => {
    const res = await api.get<GetRequestsResponse>('/requests/my-requests');
    return res.data;
};
