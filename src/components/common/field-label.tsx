import { StyleSheet, Text, View } from 'react-native';

import { FixedColors, LineHeightRatio } from '@constants/theme';

/**
 * 여러 개를 고를 수 있는 묶음의 라벨에 붙이는 안내.
 * 시안(2-1-2)이 복수 선택이 되는 묶음에만 라벨 아래 작은 글씨로 답니다.
 */
export const MULTI_SELECT_HINT = '복수 응답 가능';

/** 라벨 아래 안내 줄. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const HINT_FONT_SIZE = 10;

interface FieldLabelProps {
  label: string;
  /** 필수 입력이면 라벨 뒤에 빨간 별표를 붙입니다. */
  required?: boolean;
  /** 라벨 바로 아래에 붙는 작은 안내 한 줄. 복수 선택 여부처럼 짧은 단서만 답니다. */
  hint?: string;
}

/** 어두운 배경 위 입력 항목의 라벨. 정보 입력 화면의 필드들이 함께 씁니다. */
export function FieldLabel({ label, required = false, hint }: FieldLabelProps) {
  return (
    // 안내 줄은 라벨에 바로 붙어야 해서 둘을 한 덩이로 묶습니다.
    <View>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>

      {hint === undefined ? null : <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
    color: FixedColors.onDark,
  },
  required: {
    color: FixedColors.required,
  },
  hint: {
    fontSize: HINT_FONT_SIZE,
    lineHeight: HINT_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
  },
});
