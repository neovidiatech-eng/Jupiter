import { useQuery } from "@tanstack/react-query";
import { getConversations } from "../services/chatServices";

export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => getConversations(),
  });
};
