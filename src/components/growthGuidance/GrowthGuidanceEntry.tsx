import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { growthGuidanceService } from "../../services/growthGuidanceService";
import { FeatureActionButton } from "../FeatureActionButton";

export function GrowthGuidanceEntry() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user?.id) return;
    growthGuidanceService
      .fetchCurrentPlan(user.id)
      .then((plan) => active && setHasPlan(!!plan))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <FeatureActionButton
      title={t(hasPlan ? "View your growth plan" : "Build a personal growth plan")}
      subtitle={t(
        hasPlan
          ? "See your direction and the first real-world step."
          : "Describe where you feel stuck and get a practical direction made for you."
      )}
      onPress={() => router.push("/growth-guidance/intake" as never)}
      tone="indigo"
      variant="card"
      fullWidth
    />
  );
}
