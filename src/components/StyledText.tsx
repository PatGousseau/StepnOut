import { Text as RNText, TextProps } from 'react-native';
import { globalStyles } from '../constants/Styles';

export const Text = (props: TextProps) => {
  const fontFamily = props.style?.fontWeight === 'bold' 
    ? globalStyles.textBold 
    : globalStyles.text;
  
  return <RNText {...props} style={[fontFamily, props.style]} />;
};