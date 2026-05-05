import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function createTermHighlighter(
  termsArray?: Array<{ term: string; explanation: string }>,
) {
  const termsMap: Record<string, string> = {};
  const fallbackTerms: Record<string, string> = {
    hypertension:
      "High blood pressure — when the force of blood against your artery walls is consistently too high.",
    HbA1c:
      "A blood test showing your average blood sugar over the past 2–3 months.",
    eGFR:
      "Estimated Glomerular Filtration Rate — a blood test that measures how well your kidneys are filtering waste.",
    pathology:
      "Laboratory testing of blood, tissue, or other body samples to diagnose disease.",
    chronic: "A condition that lasts for a long time or keeps coming back.",
    inflammation:
      "Swelling, redness, and pain — your body's response to injury or infection.",
  };
  if (termsArray) {
    for (const t of termsArray) {
      termsMap[t.term.toLowerCase()] = t.explanation;
    }
  }
  const allTerms = { ...fallbackTerms, ...termsMap };

  return function highlightTerms(text: string) {
    if (!text || typeof text !== "string") return text;
    const keys = Object.keys(allTerms);
    if (keys.length === 0) return text;
    const regex = new RegExp(
      `\\b(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
      "gi",
    );
    const parts = text.split(regex);
    return parts.map((part, i) => {
      const lower = part.toLowerCase();
      if (allTerms[lower]) {
        return (
          <Tooltip key={i}>
            <TooltipTrigger asChild>
              <span className="cursor-help border-b border-dashed border-primary text-primary font-medium">
                {part}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs border-l-4 border-l-primary">
              <p className="text-sm">{allTerms[lower]}</p>
            </TooltipContent>
          </Tooltip>
        );
      }
      return part;
    });
  };
}
