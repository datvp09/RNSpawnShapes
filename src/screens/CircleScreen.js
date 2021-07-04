import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import {Circle} from '@components';
import {TapGestureHandler, State} from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import RNShake from 'react-native-shake';
import {
  BIGGEST_SCREEN_PERCENT,
  COLOR_URL,
  randomNumberFrom,
  SMALLEST_SCREEN_PERCENT,
  ITEMS_EACH_FETCH,
  ITEMS_LEFT_TO_FETCH_AGAIN,
  width,
  height,
  randomColor,
} from '@utils';
import axios from 'axios';
import _ from 'lodash';

const CircleScreen = () => {
  const [shapeList, setShapeList] = useState([]);
  const [oldPositions, setOldPositions] = useState([]);
  const [randomCircleColors, setRandomCircleColors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastRealPosition = useRef({x: 0, y: 0});

  useEffect(() => {
    setIsLoading(true);
    expandColorList();
    RNShake.addListener(() => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          500,
          LayoutAnimation.Types.easeInEaseOut,
          LayoutAnimation.Properties.opacity,
        ),
      );
      setShapeList([]);
    });

    return RNShake.removeListener;
  }, []);

  useEffect(() => {
    if (
      randomCircleColors.length > 0 &&
      randomCircleColors.length - shapeList.length < ITEMS_LEFT_TO_FETCH_AGAIN
    ) {
      // expand the list to make sure always enough items to generate
      setRandomCircleColors([
        ...randomCircleColors,
        ...randomCircleColors.slice(0, ITEMS_EACH_FETCH),
      ]);
      expandColorList();
    }
  }, [shapeList, randomCircleColors]);

  const expandColorList = () => {
    const randomCircleColorPromises = [...Array(ITEMS_EACH_FETCH)].map(() =>
      axios.get(COLOR_URL),
    );
    Promise.all(randomCircleColorPromises)
      .then(res => {
        setRandomCircleColors([
          ...randomCircleColors,
          ...res.map(x => `#${x.data[0].hex}`),
        ]);
      })
      .catch(e => {
        setRandomCircleColors([
          ...randomCircleColors,
          ...[...Array(ITEMS_EACH_FETCH)].map(randomColor),
        ]);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <View
      onTouchStart={e => {
        if (isLoading) {
          return;
        }
        const {pageX, pageY} = e.nativeEvent;
        let newX = pageX;
        let newY = pageY;
        const lastPosition = oldPositions[oldPositions.length - 1];

        // console.log(
        //   'log-1',
        //   {x: newX, y: newY},
        //   {x: lastRealPosition.current.x, y: lastRealPosition.current.y},
        // );

        const isNew =
          !lastPosition ||
          Math.abs(lastRealPosition.current.x - newX) > 5 ||
          Math.abs(lastRealPosition.current.y - newY) > 5;

        // if in history, put nearby
        if (!isNew) {
          newX = lastPosition.x + 10;
          newY = lastPosition.y + 10;
        }

        // console.log('log-2', isNew, lastPosition, {x: newX, y: newY});

        const percent = randomNumberFrom(
          SMALLEST_SCREEN_PERCENT,
          BIGGEST_SCREEN_PERCENT,
        );
        const size = (percent / 100) * width;

        LayoutAnimation.configureNext(
          LayoutAnimation.create(
            400,
            LayoutAnimation.Types.easeInEaseOut,
            LayoutAnimation.Properties.opacity,
          ),
        );
        setShapeList([
          ...shapeList,
          <View
            style={{
              position: 'absolute',
              top: newY,
              left: newX - size / 2,
            }}>
            <Circle size={size} color={randomCircleColors[shapeList.length]} />
          </View>,
        ]);
        setOldPositions([...oldPositions, {x: newX, y: newY}]);
        setTimeout(() => {
          lastRealPosition.current.x = pageX;
          lastRealPosition.current.y = pageY;
        });
      }}
      style={styles.flex}>
      {shapeList.map((item, index) => (
        <View key={index}>{item}</View>
      ))}
      {/* <Modal
        isVisible={isLoading}
        backdropOpacity={0.25}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}>
        <View style={styles.spinnerBackground}>
          <ActivityIndicator size={'large'} color={'lightgray'} />
        </View>
      </Modal> */}
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: 'whitesmoke'},
  spinnerBackground: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default CircleScreen;
