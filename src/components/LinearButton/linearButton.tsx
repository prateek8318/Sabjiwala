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

interface LinearButtonProps {
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
  showIconLeft?:boolean
}

const LinearButton: FC<LinearButtonProps> = ({
  onPress,
  isLoading,
  indicatorColor,
  disabled,
  showIconLeft,
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
      disabled={isLoading === true ? true : disabled}>
      <View
      >
        <LinearGradient
          colors={[Colors.PRIMARY[200], Colors.PRIMARY[100]]}
          style={styles.gradientButton}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0 }}>
          <View style={touchableOpacityStyle}>
            {isLoading ? (
              <View style={buttonView}>
                <View style={indicatorStyle}>
                  <ActivityIndicator color={indicatorColor} />
                </View>
              </View>
            ) : (
              <View style={buttonView}>
                {showIconLeft && (
                  <View style={{marginRight: 2 }}>
                    <Icon
                      family={iconFamily}
                      name={icon || 'help-outline'}
                      size={22}
                      color={Colors.PRIMARY[300]}
                    />
                  </View>
                )}
                <TextView
                  style={[buttonText, titleStyle, disabled && disabledBtnText]}>
                  {title}
                </TextView>

                {showIcon && (
                  <View style={{marginLeft: 2 }}>
                    <Icon
                      family={iconFamily}
                      name={icon || 'help-outline'}
                      size={22}
                      color={Colors.PRIMARY[300]}
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

export default LinearButton;

