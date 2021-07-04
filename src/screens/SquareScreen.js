import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import {Square} from '@components';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import RNShake from 'react-native-shake';
import {useIsFocused} from '@react-navigation/native';
import {
  IMAGE_URL,
  ITEMS_LEFT_TO_FETCH_AGAIN,
  ITEMS_EACH_FETCH,
  randomColor,
  randomShapeSize,
} from '@utils';
import axios from 'axios';

/*
  STRATEGY
  - In order to make press action responses quickly, the color/pattern need to be loaded first,
    into an array size <ITEMS_EACH_FETCH> bigger than the shape size
  - When there are <ITEMS_LEFT_TO_FETCH_AGAIN> items left then load more action will be call to fulfill data needed
  - The pattern data which is image will be prefetch if the shape is circle or square by FastImage,
    for triangle shape, pattern will be loaded as base64 due to shaping it with SVG clippath
  - Shapes entering & exiting animation use LayoutAnimation opacity easing effect

  TECHNICAL PEOBLEM
  - For multiple gesture handler which are combo of pan, pinch & double touch,
    multiple shapes spawn cannot share touch background for now, so I decide to only apply pan gesture on them
  - Default Image/FastImage cannot be clipped using react-native-svg, so for pattern triangle I decide to use react-native-svg Image
    to manually wait for pattern to completely load then apply clippath
*/

const SquareScreen = () => {
  const [shapeList, setShapeList] = useState([]);
  const [oldPositions, setOldPositions] = useState([]);
  const [randomSquarePatterns, setRandomSquarePatterns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastRealPosition = useRef({x: 0, y: 0});
  const isFocused = useIsFocused();
  const _translateX = new Animated.Value(0);
  const _translateY = new Animated.Value(0);
  const _lastOffset = {x: 0, y: 0};

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

  const expandColorList = () => {
    const randomPatternPromises = [...Array(ITEMS_EACH_FETCH)].map(() =>
      axios.get(IMAGE_URL),
    );
    Promise.all(randomPatternPromises)
      .then(res => {
        const urls = res.map(x => x.data[0].imageUrl.replace('http', 'https'));
        setRandomSquarePatterns([...randomSquarePatterns, ...urls]);

        const preload = urls.map(url => ({uri: url}));
        FastImage.preload(preload);
      })
      .catch(e => {
        setRandomSquarePatterns([
          ...randomSquarePatterns,
          ...[...Array(ITEMS_EACH_FETCH)].map(randomColor),
        ]);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (
      randomSquarePatterns.length > 0 &&
      randomSquarePatterns.length - shapeList.length < ITEMS_LEFT_TO_FETCH_AGAIN
    ) {
      // expand the list to make sure always enough items to generate
      setRandomSquarePatterns([
        ...randomSquarePatterns,
        ...randomSquarePatterns.slice(0, ITEMS_EACH_FETCH),
      ]);
      expandColorList();
    }
  }, [shapeList, randomSquarePatterns]);

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
      Math.abs(lastRealPosition.current.x - newX) > 5 ||
      Math.abs(lastRealPosition.current.y - newY) > 5;

    // if close to last shape position, put the new one nearby
    if (!isNew) {
      newX = lastPosition.x + 10;
      newY = lastPosition.y + 10;
    }

    const lastShapeData = randomSquarePatterns[shapeList.length];

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
            left: newX,
            transform: [{translateX: _translateX}, {translateY: _translateY}],
          }}
          collapsable={false}>
          <Square size={randomShapeSize()} imageSource={lastShapeData} />
        </Animated.View>
      </PanGestureHandler>,
    ]);
    setOldPositions([...oldPositions, {x: newX, y: newY}]);
    setTimeout(() => {
      lastRealPosition.current.x = pageX;
      lastRealPosition.current.y = pageY;
    });
  };

  return (
    <TouchableWithoutFeedback onPress={onBackgroundTouch}>
      <View style={styles.flex}>
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
  flex: {
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

export default SquareScreen;
