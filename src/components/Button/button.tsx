import {
  ActivityIndicator,
  TouchableOpacity,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import styles from './styles';
import { FC } from 'react';
import { Colors, Icon } from '../../constant';
import TextView from '../TextView/textView';
import _ from 'lodash';

interface ButtonProps {
  onPress?: () => void;
  isLoading?: boolean;
  indicatorColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  title?: string | null;
  titleStyle?: TextStyle;
  buttonColor?: string;
  icon?: string;
  iconFamily?: any;
  showIcon?: boolean;
}

const Button: FC<ButtonProps> = ({
  onPress,
  isLoading,
  indicatorColor,
  disabled,
  style,
  title,
  titleStyle,
  buttonColor,
  icon,
  iconFamily,
  showIcon,
}) => {
  const {
    buttonContainer,
    buttonView,
    indicatorStyle,
    touchableOpacityStyle,
    disabledButtonContainer,
    buttonText,
    disabledBtnText,
  } = styles;

  const handleClick = () => {
    try {
      if (onPress) {
        _.debounce(onPress, 500)();
      }
    } catch (error) {
      console.warn('handleClick', error);
    }
  };

  return (
    <TouchableOpacity
      style={style}
      onPress={() => handleClick()}
      disabled={isLoading === true ? true : disabled}
    >
      <View
        style={[
          disabled ? disabledButtonContainer : buttonContainer,
          {
            backgroundColor: buttonColor
              ? buttonColor
              : disabled
              ? Colors.PRIMARY[200]
              : Colors.PRIMARY[100],
          },
        ]}
      >
        <View style={touchableOpacityStyle}>
          {isLoading ? (
            <View style={buttonView}>
              <View style={indicatorStyle}>
                <ActivityIndicator color={indicatorColor} />
              </View>
            </View>
          ) : (
            <View style={buttonView}>
              <TextView
                style={[buttonText, titleStyle, disabled && disabledBtnText]}
              >
                {title}
              </TextView>

              {showIcon && (
                <Icon
                  family={iconFamily}
                  name={icon || 'help-outline'}
                  size={20}
                  color={Colors.PRIMARY[300]}
                />
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default Button;
