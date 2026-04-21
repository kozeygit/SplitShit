import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Payer } from "@/models/bill";
import { Colors } from "@/constants/Colors";

type Props = {
  payer: Payer;
  party: number,
}

const AdjustPayer = ({payer, party}: Props) => {
  const [isInBill, setIsInBill] = useState(party > 0);
  const [partySize, setPartySize] = useState(party);

  useEffect(() => {
    payer.partySize = partySize;
    if (partySize > 0) {
      setIsInBill(true);
    } else {
      setIsInBill(false);
    }
  }, [partySize]);


  const handleTogglePayer = () => {
    if (isInBill) {
      setPartySize(0);
    } else {
      setPartySize(1);
    }
  };

  const partyIncrease = () => {
    console.log("Party Increase");
    setPartySize(partySize + 1);
  };

  const partyDecrease = () => {
    console.log("Party Decrease");
    if (partySize === 0) return;
    setPartySize(partySize - 1);
  };

  return (
    <View style={styles.payerRow}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Pressable onPress={handleTogglePayer}>
          <PayerIcon payer={payer} checked={isInBill} />
        </Pressable>
        <ThemedText>{payer.name}</ThemedText>
      </View>
      {isInBill ? (
        <View style={styles.adjustParty}>
          <TouchableOpacity onPress={partyDecrease} style={{ padding: 5}}>
            <Ionicons name="remove" size={20}/>
          </TouchableOpacity>
          <ThemedText>{partySize.toString()}</ThemedText>
          <TouchableOpacity onPress={partyIncrease} style={{ padding: 5 }}>
            <Ionicons name="add" size={20} />
          </TouchableOpacity>
        </View>
      ) : (
        <Pressable onPress={handleTogglePayer} style={styles.addButton}>
          <ThemedText>{isInBill ? "Remove" : "Add"}</ThemedText>
        </Pressable>
      )}
    </View>
  );
};

export default AdjustPayer;

const styles = StyleSheet.create({
  payerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    paddingRight: 10,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 50,
    backgroundColor: "white",
    width: 100,
    alignItems: "center",
    padding: 5,
  },
  adjustParty: {
    width: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 50,
  },
});
