import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { Text, View, StyleSheet, TouchableNativeFeedback } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Bill, Payer } from "@/models/bill";

const colorKeys = Object.values(Colors.pastel);

const PayerCard = ({ payerData }: { payerData: Payer }) => {
    const iconColor = colorKeys[Number(payerData.id) % colorKeys.length];

    return (
        <View style={styles.payerCard}>
            <View style={[styles.iconStyle, { backgroundColor: iconColor }]}>
                <ThemedText type="defaultSemiBold">
                    {payerData.name.substring(0, 2)}
                </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.payerName}>
                {payerData.name.length < 10 ? payerData.name : payerData.name.substring(0,8).trim() + "..."}
            </ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    payerCard: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",

        maxHeight: 100,
        aspectRatio: 1,
        overflow: "hidden",

        backgroundColor: "white",
        borderWidth: 2,
        borderRadius: 20,
        margin: 10,

        elevation: 5,
    },
    payerName: {
        paddingTop: 5,
        fontSize: 14,
    },
    iconStyle: {
        borderWidth: 1,
        borderRadius: "100%",
        padding: 10,
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default PayerCard;
