import { colors } from "../constants/Colors";

export const getChallengeDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return colors.light.easyGreen;
    case "medium":
      return colors.light.mediumYellow;
    case "hard":
      return colors.light.hardRed;
    default:
      return colors.light.easyGreen;
  }
};
