import React, { useCallback, useState } from "react";
import { StyleSheet, FlatList, View, RefreshControl } from "react-native";
import { Colors } from "@/constants/Colors";
import Logo from "@/components/ui/logo";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchAllGroups } from "@/utils/fetchData";
import { Group } from "@/models/bill";
import GroupCard from "@/components/group/GroupCard";
import ActionFAB from "@/components/ui/ActionFAB";

const GroupPage = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedGroups = await fetchAllGroups();
      setGroups(fetchedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh]),
  );

  return (
    <View style={styles.container}>
      <Logo />
      <FlatList
        numColumns={2}
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <GroupCard groupData={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <ActionFAB
        activeColor={Colors.pastel.green}
        count={selectedGroupIds.length}
        onAdd={() => router.push("/(modals)/newGroup")}
        onCancel={() => setSelectedGroupIds([])}
        actions={[
          {
            icon: "delete",
            color: "red",
            iconColor: "white",
            onPress: () => console.log("Delete groups:", selectedGroupIds),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: Colors.pastel.green,
  },
});

export default GroupPage;
