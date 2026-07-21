import type { Lang, Mode, Order } from "./types";

const X = "\u00d7";

/** All user-facing microcopy for one language. */
export interface Strings {
  brand: string;
  suffix: string;
  leadPre: string;
  leadPost: string;
  ktable: string;
  krange: string;
  korder: string;
  kmode: string;
  kchoices: string;
  rAll: string;
  rFirst: string;
  rHard: string;
  rCustom: string;
  from: string;
  to: string;
  oOrder: string;
  oShuffle: string;
  mStudy: string;
  mReveal: string;
  mChoose: string;
  noteStudy: string;
  noteReveal: string;
  noteChoose: string;
  start: string;
  numHint: string;
  ord: Record<Order, string>;
  md: Record<Mode, string>;
  retrying: string;
  cueStudy: string;
  cueHidden: string;
  cueShown: string;
  cueChoose: string;
  pickHint: string;
  fbRight: string;
  fbWrongPre: string;
  fbWrongPost: string;
  next: string;
  back: string;
  reveal: string;
  menu: string;
  keySpace: string;
  subPlain: string;
  subTail: string;
  goAgain: string;
  changeSetup: string;
  tableOf: (n: number) => string;
  wholeTable: (n: number) => string;
  doneH: (n: number) => string;
  subChoose: (right: number, total: number) => string;
  retryBtn: (k: number) => string;
}

export const T: Record<Lang, Strings> = {
  en: {
    brand: "times tables",
    suffix: "— practice",
    leadPre: "set up a session, then press ",
    leadPost: " to begin. nothing is timed, and nothing is scored against you.",
    ktable: "table",
    krange: "range",
    korder: "order",
    kmode: "mode",
    kchoices: "choices",
    rAll: `all ${X}1\u2013${X}10`,
    rFirst: `first half ${X}1\u2013${X}5`,
    rHard: `harder half ${X}6\u2013${X}10`,
    rCustom: "custom",
    from: `from ${X}`,
    to: `to ${X}`,
    oOrder: "in order",
    oShuffle: "shuffled",
    mStudy: "study \u2014 answers shown",
    mReveal: "reveal \u2014 tap to check",
    mChoose: "choose \u2014 multiple choice",
    noteStudy: "read each one out loud, then move on.",
    noteReveal: "say your answer out loud, then reveal it to check.",
    noteChoose: "tap the answer you think is right.",
    start: "start",
    numHint: "or use a number key 2\u20139",
    ord: { seq: "in order", shuffle: "shuffled" },
    md: { study: "study", reveal: "reveal", choose: "choose" },
    retrying: "retrying the missed ones",
    cueStudy: "read it out loud:",
    cueHidden: "say your answer out loud\u2026",
    cueShown: "now you know it. say it again, then move on.",
    cueChoose: "which one is it?",
    pickHint: "tap an answer",
    fbRight: "that\u2019s right.",
    fbWrongPre: "not quite \u2014 ",
    fbWrongPost: ". now you\u2019ve got it.",
    next: "next",
    back: "back",
    reveal: "reveal",
    menu: "menu",
    keySpace: "space",
    subPlain: "you worked through the whole thing, one line at a time.",
    subTail: "that whole table is only ten lines \u2014 you just did the ones you chose.",
    goAgain: "go again",
    changeSetup: "change setup",
    tableOf: (n) => `table of ${n}`,
    wholeTable: (n) => `the whole table of ${n}`,
    doneH: (n) => `table of ${n} \u2014 done.`,
    subChoose: (r, t) => `you got ${r} of ${t} on your own.`,
    retryBtn: (k) => `practise the ${k} missed`,
  },
  pt: {
    brand: "tabuada",
    suffix: "— praticar",
    leadPre: "prepara uma sess\u00e3o e depois carrega em ",
    leadPost: " para come\u00e7ar. n\u00e3o h\u00e1 tempo a contar nem pontua\u00e7\u00e3o contra ti.",
    ktable: "tabuada",
    krange: "intervalo",
    korder: "ordem",
    kmode: "modo",
    kchoices: "op\u00e7\u00f5es",
    rAll: `tudo ${X}1\u2013${X}10`,
    rFirst: `primeira metade ${X}1\u2013${X}5`,
    rHard: `metade dif\u00edcil ${X}6\u2013${X}10`,
    rCustom: "personalizado",
    from: `de ${X}`,
    to: `a ${X}`,
    oOrder: "por ordem",
    oShuffle: "baralhado",
    mStudy: "estudar \u2014 com respostas",
    mReveal: "revelar \u2014 toca para ver",
    mChoose: "escolher \u2014 escolha m\u00faltipla",
    noteStudy: "l\u00ea cada uma em voz alta e depois avan\u00e7a.",
    noteReveal: "diz a resposta em voz alta e depois revela para confirmar.",
    noteChoose: "toca na resposta que achas certa.",
    start: "come\u00e7ar",
    numHint: "ou usa uma tecla de 2 a 9",
    ord: { seq: "por ordem", shuffle: "baralhado" },
    md: { study: "estudar", reveal: "revelar", choose: "escolher" },
    retrying: "a rever os erros",
    cueStudy: "l\u00ea em voz alta:",
    cueHidden: "diz a resposta em voz alta\u2026",
    cueShown: "agora j\u00e1 sabes. diz outra vez e avan\u00e7a.",
    cueChoose: "qual \u00e9?",
    pickHint: "toca numa resposta",
    fbRight: "certo.",
    fbWrongPre: "n\u00e3o \u00e9 bem \u2014 ",
    fbWrongPost: ". agora j\u00e1 sabes.",
    next: "seguinte",
    back: "voltar",
    reveal: "revelar",
    menu: "menu",
    keySpace: "espa\u00e7o",
    subPlain: "passaste por tudo, uma linha de cada vez.",
    subTail: "a tabuada inteira s\u00f3 tem dez linhas \u2014 fizeste as que escolheste.",
    goAgain: "outra vez",
    changeSetup: "mudar defini\u00e7\u00f5es",
    tableOf: (n) => `tabuada do ${n}`,
    wholeTable: (n) => `a tabuada do ${n} inteira`,
    doneH: (n) => `tabuada do ${n} \u2014 feito.`,
    subChoose: (r, t) => `acertaste ${r} de ${t} sozinha.`,
    retryBtn: (k) => `rever as ${k} erradas`,
  },
  it: {
    brand: "tabelline",
    suffix: "— pratica",
    leadPre: "prepara una sessione, poi premi ",
    leadPost: " per iniziare. niente tempo, niente punteggio contro di te.",
    ktable: "tabellina",
    krange: "intervallo",
    korder: "ordine",
    kmode: "modalit\u00e0",
    kchoices: "opzioni",
    rAll: `tutta ${X}1\u2013${X}10`,
    rFirst: `prima met\u00e0 ${X}1\u2013${X}5`,
    rHard: `met\u00e0 difficile ${X}6\u2013${X}10`,
    rCustom: "personalizzato",
    from: `da ${X}`,
    to: `a ${X}`,
    oOrder: "in ordine",
    oShuffle: "mescolata",
    mStudy: "studiare \u2014 con le risposte",
    mReveal: "scoprire \u2014 tocca per controllare",
    mChoose: "scegliere \u2014 a scelta multipla",
    noteStudy: "leggi ogni riga ad alta voce, poi vai avanti.",
    noteReveal: "d\u00ec la risposta ad alta voce, poi scoprila per controllare.",
    noteChoose: "tocca la risposta che pensi sia giusta.",
    start: "inizia",
    numHint: "oppure usa un tasto da 2 a 9",
    ord: { seq: "in ordine", shuffle: "mescolata" },
    md: { study: "studiare", reveal: "scoprire", choose: "scegliere" },
    retrying: "ripasso degli errori",
    cueStudy: "leggi ad alta voce:",
    cueHidden: "d\u00ec la risposta ad alta voce\u2026",
    cueShown: "adesso lo sai. dillo di nuovo e vai avanti.",
    cueChoose: "qual \u00e8?",
    pickHint: "tocca una risposta",
    fbRight: "esatto.",
    fbWrongPre: "non proprio \u2014 ",
    fbWrongPost: ". adesso lo sai.",
    next: "avanti",
    back: "indietro",
    reveal: "scopri",
    menu: "menu",
    keySpace: "spazio",
    subPlain: "hai fatto tutto, una riga alla volta.",
    subTail: "tutta la tabellina \u00e8 solo dieci righe \u2014 hai fatto quelle che hai scelto.",
    goAgain: "ancora",
    changeSetup: "cambia impostazioni",
    tableOf: (n) => `tabellina del ${n}`,
    wholeTable: (n) => `tutta la tabellina del ${n}`,
    doneH: (n) => `tabellina del ${n} \u2014 fatto.`,
    subChoose: (r, t) => `ne hai indovinate ${r} su ${t} da sola.`,
    retryBtn: (k) => `ripassa le ${k} sbagliate`,
  },
};
