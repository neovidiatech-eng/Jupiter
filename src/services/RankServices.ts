import api from "../lib/axios";
import { RankResponse } from "../types/rank";

export const getAllRanks = async (): Promise<RankResponse> => {
    const response = await api.get<RankResponse>("/ranks");
    return response.data;
}
