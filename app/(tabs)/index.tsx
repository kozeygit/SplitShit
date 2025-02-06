import { ThemedText } from "@/components/ThemedText";
import React, { useCallback, useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableNativeFeedback,
    SafeAreaView,
    Image,
    RefreshControl,
} from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";

import { Bill } from "../models/bill";
import { ThemedView } from "@/components/ThemedView";
import BillCard from "@/components/bill/billCard";
import { useTestDb } from "../utils/dbToModel";

const BillPage = () => {
    const { getBills, insertDummyData } = useTestDb();
    const [refreshing, setRefreshing] = useState(false); // State for refreshing

    const handleButtonPress = async () => {
        console.log("OPS");
        try {
            await getBills();
        } catch (error) {
            console.log(error);
        }
        try {
            await insertDummyData();
        } catch (error) {
            console.log(error);
        }
        try {
            await getBills();
        } catch (error) {
            console.log(error);
        }
    };

    const [bills, setBills] = useState<Bill[]>([]); // State for bills

    const fetchBills = useCallback(async () => {
        setRefreshing(true);
        try {
            const fetchedBills = await getBills();
            setBills(fetchedBills); // Correct: Functional update
        } catch (error) {
            console.error("Error fetching bills:", error);
        } finally {
            setRefreshing(false);
        }
    }, [getBills]);

    useEffect(() => {
        fetchBills();
    }, [fetchBills]);

    const [expandedBillId, setExpandedBillId] = useState<number | null>(null);

    const toggleDropdown = (id: number) => {
        setExpandedBillId(expandedBillId === id ? null : id);
    };

    const onRefresh = useCallback(() => {
        fetchBills();
    }, [fetchBills]);

    console.log("BillPage rendered");

    return (
        <SafeAreaView
            style={{
                flex: 1,
                paddingHorizontal: 10,
                backgroundColor: Colors.pastel.red,
            }}
        >
            {/* Title */}
            <View>
                <Image
                    source={require("@/assets/images/logo.png")}
                    resizeMode="contain"
                    style={styles.logo}
                />
            </View>
            {/* Bill Cards */}
            <FlatList
                style={{ padding: 10 }}
                data={bills}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
                renderItem={({ item }) => (
                    <BillCard
                        billData={item}
                        isExpanded={expandedBillId === item.id}
                        onToggleDropdown={toggleDropdown}
                    />
                )}
            />

            {/* Add Bill Button */}
            <ThemedView style={styles.addBillButtonOuter}>
                <TouchableNativeFeedback onPress={handleButtonPress}>
                    <ThemedView style={styles.addBillButtonInner}>
                        <ThemedText
                            type="defaultSemiBold"
                            style={styles.addBillText}
                        >
                            New Bill
                        </ThemedText>
                        <IconSymbol
                            size={24}
                            name="plus.app.fill"
                            color={Colors.dark.background}
                            style={styles.addBillIcon}
                        />
                    </ThemedView>
                </TouchableNativeFeedback>
            </ThemedView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    logo: {
        marginTop: 60,
        marginBottom: 30,
        width: "100%",
        resizeMode: "contain",
        height: 120,
    },

    titleText: {
        marginTop: 100,
        marginBottom: 70,
        textAlign: "center",
    },

    addBillButtonOuter: {
        position: "absolute",
        bottom: 20,
        right: 20,
        borderWidth: 2,
        borderRadius: 50,
        elevation: 5,
        overflow: "hidden",
    },
    addBillButtonInner: {
        flexDirection: "row",
        gap: 10,
        borderRadius: 50,
        padding: 10,
        justifyContent: "space-evenly",
        alignItems: "center",
    },

    addBillIcon: {
        backgroundColor: Colors.pastel.blue,
        borderRadius: 50,
        borderWidth: 2,
        padding: 8,
    },
    addBillText: {
        fontSize: 20,
        marginLeft: 10,
    },
});

export default BillPage;
