import React, { useCallback, useState } from "react";
import { StyleSheet, FlatList, View, RefreshControl } from "react-native";
import { Colors } from "@/constants/Colors";
import Logo from "@/components/ui/logo";
import { useFocusEffect } from "expo-router";
import { fetchAllGroups } from "@/utils/fetchData"; // Assuming you have this
import { Group } from "@/models/bill";
import GroupCard from "@/components/group/GroupCard"; // You'll need to create this

const GroupPage = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]); // Use your Group type here

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

  useFocusEffect(useCallback(() => { onRefresh(); }, [onRefresh]));

  return (
    <View style={styles.container}>
      <Logo />
      <FlatList
        numColumns={2}
        data={groups}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <GroupCard groupData={item} />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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