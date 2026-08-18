import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { BrandStory } from '@/types/home';
import { FixedColors, Spacing, Typography } from '@constants/theme';
import { useLocale } from '@stores/locale-store';

interface BrandStoryBlockProps {
  story: BrandStory;
  style?: StyleProp<ViewStyle>;
}

/**
 * `About MCM` 처럼 제목 한 줄과 본문 한 덩이로 이루어진 브랜드 소개 글.
 * 제목과 본문 크기는 글마다 달라서 `story.titleToken` / `story.bodyToken` 이 정합니다.
 */
export function BrandStoryBlock({ story, style }: BrandStoryBlockProps) {
  const locale = useLocale();

  return (
    <View style={[styles.story, style]}>
      <Text style={[styles.title, Typography[story.titleToken]]}>{story.title}</Text>
      <Text style={[styles.body, Typography[story.bodyToken]]} numberOfLines={story.maxLines}>
        {story.body[locale]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  story: {
    gap: Spacing.one,
  },
  // 크기는 `story.titleToken` 이 덮어씁니다. 여기서는 색만 정합니다.
  title: {
    color: FixedColors.onDark,
  },
  // 크기는 `story.bodyToken` 이 덮어씁니다. 여기서는 색만 정합니다.
  body: {
    color: FixedColors.onDark,
  },
});
