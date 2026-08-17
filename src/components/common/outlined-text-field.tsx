import { StyleSheet, Text, TextInput, View, type ImageRequireSource } from 'react-native';
import { Image } from 'expo-image';

import { FieldLabel } from '@components/common/field-label';
import { FixedColors, LineHeightRatio, Spacing } from '@constants/theme';

/** 라벨 아래 안내 줄. Figma 텍스트 스타일에 없는 크기라 여기서 직접 잡습니다. */
const DESCRIPTION_FONT_SIZE = 11;

interface OutlinedTextFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  /** 라벨에 빨간 별표를 붙입니다. 비우면 선택 입력입니다. */
  required?: boolean;
  /** 필드 오른쪽에 붙는 24×24 아이콘. 시안의 Working At 돋보기처럼 장식용입니다. */
  icon?: ImageRequireSource;
  /** 라벨 바로 아래에 붙는 안내 한 줄. 무엇을 적으면 되는지 일러 줍니다. */
  description?: string;
  /** 여러 줄을 받습니다. 글이 늘어나면 필드도 함께 늘어납니다. */
  multiline?: boolean;
  /** 받을 수 있는 최대 글자 수 */
  maxLength?: number;
}

/** 어두운 배경 위 테두리만 있는 입력 필드. 기본은 한 줄이고 `multiline` 으로 메모가 됩니다. */
export function OutlinedTextField({
  label,
  value,
  placeholder,
  onChangeText,
  required = false,
  icon,
  description,
  multiline = false,
  maxLength,
}: OutlinedTextFieldProps) {
  return (
    <View style={styles.field}>
      {/* 안내 줄은 라벨에 바로 붙어야 해서 둘을 한 덩이로 묶습니다. */}
      <View>
        <FieldLabel label={label} required={required} />
        {description === undefined ? null : <Text style={styles.description}>{description}</Text>}
      </View>

      <View style={[styles.box, multiline && styles.boxMultiline]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={FixedColors.placeholderOnDark}
          underlineColorAndroid="transparent"
          accessibilityLabel={label}
          multiline={multiline}
          maxLength={maxLength}
          style={[styles.input, multiline && styles.inputMultiline]}
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
  description: {
    fontSize: DESCRIPTION_FONT_SIZE,
    lineHeight: DESCRIPTION_FONT_SIZE * LineHeightRatio.base,
    color: FixedColors.onDark,
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
  // 여러 줄일 때는 높이를 글에 맡기고, 한 줄일 때의 높이를 바닥으로 삼습니다.
  boxMultiline: {
    height: undefined,
    minHeight: 42,
    alignItems: 'flex-start',
    paddingVertical: Spacing.two,
  },
  input: {
    flex: 1,
    // 안드로이드가 기본으로 넣는 여백을 없애 세 플랫폼의 높이를 맞춥니다.
    padding: 0,
    fontSize: 14,
    color: FixedColors.onDark,
  },
  // 안드로이드는 여러 줄 입력의 글을 기본으로 가운데에 두어 위로 올려 둡니다.
  inputMultiline: {
    textAlignVertical: 'top',
  },
  icon: {
    width: 24,
    height: 24,
  },
});
