import { StyleSheet, TextInput, View, type ImageRequireSource } from 'react-native';
import { Image } from 'expo-image';

import { FieldLabel } from '@components/common/field-label';
import { FixedColors, Spacing } from '@constants/theme';

interface OutlinedTextFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  /** 라벨에 빨간 별표를 붙입니다. 비우면 선택 입력입니다. */
  required?: boolean;
  /** 필드 오른쪽에 붙는 24×24 아이콘. 시안의 Working At 돋보기처럼 장식용입니다. */
  icon?: ImageRequireSource;
}

/** 어두운 배경 위 테두리만 있는 한 줄 입력 필드. */
export function OutlinedTextField({
  label,
  value,
  placeholder,
  onChangeText,
  required = false,
  icon,
}: OutlinedTextFieldProps) {
  return (
    <View style={styles.field}>
      <FieldLabel label={label} required={required} />

      <View style={styles.box}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={FixedColors.placeholderOnDark}
          underlineColorAndroid="transparent"
          accessibilityLabel={label}
          style={styles.input}
        />
        {icon ? (
          <Image source={icon} style={styles.icon} contentFit="contain" accessible={false} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: '100%',
    gap: Spacing.two,
  },
  box: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: FixedColors.onDark,
  },
  input: {
    flex: 1,
    // 안드로이드가 기본으로 넣는 여백을 없애 세 플랫폼의 높이를 맞춥니다.
    padding: 0,
    fontSize: 14,
    color: FixedColors.onDark,
  },
  icon: {
    width: 24,
    height: 24,
  },
});
