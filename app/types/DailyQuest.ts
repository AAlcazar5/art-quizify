export interface DailyQuest {
    id: number;
    label: string;
    current: number;
    goal: number;
    rewardUnlocked: boolean;
    icon: React.ReactNode;
  }