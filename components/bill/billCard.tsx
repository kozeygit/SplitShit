import { ThemedText } from "@/components/ThemedText";
import React from "react";
import {
  View,
  StyleSheet,
  TouchableNativeFeedback,
  FlatList,
} from "react-native";
import { Colors } from "@/constants/Colors";
import { Bill } from "@/models/bill"; // Import your Bill type
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Price } from "@/utils/priceUtils";

const colorKeys = Object.values(Colors.pastel);

interface BillCardProps {
  billData: Bill;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleDropdown: (id: number) => void;
  onEdit: (id: number) => void;
  onComplete: (id: number) => void;
  onSelect: (id: number) => void;
}

const BillCard: React.FC<BillCardProps> = ({
  billData,
  isExpanded,
  isSelected,
  onToggleDropdown,
  onEdit,
  onComplete,
  onSelect: onToggleSelect,
}) => {
  const iconColor = colorKeys[billData.id % colorKeys.length];

  const styles = billData.complete ? completeStyles : incompleteStyles;
  const icons = [
    "payments",
    "receipt-long",
    "paid",
    "request-quote",
    "currency-pound",
  ];
  const icon = icons[Number(billData.id) % icons.length];

  const animatedStyles = useAnimatedStyle(() => {
    return {
      height: withTiming(isExpanded ? 45 : 0, { duration: 100 }),
      opacity: withTiming(isExpanded ? 1 : 0, { duration: 100 }),
      transform: [
        { translateY: withTiming(isExpanded ? 0 : -45, { duration: 100 }) },
      ],
    };
  });

  const handleToggleDropdown = () => {
    onToggleDropdown(billData.id);
  };

  const handleToggleSelect = () => {
    onToggleSelect(billData.id);
  };

  return (
    <View style={styles.billCardOuter}>
      <TouchableNativeFeedback
        onLongPress={handleToggleSelect}
        onPress={handleToggleDropdown}
      >
        <View style={styles.billCardInner}>
          {isSelected ? <View style={[styles.billIcon, { backgroundColor: "white" }]}>
            <MaterialIcons size={20} name="check" />
          </View> :
          <View style={[styles.billIcon, { backgroundColor: iconColor }]}>
            <MaterialIcons size={20} name={icon as any} />
          </View>}
          <View style={styles.billDetails}>
            <ThemedText type="defaultSemiBold" style={styles.billName}>
              {billData.name}
            </ThemedText>
            <ThemedText type="default" style={styles.billDate}>
              {billData.date.toLocaleDateString()}
            </ThemedText>
          </View>
          <View style={styles.billMeta}>
            <ThemedText type="subtitle" style={styles.billTotal}>
              {`£${billData.userEnteredTotal.toDisplay()}`}
            </ThemedText>
          </View>
          <MaterialIcons
            size={30}
            name={isExpanded ? "arrow-drop-up" : "arrow-drop-down"}
            color="lightgrey"
            style={styles.dropdownIcon}
          />
          {isSelected && (
            <View style={styles.selected}>
            </View>
          )}
        </View>
      </TouchableNativeFeedback>

      <Animated.View
        style={[
          {
            overflow: "hidden",
            flexDirection: "row",
            borderTopWidth: isExpanded ? 2 : 0,
            zIndex: -1,
          },
          animatedStyles,
        ]}
      >
        {isExpanded && (
          <>
            <TouchableNativeFeedback onPress={() => onEdit(billData.id)}>
              <View style={styles.dropdownOptionEdit}>
                <ThemedText type="default">Edit</ThemedText>
              </View>
            </TouchableNativeFeedback>
            <TouchableNativeFeedback onPress={() => onComplete(billData.id)}>
              <View style={styles.dropdownOptionComplete}>
                <ThemedText type="default">Complete</ThemedText>
              </View>
            </TouchableNativeFeedback>
          </>
        )}
      </Animated.View>
    </View>
  );
};

const completeStyles = StyleSheet.create({
selected: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  billCardOuter: {
    backgroundColor: "white",
    borderWidth: 2,
    margin: 10,
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
    borderWidth: 1,
    padding: 10,
    borderRadius: "100%",
    aspectRatio: 1,
    marginRight: 10,
    zIndex: 100,
  },
  billDetails: {
    flex: 1,
  },
  billName: {
    textDecorationLine: "line-through",
    fontSize: 16,
    marginBottom: 5,
  },
  billDate: {
    fontSize: 14,
    color: "grey",
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
    justifyContent: "center",
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
  selected: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 0,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  billCardOuter: {
    backgroundColor: "white",
    borderWidth: 2,
    margin: 10,
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
    borderWidth: 1,
    padding: 10,
    borderRadius: "100%",
    aspectRatio: 1,
    marginRight: 10,
    zIndex: 100,
  },
  billDetails: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    marginBottom: 5,
  },
  billDate: {
    fontSize: 14,
    color: "grey",
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
    justifyContent: "center",
    backgroundColor: Colors.pastel.blue,
    borderRightWidth: 1,
  },
  dropdownOptionComplete: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.pastel.green,
    borderLeftWidth: 1,
  },
  dropdownIcon: {
    paddingLeft: 10,
  },
});

export default BillCard;
