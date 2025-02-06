import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { View, StyleSheet, TouchableNativeFeedback } from "react-native";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { ThemedView } from "@/components/ThemedView";
import { Bill } from "@/app/models/bill"; // Import your Bill type
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

const colorKeys = Object.values(Colors.pastel);

interface BillCardProps {
    billData: Bill;
    isExpanded: boolean;
    onToggleDropdown: (id: number) => void;
}

const BillCard: React.FC<BillCardProps> = ({ billData, isExpanded, onToggleDropdown }) => {
    const iconColor = colorKeys[Number(billData.id) % colorKeys.length];
    const styles = billData.complete ? completeStyles : incompleteStyles;

    const animatedStyles = useAnimatedStyle(() => {
        return {
            height: withTiming(isExpanded ? 45 : 0, { duration: 100 }),
            opacity: withTiming(isExpanded ? 1 : 0, { duration: 100 }),
            transform: [{ translateY: withTiming(isExpanded ? 0 : -45, { duration: 101 }) }],
        };
    });

    return (
        <ThemedView style={styles.billCardOuter}>
            <TouchableNativeFeedback onPress={() => onToggleDropdown(billData.id)}>
                <ThemedView style={styles.billCardInner}>
                    <IconSymbol size={35} name="note" color={iconColor} style={styles.billIcon} />
                    <View style={styles.billDetails}>
                        <ThemedText type="defaultSemiBold" style={styles.billName}>
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
                        name={isExpanded ? "chevron.compact.up" : "chevron.compact.down"}
                        color="lightgrey"
                        style={styles.dropdownIcon}
                    />
                </ThemedView>
            </TouchableNativeFeedback>

            <Animated.View
                style={[
                    {
                        overflow: "hidden",
                        flexDirection: "row",
                        borderTopWidth: isExpanded ? 2 : 0,
                        zIndex: -1
                    },
                    animatedStyles,
                ]}
            >
                {isExpanded && (
                    <>
                        <TouchableNativeFeedback onPress={() => console.log(`Edit ${billData.name}`)}>
                            <View style={styles.dropdownOptionEdit}>
                                <ThemedText type="default">Edit</ThemedText>
                            </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback onPress={() => console.log(`Complete ${billData.name}`)}>
                            <View style={styles.dropdownOptionComplete}>
                                <ThemedText type="default">Complete</ThemedText>
                            </View>
                        </TouchableNativeFeedback>
                    </>
                )}
            </Animated.View>
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
        color: "green",
    },
    dropdownOptionEdit: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 10,
        backgroundColor: Colors.pastel.blue,
    },
    dropdownOptionComplete: {
        display: "none", // Or style as needed for "complete" state
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