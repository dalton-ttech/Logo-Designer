import React from 'react';

export enum LogoType {
  Wordmark = 'A',
  Abstract = 'B',
  Combo = 'C',
  LetterMod = 'D',
}

export interface GenerationParams {
  brandName: string;
  keywords: string;
  logoType: LogoType;
  backgroundStyle: string;
  gradientTarget?: string;
  abstractTarget?: string;
  extraDesc?: string;
}

export interface PromptResponse {
  english_prompt: string;
  chinese_explanation: string;
}

export interface GeneratedResult {
  imageUrl: string;
  explanation: string;
}

export interface TypeCardData {
  id: LogoType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}