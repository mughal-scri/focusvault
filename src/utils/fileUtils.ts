import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

export const saveFilePermanently = async (
  uri: string,
  fileName: string
): Promise<string> => {
  try {
    const cleanName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const docDir = (FileSystem as any).documentDirectory ?? (FileSystem as any).cacheDirectory;
    const destUri = `${docDir}focusvault_${cleanName}`;
    const existing = await FileSystem.getInfoAsync(destUri);
    if (!existing.exists) {
      await FileSystem.copyAsync({ from: uri, to: destUri });
    }
    return destUri;
  } catch {
    return uri;
  }
};

export const openFile = async (uri: string) => {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      Alert.alert(
        'File Not Found',
        'This file no longer exists on your device. Please remove it and add it again.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Convert to content URI for Android sharing
    let shareUri = uri;
    if (Platform.OS === 'android' && uri.startsWith('file://')) {
      shareUri = await (FileSystem as any).getContentUriAsync(uri);
    }

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      Alert.alert('Not Supported', 'File sharing is not available on this device.');
      return;
    }

    await Sharing.shareAsync(shareUri, {
      dialogTitle: 'Open file with...',
      mimeType: getMimeType(uri),
      UTI: getUTI(uri),
    });
  } catch (error: any) {
    Alert.alert('Error', `Could not open file: ${error?.message || 'Unknown error'}`);
  }
};

const getMimeType = (uri: string): string => {
  const ext = uri.split('.').pop()?.toLowerCase().split('?')[0];
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    txt: 'text/plain',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  return mimeMap[ext || ''] || '*/*';
};

const getUTI = (uri: string): string => {
  const ext = uri.split('.').pop()?.toLowerCase().split('?')[0];
  const utiMap: Record<string, string> = {
    pdf: 'com.adobe.pdf',
    docx: 'org.openxmlformats.wordprocessingml.document',
    xlsx: 'org.openxmlformats.spreadsheetml.sheet',
    pptx: 'org.openxmlformats.presentationml.presentation',
    txt: 'public.plain-text',
    jpg: 'public.jpeg',
    jpeg: 'public.jpeg',
    png: 'public.png',
  };
  return utiMap[ext || ''] || 'public.item';
};