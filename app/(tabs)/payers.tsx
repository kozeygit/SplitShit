import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    TouchableNativeFeedback,
    SafeAreaView,
    ScrollView,
    Image,
} from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";

import { Bill, BillItem, Payer, DiscountItem } from "../models/bill";
import { ThemedView } from "@/components/ThemedView";
import BillCard from "@/components/bill/billCard";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import PayerCard from "@/components/bill/payerCard";

const PayerPage = () => {
    const dummyPayers: Payer[] = [
        {
            id: "0",
            name: "Kozell",
            amountToPay: 0,
            partySize: 3,
        },
        {
            id: "1",
            name: "Louanne",
            amountToPay: 0,
            partySize: 2,
        },
        {
            id: "2",
            name: "Nathaniel",
            amountToPay: 0,
            partySize: 4,
        },
    ];

    const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

    const toggleDropdown = (id: string) => {
        setExpandedBillId(expandedBillId === id ? null : id);
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                paddingHorizontal: 10,
                paddingTop: 50,
                backgroundColor: Colors.pastel.indigo,
            }}
        >
            {/* Payer Cards */}
            <FlatList
                numColumns={2}
                style={{ padding: 10}}
                contentContainerStyle={{borderWidth: 2 , alignItems: "stretch", gap: 10}}
                data={dummyPayers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <PayerCard payerData={item} />}
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
        fontSize: 20,
        marginLeft: 10,
    },
});

export default PayerPage;
