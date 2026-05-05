import { useQuery } from "@tanstack/react-query"
import { getMyRequests } from "../services/RequestServices"

export const useMyRequests = () => {
    return useQuery({
        queryKey: ['my-requests'],
        queryFn: getMyRequests
    })
}