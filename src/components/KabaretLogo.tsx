type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: { word: "text-xl", sub: "text-[0.5rem]", gap: "gap-0.5", dot: "w-1.5 h-1.5", line: "w-3" },
  md: { word: "text-3xl", sub: "text-[0.65rem]", gap: "gap-1", dot: "w-2 h-2", line: "w-5" },
  lg: { word: "text-5xl sm:text-6xl", sub: "text-xs sm:text-sm", gap: "gap-2", dot: "w-3 h-3", line: "w-8 sm:w-12" },
};

/** Logo "Kabaret do Rhadonym" — wordmark creme com detalhes geométricos amarelos. */
export default function KabaretLogo({ size = "md", className = "" }: Props) {
  const s = SIZES[size];
  return (
    <div
      className={`kabaret-logo inline-flex flex-col items-center leading-none select-none ${s.gap} ${className}`}
      aria-label="Kabaret do Rhadonym"
      role="img"
    >
      <div className="relative flex items-center">
        <span className={`${s.dot} rounded-full bg-[#ffc400] mr-1.5 self-end mb-[0.2em]`} />
        <span
          className={`font-display font-black tracking-tight text-[#fdf0e0] ${s.word}`}
          style={{ textShadow: "0.06em 0.06em 0 rgba(150,30,0,0.35)" }}
        >
          KABARET
        </span>
        <span className={`${s.dot} rounded-full bg-[#ffc400] absolute -top-[0.35em] -right-[0.5em]`} />
      </div>
      <div className="flex items-center gap-2">
        <span className={`h-[2px] ${s.line} bg-[#ffc400]`} />
        <span className={`font-sans font-semibold tracking-[0.45em] text-[#fdf0e0] ${s.sub}`}>
          DO RHADONYM
        </span>
        <span className={`h-[2px] ${s.line} bg-[#ffc400]`} />
      </div>
    </div>
  );
}
