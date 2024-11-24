import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

interface Comment {
  id: number;
  text: string;
  userId: string;
}

interface UserMap {
  [key: string]: {
    username: string;
    name: string;
  }
}

interface CommentsProps {
  initialComments: Comment[];
  onAddComment: (comment: { text: string; userId: string }) => void;
  userMap: UserMap;
}

const Comments: React.FC<CommentsProps> = ({ initialComments, onAddComment, userMap }) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(initialComments);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleAddComment = async () => {
    if (newComment.trim() && user) {
      const newCommentObj = {
        id: Date.now(),
        text: newComment,
        userId: user.id
      };
      setComments(prevComments => [...prevComments, newCommentObj]);
      
      // Add comment and create notification
      const result = await onAddComment(newCommentObj);
      
      // Clear input only if comment was successfully added
      if (result) {
        setNewComment('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.comment}>
            <Text style={styles.commentUser}>
              {userMap[item.userId]?.username || 'Unknown'}:
            </Text> {item.text}
          </Text>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor="#888"
          style={styles.input}
        />
        <Pressable 
          onPress={handleAddComment} 
          style={[
            styles.postButton,
            !user && styles.postButtonDisabled
          ]}
          disabled={!user}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 10,
  },
  comment: {
    marginBottom: 10,
    fontSize: 14,
    color: '#333',
  },
  commentUser: {
    fontWeight: 'bold',
    color: colors.light.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
  },
  postButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  postButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  postButtonDisabled: {
    backgroundColor: colors.light.primary + '80',
  }
});

export default Comments;
