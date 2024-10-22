import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import Comments from './Comments'; 
import { colors } from '../constants/Colors';

interface PostProps {
  profilePicture: any; 
  name: string;        
  text?: string;      
  image?: any;     
  likes: number;    
  comments: number;  
}

const Post: React.FC<PostProps> = ({ profilePicture, name, text, image, likes, comments }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentList, setCommentList] = useState<{ id: number; text: string; userName: string }[]>([]); // Adjust type if needed

  const handleAddComment = (comment: string) => {
    if (comment.trim()) {
      const newComment = { id: commentList.length + 1, text: comment, userName: 'User' }; // Replace 'User' with actual user name
      setCommentList([...commentList, newComment]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={profilePicture} style={styles.profilePicture} />
        <Text style={styles.name}>{name}</Text>
      </View>
      {text && <Text style={styles.text}>{text}</Text>}
      {image && <Image source={image} style={styles.postImage} />}
      <View style={styles.footer}>
        <View style={styles.iconContainer}>
          <Icon name="heart" size={16} color="#FF0000" />
          <Text style={styles.iconText}>{likes}</Text>
        </View>
        <TouchableOpacity onPress={() => setShowComments(true)}>
          <View style={styles.iconContainer}>
            <Icon name="comment" size={16} color="#5A5A5A" />
            <Text style={styles.iconText}>{comments}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade" 
        transparent={true}
        visible={showComments}
        onRequestClose={() => setShowComments(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Pressable onPress={() => setShowComments(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
            <Comments 
              initialComments={commentList} 
              onAddComment={handleAddComment} 
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16, 
  },
  iconText: {
    marginLeft: 4,
    fontSize: 14,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Dark transparent background
  },
  modalContainer: {
    justifyContent: 'flex-end',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    backgroundColor: "black"
  },
  modalContent: {
    width: '100%', 
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.light.primary,
  },
});

export default Post;
