import type { PropsWithChildren } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { FixedColors, Spacing } from '@constants/theme';

type PopupOverlayProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  /** 스크린 리더가 팝업을 열었을 때 읽을 이름 */
  label: string;
}>;

/**
 * 화면을 어둡게 덮고 그 위에 내용 한 덩이를 띄우는 팝업.
 * 어두운 바깥을 누르거나 안드로이드 뒤로 가기로 닫습니다.
 *
 * 시안에는 팝업이 놓일 자리가 그려져 있지 않아 화면 한가운데에 둡니다.
 */
export function PopupOverlay({ visible, onClose, label, children }: PopupOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      // 안드로이드 뒤로 가기 버튼. iOS 에서는 호출되지 않습니다.
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.stage}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} 닫기`}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        {/* 내용 위에서는 누르기가 스크림으로 새지 않아야 합니다. */}
        <View accessibilityLabel={label} style={styles.content}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: FixedColors.scrim,
  },
  content: {
    maxWidth: '100%',
  },
});
