// // src/components/Header.tsx
// import React from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { TabNavigationProp } from '../navigation.d'; // Import your types

// const Header = () => {
//   const navigation = useNavigation<TabNavigationProp>(); // Specify the type here

//   return (
//     <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#fff' }}>
//       <TouchableOpacity onPress={() => navigation.navigate('Home')}>
//         <Text>Home</Text>
//       </TouchableOpacity>
//       <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
//         <Text>Profile</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default Header;
