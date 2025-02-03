import { ThemedText } from "@/components/ThemedText";
import React, { useState } from "react";
import { View, StyleSheet, TouchableNativeFeedback } from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemedView } from "@/components/ThemedView";
import { Bill } from "@/app/models/bill";
import Animated, {
    BounceIn,
    FadeIn,
    FadeOut,
    FlipInXDown,
    SlideInUp,
    SlideOutDown,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

const colorKeys = Object.values(Colors.pastel);

const BillCard = ({
    billData,
    isExpanded,
    onToggleDropdown,
}: {
    billData: Bill;
    isExpanded: boolean;
    onToggleDropdown: (id: string) => void;
}) => {
    const iconColor = colorKeys[Number(billData.id) % colorKeys.length];
    const styles = billData.complete ? completeStyles : incompleteStyles;

    return (
        <ThemedView style={styles.billCardOuter}>
            <TouchableNativeFeedback onPress={() => onToggleDropdown(billData.id)}>
                <ThemedView style={styles.billCardInner}>
                    <IconSymbol
                        size={35}
                        name="note"
                        color={iconColor}
                        style={styles.billIcon}
                    />
                    <View style={styles.billDetails}>
                        <ThemedText
                            type="defaultSemiBold"
                            style={styles.billName}
                        >
                            {billData.name}
                        </ThemedText>
                        <ThemedText type="default" style={styles.billSubtext}>
                            {billData.date.toDateString()}
                        </ThemedText>
                    </View>
                    <View style={styles.billMeta}>
                        <ThemedText type="subtitle" style={styles.billTotal}>
                            {`£${billData.userEnteredTotal.toFixed(2)}`}
                        </ThemedText>
                    </View>
                    <IconSymbol
                        size={30}
                        name={
                            isExpanded
                                ? "chevron.compact.up"
                                : "chevron.compact.down"
                        }
                        color="lightgrey"
                        style={styles.dropdownIcon}
                    />
                </ThemedView> 
            </TouchableNativeFeedback>

            {/* Dropdown Menu */}
            {isExpanded && (
                <Animated.View
                    entering={FlipInXDown}
                    exiting={SlideOutDown}
                    style={{
                        zIndex: -1,
                        flexDirection: "row",
                        borderTopWidth: 2,
                    }}
                >
                    <TouchableNativeFeedback
                        onPress={() => console.log(`Edit ${billData.name}`)}
                    >
                        <View style={styles.dropdownOptionEdit}>
                            <ThemedText type="default">Edit</ThemedText>
                        </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                        onPress={() => console.log(`Complete ${billData.name}`)}
                    >
                        <View style={styles.dropdownOptionComplete}>
                            <ThemedText type="default">Complete</ThemedText>
                        </View>
                    </TouchableNativeFeedback>
                </Animated.View>
            )}
        </ThemedView>
    );
};

const completeStyles = StyleSheet.create({
    billCardOuter: {
        borderWidth: 2,
        marginVertical: 10,
        borderRadius: 20,
        overflow: "hidden",
        elevation: 5,
    },
    billCardInner: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
    },
    billIcon: {
        marginRight: 15,
    },
    billDetails: {
        flex: 1,
    },
    billName: {
        textDecorationLine: "line-through",
        fontSize: 16,
        marginBottom: 5,
    },
    billSubtext: {
        fontSize: 14,
    },
    billMeta: {
        alignItems: "flex-end",
    },
    billTotal: {
        fontSize: 18,
        color: "green"
    },
    dropdownMenu: {
        zIndex: -1,
        flexDirection: "row",
        borderTopWidth: 2,
    },
    dropdownOptionEdit: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: Colors.pastel.blue,
    },
    dropdownOptionComplete: {
        display: "none",
    },
    dropdownIcon: {
        paddingLeft: 10,
    },
});

const incompleteStyles = StyleSheet.create({
    billCardOuter: {
        borderWidth: 2,
        marginVertical: 10,
        borderRadius: 20,
        overflow: "hidden",
        elevation: 5,
    },
    billCardInner: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
    },
    billIcon: {
        marginRight: 15,
    },
    billDetails: {
        flex: 1,
    },
    billName: {
        fontSize: 16,
        marginBottom: 5,
    },
    billSubtext: {
        fontSize: 14,
    },
    billMeta: {
        alignItems: "flex-end",
    },
    billTotal: {
        fontSize: 18,
    },
    dropdownMenu: {
        zIndex: -1,
        flexDirection: "row",
        borderTopWidth: 2,
    },
    dropdownOptionEdit: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: Colors.pastel.blue,
        borderRightWidth: 1,
    },
    dropdownOptionComplete: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: Colors.pastel.green,
        borderLeftWidth: 1,
    },
    dropdownIcon: {
        paddingLeft: 10,
    },
});

export default BillCard;
