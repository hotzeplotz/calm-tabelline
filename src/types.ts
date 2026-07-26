export type Lang = "en" | "pt" | "it";
export type Theme = "system" | "light" | "dark";
export type Mode = "study" | "reveal" | "choose";
export type Order = "seq" | "shuffle";
export type View = "menu" | "practice" | "done";

/** One practice question: a × b, where a is the table and b the multiplier. */
export interface Item {
  a: number;
  b: number;
}

/** Full application state. A single mutable object owned by the controller. */
export interface State {
  // preferences (persisted)
  theme: Theme;
  lang: Lang;
  code: boolean; // Bortolato digit colour-coding on/off

  // menu selections
  view: View;
  tables: number[]; // selected tables, ascending, each 2..9, never empty
  start: number; // multiplier lower bound, 1..10
  end: number; // multiplier upper bound, 1..10
  custom: boolean; // custom range chosen (vs a preset)
  order: Order;
  mode: Mode;
  n: number; // number of choices in choose mode, 3..5

  // practice run
  items: Item[]; // ordered questions for this session
  idx: number;
  revealed: boolean; // reveal mode: current answer shown?
  choices: number[]; // choose mode: options for the current item
  picked: number | null; // choose mode: value the child tapped
  done: Record<string, boolean>; // itemKey -> completed this session
  results: Record<string, boolean>; // choose mode: itemKey -> correct?
  retryMode: boolean;
  missed: Item[]; // questions to retry (from a finished choose session)
}
