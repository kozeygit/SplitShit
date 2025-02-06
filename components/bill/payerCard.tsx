import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { View, StyleSheet, TouchableNativeFeedback } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "@/components/ThemedView";
import { Bill, Payer } from "@/models/bill";

const colorKeys = Object.values(Colors.pastel);

const PayerCard = ({ payerData }: { payerData: Payer }) => {
    const iconColor = colorKeys[Number(payerData.id) % colorKeys.length];

    return (
        <ThemedView style={styles.payerCard}>
            <IconSymbol
                size={35}
                name="person.2"
                color={iconColor}
            />
            <ThemedText type="defaultSemiBold" style={styles.payerName}>
                {payerData.name}    
            </ThemedText>
        </ThemedView>
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

        borderWidth: 2,
        borderRadius: 20,
        margin: 10,

        elevation: 5,
    },
    payerName: {
        fontSize: 14,
    },
});

export default PayerCard;
