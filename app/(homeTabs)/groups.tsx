import React, { useCallback, useState } from "react";
import { StyleSheet, FlatList, View, RefreshControl } from "react-native";
import { Colors } from "@/constants/Colors";
import Logo from "@/components/ui/Logo";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchAllGroups } from "@/utils/fetchData";
import { Group } from "@/models/bill";
import GroupCard from "@/components/group/GroupCard";
import ActionFAB from "@/components/ui/ActionFAB";
import { removeGroup } from "@/utils/removeData";

const GroupPage = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedGroups = await fetchAllGroups(true);
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

  const handleSelect = (id: number) => {
    if (selectedGroupIds.length === 0) {
      return;
    }
    if (selectedGroupIds.includes(id)) {
      setSelectedGroupIds(selectedGroupIds.filter((value) => value !== id));
      return;
    }
    setSelectedGroupIds([...selectedGroupIds, id]);
  };

  const handleLongSelect = (id: number) => {
    if (selectedGroupIds.includes(id)) {
      setSelectedGroupIds(selectedGroupIds.filter((value) => value !== id));
      return;
    }
    setSelectedGroupIds([...selectedGroupIds, id]);
  };

  const handleDelete = async (groupIds: number[]) => {
    for (const groupId of groupIds) {
      await removeGroup(groupId);
      console.log("Deleting bill:", groupId);
    }
    onRefresh();
    setSelectedGroupIds([]);
  };
  return (
    <View style={styles.container}>
      <Logo />
      <FlatList
        numColumns={1}
        data={groups.filter((group) => !group.isArchived)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <GroupCard
            groupData={item}
            onPress={handleSelect}
            isSelected={selectedGroupIds.includes(item.id)}
            onSelect={handleLongSelect}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <ActionFAB
        activeColor={Colors.pastel.green}
        count={selectedGroupIds.length}
        onAdd={() => router.push("/(newModals)/newGroup")}
        onCancel={() => setSelectedGroupIds([])}
        actions={[
          {
            icon: "delete",
            color: "red",
            iconColor: "white",
            onPress: () => handleDelete(selectedGroupIds),
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
