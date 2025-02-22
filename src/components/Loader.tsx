import { ActivityIndicator, View } from 'react-native';
import { colors } from '../constants/Colors';


export const Loader = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
      <ActivityIndicator size={'small'} color={colors.light.primary} />
    </View>
  );
};
