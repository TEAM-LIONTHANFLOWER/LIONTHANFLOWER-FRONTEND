import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { Spacing } from '@constants/theme';
import type { MyselfPhoto } from '@/types/home';

/** 시안의 사진 한 장 크기. */
const PHOTO_WIDTH = 266;
const PHOTO_HEIGHT = 333;

interface MyselfGalleryProps {
  photos: readonly MyselfPhoto[];
  style?: StyleProp<ViewStyle>;
}

/**
 * 옆으로 넘겨 보는 화보 갤러리.
 *
 * 시안에서 사진 줄이 화면 오른쪽 끝을 넘어 이어집니다. 그래서 화면 좌우 여백 바깥에 놓고,
 * 대신 좌우 여백을 이 컴포넌트가 스크롤 콘텐츠에 직접 넣습니다.
 * 여백 안에 갇히면 세로 스크롤 영역에서 오른쪽이 잘려 마지막 사진이 끊겨 보입니다.
 */
export function MyselfGallery({ photos, style }: MyselfGalleryProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={styles.content}
    >
      {photos.map((photo) => (
        <View key={photo.id} style={styles.photo}>
          <Image
            source={photo.image}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityLabel={photo.description}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  photo: {
    width: PHOTO_WIDTH,
    height: PHOTO_HEIGHT,
    overflow: 'hidden',
  },
});
