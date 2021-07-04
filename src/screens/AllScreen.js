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
import {
  BIGGEST_SCREEN_PERCENT,
  COLOR_URL,
  IMAGE_URL,
  randomNumberFrom,
  SMALLEST_SCREEN_PERCENT,
  width,
  height,
  getBase64FromUrl,
  ITEMS_EACH_FETCH,
  ITEMS_LEFT_TO_FETCH_AGAIN,
  randomColor,
  timeoutAsync,
} from '@utils';
import axios from 'axios';
import _ from 'lodash';
import Modal from 'react-native-modal';
import RNShake from 'react-native-shake';
import {
  PanGestureHandler,
  State,
  TapGestureHandler,
  PanGestureHandlerGestureEvent,
  RotationGestureHandler,
  PinchGestureHandler,
} from 'react-native-gesture-handler';
import {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

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
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const doubleTapRef = useRef();
  const pinchRef = useRef();

  // const onGestureEvent = useAnimatedGestureHandler({
  //   onStart: (_event, ctx) => {
  //     ctx.x = translateX.value;
  //     ctx.y = translateY.value;
  //   },
  //   onActive: ({translationX, translationY}) => {
  //     translateX.value = translationX;
  //     translateY.value = translationY;
  //     // triggered on every frame of the pan gesture
  //   },
  //   onEnd: () => {
  //     // triggered at the end of the pan gesture
  //   },
  // });

  // const animatedStyle = useAnimatedStyle(() => ({
  //   transform: [{translateX: translateX.value}, {translateY: translateY.value}],
  // }));

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
    // console.log('randomData-9', randomData);
  }, [shapeList, randomData]);

  const expandColorList = () => {
    const bools = [...Array(ITEMS_EACH_FETCH)].map(() => Math.random() < 0.5);
    const randomPromises = bools.map(bool =>
      bool ? axios.get(COLOR_URL) : axios.get(IMAGE_URL),
    );

    Promise.all(randomPromises)
      .then(res => {
        const colorRes = res.filter(x => x.data[0].hasOwnProperty('hex'));
        const arrBase64Promises = res
          .filter(x => !x.data[0].hasOwnProperty('hex'))
          .map(x => {
            const url = x.data[0].imageUrl.replace('http', 'https');
            return getBase64FromUrl(url);
          });

        Promise.all(arrBase64Promises).then(base64Res => {
          setRandomData([
            ...randomData,
            ...bools.map((bool, index) => {
              if (bool) {
                const firstColorRes = colorRes.shift();
                return `#${firstColorRes.data[0].hex}`;
              } else {
                return base64Res.shift();
              }
            }),
          ]);
        });
      })
      .catch(e => {
        // console.log('fail-9');
        setRandomData([
          ...randomData,
          ...[...Array(ITEMS_EACH_FETCH)].map(randomColor),
        ]);
      })
      .finally(() => setIsLoading(false));
  };

  let lastPress = 0;
  const onDoublePress = index => {
    const time = new Date().getTime();
    const delta = time - lastPress;

    const DOUBLE_PRESS_DELAY = 400;
    if (delta < DOUBLE_PRESS_DELAY) {
      // Success double press
      console.log('double press');
    }
    lastPress = time;
  };

  // return (
  //   <View style={{paddingTop: 100}}>
  //     <Players />
  //     <Players />
  //   </View>
  // );

  const onBackgroundTouch = async e => {
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
      Math.abs(newX - size / 2 - lastRealPosition.current.x) > 5 ||
      Math.abs(newY - lastRealPosition.current.y) > 5;
    // console.log(
    //   'isNew-tri?',
    //   lastPosition,
    //   newX - lastSize.current / 2 - lastRealPosition.current.x,
    //   // {x: lastRealPosition.current.x, y: lastRealPosition.current.y},
    //   // {x: newX, y: newY},
    //   isNew,
    // );

    // if in history, put nearby
    if (!isNew) {
      newX = lastPosition.x + lastSize.current / 2 + 10;
      newY = lastPosition.y + 10;
    }

    const percent = randomNumberFrom(
      SMALLEST_SCREEN_PERCENT,
      BIGGEST_SCREEN_PERCENT,
    );
    const size = (percent / 100) * width;

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

      <PinchGestureHandler
        key={shapeList.length}
        ref={pinchRef}
        // simultaneousHandlers={doubleTapRef}
        // waitFor={doubleTapRef}
        onGestureEvent={_onPinchGestureEvent}
        onHandlerStateChange={_onPinchHandlerStateChange}>
        {/* <Animated.View style={styles.flex}> */}
        <TapGestureHandler
          ref={doubleTapRef}
          // waitFor={pinchRef}
          numberOfTaps={2}
          onHandlerStateChange={e => {
            if (e.nativeEvent.state === State.ACTIVE) {
              console.log('double tapped');
            }
          }}>
          {/* <Animated.View
          style={[
            {
              width: 200,
              height: 200,
              backgroundColor: 'red',
              top: 100,
              left: 100,
              transform: [{perspective: 200}, {scale: _scale}],
            },
          ]}
          collapsable={false}></Animated.View> */}
          <Animated.View
            style={{
              position: 'absolute',
              top: newY,
              left: randomType == TYPE.square ? newX : newX - size / 2,
              transform: [{perspective: 200}, {scale: _scale}],
            }}
            // onStartShouldSetResponder={evt => onDoublePress(shapeList.length)}
            collapsable={false}>
            <Shape {...props} />
          </Animated.View>
        </TapGestureHandler>
        {/* </Animated.View> */}
      </PinchGestureHandler>,
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

  const _baseScale = new Animated.Value(1);
  const _pinchScale = new Animated.Value(1);
  const _scale = Animated.multiply(_baseScale, _pinchScale);
  let _lastScale = 1;

  const _onPinchHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      _lastScale *= event.nativeEvent.scale;
      _baseScale.setValue(_lastScale);
      _pinchScale.setValue(1);
    }
  };

  const _onPinchGestureEvent = Animated.event(
    [{nativeEvent: {scale: _pinchScale}}],
    {useNativeDriver: true},
  );

  // return (
  //   <View style={{flex: 1}}>
  //     <PinchableBox />
  //   </View>
  // );

  return (
    // <TapGestureHandler
    //   waitFor={doubleTapRef}
    //   onHandlerStateChange={e => {
    //     if (e.nativeEvent.state === State.ACTIVE) {
    //       console.log('single tapped');
    //       onBackgroundTouch(e);
    //     }
    //   }}>
    <TouchableWithoutFeedback onPress={onBackgroundTouch}>
      <View style={styles.container}>
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
    </TouchableWithoutFeedback>
    // </TapGestureHandler>
  );

  return (
    <TouchableWithoutFeedback onPress={onBackgroundTouch}>
      <View style={styles.container}>
        {shapeList.map((item, index) => (
          <View key={index}>{item}</View>
        ))}

        {/* <PinchGestureHandler
        ref={pinchRef}
        onGestureEvent={_onPinchGestureEvent}
        onHandlerStateChange={_onPinchHandlerStateChange}>
        <Animated.View
          style={[
            {
              width: 200,
              height: 200,
              backgroundColor: 'red',
              top: 100,
              left: 100,
              transform: [{perspective: 200}, {scale: _scale}],
            },
          ]}
          collapsable={false}></Animated.View>
      </PinchGestureHandler> */}
        {/* <PinchableBox />
      <PinchableBox /> */}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    // borderWidth: 1,
    // borderColor: 'red',
  },
  spinnerBackground: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  box: {
    position: 'absolute',
    top: 100,
    left: 100,
    width: 200,
    height: 200,
    backgroundColor: 'red',
    // zIndex: 1000,
  },
});

export default AllScreen;

class PinchableBox extends React.Component {
  rotationRef = React.createRef();
  pinchRef = React.createRef();

  constructor(props) {
    super(props);

    /* Pinching */
    this.baseScale = new Animated.Value(1);
    this.pinchScale = new Animated.Value(1);
    this.scale = Animated.multiply(this.baseScale, this.pinchScale);
    this.lastScale = 1;
    this.onPinchGestureEvent = Animated.event(
      [{nativeEvent: {scale: this.pinchScale}}],
      {useNativeDriver: true},
    );

    /* Rotation */
    this.rotate = new Animated.Value(0);
    this.rotateStr = this.rotate.interpolate({
      inputRange: [-100, 100],
      outputRange: ['-100rad', '100rad'],
    });
    this.lastRotate = 0;
    this.onRotateGestureEvent = Animated.event(
      [{nativeEvent: {rotation: this.rotate}}],
      {useNativeDriver: true},
    );
  }

  onRotateHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this.lastRotate += event.nativeEvent.rotation;
      this.rotate.setOffset(this.lastRotate);
      this.rotate.setValue(0);
    }
  };

  onPinchHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      this.lastScale *= event.nativeEvent.scale;
      this.baseScale.setValue(this.lastScale);
      this.pinchScale.setValue(1);
    }
  };

  render() {
    return (
      <RotationGestureHandler
        ref={this.rotationRef}
        simultaneousHandlers={this.pinchRef}
        onGestureEvent={this.onRotateGestureEvent}
        onHandlerStateChange={this.onRotateHandlerStateChange}>
        <Animated.View style={styless.wrapper}>
          <PinchGestureHandler
            ref={this.pinchRef}
            simultaneousHandlers={this.rotationRef}
            onGestureEvent={this.onPinchGestureEvent}
            onHandlerStateChange={this.onPinchHandlerStateChange}>
            {/* <Animated.View style={styless.container} collapsable={false}> */}
            <Animated.View
              style={{
                width: 100,
                height: 100,
                backgroundColor: 'blue',
                transform: [
                  {perspective: 200},
                  {scale: this.scale},
                  {rotate: this.rotateStr},
                ],
              }}
            />
            {/* <Animated.Image
              style={[
                styless.pinchableImage,
                {
                  transform: [
                    {perspective: 200},
                    {scale: this.scale},
                    {rotate: this.rotateStr},
                  ],
                },
              ]}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              source={require('./swmansion.png')}
            /> */}
            {/* </Animated.View> */}
          </PinchGestureHandler>
        </Animated.View>
      </RotationGestureHandler>
    );
  }
}

const styless = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    overflow: 'hidden',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  pinchableImage: {
    width: 250,
    height: 250,
  },
  wrapper: {
    flex: 1,
  },
});
