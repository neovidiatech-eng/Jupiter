import api from "../lib/axios"
import { GetRequestsResponse } from "../types/requests"

export const getMyRequests = async ( ):Promise<GetRequestsResponse>=> {
   const response = await api.get<GetRequestsResponse>('/session-requests/my-requests')
   return response.data;
}

