import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { ActionPill } from '@components/common/action-pill';
import { PopupOverlay } from '@components/common/popup-overlay';
import { INITIAL_SETUP_ITEMS } from '@constants/arc';
import { FixedColors, Typography } from '@constants/theme';
import { useLocale } from '@stores/locale-store';
import paperclip from '@assets/images/arc/paperclip.svg';
import settingsIcon from '@assets/images/common/settings.svg';

/** 시안(기본설정)의 쪽지 치수. Spacing 스케일에 없는 값이라 이름을 붙여 둡니다. */
const CARD_WIDTH = 307;
const CARD_PADDING_X = 44;
const CARD_PADDING_Y = 42;
const ITEM_GAP = 19.5;
const LABEL_TO_VALUE = 3;

/**
 * 쪽지 오른쪽 아래에 걸린 집게.
 * 쪽지 밖으로 걸쳐 나와야 해서 쪽지의 형제로 두고 자리를 직접 잡습니다.
 */
const CLIP_WIDTH = 58;
const CLIP_HEIGHT = 77.5;
const CLIP_LEFT = 230;
const CLIP_TOP = 161;
/** 집게가 쪽지 아래로 넘어간 만큼. 이만큼 아래를 비워 두어야 잘리지 않습니다. */
const CLIP_OVERHANG = 44;

const LABEL = 'Initial setup';

/** 아이콘만 놓을 때의 크기. 시안(2-1 Arc)의 톱니 아이콘과 같은 값입니다. */
const ICON_SIZE = 29;
/** 아이콘이 29 라 최소 터치 영역 44 를 채우려면 사방으로 8 씩 더 필요합니다. */
const ICON_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;

interface InitialSetupButtonProps {
  /**
   * 라벨 없이 톱니 아이콘만 놓습니다.
   * 카드 한 장이 화면을 채우는 Arc 화면은 머리말 줄에 글자를 더 얹지 않습니다.
   */
  iconOnly?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * 머리말 줄 오른쪽의 `Initial setup`. 누르면 방문 전에 고른 응대 방식과 언어가
 * 쪽지 한 장으로 열립니다.
 *
 * 고객 Arc 화면과 직원 고객 상세 화면이 같은 동작을 해서 버튼과 팝업을 함께 들고 있습니다.
 */
export function InitialSetupButton({ iconOnly = false, style }: InitialSetupButtonProps) {
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {iconOnly ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={LABEL}
          accessibilityState={{ expanded: isOpen }}
          hitSlop={ICON_HIT_SLOP}
          onPress={() => setIsOpen(true)}
          style={style}
        >
          <Image
            source={settingsIcon}
            style={styles.icon}
            contentFit="contain"
            accessible={false}
          />
        </Pressable>
      ) : (
        <ActionPill
          label={LABEL}
          icon={settingsIcon}
          onPress={() => setIsOpen(true)}
          style={style}
        />
      )}

      <PopupOverlay visible={isOpen} onClose={() => setIsOpen(false)} label={LABEL}>
        <View style={styles.stage}>
          <View style={styles.card}>
            {INITIAL_SETUP_ITEMS.map((item) => (
              <View key={item.id}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={[styles.value, Typography[item.valueToken]]}>
                  {item.value[locale]}
                </Text>
              </View>
            ))}
          </View>

          <Image source={paperclip} style={styles.clip} contentFit="contain" accessible={false} />
        </View>
      </PopupOverlay>
    </>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  // 좁은 화면에서도 고정 폭이 넘치지 않도록 최대 폭을 함께 둡니다.
  stage: {
    width: CARD_WIDTH,
    maxWidth: '100%',
    paddingBottom: CLIP_OVERHANG,
  },
  card: {
    paddingHorizontal: CARD_PADDING_X,
    paddingVertical: CARD_PADDING_Y,
    gap: ITEM_GAP,
    backgroundColor: FixedColors.cardSurface,
  },
  label: {
    ...Typography.bodyEn14,
    color: FixedColors.onLight,
  },
  // 글자 크기는 항목마다 달라서 쓰는 쪽에서 토큰으로 덧씌웁니다.
  value: {
    color: FixedColors.onLight,
    marginTop: LABEL_TO_VALUE,
  },
  clip: {
    position: 'absolute',
    left: CLIP_LEFT,
    top: CLIP_TOP,
    width: CLIP_WIDTH,
    height: CLIP_HEIGHT,
  },
});
