// In your useGetData hook:
import { fetchBills, fetchBillItems, fetchPayers, fetchBasicBills } from "@/utils/fetchData"; // Import the functions
import { useCallback } from "react";

export const useGetData = () => {

    const getBasicBills = useCallback(async () => {
        return await fetchBasicBills();
    }, []);

    const getBills = useCallback(async () => {
        return await fetchBills();
    }, []);

    const getBillItems = useCallback(async (billId?: number) => {
        return await fetchBillItems(billId);
    }, []);

    const getPayers = useCallback(async (billId?: number) => {
        return await fetchPayers(billId);
    }, []);

    return { getBills, getBillItems, getPayers, getBasicBills};
};