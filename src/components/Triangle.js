import React, {useRef} from 'react';
import {View, StyleSheet} from 'react-native';
import {TapGestureHandler} from 'react-native-gesture-handler';
import {Svg, Defs, ClipPath, Image, G, Polygon} from 'react-native-svg';
import {shadow, isiOS} from '@utils';

const Triangle = ({
  size = 120,
  color = 'blue',
  imageSource = '',
  onDoubleTapEvent = () => {},
}) => {
  const doubleTapRef = useRef();

  if (imageSource != '') {
    return (
      <Svg height={size} width={size} style={isiOS ? shadow : {}}>
        <Defs>
          <ClipPath id="clip">
            <Polygon points={`${size / 2},0 0,${size} ${size},${size}`} />
          </ClipPath>
        </Defs>

        {isiOS ? (
          <G clipPath="url(#clip)">
            <Image href={{uri: imageSource}} />
          </G>
        ) : (
          <Image href={{uri: imageSource}} clipPath="url(#clip)" />
        )}
      </Svg>
    );
  }
  // return (
  //   <Svg height={size} width={size} style={shadow}>
  //     <Polygon
  //       points={`${size / 2},0 0,${size} ${size},${size}`}
  //       fill={color}
  //     />
  //   </Svg>
  // );

  return (
    <TapGestureHandler
      ref={doubleTapRef}
      onHandlerStateChange={onDoubleTapEvent}
      numberOfTaps={2}>
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
    </TapGestureHandler>
  );
};

const styles = StyleSheet.create({
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
