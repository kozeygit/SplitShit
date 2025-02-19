import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { Bill } from "@/models/bill";

interface props {
  billData: Bill;
  isOpen: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const EditBillDetailsModal = ({
  billData,
  isOpen,
  onSave,
  onCancel,
}: props) => {

  return (
    <Modal onRequestClose={onCancel} visible={isOpen} transparent={true}>
      <Pressable style={styles.modalBG} onPress={onCancel} >
        <View style={styles.container}>
          <Text>{billData.name}</Text>
          <Text>{billData.userEnteredTotal}</Text>
          <Text>{billData.date.toLocaleDateString()}</Text>
          <Text>{billData.serviceCharge}</Text>
        </View>
      </Pressable>
    </Modal>
  );
};

export default EditBillDetailsModal;

const styles = StyleSheet.create({
  modalBG: {
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",

  },

  container: {
    flex: 1,
    marginHorizontal: 30,
    marginVertical: 200,
    padding: 30,

    borderWidth: 2,
    borderRadius: 20,

    elevation: 5,
    
    backgroundColor: "white",
  },
  containerPressed: {
    transform: [{scale: 0.9}]
  }
});
