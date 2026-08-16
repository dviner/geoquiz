import { Region, SafeQuestion } from "@/lib/types";
import { MapQuestion } from "./MapQuestion";
import { TriviaQuestion } from "./TriviaQuestion";
import { AnswerOptions } from "./AnswerOptions";

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface QuestionCardProps {
  question: SafeQuestion;
  disabled?: boolean;
  selectedIndex?: number | null;
  correctIndex?: number | null;
  onSelect?: (index: number) => void;
  /** Shown only once revealed, for non-map questions whose answer has a sensible place to point to. */
  locationCountryIds?: string[];
  locationRegion?: Region;
  capitalCoordinates?: [number, number];
}

export function QuestionCard({
  question,
  disabled,
  selectedIndex,
  correctIndex,
  onSelect,
  locationCountryIds,
  locationRegion,
  capitalCoordinates,
}: QuestionCardProps) {
  const revealed = correctIndex !== null && correctIndex !== undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-wide text-neutral-400">
        <span className={`rounded-full px-2 py-0.5 font-semibold ${DIFFICULTY_STYLES[question.difficulty]}`}>
          {question.difficulty}
        </span>
        <span>{question.category}</span>
      </div>

      {question.type === "map" && question.countryId ? (
        <>
          <MapQuestion key={question.id} countryIds={[question.countryId]} region={question.region} />
          <TriviaQuestion prompt={question.prompt} />
        </>
      ) : (
        <TriviaQuestion prompt={question.prompt} />
      )}

      <AnswerOptions
        options={question.options}
        disabled={disabled}
        selectedIndex={selectedIndex}
        correctIndex={correctIndex}
        onSelect={onSelect}
      />

      {revealed && question.type === "trivia" && locationCountryIds && locationCountryIds.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-center text-xs uppercase tracking-wide text-neutral-400">Where it is</p>
          <MapQuestion
            key={question.id}
            countryIds={locationCountryIds}
            region={locationRegion}
            markerCoordinates={capitalCoordinates}
          />
        </div>
      )}
    </div>
  );
}
