// In your useGetData hook:
import { fetchBill, fetchBillItems, fetchPayers, fetchBills, fetchBillItem } from "@/utils/fetchData"; // Import the functions
import { useCallback } from "react";

export const useGetData = () => {

    const getBills = useCallback(async () => {
        return await fetchBills();
    }, [fetchBills]);

    const getBill = useCallback(async (billId: number) => {
        return await fetchBill(billId);
    }, [fetchBill]);

    const getBillItems = useCallback(async (billId: number) => {
        return await fetchBillItems(billId);
    }, [fetchBillItems]);
    
    const getBillItem = useCallback(async (itemId: number) => {
        return await fetchBillItem(itemId);
    }, [fetchBillItems]);

    const getPayers = useCallback(async (billId?: number) => {
        return await fetchPayers(billId);
    }, [fetchPayers]);

    return { getBills, getBillItems, getPayers, getBill, getBillItem};
};