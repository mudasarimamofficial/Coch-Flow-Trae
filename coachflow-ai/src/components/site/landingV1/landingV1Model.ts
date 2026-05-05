import { defaultLandingV1, type LandingV1Content } from "@/components/site/landingV1Defaults";

export function mergeLandingV1(content: unknown, landingV1: LandingV1Content) {
  const root = (content && typeof content === "object" ? (content as any) : {}) as any;
  return { ...root, landingV1 };
}

export function landingV1Preset() {
  return { landingV1: defaultLandingV1 };
}

