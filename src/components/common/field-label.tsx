import { StyleSheet, Text } from 'react-native';

import { FixedColors } from '@constants/theme';

interface FieldLabelProps {
  label: string;
  /** 필수 입력이면 라벨 뒤에 빨간 별표를 붙입니다. */
  required?: boolean;
}

/** 어두운 배경 위 입력 항목의 라벨. 정보 입력 화면의 필드들이 함께 씁니다. */
export function FieldLabel({ label, required = false }: FieldLabelProps) {
  return (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
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
});
