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

const colorKeys = Object.values(Colors.pastel);

interface BillCardProps {
  billData: Bill;
  isExpanded: boolean;
  isDeleteExpanded: boolean;
  onToggleDropdown: (id: number) => void;
  onEdit: (id: number) => void;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

const BillCard: React.FC<BillCardProps> = ({
  billData,
  isExpanded,
  isDeleteExpanded,
  onToggleDropdown,
  onEdit,
  onComplete,
  onDelete: onToggleDelete,
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

  const animatedDeleteStyles = useAnimatedStyle(() => {
    return {
      right: withTiming(isDeleteExpanded ? 0 : -100, { duration: 100 }),
      opacity: withTiming(isDeleteExpanded ? 1 : 0, { duration: 100 }),
    };
  });
  const handleToggleDropdown = () => {
    if (isDeleteExpanded) {
      onToggleDelete(billData.id);
      return;
    }
    onToggleDropdown(billData.id);
  };

  const handleToggleDelete = () => {
    if (isExpanded) {
      onToggleDropdown(billData.id);
    }
    onToggleDelete(billData.id);
  };

  return (
    <View style={styles.billCardOuter}>
      <TouchableNativeFeedback
        onLongPress={handleToggleDelete}
        onPress={handleToggleDropdown}
      >
        <View style={styles.billCardInner}>
          <View style={[styles.billIcon, { backgroundColor: iconColor }]}>
            <MaterialIcons size={20} name={icon as any} />
          </View>
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
              {`£${billData.userEnteredTotal.toFixed(2)}`}
            </ThemedText>
          </View>
          <MaterialIcons
            size={30}
            name={isExpanded ? "arrow-drop-up" : "arrow-drop-down"}
            color="lightgrey"
            style={styles.dropdownIcon}
          />
          <Animated.View
            style={
              animatedDeleteStyles
            }
          >
            {isDeleteExpanded && (
              <View style={styles.delete}>
                <ThemedText>Delete</ThemedText>
              </View>
            )}
          </Animated.View>
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
  delete: {
    backgroundColor: "red",
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
  delete: {
    position: "absolute",
    backgroundColor: "red",
    height: "200%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    borderLeftWidth: 2,
    right: 0,
    elevation: 5,
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
