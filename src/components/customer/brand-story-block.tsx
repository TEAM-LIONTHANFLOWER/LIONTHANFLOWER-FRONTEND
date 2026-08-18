import { StyleSheet, Text, View } from 'react-native';

import { FixedColors, Spacing, Typography } from '@constants/theme';
import type { BrandStory } from '@/types/home';

interface BrandStoryBlockProps {
  story: BrandStory;
}

/**
 * `About MCM` 처럼 제목 한 줄과 본문 한 덩이로 이루어진 브랜드 소개 글.
 * 본문 크기는 글마다 달라서 `story.bodyToken` 이 정합니다.
 */
export function BrandStoryBlock({ story }: BrandStoryBlockProps) {
  return (
    <View style={styles.story}>
      <Text style={styles.title}>{story.title}</Text>
      <Text style={[styles.body, Typography[story.bodyToken]]} numberOfLines={story.maxLines}>
        {story.body}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  story: {
    gap: Spacing.one,
  },
  title: {
    ...Typography.titleEn20,
    color: FixedColors.onDark,
  },
  // 크기는 `story.bodyToken` 이 덮어씁니다. 여기서는 색만 정합니다.
  body: {
    color: FixedColors.onDark,
  },
});
