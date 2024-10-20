// src/components/Comments.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';

interface Comment {
  id: number; // Unique identifier for each comment
  text: string; // Comment text
}

interface CommentsProps {
  initialComments: Comment[]; // Existing comments passed as a prop
  onAddComment: (comment: string) => void; // Callback to add a comment
}

const Comments: React.FC<CommentsProps> = ({ initialComments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment); // Call the prop function to add a comment
      setNewComment(''); // Clear the input
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={initialComments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <Text style={styles.comment}>{item.text}</Text>}
      />
      <TextInput
        value={newComment}
        onChangeText={setNewComment}
        placeholder="Add a comment..."
        style={styles.input}
      />
      <Button title="Post" onPress={handleAddComment} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  comment: {
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
});

export default Comments;
