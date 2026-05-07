import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createRequest, getMyRequests } from "../services/RequestServices"
import ErrorService from "../utils/ErrorService"

export const useMyRequests = () => {
    return useQuery({
        queryKey: ['my-requests'],
        queryFn: getMyRequests
    })
}

export const useCreateRequest = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
            ErrorService.success("Request created successfully");
        },
        onError: () => {
            ErrorService.error("Request creation failed");
        }
    });

}