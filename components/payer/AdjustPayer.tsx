import {
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import PayerIcon from "@/components/payer/PayerIcon";
import { ThemedText } from "@/components/ThemedText";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Payer } from "@/models/bill";

type Props = {
  payer: Payer;
  party: number,
  onValueChange: (newSize: number) => void
}

const AdjustPayer = ({payer, party, onValueChange}: Props) => {
  const isInBill = party > 0;

  const handleTogglePayer = () => {
    onValueChange(isInBill ? 0 : 1);
  };

  const partyIncrease = () => {
    console.log("Party Increase");
    onValueChange(party + 1)
  };

  const partyDecrease = () => {
    console.log("Party Decrease");
    if (party === 0) return;
    onValueChange(party - 1)
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
          <ThemedText>{party.toString()}</ThemedText>
          <TouchableOpacity onPress={partyIncrease} style={{ padding: 5 }}>
            <Ionicons name="add" size={20} />
          </TouchableOpacity>
        </View>
      ) : (
        <Pressable onPress={handleTogglePayer} style={styles.addButton}>
          <ThemedText>Add</ThemedText>
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
