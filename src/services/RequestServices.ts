import api from "../lib/axios"
import { CreateRequestType, GetRequestsResponse } from "../types/requests"

export const getMyRequests = async ( ):Promise<GetRequestsResponse>=> {
   const response = await api.get<GetRequestsResponse>('/session-requests/my-requests')
   return response.data;
}

export const createRequest = async (reqeustData:CreateRequestType):Promise<GetRequestsResponse>=> {
   const response = await api.post<GetRequestsResponse>('/session-requests',reqeustData)
   return response.data;
}
