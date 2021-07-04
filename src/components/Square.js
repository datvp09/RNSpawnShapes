import React, {useRef} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {shadow} from '@utils';

const Square = ({size = 100, imageSource = '', color = 'red'}) => {
  console.log('square-receive', size, imageSource, color);
  return (
    <View
      style={[
        shadow,
        {
          width: size,
          height: size,
          backgroundColor: imageSource == '' ? color : 'transparent',
        },
      ]}>
      {/* {imageSource != '' && (
        )} */}
      <FastImage
        source={{
          uri: imageSource,
        }}
        resizeMode={'cover'}
        style={styles.flex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
});

export default Square;
