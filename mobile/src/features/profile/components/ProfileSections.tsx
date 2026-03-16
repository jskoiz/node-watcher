import React from 'react';
import { Image, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { UserPhoto } from '../../../api/types';
import { Button, Card, Chip } from '../../../design/primitives';
import { profileStyles as styles } from './profile.styles';

export function TagPill({
  color = '#7C6AF7',
  interactive = true,
  label,
  onPress,
  selected,
}: {
  color?: string;
  interactive?: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Chip
      onPress={onPress}
      label={label}
      active={selected}
      accentColor={color}
      interactive={interactive}
      style={styles.tagPill as any}
      textStyle={styles.tagPillText as any}
    />
  );
}

export function EditableField({
  editMode,
  label,
  multiline = false,
  onChangeText,
  placeholder,
  value,
}: {
  editMode: boolean;
  label: string;
  multiline?: boolean;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {editMode ? (
        <TextInput
          style={[styles.fieldInput, multiline ? styles.fieldInputMultiline : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(240,246,252,0.35)"
          autoCapitalize="none"
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: value ? '#F0F6FC' : 'rgba(240,246,252,0.35)' }]}>
          {value || placeholder}
        </Text>
      )}
    </View>
  );
}

export function PhotoManager({
  canEdit,
  isBusy,
  onDelete,
  onMakePrimary,
  onMoveLeft,
  onMoveRight,
  onUpload,
  photos,
}: {
  canEdit: boolean;
  isBusy: boolean;
  onDelete: (photoId: string) => void;
  onMakePrimary: (photoId: string) => void;
  onMoveLeft: (photoId: string) => void;
  onMoveRight: (photoId: string) => void;
  onUpload: () => void;
  photos: UserPhoto[];
}) {
  const visiblePhotos = photos.filter((photo) => !photo.isHidden);

  return (
    <View style={styles.photoManager}>
      <View style={styles.photoGrid}>
        {visiblePhotos.map((photo, index) => (
          <Card key={photo.id} style={styles.photoCard}>
            <Image source={{ uri: photo.storageKey }} style={styles.photoImage} />
            <View style={styles.photoMeta}>
              <Text style={styles.photoLabel}>{photo.isPrimary ? 'Primary photo' : `Photo ${index + 1}`}</Text>
              {canEdit ? (
                <View style={styles.photoActions}>
                  <Pressable disabled={isBusy || index === 0} onPress={() => onMoveLeft(photo.id)} style={styles.photoActionChip}>
                    <Text style={styles.photoActionText}>Left</Text>
                  </Pressable>
                  <Pressable disabled={isBusy || index === visiblePhotos.length - 1} onPress={() => onMoveRight(photo.id)} style={styles.photoActionChip}>
                    <Text style={styles.photoActionText}>Right</Text>
                  </Pressable>
                  {!photo.isPrimary ? (
                    <Pressable disabled={isBusy} onPress={() => onMakePrimary(photo.id)} style={styles.photoActionChip}>
                      <Text style={styles.photoActionText}>Primary</Text>
                    </Pressable>
                  ) : null}
                  <Pressable disabled={isBusy} onPress={() => onDelete(photo.id)} style={[styles.photoActionChip, styles.photoDeleteChip]}>
                    <Text style={styles.photoDeleteText}>Remove</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </Card>
        ))}
      </View>
      {canEdit ? (
        <Button label={isBusy ? 'Working…' : 'Upload photo'} onPress={onUpload} disabled={isBusy} variant="secondary" />
      ) : null}
    </View>
  );
}
