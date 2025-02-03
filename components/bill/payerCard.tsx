import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { View, StyleSheet, TouchableNativeFeedback } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "@/components/ThemedView";
import { Bill, Payer } from "@/app/models/bill";

const colorKeys = Object.values(Colors.pastel);

const PayerCard = ({ payerData }: { payerData: Payer }) => {
    const iconColor = colorKeys[Number(payerData.id) % colorKeys.length];

    return (
        <ThemedView style={styles.payerCard}>
            <IconSymbol
                size={35}
                name="person"
                color={iconColor}
            />
            <ThemedText type="defaultSemiBold" style={styles.billName}>
                {payerData.name}    
            </ThemedText>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    payerCard: {
        flex: 1,
        borderWidth: 2,
        borderRadius: 20,
        overflow: "hidden",
        elevation: 5,
        alignItems: "center",
        padding: 20,
        margin: 10
    },
    billName: {
        fontSize: 16,
    },
});

export default PayerCard;
