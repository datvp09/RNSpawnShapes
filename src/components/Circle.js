import React from 'react';
import {View} from 'react-native';
import {shadow} from '@utils';
import FastImage from 'react-native-fast-image';

const Circle = ({size = 80, color = 'green', imageSource = ''}) => (
  <View
    style={{
      ...shadow,
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: imageSource == '' ? color : 'transparent',
    }}>
    {imageSource != '' && (
      <FastImage
        source={{
          uri: imageSource,
        }}
        resizeMode={'cover'}
        style={{flex: 1, borderRadius: size / 2}}
      />
    )}
  </View>
);

export default Circle;
