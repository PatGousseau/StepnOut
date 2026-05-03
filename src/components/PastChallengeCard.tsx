import React from "react";
import { Challenge } from "../types";
import { ChallengePreviewCard } from "./ChallengePreviewCard";

export function PastChallengeCard({
  challenge,
  onPress,
}: {
  challenge: Challenge;
  onPress: () => void;
}) {
  const filePath = challenge.media?.file_path;

  return (
    <ChallengePreviewCard
      title={challenge.title}
      description={challenge.description}
      difficulty={challenge.difficulty}
      imagePath={filePath}
      onPress={onPress}
    />
  );
}
