import { useQuery } from "@tanstack/react-query"
import { getStudentProfile } from "../services/ProfileServices"
import { StudentProfileResponse } from "../../../types/profile"

export const useProfile = (options?: any) => {
    return useQuery<StudentProfileResponse>({
        queryKey: ["profile"],
        queryFn: getStudentProfile,
        ...options
    })
}