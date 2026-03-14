import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export const openFile = async (uri: string) => {
  try {
    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      Alert.alert('File Not Found', 'This file no longer exists on your device.');
      return;
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Open with...',
        UTI: 'public.item',
      });
    } else {
      Alert.alert('Cannot Open', 'No app available to open this file.');
    }
  } catch (error) {
    Alert.alert('Error', 'Could not open this file. Please try again.');
  }
};

export const saveFilePermanently = async (uri: string, fileName: string): Promise<string> => {
  try {
    const destUri = `${FileSystem.documentDirectory}${fileName}`;
    const fileInfo = await FileSystem.getInfoAsync(destUri);
    if (!fileInfo.exists) {
      await FileSystem.copyAsync({ from: uri, to: destUri });
    }
    return destUri;
  } catch (error) {
    // Return original URI if copy fails
    return uri;
  }
};