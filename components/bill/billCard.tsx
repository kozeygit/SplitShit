import { ThemedText } from "@/components/ThemedText";
import React from "react";
import { View, StyleSheet } from "react-native";
import Touchable from "@/components/ui/Touchable";
import { Colors } from "@/constants/Colors";
import { Bill } from "@/models/bill";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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
  const isComplete = billData.complete;

  const icons = [
    "payments",
    "receipt-long",
    "paid",
    "request-quote",
    "currency-pound",
  ];
  const icon = icons[Number(billData.id) % icons.length];

  const dropdownHeight = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    dropdownHeight.value = withTiming(isExpanded ? 45 : 0, { duration: 100 });
    return {
      height: dropdownHeight.value,
      borderTopWidth: dropdownHeight.value > 0 ? 2 : 0,
    };
  });

  const handleToggleDropdown = () => onToggleDropdown(billData.id);
  const handleToggleSelect = () => onToggleSelect(billData.id);

  return (
    <View style={styles.billCardOuter}>
      <Touchable
        onLongPress={handleToggleSelect}
        onPress={handleToggleDropdown}
        style={styles.billCardInner}
      >
        {isSelected ? (
          <View style={[styles.billIcon, { backgroundColor: "white" }]}>
            <MaterialIcons size={20} name="check" />
          </View>
        ) : (
          <View style={[styles.billIcon, { backgroundColor: iconColor }]}>
            <MaterialIcons size={20} name={icon as any} />
          </View>
        )}
        <View style={styles.billDetails}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.billName, isComplete && styles.billNameComplete]}
          >
            {billData.name}
          </ThemedText>
          <ThemedText type="default" style={styles.billDate}>
            {billData.date.toLocaleDateString()}
          </ThemedText>
        </View>
        <View style={styles.billMeta}>
          <ThemedText
            type="subtitle"
            style={[styles.billTotal, isComplete && styles.billTotalComplete]}
          >
            {`£${billData.userEnteredTotal.toDisplay()}`}
          </ThemedText>
        </View>
        <MaterialIcons
          size={30}
          name={isExpanded ? "arrow-drop-up" : "arrow-drop-down"}
          color="lightgrey"
          style={styles.dropdownIcon}
        />
        {isSelected && <View style={styles.selected} />}
      </Touchable>

      {/* Always rendered so the close animation can play fully */}
      <Animated.View style={[styles.dropdown, animatedStyles]}>
        <Touchable
          style={styles.dropdownOptionEdit}
          onPress={() => onEdit(billData.id)}
        >
          <ThemedText type="default">Edit</ThemedText>
        </Touchable>
        {!isComplete && (
          <Touchable
            style={styles.dropdownOptionComplete}
            onPress={() => onComplete(billData.id)}
          >
            <ThemedText type="default">Complete</ThemedText>
          </Touchable>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  billCardOuter: {
    margin: 10,
    borderWidth: 2,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 5,
    backgroundColor: "white",
  },
  billCardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    zIndex: 1,
  },
  selected: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.3)",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    paddingHorizontal: 20,
    zIndex: 10,
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
  billNameComplete: {
    textDecorationLine: "line-through",
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
  billTotalComplete: {
    color: "green",
  },
  dropdownIcon: {
    paddingLeft: 10,
  },
  dropdown: {
    overflow: "hidden",
    flexDirection: "row",
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
});

export default BillCard;
