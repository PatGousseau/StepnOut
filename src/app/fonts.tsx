import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fontsList } from '../constants/fontsList';

const FontsPage = () => {
  const fonts = fontsList
    .split('\n')
    .filter(line => 
      line.trim() && 
      !line.includes('=') && 
      !line.includes('To use') &&
      !line.includes('Android:') &&
      !line.includes('iOS:') &&
      !line.includes('Alternatively')
    )
    .map(font => font.trim());

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {fonts.map((font, index) => (
          <Text
            key={index}
            style={[styles.text, { fontFamily: font }]}
          >
            stepn out - {font}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 20,
  },
  text: {
    fontSize: 24,
    marginVertical: 10,
  },
});

export default FontsPage;