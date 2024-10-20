// src/constants/Colors.ts

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const colors = {
  light: {
    background: '#F5F5F5',  // Off-white
    primary: '#7798AB',     // Primary Blue
    secondary: '#C3DBC5',   // Light Green
    accent: '#E8DCB9',      // Yellow 
    text: '#0D1B1E',        // Dark Color 
    lightText: '#7F8C8D',   // Light
    cardBg: '#FFFFFF',      // White
    success: '#66BB6A',     // Success 
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export default colors;
