import { Image, View, TouchableOpacity } from 'react-native';
import styles from './style';
import { FC } from 'react';
import { Colors, Images } from '../../constant';
import { TextView } from '../../components';

interface CheckBoxProps {
  isChecked?: boolean;
  onPress?: () => void;
  boxTitle?: string | null;
  boxTitleColor?: any;
  isRtl?: boolean;
}

const CheckBox: FC<CheckBoxProps> = ({
  isChecked,
  onPress,
  boxTitle,
  isRtl,
  boxTitleColor,
}) => {
  const { container, checkBoxImageView, title } = styles;
  const iconName = isChecked
    ? Images.ic_square_checked
    : Images.ic_square_unchecked;

  return (
    <View style={container}>
      {isRtl && <TextView style={title}>{boxTitle}</TextView>}
      <TouchableOpacity onPress={onPress}>
        <Image source={iconName} style={checkBoxImageView} />
      </TouchableOpacity>
      {!isRtl && (
        <TextView
          style={[
            title,
            { color: boxTitleColor ? boxTitleColor : Colors.PRIMARY[400] },
          ]}
        >
          {boxTitle}
        </TextView>
      )}
    </View>
  );
};

export default CheckBox;
