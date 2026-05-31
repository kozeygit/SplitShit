import React, { useState, useCallback, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import { Colors } from "@/constants/Colors";
import { ThemedText } from "@/components/ThemedText";
import { useRouter, useFocusEffect } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { insertGroup } from "@/utils/insertData";
import { Group, NewGroup, Payer } from "@/models/bill";
import { fetchGroup, fetchAllPayers } from "@/utils/fetchData";
import SelectPayer from "@/components/payer/SelectPayer";
import { SafeAreaView } from "react-native-safe-area-context";
import { FormButtonRow } from "@/components/ui/FormButtonRow";
import { updateGroupPayers } from "@/utils/updateData";

// Validation Schema
const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
});

export default function NewGroupPage() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<NewGroup>({
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(groupSchema),
  });

  const flatListRef = useRef<FlatList>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [selectedPayerIds, setSelectedPayerIds] = useState<number[]>([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedPayers = await fetchAllPayers();
      setPayers(fetchedPayers);
    } catch (error) {
      console.error("Error fetching payers:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh]),
  );

  const onSubmit = async (data: NewGroup) => {
    try {
      if (selectedPayerIds.length === 0) {
        Alert.alert(
          "A group without anyone seems pretty lonely.",
          "Add at least one payer to the group. More than one would be ideal, or there's no point really.",
        );
        return;
      }

      const newGroupId = await insertGroup(data);
      if (newGroupId < 0) {
        console.error("Failed to insert group");
        return;
      }
      const group = await fetchGroup(newGroupId);
      if (!group) return;

      group.payers = payers.filter((payer) =>
        selectedPayerIds.includes(payer.id),
      );
      await updateGroupPayers(group);
      router.back();
    } catch (error) {
      console.error("Database error:", error);
    }
  };

  const handleTogglePayer = (payerId: number) => {
    if (!payers) return;
    setSelectedPayerIds((prevIds) =>
      prevIds.includes(payerId)
        ? prevIds.filter((id) => id !== payerId)
        : [...prevIds, payerId],
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.pastel.green, // Theme color for Groups
        paddingHorizontal: 20,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Add New Group
          </ThemedText>

          <Text style={styles.label}>Group Name</Text>
          <View
            style={[styles.input, errors.name ? styles.inputError : undefined]}
          >
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={{ flexDirection: "row", height: "100%" }}>
                  <TextInput
                    style={{ flex: 1 }}
                    placeholder="e.g. Spain Trip"
                    placeholderTextColor={Colors.light.placeholderText}
                    keyboardType="default"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <MaterialIcons
                    name="group"
                    size={20}
                    color={errors.name ? "red" : "black"}
                    style={{ alignSelf: "center" }}
                  />
                </View>
              )}
            />
          </View>
          {errors.name && (
            <Text style={styles.errorText}>{errors.name.message}</Text>
          )}
        </View>

        <View style={styles.listContainer}>
          <ThemedText type="subtitle" style={styles.title}>
            Add Members
          </ThemedText>
          <FlatList
            ref={flatListRef}
            /* fadingEdgeLength={50} // TODO: temporarily commented out until fadingEdgeLength rendering issue is resolved */
            style={{ flex: 1 }}
            contentContainerStyle={{ gap: 10, paddingVertical: 10 }}
            numColumns={1}
            data={payers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <SelectPayer
                onToggle={() => {
                  handleTogglePayer(item.id);
                }}
                payer={item}
                selected={selectedPayerIds.includes(item.id)}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
        <FormButtonRow
          onSubmit={handleSubmit(onSubmit)}
          onCancel={() => router.back()}
          submitLabel="Submit"
          cancelLabel="Cancel"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
    marginTop: 10,
    paddingHorizontal: 30,
    paddingVertical: 30,
  },

  container: {
    padding: 30,
    paddingVertical: 40,
    backgroundColor: "white",
    borderWidth: 2,
    borderRadius: 20,
    elevation: 5,
  },
  title: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    paddingTop: 20,
    paddingBottom: 5,
  },
  input: {
    height: 50,
    borderBottomWidth: 1,
    borderColor: "lightgrey",
    paddingHorizontal: 10,
    backgroundColor: "white",
    justifyContent: "center",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
});
function updateGroupPayer(newGroupId: number, selectedPayerIds: number[]) {
  throw new Error("Function not implemented.");
}
