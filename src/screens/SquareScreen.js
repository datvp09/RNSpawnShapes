import React, {useState, useRef, useEffect} from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';
import Modal from 'react-native-modal';
import FastImage from 'react-native-fast-image';
import {Square, Circle, Triangle} from '@components';
import {TapGestureHandler, State} from 'react-native-gesture-handler';
import RNShake from 'react-native-shake';
import {
  BIGGEST_SCREEN_PERCENT,
  COLOR_URL,
  IMAGE_URL,
  randomNumberFrom,
  SMALLEST_SCREEN_PERCENT,
  width,
  getBase64FromUrl,
  ITEMS_LEFT_TO_FETCH_AGAIN,
  ITEMS_EACH_FETCH,
  randomColor,
  height,
  timeoutAsync,
} from '@utils';
import axios from 'axios';
import {size} from 'lodash';

const SquareScreen = () => {
  const doubleTapRef = useRef();
  // const headerHeight = useHeaderHeight();
  // const [listRef, setListRef] = useState(Array(shapes.length).fill(useRef()));
  const [shapeList, setShapeList] = useState([]);
  const [oldPositions, setOldPositions] = useState([]);
  const [randomSquarePatterns, setRandomSquarePatterns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const lastRealPosition = useRef({x: 0, y: 0});
  let firstPressTime;
  let secondPressTime;
  let isFirstTap = false;
  let isSecondTap = false;

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
    // cannot use Array.fill, it will create duplicate colors
    // const randomColorOrImage = Array(10).fill(Math.random() < 0.5);

    const randomPatternPromises = [...Array(ITEMS_EACH_FETCH)].map(() =>
      axios.get(IMAGE_URL),
    );
    Promise.all(randomPatternPromises)
      // .then(res => {
      //   const arrBase64Promises = res.map(async x => {
      //     const url = x.data[0].imageUrl.replace('http', 'https');
      //     return getBase64FromUrl(url);
      //   });
      //   Promise.all(arrBase64Promises)
      //     .then(base64Res => {
      //       setRandomSquarePatterns([...randomSquarePatterns, ...base64Res]);
      //     })
      //     .finally(() => setIsLoading(false));
      // })
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

  // useEffect(() => {
  //   console.log('randomSquarePatterns', randomSquarePatterns);
  // }, [randomSquarePatterns]);

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

  const onDoubleTapEvent = (event, index) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      console.log('tappppp', index);

      // axios
      //   .get(COLOR_URL)
      //   .then(res => {
      //     console.log('res: ', res);
      //   })
      //   .catch(e => {
      //     console.log('e: ', e);
      //   });
      // axios({url: COLOR_URL})
      //   .then(res => {
      //     console.log('res: ', res);
      //   })
      //   .catch(e => {
      //     console.log('e: ', e);
      //   });
    }
  };

  return (
    <View
      onTouchStart={async e => {
        // e.persist();

        // if (!firstPressTime) {
        //   isFirstTap = true;
        //   firstPressTime = Date.now();
        // }

        // // setTimeout(() => {
        // //   secondPressTime = Date.now();
        // //   console.log('now-0', firstPressTime, secondPressTime);
        // // }, 200);

        // // await timeoutAsync(300);
        // if (isFirstTap && !isSecondTap) {
        //   secondPressTime = Date.now();
        //   const isDoubleTap = secondPressTime - firstPressTime < 280;
        //   console.log(
        //     'check-x',
        //     firstPressTime,
        //     secondPressTime,
        //     secondPressTime - firstPressTime,
        //   );
        //   if (isDoubleTap) {
        //     firstPressTime = null;
        //     secondPressTime = null;
        //     return;
        //   }
        // }
        // secondPressTime = null;

        if (isLoading) {
          return;
        }
        // setShapeList(
        //   randomSquarePatterns.map((url, index) => {
        //     const percent = randomNumberFrom(
        //       SMALLEST_SCREEN_PERCENT,
        //       BIGGEST_SCREEN_PERCENT,
        //     );
        //     const size = (percent / 100) * width;
        //     const props = {size};

        //     return (
        //       <FastImage
        //         key={index}
        //         style={{width: size, height: size}}
        //         source={{uri: url}}
        //       />
        //     );
        //   }),
        // );
        // return;
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

        const percent = randomNumberFrom(
          SMALLEST_SCREEN_PERCENT,
          BIGGEST_SCREEN_PERCENT,
        );
        const props = {size: (percent / 100) * width};
        const lastShapeData = randomSquarePatterns[shapeList.length];
        console.log('square-log', randomSquarePatterns, lastShapeData);

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
          <TapGestureHandler
            key={shapeList.length}
            ref={doubleTapRef}
            onHandlerStateChange={event =>
              onDoubleTapEvent(event, shapeList.length)
            }
            numberOfTaps={2}>
            <View
              key={shapeList.length}
              style={{
                position: 'absolute',
                top: newY,
                left: newX,
              }}>
              <Square {...props} />
            </View>
          </TapGestureHandler>,
        ]);
        setOldPositions([...oldPositions, {x: newX, y: newY}]);
        setTimeout(() => {
          lastRealPosition.current.x = pageX;
          lastRealPosition.current.y = pageY;
        });
      }}
      style={styles.flex}>
      {shapeList.map((item, index) => item)}
      <Modal
        isVisible={isLoading}
        backdropOpacity={0.25}
        animationIn={'fadeIn'}
        animationOut={'fadeOut'}>
        <View style={styles.spinnerBackground}>
          <ActivityIndicator size={'large'} color={'lightgray'} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    // borderWidth: 1, borderColor: 'red'
  },
  spinnerBackground: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: 'white',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  square: {
    width: 150,
    height: 150,
    backgroundColor: 'red',
    marginTop: 22,
    marginBottom: 22,
  },
});

export default SquareScreen;
