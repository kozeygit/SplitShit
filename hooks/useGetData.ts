// In your useGetData hook:
import { fetchAllGroups, fetchBill, fetchBillItems, fetchPayers, fetchAllBills, fetchBillItem, fetchGroup } from "@/utils/fetchData"; // Import the functions
import { useCallback } from "react";

export const useGetData = () => {

    const getAllBills = useCallback(async () => {
        return await fetchAllBills();
    }, [fetchAllBills]);

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


    const getGroup = useCallback(async (groupId: number) => {
        return await fetchGroup(groupId);
    }, [fetchGroup]);

    const getAllGroups = useCallback(async () => {
        return await fetchAllGroups();
    }, [fetchAllGroups]);


    return { getBills: getAllBills, getBillItems, getPayers, getBill, getBillItem, getGroup, getAllGroups};
};