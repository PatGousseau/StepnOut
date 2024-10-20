import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import Comments from './Comments'; 

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
  const [commentList, setCommentList] = useState<{ id: number; text: string }[]>([]); 

  const handleAddComment = (comment: string) => {
    const newComment = { id: commentList.length + 1, text: comment };
    setCommentList([...commentList, newComment]); 
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
        animationType="slide"
        transparent={true}
        visible={showComments}
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable onPress={() => setShowComments(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
            <Comments 
              initialComments={commentList} 
              onAddComment={handleAddComment} 
            />
          </View>
        </View>
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
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
    flexDirection: 'row', // Set footer to a row
    alignItems: 'center', // Center icons vertically
    marginTop: 10,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16, // Space between icons
  },
  iconText: {
    marginLeft: 4,
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default Post;
