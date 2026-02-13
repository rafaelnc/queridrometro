export const EMOJIS = [
  { emoji: "😊", label: "Feliz" },
  { emoji: "🐍", label: "Cobra" },
  { emoji: "😠", label: "Bravo" },
  { emoji: "🤢", label: "Nojo" },
  { emoji: "❤️", label: "Amor" },
  { emoji: "💣", label: "Bomba" },
  { emoji: "🍌", label: "Banana" },
  { emoji: "💔", label: "Coração partido" },
  { emoji: "🍆", label: "Beringela" },
  { emoji: "🍑", label: "Pêssego" },
] as const;

export type EmojiCode = (typeof EMOJIS)[number]["emoji"];
