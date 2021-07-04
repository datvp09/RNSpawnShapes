import React, {useRef} from 'react';
import {View, Image} from 'react-native';
import {TapGestureHandler} from 'react-native-gesture-handler';
import {shadow} from '@utils';
import {
  Svg,
  Defs,
  ClipPath,
  // Image,
  G,
  Circle as CircleSvg,
  Ellipse,
} from 'react-native-svg';

const Circle = ({
  size = 80,
  color = 'green',
  imageSource = '',
  onDoubleTapEvent = () => {},
}) => {
  const doubleTapRef = useRef();

  // return (
  //   <Svg
  //     height={size}
  //     width={size}
  //     style={{...shadow, borderWidth: 1, borderColor: 'red'}}>
  //     <Defs>
  //       <ClipPath id="clip">
  //         <CircleSvg r={size} cx={size} cy={size} />;
  //       </ClipPath>
  //     </Defs>

  //     <G clipPath="url(#clip)">
  //       <Image
  //         href={{
  //           uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJgAAACYCAIAAACXoLd2AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAzfHTVMAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAAASAAAAEgARslrPgAAAAl2cEFnAAAAmAAAAJgAXX8pNQAAA8tJREFUeNrtnUF2wjAMBZVcSZzJnMmcydypi/QV2jg0jiVi9EYrLVpUe/I9ryklIo2lqqq67lNKKaVjfc4552zbl1JKKeveY1bP2rf2072qU1X18EpSSuY7m3OuUiyleMzqWfvWfr4PJ7mUT88lFKEIxTEoCo6s9TiSXHK6QhGKUPweVv0JcOSxteNIcglFKEIxCEXBkbUeR5JLTlco/q7p5/tF5H6//9u/oLvzFdb9sqTb7WbYL1t8vV7/9B6zeta+Va2vNp84+7m33dmlX1Nceo9ZPWs3ycZ04mxyaZiNGYoBKKoqjoxAUXAkjiSXY+USR0ag+HBk/xnSUz270HpleMzqKSvXzIZXn8d6PLzrMaunTE6pydbtHushl3u4zFAMQDGlhCMjUBQciSPJ5Vi5xJERKOLIIBQFR+JIcjlWLnFkBIo4MghFwZE4klyOlUscGYEijgxCUXAkjiSXY+USR0ag+HDk1vuU9r+X8KxzqfXK8CiP838Pi+d+bvrq1+9CO+uKbt1fj/I4OZq4TK0UyeVWnZvLGYoBKOaccWQEioIjrQpHkkscCUUcGYyi4EirwpHkEkdCEUcGoyg40qpwJLnEkVDEkcEoCo60KhxJLnEkFHFkMIqCI60KR5JLHAlFHBmMouBIq8KR5BJHQnHtyOXhJpfL5d/e4/Ole3ah9crwmNWz9q393MPiuZ+bvnrpPT6Z2HZnXyfPY1bP2rf2s4nL1EqRXI6ZyxmKASiWUnBkBIqCI3EkuRwrlzgyAsWHI7kb0FOn3w0Q7rVaFfdaySX3WqHI3yODURQcaVU4klziSCjiyGAUBUdaFY4klzgSijgyGEXBkVaFI8kljoQijgxGUXCkVeFIcokjoYgjg1EUHGlVOJJc4kgo4shgFAVHWhWOJJc4EoprR/b/t43HjnucVx6zPK6A1v8E4hnLNn1PtV6L1Z5nLAfJJc9YjkAx/TxjGYofTVFwJI4kl2PlEkdGoIgjg1AUHIkjyeVYucSRESjiyCAUBUfiSHI5Vi5xZASKODIIRcGROJJcjpVLHBmB4sOR/WeIx4739B6f1/3O94G2vtp84uwet+/pPT7p+Z3vIGx6tenE2eTSMBszFANQVFUcGYGi4EgcSS7HyiWOjEDxyO/xqvrzbc99SmlZ2IE+57xstGFfSlkecfKn95jVs/at/XSv6lRVPbySlJL5zuacqxRLKR6zeta+tZ/vw0ku5dNzCUUoQnEMioIjaz2OJJecrlCEIhS/h1V/Ahx5bO04klxCEYpQDEJRcGStx5HkktMVir/rCx0bhE7MXFvUAAAAJXRFWHRjcmVhdGUtZGF0ZQAyMDE2LTAzLTI1VDAzOjQzOjEzLTA1OjAwnGF4kQAAACV0RVh0bW9kaWZ5LWRhdGUAMjAxNi0wMy0yNVQwMzo0MzoxMy0wNTowMMPQDqUAAAAZdEVYdFNvZnR3YXJlAEFkb2JlIEltYWdlUmVhZHlxyWU8AAAAAElFTkSuQmCC',
  //         }}
  //       />
  //     </G>
  //   </Svg>
  //   // <Svg height={size} width={size} style={shadow}>
  //   //   <CircleSvg cx={size / 2} cy={size / 2} r={size / 2} fill={color} />
  //   // </Svg>
  // );
  // if (imageSource != '') {
  // }
  return (
    <TapGestureHandler
      ref={doubleTapRef}
      onHandlerStateChange={onDoubleTapEvent}
      numberOfTaps={2}>
      <View
        style={{
          ...shadow,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: imageSource == '' ? color : 'transparent',
          // borderWidth: 1,
          // borderColor: 'red',
        }}>
        {imageSource != '' && (
          <Image
            source={{
              uri: imageSource,
            }}
            resizeMode={'cover'}
            style={{flex: 1, borderRadius: size / 2}}
          />
        )}
      </View>
    </TapGestureHandler>
  );
};

export default Circle;
