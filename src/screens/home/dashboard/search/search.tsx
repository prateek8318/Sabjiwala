import React, { FC, useContext, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import styles from './search.styles';
import { HomeStackProps } from '../../../../@types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from '../../../../constant/dimentions';
import { Colors, Fonts, Icon, Images, Typography } from '../../../../constant';
import { Header } from '../../../../components';
import InputText from '../../../../components/InputText/TextInput';

type SearchScreenNavigationType = NativeStackNavigationProp<
  HomeStackProps,
  'Search'
>;

const Search: FC = () => {
  const navigation = useNavigation<SearchScreenNavigationType>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Header />
        </View>

        <View>
          <View style={styles.searchBox}>
            <View style={styles.searchView}>
              <Icon
                family="EvilIcons"
                name="search"
                color={Colors.PRIMARY[100]}
                size={30}
              />
              <InputText
                value={''}
                //@ts-ignore
                inputStyle={[styles.inputView]}
                placeHolderTextStyle={Colors.PRIMARY[500]}
                placeholder="Search for Grocery"
                onChangeText={(value: string) => {
                  console.log('TEst', value);
                }}
              />
            </View>
          </View>
        </View>
        <View style={styles.imgSearchView}>
          <Image source={Images.img_search} style={styles.imgSearch} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Search;
