import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import backArrow from '@assets/images/common/back-arrow.svg';

/** 시안(`2-1 Worldline`)의 버튼 크기. 그대로도 최소 터치 영역 44 를 넘습니다. */
const BUTTON_WIDTH = 62;
const BUTTON_HEIGHT = 46;

interface BackArrowButtonProps {
  onPress: () => void;
  /** 스크린 리더가 읽을 이름. 어디로 돌아가는지에 따라 화면마다 다릅니다. */
  label?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * 왼쪽을 가리키는 화살표 하나뿐인 뒤로 가기 버튼.
 * 머리말 아래 줄에서 알약 탭이 있어야 할 자리를 대신 차지합니다.
 *
 * 어두운 브랜드 배경 위에만 올라가므로 화살표 색이 흰색으로 고정입니다.
 */
export function BackArrowButton({ onPress, label = '뒤로 가기', style }: BackArrowButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, style]}
    >
      <Image source={backArrow} style={styles.arrow} contentFit="contain" accessible={false} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
  },
  arrow: {
    width: '100%',
    height: '100%',
  },
});
