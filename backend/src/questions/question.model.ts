export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  prompt: string;
  passage?: string;
  options: Option[];
  correctOptionId: string;
};
