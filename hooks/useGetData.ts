// In your useGetData hook:
import { fetchBill, fetchBillItems, fetchPayers, fetchBills } from "@/utils/fetchData"; // Import the functions
import { useCallback } from "react";

export const useGetData = () => {

    const getBills = useCallback(async () => {
        return await fetchBills();
    }, []);

    const getBill = useCallback(async (billId: number) => {
        return await fetchBill(billId);
    }, []);

    const getBillItems = useCallback(async (billId?: number) => {
        return await fetchBillItems(billId);
    }, []);

    const getPayers = useCallback(async (billId?: number) => {
        return await fetchPayers(billId);
    }, []);

    return { getBills, getBillItems, getPayers, getBill};
};