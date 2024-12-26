import { ProfilePage } from '../../components/ProfilePage';
import { useAuth } from '../../contexts/AuthContext';
import { Text } from '../../components/StyledText';
import { Loader } from '@/src/components/Loader';

const ProfileScreen: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Text>Something went wrong!</Text>;
  }
  
  return <ProfilePage userId={user.id} />;
};

export default ProfileScreen;
