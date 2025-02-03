/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { YellowBox } from "react-native";

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  pastel: {
    pink: '#FFC6FF',
    red: '#FFADAD',
    orange: '#FFD6A5',
    yellow: '#FDFFB6',
    green: '#CAFFBF',
    turquoise: '#98F5E1',
    cyan: '#9BF6FF',
    blue: '#90DBF4',
    indigo: '#A0C4FF',
    violet: '#BDB2FF'

  },
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
