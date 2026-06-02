import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  FlatList,
  View,
  RefreshControl,
  Alert,
  AlertButton,
} from "react-native";
import { Colors } from "@/constants/Colors";
import Logo from "@/components/ui/Logo";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchAllGroups, fetchAllGroupsWithPayers } from "@/utils/fetchData";
import { Group } from "@/models/bill";
import GroupCard from "@/components/group/GroupCard";
import ActionFAB from "@/components/ui/ActionFAB";
import { removeGroup } from "@/utils/removeData";
import { deleteGroupImage, saveGroupImage } from "@/utils/fileSystem";
import { updateGroupImagePath } from "@/utils/updateData";
import { setProfileImage } from "@/utils/imageUtils";
import { useImagePicker } from "@/hooks/useImagePicker";

const GroupPage = () => {
  const router = useRouter();

  const [refreshing, setRefreshing] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const { launchCamera, launchGallery } = useImagePicker({ aspect: [1, 1] });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedGroups = await fetchAllGroupsWithPayers();
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

  const handleManageProfileImage = async (group: Group) => {
    const triggerUpdate = (launchFn: () => Promise<string | null>) =>
      setProfileImage({
        launchFn,
        currentImagePath: group.imagePath,
        saveImageFn: (uri) => saveGroupImage(uri, group.id),
        deleteImageFn: deleteGroupImage,
        updateDbFn: (path) => updateGroupImagePath(group.id, path),
        onRefresh,
      });

    const alertButtons: AlertButton[] = [
      { text: "Take Photo", onPress: () => triggerUpdate(launchCamera) },
      {
        text: "Choose from Gallery",
        onPress: () => triggerUpdate(launchGallery),
      },
    ];

    if (group.imagePath) {
      alertButtons.push({
        text: "Delete Current Photo",
        style: "destructive",
        onPress: async () => {
          deleteGroupImage(group.imagePath!);
          await updateGroupImagePath(group.id, undefined);
          onRefresh();
        },
      });
    }

    alertButtons.push({ text: "Cancel", style: "cancel" });

    Alert.alert(
      group.imagePath ? "Manage Profile Photo" : "Add Profile Photo",
      "Select an option below",
      alertButtons,
    );
  };

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
