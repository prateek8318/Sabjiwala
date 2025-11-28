import { Image, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import styles from './styles';
import { FC } from 'react';
import TextView from '../TextView/textView';
import { Images } from '../../constant';

export interface RadioButtonArray {
  id: number;
  buttonName: string;
}
interface RadioButtonProps {
  buttonArray: Array<RadioButtonArray>;
  onPressButton: (selectedId: number) => void;
}

const RadioButton: FC<RadioButtonProps> = ({ buttonArray, onPressButton }) => {
  const { container, buttonView, radioButton, title } = styles;
  const [selectedItems, setselectedItems] = useState(0);
  return (
    <View style={container}>
      {buttonArray.map((item, index) => {
        return (
          <TouchableOpacity
            key={index.toString()}
            style={buttonView}
            onPress={() => {
              setselectedItems(item.id), onPressButton(item.id);
            }}
          >
            <Image
              source={
                item.id === selectedItems
                  ? Images.ic_radio_checked
                  : Images.ic_radio_unchecked
              }
              style={radioButton}
            />
            <TextView style={title}>{item.buttonName}</TextView>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default RadioButton;
