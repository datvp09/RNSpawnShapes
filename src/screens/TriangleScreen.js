import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TouchableWithoutFeedback,
  LayoutAnimation,
  Animated,
} from 'react-native';
import {Triangle} from '@components';
import {PanGestureHandler, State} from 'react-native-gesture-handler';
import {useIsFocused} from '@react-navigation/native';
import {
  COLOR_URL,
  IMAGE_URL,
  getBase64FromUrl,
  ITEMS_EACH_FETCH,
  ITEMS_LEFT_TO_FETCH_AGAIN,
  randomColor,
  randomShapeSize,
} from '@utils';
import axios from 'axios';
import _ from 'lodash';
import Modal from 'react-native-modal';
import RNShake from 'react-native-shake';

const TriangleScreen = () => {
  const [shapeList, setShapeList] = useState([]);
  const [oldPositions, setOldPositions] = useState([]);
  const [randomData, setRandomData] = useState([]); // color or image
  const [isLoading, setIsLoading] = useState(false);
  const lastRealPosition = useRef({x: 0, y: 0});
  const lastSize = useRef(0);
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
      randomData.length > 0 &&
      randomData.length - shapeList.length < ITEMS_LEFT_TO_FETCH_AGAIN
    ) {
      // expand the list to make sure always enough items to generate
      setRandomData([...randomData, ...randomData.slice(0, ITEMS_EACH_FETCH)]);
      expandColorList();
    }
  }, [shapeList, randomData]);

  const expandColorList = () => {
    const bools = [...Array(ITEMS_EACH_FETCH)].map(() => Math.random() < 0.5);
    const randomPromises = bools.map(bool =>
      bool ? axios.get(COLOR_URL) : axios.get(IMAGE_URL),
    );

    Promise.all(randomPromises)
      .then(res => {
        const colorRes = res.filter((_, index) => bools[index]);
        const imageRes = res.filter((_, index) => !bools[index]);

        // Image from react-native-svg doesn't include prefetch method
        // have to convert to base64 for fast response
        const arrBase64Promises = res
          .filter((_, index) => !bools[index])
          .map(x => {
            const url = x.data[0].imageUrl.replace('http', 'https');
            return getBase64FromUrl(url);
          });

        Promise.all(arrBase64Promises).then(base64Res => {
          setRandomData([
            ...randomData,
            ...bools.map((bool, index) => {
              if (!bool) {
                return base64Res.shift();
              }
              const firstColorRes = colorRes.shift();
              return `#${firstColorRes.data[0].hex}`;
            }),
          ]);
        });
      })
      .catch(e => {
        setRandomData([
          ...randomData,
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
          <Triangle {...props} />
        </Animated.View>
      </PanGestureHandler>,
    ]);
    setOldPositions([...oldPositions, {x: newX - size / 2, y: newY}]);
    setTimeout(() => {
      lastRealPosition.current.x = pageX - size / 2;
      lastRealPosition.current.y = pageY;
    });
    lastSize.current = size;
  };

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

export default TriangleScreen;
