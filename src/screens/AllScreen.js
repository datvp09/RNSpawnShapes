import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {Triangle, Square, Circle} from '@components';
import {useIsFocused} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {
  COLOR_URL,
  IMAGE_URL,
  ITEMS_EACH_FETCH,
  ITEMS_LEFT_TO_FETCH_AGAIN,
  randomColor,
  randomNumberFrom,
  randomShapeSize,
} from '@utils';
import axios from 'axios';
import _ from 'lodash';
import Modal from 'react-native-modal';
import RNShake from 'react-native-shake';
import {
  PanGestureHandler,
  State,
  RotationGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler';

const TYPE = {
  square: 0,
  circle: 1,
  triangle: 2,
};

const AllScreen = () => {
  const [shapeList, setShapeList] = useState([]);
  const [oldPositions, setOldPositions] = useState([]);
  const [randomData, setRandomData] = useState([]); // color or image
  const [isLoading, setIsLoading] = useState(false);
  const lastRealPosition = useRef({x: 0, y: 0});
  const lastSize = useRef(0);
  const _translateX = new Animated.Value(0);
  const _translateY = new Animated.Value(0);
  const _lastOffset = {x: 0, y: 0};
  const isFocused = useIsFocused();

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
      randomData.length > 0 &&
      randomData.length - shapeList.length < ITEMS_LEFT_TO_FETCH_AGAIN
    ) {
      // expand the list to make sure always enough items to generate
      setRandomData([...randomData, ...randomData.slice(0, ITEMS_EACH_FETCH)]);
      expandColorList();
    }
  }, [shapeList, randomData]);

  const expandColorList = () => {
    // list of true | false to determine whether color or image url
    const bools = [...Array(ITEMS_EACH_FETCH)].map(() => Math.random() < 0.5);
    const randomPromises = bools.map(bool =>
      bool ? axios.get(COLOR_URL) : axios.get(IMAGE_URL),
    );

    Promise.all(randomPromises)
      .then(res => {
        const colorRes = res.filter((_, index) => bools[index]);
        const imageRes = res.filter((_, index) => !bools[index]);
        const urls = imageRes.map(x =>
          x.data[0].imageUrl.replace('http', 'https'),
        );
        const preload = urls.map(url => ({uri: url}));
        FastImage.preload(preload);

        setRandomData([
          ...randomData,
          ...bools.map((bool, index) => {
            if (!bool) {
              return urls.shift();
            }
            const firstColorRes = colorRes.shift();
            return `#${firstColorRes.data[0].hex}`;
          }),
        ]);
      })
      .catch(e => {
        setRandomData([
          ...randomData,
          ...[...Array(ITEMS_EACH_FETCH)].map(randomColor),
        ]);
      })
      .finally(() => setIsLoading(false));
  };

  const onBackgroundTouch = e => {
    if (isLoading) {
      return;
    }

    const {pageX, pageY} = e.nativeEvent;
    let newX = pageX;
    let newY = pageY;
    const lastPosition = oldPositions[oldPositions.length - 1];

    const isNew =
      !lastPosition ||
      Math.abs(newX - size / 2 - lastRealPosition.current.x) > 5 ||
      Math.abs(newY - lastRealPosition.current.y) > 5;

    // if close to last shape position, put the new one nearby
    if (!isNew) {
      newX = lastPosition.x + lastSize.current / 2 + 10;
      newY = lastPosition.y + 10;
    }

    const size = randomShapeSize();
    const props = {size};
    const lastShapeData = randomData[shapeList.length];

    // is color
    if (!lastShapeData || lastShapeData.length < 10) {
      props.color = lastShapeData;
    } else {
      props.imageSource = lastShapeData;
    }

    const randomType = randomNumberFrom(TYPE.square, TYPE.triangle);
    let Shape;
    if (randomType == TYPE.square) {
      Shape = Square;
    } else if (randomType == TYPE.circle) {
      Shape = Circle;
    } else if (randomType == TYPE.triangle) {
      Shape = Triangle;
    }

    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        400,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
    setShapeList([
      ...shapeList,
      <PanGestureHandler
        key={shapeList.length}
        onGestureEvent={_onDragGestureEvent}
        onHandlerStateChange={_onDragHandlerStateChange}>
        <Animated.View
          style={{
            position: 'absolute',
            top: newY,
            left: randomType == TYPE.square ? newX : newX - size / 2,
            transform: [{translateX: _translateX}, {translateY: _translateY}],
          }}
          collapsable={false}>
          <Shape {...props} />
        </Animated.View>
      </PanGestureHandler>,
    ]);
    setOldPositions([
      ...oldPositions,
      {x: randomType == TYPE.triangle ? newX - size / 2 : newX, y: newY},
    ]);
    setTimeout(() => {
      lastRealPosition.current.x =
        randomType == TYPE.triangle ? pageX - size / 2 : pageX;
      lastRealPosition.current.y = pageY;
    });
    lastSize.current = size;
  };

  const _onDragHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      _lastOffset.x += event.nativeEvent.translationX;
      _lastOffset.y += event.nativeEvent.translationY;
      _translateX.setOffset(_lastOffset.x);
      _translateX.setValue(0);
      _translateY.setOffset(_lastOffset.y);
      _translateY.setValue(0);
    }
  };

  const _onDragGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: _translateX,
          translationY: _translateY,
        },
      },
    ],
    {useNativeDriver: true},
  );

  return (
    <TouchableWithoutFeedback onPress={onBackgroundTouch}>
      <View style={styles.container}>
        {shapeList.map(item => item)}
        <Modal
          isVisible={isLoading && isFocused}
          backdropOpacity={0.25}
          animationIn={'fadeIn'}
          animationOut={'fadeOut'}>
          <View style={styles.spinnerBackground}>
            <ActivityIndicator size={'large'} color={'lightgray'} />
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  spinnerBackground: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
  },
});

export default AllScreen;
