export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType = "trivia" | "map";
export type Region = "world" | "europe" | "africa" | "asia" | "north-america" | "south-america" | "oceania";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
  sourceUrl: string;
  /** For non-map questions: where to show the answer's location on a map after reveal. Omitted when the answer has no single sensible location (e.g. a continent or a count). */
  locationCountryIds?: string[];
  locationRegion?: Region;
  /** For capital-city questions: [longitude, latitude] of the capital, shown as a pin on the location map after reveal. */
  capitalCoordinates?: [number, number];
}

export interface MapQuestion extends BaseQuestion {
  type: "map";
  countryId: string;
  region?: Region;
}

export interface TriviaQuestion extends BaseQuestion {
  type: "trivia";
}

export type Question = MapQuestion | TriviaQuestion;

/** Question fields safe to send to a client before reveal. */
export type SafeQuestion = Omit<
  BaseQuestion,
  "correctIndex" | "explanation" | "sourceUrl" | "locationCountryIds" | "locationRegion" | "capitalCoordinates"
> &
  Partial<Pick<MapQuestion, "countryId" | "region">>;

export interface Person {
  id: string;
  name: string;
}

export interface AnswerResult {
  personId: string;
  personName: string;
  answerIndex: number | null;
  isCorrect: boolean;
}

export interface DailyStatus {
  answeredCount: number;
  totalCount: number;
  waitingOn: string[];
}

export interface TodayResponseLocked {
  date: string;
  question: SafeQuestion;
  youAnswered: boolean;
  yourAnswerIndex: number | null;
  status: DailyStatus;
  revealed: false;
}

export interface TodayResponseRevealed {
  date: string;
  question: SafeQuestion;
  youAnswered: boolean;
  yourAnswerIndex: number | null;
  status: DailyStatus;
  revealed: true;
  correctIndex: number;
  explanation: string;
  sourceUrl: string;
  locationCountryIds?: string[];
  locationRegion?: Region;
  capitalCoordinates?: [number, number];
  results: AnswerResult[];
}

export type TodayResponse = TodayResponseLocked | TodayResponseRevealed;

export interface PersonStats {
  personId: string;
  personName: string;
  totalAnswered: number;
  totalCorrect: number;
  accuracyPct: number;
  currentStreak: number;
  longestStreak: number;
}

export interface HistoryDay {
  date: string;
  question: SafeQuestion;
  revealed: boolean;
  correctIndex: number | null;
  explanation: string | null;
  sourceUrl: string | null;
  locationCountryIds?: string[];
  locationRegion?: Region;
  capitalCoordinates?: [number, number];
  results: AnswerResult[];
  status: DailyStatus;
}
