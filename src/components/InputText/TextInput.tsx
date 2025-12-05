import React, { FC } from 'react';
import {
  TextInput,
  View,
  ReturnKeyTypeOptions,
  KeyboardTypeOptions,
  TextStyle,
} from 'react-native';
import { FormikErrors, FormikTouched } from 'formik';
import TextView from '../TextView/textView';
import styles from './styles';
import { heightPercentageToDP as hp } from '../../constant/dimentions';
import { Colors, Icon } from '../../constant';
interface TextInputProps {
  placeholderTextColor?: string;   
  refs?: React.RefObject<TextInput>;
  placeholder?: string;
  placeHolderTextStyle?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  inputStyle?: TextStyle;
  autofocus?: boolean;
  inputLabel?: string;
  onFocus?: any;
  multiline?: boolean;
  editable?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  textOnSubmit?: () => void;
  inputContainer?:any;
  showIcon?: boolean;
  icon?: string;
  iconFamily?: any;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions | undefined;
  pointerEvents?: 'box-none' | 'none' | 'box-only' | 'auto' | undefined;
  error?: FormikErrors<string> | any;
  touched?: FormikTouched<boolean> | any;
}

const InputText: FC<TextInputProps> = ({
  refs,
  placeholder,
  placeHolderTextStyle,
  value,
  onChangeText,
  autofocus,
  inputStyle,
  editable,
  onFocus,
  inputContainer,
  showIcon,
  multiline,
  returnKeyType,
  textOnSubmit,
  error,
  iconFamily,
  icon,
  touched,
  keyboardType,
  maxLength,
  pointerEvents,
}) => {
  return (
    <View style={inputContainer && inputContainer}>
      <View>
        {showIcon && (
          <View style={styles.iconView}>
            <Icon
              family={iconFamily}
              name={icon || 'help-outline'}
              size={30}
              color={Colors.PRIMARY[100]}
            />
          </View>
        )}
      </View>
      <TextInput
        ref={refs}
        placeholder={placeholder}
        placeholderTextColor={placeHolderTextStyle}
        onSubmitEditing={textOnSubmit}
        onChangeText={onChangeText}
        style={inputStyle && inputStyle}
        editable={editable}
        multiline={multiline}
        onFocus={onFocus}
        autoFocus={autofocus}
        pointerEvents={pointerEvents}
        value={value}
        maxLength={maxLength}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
      />
      {error && touched && <TextView style={styles.error}>{error}</TextView>}
    </View>
  );
};

export default InputText;
