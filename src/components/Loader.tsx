import { ActivityIndicator, View } from 'react-native';
import { colors } from '../constants/Colors';

interface LoaderProps {
  size?: number | 'small' | 'large';
}

export const Loader = ({ size = 'small' }: LoaderProps) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
      <ActivityIndicator size={size} color={colors.light.primary} />
    </View>
  );
};
