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

interface BorderButtonProps {
  onPress?: () => void;
  isLoading?: boolean;
  indicatorColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  buttonWidth?: any;
  title?: string | null;
  titleStyle?: TextStyle;
  buttonColor?: string;
  icon?: string;
  iconFamily?: any;
  showIcon?: boolean;
}

const BorderButton: FC<BorderButtonProps> = ({
  onPress,
  isLoading,
  indicatorColor,
  disabled,
  buttonWidth,
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
      <View style={[buttonContainer, { width: buttonWidth }]}>
        <View style={touchableOpacityStyle}>
          {isLoading ? (
            <View style={buttonView}>
              <View style={indicatorStyle}>
                <ActivityIndicator color={indicatorColor} />
              </View>
            </View>
          ) : (
            <View style={buttonView}>
              {showIcon && (
                <View style={{ marginBottom: 5, marginRight: 4 }}>
                  <Icon
                    family={iconFamily}
                    name={icon || 'help-outline'}
                    size={30}
                    color={Colors.PRIMARY[100]}
                  />
                </View>
              )}
              <TextView
                style={[buttonText, titleStyle, disabled && disabledBtnText]}
              >
                {title}
              </TextView>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default BorderButton;
