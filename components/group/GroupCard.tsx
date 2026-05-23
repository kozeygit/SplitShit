import { ThemedText } from "@/components/ThemedText";
import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

import { Bill, Group, Payer } from "@/models/bill";
import PayerIcon from "../payer/PayerIcon";
import Touchable from "../ui/Touchable";

interface GroupCardProps {
  groupData: Group;
  isSelected: boolean;
  onPress: (id: number) => void;
  onSelect: (id: number) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  groupData,
  isSelected,
  onPress,
  onSelect,
}) => {
  const concatenate = groupData.payers.length > 4 ? true : false;

  const handlePress = () => onPress(groupData.id);
  const handleToggleSelect = () => onSelect(groupData.id);

  return (
    <Touchable
      style={styles.groupCard}
      onPress={handlePress}
      onLongPress={handleToggleSelect}
    >
      <View style={styles.groupInfo}>
        <ThemedText type="defaultSemiBold" style={styles.groupName}>
          {groupData.name.length < 20
            ? groupData.name
            : groupData.name.substring(0, 18).trim() + "..."}
        </ThemedText>
      </View>
      <View style={styles.payerList}>
        {groupData.payers.slice(0, concatenate ? 3 : 4).map((payer) => (
          <View key={payer.id} style={styles.payerIconWrapper}>
            <PayerIcon size={30} payer={payer} />
          </View>
        ))}
        {concatenate && (
          <View style={styles.payerIconWrapper}>
            <View style={styles.moreIconStyle}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 10 }}>
                {"+"}
                {groupData.payers.length - 3}
              </ThemedText>
            </View>
          </View>
        )}
      </View>
      {isSelected && <View style={styles.selected} />}
    </Touchable>
  );
};

const styles = StyleSheet.create({
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
  groupInfo: {
    flex: 1,
  },
  payerIconWrapper: {
    alignItems: "center",
    width: 25,
  },
  moreIconStyle: {
    borderWidth: 1,
    borderRadius: "100%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",

    width: 30,
    height: 30,
    backgroundColor: "white",
  },
  payerList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  groupCard: {
    flex: 1,
    flexDirection: "row",
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 200,
    margin: 10,
    overflow: "hidden",
    elevation: 5,
  },
  groupName: {
    marginLeft: 15,
    fontSize: 16,
  },
});

export default GroupCard;
