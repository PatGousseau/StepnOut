import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, PanResponder } from 'react-native';
import { Video } from 'expo-av';
import Icon from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';

interface VideoPlayerProps {
  videoUri: string;
  visible: boolean;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUri, visible, onClose }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [swipeY, setSwipeY] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx * 3);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) { // Only respond to downward swipes
          setSwipeY(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) { // Close if swiped down more than 150px
          onClose();
        }
        setSwipeY(0);
      },
    })
  ).current;

  const togglePlayPause = async () => {
    if (status.isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };

  const handleVideoPress = () => {
    setShowControls(prev => !prev);
  };

  // Add autoplay on load
  const handleLoad = async () => {
    await videoRef.current?.playAsync();
  };

  useEffect(() => {
    if (showControls) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide controls after 3 seconds
      
      return () => clearTimeout(timeout);
    }
  }, [showControls]);

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View 
        style={[
          styles.container, 
          { 
            transform: [{ translateY: swipeY }],
            opacity: 1 - Math.min(swipeY / 300, 1) // Add fade effect
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={styles.videoContainer}
          activeOpacity={1}
          onPress={handleVideoPress}
        >
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: videoUri }}
            useNativeControls={false}
            resizeMode="contain"
            isLooping
            onPlaybackStatusUpdate={setStatus}
            onLoad={handleLoad}
            {...panResponder.panHandlers}
          />
          
          {showControls && (
            <>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="times" size={24} color="white" />
              </TouchableOpacity>
              
              <View style={styles.controls}>
                <TouchableOpacity onPress={togglePlayPause} style={styles.playButton}>
                  <Icon name={status.isPlaying ? "pause" : "play"} size={32} color="white" />
                </TouchableOpacity>
                
                <Slider
                  style={styles.slider}
                  value={status.positionMillis || 0}
                  minimumValue={0}
                  maximumValue={status.durationMillis || 0}
                  onSlidingComplete={async (value) => {
                    await videoRef.current?.setPositionAsync(value);
                  }}
                  minimumTrackTintColor="#FFFFFF"
                  maximumTrackTintColor="#888888"
                  thumbTintColor="#FFFFFF"
                  thumbSize={10}
                />
              </View>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  playButton: {
    alignSelf: 'center',
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  slider: {
    width: '100%',
    height: 40,
    backgroundColor: 'transparent',
  },
  closeButton: {
    position: 'absolute',
    backgroundColor: 'transparent',
    top: 50,
    right: 20,
    borderRadius: 15,
    padding: 6,
    zIndex: 1,
  },
});

export default VideoPlayer; 