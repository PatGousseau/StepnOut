import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, FlatList } from 'react-native';
import { colors } from '../constants/Colors';

interface Comment {
  id: number; 
  text: string; 
  userName: string; 
}

interface CommentsProps {
  initialComments: Comment[]; 
  onAddComment: (comment: { text: string; userName: string }) => void; 
}

const Comments: React.FC<CommentsProps> = ({ initialComments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [username] = useState('User'); 

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment({ text: newComment, userName: username }); 
      setNewComment(''); 
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={initialComments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.comment}>
            <Text style={styles.commentUser}>{item.userName}:</Text> {item.text}
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
        <Pressable onPress={handleAddComment} style={styles.postButton}>
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
});

export default Comments;
