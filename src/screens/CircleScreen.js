import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  LayoutAnimation,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import {Circle} from '@components';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import {useIsFocused} from '@react-navigation/native';
import Modal from 'react-native-modal';
import RNShake from 'react-native-shake';
import {
  COLOR_URL,
  ITEMS_EACH_FETCH,
  ITEMS_LEFT_TO_FETCH_AGAIN,
  randomColor,
  randomShapeSize,
} from '@utils';
import axios from 'axios';
import _ from 'lodash';

const CircleScreen = () => {
  const [shapeList, setShapeList] = useState([]);
  const [oldPositions, setOldPositions] = useState([]);
  const [randomCircleColors, setRandomCircleColors] = useState([]);
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

    const size = randomShapeSize();

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
            left: newX - size / 2,
            transform: [{translateX: _translateX}, {translateY: _translateY}],
          }}
          collapsable={false}>
          <Circle size={size} color={randomCircleColors[shapeList.length]} />
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
