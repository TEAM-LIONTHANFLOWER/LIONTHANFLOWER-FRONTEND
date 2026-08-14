import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { OrbitLogo } from '@components/common/orbit-logo';
import { ScreenContainer } from '@components/common/screen-container';
import { BrandColors } from '@constants/theme';
import storeFront from '@assets/images/matching/store-front.jpg';
import mcmSymbol from '@assets/images/splash/mcm-symbol.png';

// 시안(393×852) 의 세로 배분입니다. 화면 크기가 달라도 비율이 유지되도록 flex 로 옮겼습니다.
/** 화면 위 ~ 로고 아래 */
const LOGO_SLOT_FLEX = 163;
/** 로고 아래 ~ 안내 문구 아래 */
const MESSAGE_SLOT_FLEX = 281;
/** 안내 문구 아래 ~ 화면 끝 */
const SYMBOL_SLOT_FLEX = 408;
/** 시안에서 심벌 아래 남는 여백 */
const SYMBOL_BOTTOM = 50;

/**
 * 고객 매칭 대기 화면 — `/matching`
 *
 * 정보 입력을 끝낸 고객이 직원이 배정되기를 기다리는 화면입니다.
 * 배정 결과를 받아올 API 가 아직 없어 지금은 대기 화면에 머뭅니다.
 */
export default function CustomerMatchingScreen() {
  return (
    <View style={styles.root}>
      <Image
        source={storeFront}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
      />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.scrim]} />

      <ScreenContainer backgroundColor="transparent" style={styles.stage}>
        <View style={styles.logoSlot}>
          <OrbitLogo />
        </View>

        <View style={styles.messageSlot}>
          <Text style={styles.message} accessibilityLiveRegion="polite">
            {'직원을 매칭중입니다...\n잠시만 직원을 기다려주세요'}
          </Text>
        </View>

        <View style={styles.symbolSlot}>
          <Image source={mcmSymbol} style={styles.symbol} contentFit="contain" accessible={false} />
        </View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.splashBackground,
  },
  // 시안의 오버레이는 그라데이션이 아니라 화면 전체에 고르게 깔린 검정 50% 입니다.
  scrim: {
    backgroundColor: BrandColors.scrim,
  },
  stage: {
    paddingVertical: 0,
    gap: 0,
  },
  logoSlot: {
    flex: LOGO_SLOT_FLEX,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  messageSlot: {
    flex: MESSAGE_SLOT_FLEX,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    color: BrandColors.onDark,
    textAlign: 'center',
  },
  symbolSlot: {
    flex: SYMBOL_SLOT_FLEX,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: SYMBOL_BOTTOM,
  },
  symbol: {
    width: 45,
    height: 41,
  },
});
