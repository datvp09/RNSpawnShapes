import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';
import {Triangle} from '@components';
import {TapGestureHandler, State} from 'react-native-gesture-handler';
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

  // useEffect(() => {
  //   console.log('randomData', randomData);
  // }, [randomData]);

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

        Promise.all(arrBase64Promises)
          .then(base64Res => {
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
          })
          .finally(() => setIsLoading(false));
      })
      .catch(e => {
        setRandomData([
          ...randomData,
          ...[...Array(ITEMS_EACH_FETCH)].map(randomColor),
        ]);
      });
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
            <Triangle {...props} />
          </View>,
        ]);
        setOldPositions([...oldPositions, {x: newX - size / 2, y: newY}]);
        setTimeout(() => {
          lastRealPosition.current.x = pageX - size / 2;
          lastRealPosition.current.y = pageY;
        });
        lastSize.current = size;
      }}
      style={styles.container}>
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
