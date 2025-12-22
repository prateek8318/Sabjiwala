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
import LinearGradient from 'react-native-linear-gradient';

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
      {disabled ? (
        <View style={disabledButtonContainer}>
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
      ) : buttonColor ? (
        // Solid-color button when a custom buttonColor is provided
        <View style={[buttonContainer, { backgroundColor: buttonColor }]}>
          <View style={touchableOpacityStyle}>
            {isLoading ? (
              <View style={buttonView}>
                <View style={indicatorStyle}>
                  <ActivityIndicator color={indicatorColor} />
                </View>
              </View>
            ) : (
              <View style={buttonView}>
                <TextView style={[buttonText, titleStyle]}>
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
      ) : (
        <LinearGradient
          // Global primary button gradient
          colors={['#5A875C', '#015304']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0 }}
          style={buttonContainer}
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
                <TextView style={[buttonText, titleStyle]}>
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
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

export default Button;
