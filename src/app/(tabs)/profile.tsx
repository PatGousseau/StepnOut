import { useLocalSearchParams } from 'expo-router';
import { ProfilePage } from '../../components/ProfilePage';
import { useAuth } from '../../contexts/AuthContext';
import { Text } from '../../components/StyledText';

const ProfileScreen: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Text>Something went wrong!</Text>;
  }
  
  return <ProfilePage userId={user.id} />;
};

export default ProfileScreen;
