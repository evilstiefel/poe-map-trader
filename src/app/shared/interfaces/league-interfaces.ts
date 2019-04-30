export interface LeagueInfo {
  id: string;
  realm: string;
  description: string;
  startAt: string;
  endAt: string | null;
  delveEvent: boolean;
  rules: string[];
}
