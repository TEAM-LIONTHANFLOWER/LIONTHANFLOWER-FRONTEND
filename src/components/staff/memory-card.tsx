import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { FixedColors, FontFamily, Spacing, Typography } from '@constants/theme';
import arrowNext from '@assets/images/staff/arrow-next-dark.svg';
import arrowPrevious from '@assets/images/staff/arrow-prev-dark.svg';
import type { MemoryCardContent } from '@/types/visit';

/** 시안의 카드 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const CARD_MIN_HEIGHT = 441;
const CARD_PADDING_X = 34;
const CARD_PADDING_TOP = 47;
const TITLE_TO_BODY = 10;
const FOOTER_HEIGHT = 46;
const FOOTER_PADDING_RIGHT = 20;
const PREVIOUS_BUTTON_WIDTH = 62;

const NEXT_LABEL_FONT_SIZE = 16;
const NEXT_LABEL_LINE_HEIGHT = 24;
const ARROW_HEIGHT = 10;
const NEXT_ARROW_WIDTH = 51;
const PREVIOUS_ARROW_WIDTH = 28;

interface MemoryCardProps {
  content: MemoryCardContent;
  /** 이전 면으로 넘깁니다. 넘길 면이 없으면 비워 둡니다. */
  onPrevious?: () => void;
  /** 다음 면으로 넘깁니다. 마지막 면이면 비워 두고, 그러면 버튼이 흐려집니다. */
  onNext?: () => void;
}

/**
 * 크림색 기록 카드.
 *
 * 여러 면을 넘겨 볼 때만 아래에 화살표 줄이 붙습니다. 한 면짜리 화면은 둘 다 비워
 * 두는데, 시안의 카드(2-1 arc 조회)도 본문만 담고 화살표는 담지 않습니다.
 *
 * 화살표 그림은 오른쪽을 가리키는 한 벌뿐이라, 이전 버튼은 좌우로 뒤집어 씁니다.
 */
export function MemoryCard({ content, onPrevious, onNext }: MemoryCardProps) {
  const hasPager = onPrevious !== undefined || onNext !== undefined;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        <Text style={styles.title}>{content.title}</Text>
        {content.lines.map((line, index) => (
          // 서버에서 오는 줄 목록이라 내용이 겹칠 수 있습니다. 순서가 바뀌지 않는 목록이라
          // 자리를 키로 씁니다.
          <Text key={index} style={styles.line}>
            {line}
          </Text>
        ))}
      </View>

      {!hasPager ? null : (
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이전"
            accessibilityState={{ disabled: onPrevious === undefined }}
            disabled={onPrevious === undefined}
            onPress={onPrevious}
            style={[styles.previousButton, onPrevious === undefined && styles.buttonDisabled]}
          >
            <Image
              source={arrowPrevious}
              style={styles.previousArrow}
              contentFit="contain"
              accessible={false}
            />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="다음"
            accessibilityState={{ disabled: onNext === undefined }}
            disabled={onNext === undefined}
            onPress={onNext}
            style={[styles.nextButton, onNext === undefined && styles.buttonDisabled]}
          >
            <Text style={styles.nextLabel}>Next</Text>
            <Image
              source={arrowNext}
              style={styles.nextArrow}
              contentFit="contain"
              accessible={false}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // 본문이 짧아도 화살표가 늘 카드 맨 아래에 오도록 최소 높이를 잡고 위아래로 벌립니다.
  // 화살표 줄이 없으면 본문만 위에 남고 아래가 비어, 시안의 카드와 같아집니다.
  card: {
    minHeight: CARD_MIN_HEIGHT,
    justifyContent: 'space-between',
    paddingTop: CARD_PADDING_TOP,
    backgroundColor: FixedColors.cardSurface,
  },
  // 화살표는 카드 끝까지 나가야 해서 좌우 여백을 본문만 가집니다.
  body: {
    paddingHorizontal: CARD_PADDING_X,
  },
  title: {
    ...Typography.titleEn20,
    color: FixedColors.cardAccent,
    marginBottom: TITLE_TO_BODY,
  },
  line: {
    ...Typography.bodyKo13,
    color: FixedColors.onLight,
  },
  footer: {
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: FOOTER_PADDING_RIGHT,
  },
  previousButton: {
    width: PREVIOUS_BUTTON_WIDTH,
    height: FOOTER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previousArrow: {
    width: PREVIOUS_ARROW_WIDTH,
    height: ARROW_HEIGHT,
    transform: [{ scaleX: -1 }],
  },
  nextButton: {
    height: FOOTER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  nextLabel: {
    fontFamily: FontFamily.label,
    fontSize: NEXT_LABEL_FONT_SIZE,
    lineHeight: NEXT_LABEL_LINE_HEIGHT,
    color: FixedColors.onLight,
  },
  nextArrow: {
    width: NEXT_ARROW_WIDTH,
    height: ARROW_HEIGHT,
  },
});
