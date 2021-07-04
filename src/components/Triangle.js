import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator} from 'react-native';
import {Svg, Defs, ClipPath, G, Image, Polygon} from 'react-native-svg';
import {shadow, isiOS, isValidURL, getBase64FromUrl} from '@utils';

const Triangle = ({size = 120, color = 'blue', imageSource = ''}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState(imageSource);

  useEffect(() => {
    // if source is url then convert it to base64
    const getImageData = async () => {
      if (!isValidURL(imageSource)) {
        return;
      }
      setIsLoading(true);
      try {
        const base64 = await getBase64FromUrl(imageSource);
        setSource(base64);
      } catch (e) {
        console.log('get-base64-error', e);
      } finally {
        setIsLoading(false);
      }
    };

    getImageData();
  }, []);

  if (source == '') {
    return (
      <View
        style={[
          styles.triangle,
          isiOS ? shadow : {},
          {
            borderLeftWidth: size / 2,
            borderRightWidth: size / 2,
            borderBottomWidth: size,
            borderBottomColor: color,
          },
        ]}
      />
    );
  }

  return (
    <Svg height={size} width={size} style={isiOS ? shadow : {}}>
      <Defs>
        <ClipPath id="clip">
          <Polygon points={`${size / 2},0 0,${size} ${size},${size}`} />
        </ClipPath>
      </Defs>
      {isLoading ? (
        <ActivityIndicator color={'green'} />
      ) : isiOS ? (
        <G clipPath="url(#clip)">
          <Image href={{uri: source}} />
        </G>
      ) : (
        <Image href={{uri: source}} clipPath={'url(#clip)'} />
      )}
    </Svg>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  triangle: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});

export default Triangle;
