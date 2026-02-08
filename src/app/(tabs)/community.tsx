import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../constants/Colors';
import { Text } from '../../components/StyledText';

export default function CommunityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>community</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    paddingTop: 72,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.light.text,
  },
});
