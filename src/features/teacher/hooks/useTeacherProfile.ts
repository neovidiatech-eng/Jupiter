import { useQuery } from "@tanstack/react-query";
import { getTeacherProfile } from "../services/TeacherProfileServices";

export const useTeacherProfile = () => {
  return useQuery({
    queryKey: ["teacher-profile"],
    queryFn: getTeacherProfile,
  });
};
