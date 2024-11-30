// Generate a consistent color based on a string (user ID in this case)
export const generateColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Generate HSL color with:
    // - consistent saturation (70%)
    // - consistent lightness (65%) for readability
    // - hue based on hash
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 65%)`;
  };
  
  // Create a tint style object for the profile image
  export const getProfileImageTint = (userId: string) => {
    return {
      tint: generateColorFromString(userId),
      opacity: 0.8, // Adjust this value to control the intensity of the tint
    };
  };