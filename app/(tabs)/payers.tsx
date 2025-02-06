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

import { Bill, BillItem, Payer, DiscountItem } from "../../models/bill";
import { ThemedView } from "@/components/ThemedView";
import PayerCard from "@/components/bill/payerCard";
import { useGetData } from "@/hooks/useGetData";


const PayerPage = () => {
    const { getPayers } = useGetData();

    const [refreshing, setRefreshing] = useState(false); // State for refreshing

    const [payers, setPayers] = useState<Payer[]>([]); // State for payers

    const fetchPayers = useCallback(async () => {
        setRefreshing(true);
        try {
            const fetchedPayers = await getPayers();
            setPayers(fetchedPayers); // Correct: Functional update
        } catch (error) {
            console.error("Error fetching payers:", error);
        } finally {
            setRefreshing(false);
        }
    }, [getPayers]);

    useEffect(() => {
        fetchPayers();
    }, [fetchPayers]);


    const onRefresh = useCallback(() => {
        fetchPayers();
    }, [fetchPayers]);


    return (
        <SafeAreaView
            style={{
                flex: 1,
                paddingHorizontal: 10,
                backgroundColor: Colors.pastel.indigo,
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
            {/* Payer Cards */}
            <FlatList
                style={{ padding: 10 }}
                numColumns={2}
                data={payers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <PayerCard payerData={item} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            />

            {/* Add Payer Button */}
            <ThemedView style={styles.addBillButtonOuter}>
                <TouchableNativeFeedback
                    onPress={() => {
                        console.log("Add Bill button pressed");
                    }}
                >
                    <ThemedView style={styles.addBillButtonInner}>
                        <ThemedText
                            type="defaultSemiBold"
                            style={styles.addBillText}
                        >
                            New Payer
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
        backgroundColor: Colors.pastel.yellow,
        borderRadius: 50,
        borderWidth: 2,
        padding: 8,
    },
    addBillText: {
        marginLeft: 10,
    },
});

export default PayerPage;
