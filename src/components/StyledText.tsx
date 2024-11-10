import { Text as RNText, TextProps } from 'react-native';
import { globalStyles } from '../constants/Styles';

export const Text = (props: TextProps) => {
  return <RNText {...props} style={[globalStyles.text, props.style]} />;
};