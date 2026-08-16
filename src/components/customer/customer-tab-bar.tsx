import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

import { FixedColors, FontFamily, Radius } from '@constants/theme';
import type { CustomerTabItem, CustomerTabKey } from '@/types/home';

/** 탭 바가 화면 아래에서 차지하는 높이. 화면이 스크롤 끝에 이만큼 여백을 둬야 합니다. */
export const TAB_BAR_HEIGHT = 118;

/** 시안의 탭 바 치수. */
const BAR_WIDTH = 259;
const BAR_HEIGHT = 71;
const BAR_TOP = 16;
const BAR_PADDING_X = 14;
const ITEM_WIDTH = 70;
const ITEM_HEIGHT = 50;
const ITEM_GAP = 10;
const ICON_SIZE = 24;
const LABEL_FONT_SIZE = 13;
const LABEL_LETTER_SPACING = -0.325;
/** 아이콘과 라벨이 거의 붙어 있습니다. */
const ICON_TO_LABEL = 1;

/** 유리 면이 뒤를 얼마나 흐리는지. 시안의 은은한 정도에 맞췄습니다. */
const BLUR_INTENSITY = 24;

/** 위는 투명하고 아래로 갈수록 짙어지는 갈색 스크림. */
const TOP = { x: 0.5, y: 0 } as const;
const BOTTOM = { x: 0.5, y: 1 } as const;

interface CustomerTabBarProps {
  items: readonly CustomerTabItem[];
  activeKey: CustomerTabKey;
}

/**
 * 고객 화면 아래에 떠 있는 유리 탭 바.
 *
 * 화면 맨 아래에 붙어 안전 영역까지 덮어야 해서 `ScreenContainer` 바깥에 둡니다.
 * 대신 유리 막대 자체는 홈 인디케이터를 피하도록 아래 안전 영역만큼 띄웁니다.
 */
export function CustomerTabBar({ items, activeKey }: CustomerTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[FixedColors.tabBarScrimStart, FixedColors.tabBarScrimEnd]}
      start={TOP}
      end={BOTTOM}
      style={[styles.scrim, { paddingBottom: insets.bottom }]}
    >
      <BlurView
        intensity={BLUR_INTENSITY}
        tint="light"
        accessibilityRole="tablist"
        style={styles.bar}
      >
        {items.map((item) => (
          <TabBarItem key={item.key} item={item} isActive={item.key === activeKey} />
        ))}
      </BlurView>
    </LinearGradient>
  );
}

function TabBarItem({ item, isActive }: { item: CustomerTabItem; isActive: boolean }) {
  // 아직 화면이 없는 탭은 눌러도 갈 곳이 없습니다. 세 칸 중 두 칸을 흐리게 두면
  // 탭 바 전체가 고장 난 것처럼 보여서, 모양은 그대로 두고 눌리지만 않게 합니다.
  const button = (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: isActive, disabled: item.href === undefined }}
      disabled={isActive || item.href === undefined}
      style={[styles.item, isActive && styles.itemSelected]}
    >
      <Image source={item.icon} style={styles.icon} contentFit="contain" accessible={false} />
      <Text style={styles.label}>{item.label}</Text>
    </Pressable>
  );

  if (isActive || item.href === undefined) {
    return button;
  }

  return (
    <Link href={item.href} replace asChild>
      {button}
    </Link>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_BAR_HEIGHT,
  },
  bar: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    alignSelf: 'center',
    marginTop: BAR_TOP,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ITEM_GAP,
    paddingHorizontal: BAR_PADDING_X,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  item: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  itemSelected: {
    backgroundColor: FixedColors.glassSelected,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  label: {
    fontFamily: FontFamily.sans,
    fontSize: LABEL_FONT_SIZE,
    lineHeight: LABEL_FONT_SIZE,
    letterSpacing: LABEL_LETTER_SPACING,
    color: FixedColors.onDark,
    marginTop: ICON_TO_LABEL,
  },
});
