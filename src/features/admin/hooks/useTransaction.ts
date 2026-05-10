import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllWithdrawals, getTransactions, updateWithdrawalStatus } from "../services/TransactionServices"

export const useTransactions = () => {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: getTransactions,
    })
}

export const useWithdrawals = () => {
    return useQuery({
        queryKey: ["withdrawals"],
        queryFn: getAllWithdrawals,
    })
}

export const useUpdateWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, adminNotes }: { id: string, status: 'approve' | 'reject', adminNotes?: string }) => 
            updateWithdrawalStatus(id, status, adminNotes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
        },
    });
}