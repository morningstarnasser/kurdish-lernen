export interface Word {
  de: string;
  ku: string;
  c: string;
  n?: string;
  t?: number;
}

export const WORDS: Word[] = [
  // BEGRÜSSUNGEN
  {de:"Hallo",ku:"Silav",c:"greetings"},{de:"Guten Morgen",ku:"Beyanî baş",c:"greetings"},{de:"Guten Tag",ku:"Rojbaş",c:"greetings"},{de:"Guten Abend",ku:"Êvarî baş",c:"greetings"},{de:"Gute Nacht",ku:"Şevbaş",c:"greetings"},{de:"Wie geht es dir?",ku:"Tu çawan î?",c:"greetings"},{de:"Mir geht es gut",ku:"Ez baş im",c:"greetings"},{de:"Danke",ku:"Spas",c:"greetings"},{de:"Vielen Dank",ku:"Gelek spas",c:"greetings"},{de:"Bitte",ku:"Zehmet nebe",c:"greetings"},{de:"Bitte (Antwort)",ku:"Ser çava",c:"greetings",n:"auf meinen Augen"},{de:"Entschuldigung",ku:"Li min bibore",c:"greetings"},{de:"Ja",ku:"Erê / Belê",c:"greetings"},{de:"Nein",ku:"Na",c:"greetings"},{de:"Willkommen",ku:"Bi xêr hatî",c:"greetings"},{de:"Auf Wiedersehen",ku:"Bi xatirê te",c:"greetings"},{de:"Tschüss",ku:"Xatirê te",c:"greetings"},{de:"Freut mich",ku:"Ez gelek kêfxweş bûm",c:"greetings"},{de:"Mein Name ist...",ku:"Navê min ... e",c:"greetings"},{de:"Wie heisst du?",ku:"Navê te çî ye?",c:"greetings"},{de:"Woher kommst du?",ku:"Tu ji kwê yî?",c:"greetings"},{de:"Ich komme aus...",ku:"Ez ji ... me",c:"greetings"},{de:"Wie geht es Ihnen?",ku:"Hûn çawan in?",c:"greetings",n:"formell"},{de:"Gott sei Dank",ku:"Xwedê şikir",c:"greetings"},{de:"Wenn Gott will",ku:"Înşallah",c:"greetings"},

  // FAMILIE
  {de:"Familie",ku:"Malbat",c:"family"},{de:"Mutter",ku:"Dayk / Dayê",c:"family"},{de:"Vater",ku:"Bavk / Bab",c:"family"},{de:"Bruder",ku:"Bira",c:"family"},{de:"Schwester",ku:"Xwişk",c:"family"},{de:"Sohn",ku:"Kur",c:"family"},{de:"Tochter",ku:"Keç",c:"family"},{de:"Kind",ku:"Zarok / Mindal",c:"family"},{de:"Baby",ku:"Pitik / Sava",c:"family"},{de:"Ehemann",ku:"Mêrd",c:"family"},{de:"Ehefrau",ku:"Jin / Xêzan",c:"family"},{de:"Grossvater",ku:"Bapîr",c:"family"},{de:"Grossmutter",ku:"Dapîr",c:"family"},{de:"Onkel (väterlicherseits)",ku:"Mam",c:"family"},{de:"Onkel (mütterlicherseits)",ku:"Xal",c:"family"},{de:"Tante (väterlicherseits)",ku:"Met",c:"family"},{de:"Tante (mütterlicherseits)",ku:"Xaltî",c:"family"},{de:"Cousin",ku:"Pismam",c:"family"},{de:"Cousine",ku:"Dotmam",c:"family"},{de:"Schwiegervater",ku:"Xezûr",c:"family"},{de:"Schwiegermutter",ku:"Xesû",c:"family"},{de:"Neffe",ku:"Birazer",c:"family"},{de:"Nichte",ku:"Keçbira",c:"family"},{de:"Verwandte",ku:"Xizm",c:"family"},{de:"Zwilling",ku:"Cêwî",c:"family"},{de:"Waise",ku:"Sêwî",c:"family"},{de:"Witwe",ku:"Jinebî",c:"family"},{de:"Witwer",ku:"Mêrebî",c:"family"},

  // ZAHLEN
  {de:"null",ku:"sifir",c:"numbers",n:"0"},{de:"eins",ku:"yek",c:"numbers",n:"1"},{de:"zwei",ku:"du / didu",c:"numbers",n:"2"},{de:"drei",ku:"sê",c:"numbers",n:"3"},{de:"vier",ku:"çar",c:"numbers",n:"4"},{de:"fünf",ku:"pênc",c:"numbers",n:"5"},{de:"sechs",ku:"şeş",c:"numbers",n:"6"},{de:"sieben",ku:"heft",c:"numbers",n:"7"},{de:"acht",ku:"heşt",c:"numbers",n:"8"},{de:"neun",ku:"neh",c:"numbers",n:"9"},{de:"zehn",ku:"deh",c:"numbers",n:"10"},{de:"elf",ku:"yazde",c:"numbers",n:"11"},{de:"zwölf",ku:"dwazde",c:"numbers",n:"12"},{de:"dreizehn",ku:"sêzde",c:"numbers",n:"13"},{de:"vierzehn",ku:"çarde",c:"numbers",n:"14"},{de:"fünfzehn",ku:"pazde",c:"numbers",n:"15"},{de:"zwanzig",ku:"bîst",c:"numbers",n:"20"},{de:"dreissig",ku:"sî",c:"numbers",n:"30"},{de:"vierzig",ku:"çil",c:"numbers",n:"40"},{de:"fünfzig",ku:"pêncî",c:"numbers",n:"50"},{de:"sechzig",ku:"şêst",c:"numbers",n:"60"},{de:"siebzig",ku:"heftê",c:"numbers",n:"70"},{de:"achtzig",ku:"heştê",c:"numbers",n:"80"},{de:"neunzig",ku:"not",c:"numbers",n:"90"},{de:"hundert",ku:"sed",c:"numbers",n:"100"},{de:"tausend",ku:"hezar",c:"numbers",n:"1000"},{de:"erste/r",ku:"yekemîn / ewil",c:"numbers",n:"1."},{de:"halb / Hälfte",ku:"nîv",c:"numbers"},

  // FARBEN
  {de:"rot",ku:"sor",c:"colors"},{de:"blau",ku:"şîn",c:"colors"},{de:"grün",ku:"kesk / sewz",c:"colors"},{de:"gelb",ku:"zerd",c:"colors"},{de:"weiss",ku:"spî",c:"colors"},{de:"schwarz",ku:"reş",c:"colors"},{de:"braun",ku:"qehweyî",c:"colors"},{de:"orange",ku:"pirteqalî",c:"colors"},{de:"rosa",ku:"pembe",c:"colors"},{de:"lila",ku:"binewşî / mor",c:"colors"},{de:"grau",ku:"gewr",c:"colors"},{de:"gold",ku:"zêrîn",c:"colors"},{de:"silber",ku:"zîvîn",c:"colors"},{de:"dunkel",ku:"tarî",c:"colors"},{de:"hell",ku:"ron / ronahî",c:"colors"},

  // KÖRPER
  {de:"Kopf",ku:"Ser",c:"body"},{de:"Auge",ku:"Çav",c:"body"},{de:"Ohr",ku:"Guh",c:"body"},{de:"Nase",ku:"Difn / Lût",c:"body"},{de:"Mund",ku:"Dev",c:"body"},{de:"Zahn",ku:"Diran",c:"body"},{de:"Zunge",ku:"Ziman",c:"body"},{de:"Haar",ku:"Pirç / Por",c:"body"},{de:"Gesicht",ku:"Rû",c:"body"},{de:"Hals",ku:"Stû",c:"body"},{de:"Schulter",ku:"Mil",c:"body"},{de:"Arm",ku:"Qol",c:"body"},{de:"Hand",ku:"Dest",c:"body"},{de:"Finger",ku:"Tilî",c:"body"},{de:"Brust",ku:"Sîng",c:"body"},{de:"Bauch",ku:"Zik / Sik",c:"body"},{de:"Rücken",ku:"Pişt",c:"body"},{de:"Bein",ku:"Laq / Qaç",c:"body"},{de:"Knie",ku:"Çok",c:"body"},{de:"Fuss",ku:"Pê",c:"body"},{de:"Herz",ku:"Dil",c:"body"},{de:"Blut",ku:"Xwîn",c:"body"},{de:"Knochen",ku:"Hêstî",c:"body"},{de:"Haut",ku:"Çerm / Pêst",c:"body"},{de:"Gehirn",ku:"Mêjî",c:"body"},{de:"Bart",ku:"Rih",c:"body"},

  // NATUR
  {de:"Sonne",ku:"Roj / Xor",c:"nature"},{de:"Mond",ku:"Heyv / Mang",c:"nature"},{de:"Stern",ku:"Stêr",c:"nature"},{de:"Himmel",ku:"Asman / Ezman",c:"nature"},{de:"Erde",ku:"Erd",c:"nature"},{de:"Wasser",ku:"Av",c:"nature"},{de:"Feuer",ku:"Agir",c:"nature"},{de:"Luft",ku:"Hewa",c:"nature"},{de:"Wind",ku:"Ba",c:"nature"},{de:"Regen",ku:"Baran",c:"nature"},{de:"Schnee",ku:"Befr",c:"nature"},{de:"Berg",ku:"Çîya",c:"nature"},{de:"Tal",ku:"Gelî / Newal",c:"nature"},{de:"Fluss",ku:"Çem / Rûbar",c:"nature"},{de:"See",ku:"Gol",c:"nature"},{de:"Meer",ku:"Derya / Zerîya",c:"nature"},{de:"Wald",ku:"Daristan",c:"nature"},{de:"Baum",ku:"Dar",c:"nature"},{de:"Blume",ku:"Kulîlk / Gul",c:"nature"},{de:"Stein",ku:"Kevir / Berd",c:"nature"},{de:"Regenbogen",ku:"Keskesor",c:"nature"},

  // TIERE
  {de:"Tier",ku:"Ajal / Heywan",c:"animals"},{de:"Hund",ku:"Se / Kûçik",c:"animals"},{de:"Katze",ku:"Pisîk / Kitik",c:"animals"},{de:"Pferd",ku:"Hesp",c:"animals"},{de:"Kuh",ku:"Çêlek / Mange",c:"animals"},{de:"Schaf",ku:"Mih / Pez",c:"animals"},{de:"Ziege",ku:"Bizin",c:"animals"},{de:"Vogel",ku:"Çûçik / Teyr",c:"animals"},{de:"Fisch",ku:"Masî",c:"animals"},{de:"Huhn",ku:"Mirîşk",c:"animals"},{de:"Esel",ku:"Ker",c:"animals"},{de:"Wolf",ku:"Gur",c:"animals"},{de:"Bär",ku:"Hirç",c:"animals"},{de:"Fuchs",ku:"Rovî",c:"animals"},{de:"Löwe",ku:"Şêr",c:"animals"},{de:"Schlange",ku:"Mar",c:"animals"},{de:"Maus",ku:"Mişk",c:"animals"},{de:"Biene",ku:"Hing / Moz",c:"animals"},{de:"Adler",ku:"Eylo / Helo",c:"animals"},{de:"Taube",ku:"Kevok",c:"animals"},{de:"Schmetterling",ku:"Perperûk / Firfirûk",c:"animals"},{de:"Frosch",ku:"Beq",c:"animals"},{de:"Lamm",ku:"Berx",c:"animals"},

  // ESSEN
  {de:"Essen",ku:"Xwarin",c:"food"},{de:"trinken",ku:"vexwarin",c:"food"},{de:"Brot",ku:"Nan",c:"food"},{de:"Milch",ku:"Şîr",c:"food"},{de:"Tee",ku:"Çay",c:"food"},{de:"Kaffee",ku:"Qehwe",c:"food"},{de:"Zucker",ku:"Şekir",c:"food"},{de:"Salz",ku:"Xwê",c:"food"},{de:"Reis",ku:"Birinc",c:"food"},{de:"Fleisch",ku:"Goşt",c:"food"},{de:"Ei",ku:"Hêk",c:"food"},{de:"Käse",ku:"Penîr",c:"food"},{de:"Butter",ku:"Rûn",c:"food"},{de:"Joghurt",ku:"Mast",c:"food"},{de:"Obst",ku:"Fêkî / Mêwe",c:"food"},{de:"Gemüse",ku:"Sebze",c:"food"},{de:"Apfel",ku:"Sêv",c:"food"},{de:"Traube",ku:"Tirî",c:"food"},{de:"Tomate",ku:"Bacan",c:"food"},{de:"Gurke",ku:"Xiyar",c:"food"},{de:"Zwiebel",ku:"Pîvaz",c:"food"},{de:"Kartoffel",ku:"Patate",c:"food"},{de:"Honig",ku:"Hingiv",c:"food"},{de:"Suppe",ku:"Şorbe",c:"food"},{de:"hungrig",ku:"birçî",c:"food"},{de:"durstig",ku:"tî",c:"food"},{de:"satt",ku:"têr",c:"food"},

  // ZEIT
  {de:"Zeit",ku:"Dem / Wext",c:"time"},{de:"heute",ku:"îro",c:"time"},{de:"gestern",ku:"duh",c:"time"},{de:"morgen",ku:"sibe",c:"time"},{de:"jetzt",ku:"niha / nika",c:"time"},{de:"Morgen (Tageszeit)",ku:"Beyanî",c:"time"},{de:"Mittag",ku:"Nîvro",c:"time"},{de:"Abend",ku:"Êvar",c:"time"},{de:"Nacht",ku:"Şev",c:"time"},{de:"Tag",ku:"Roj",c:"time"},{de:"Woche",ku:"Hefte",c:"time"},{de:"Monat",ku:"Meh / Mang",c:"time"},{de:"Jahr",ku:"Sal",c:"time"},{de:"Montag",ku:"Duşem",c:"time"},{de:"Dienstag",ku:"Sêşem",c:"time"},{de:"Mittwoch",ku:"Çarşem",c:"time"},{de:"Donnerstag",ku:"Pêncşem",c:"time"},{de:"Freitag",ku:"Înî / Heynî",c:"time"},{de:"Samstag",ku:"Şemî",c:"time"},{de:"Sonntag",ku:"Yekşem",c:"time"},{de:"Frühling",ku:"Bihar",c:"time"},{de:"Sommer",ku:"Havîn",c:"time"},{de:"Herbst",ku:"Payîz",c:"time"},{de:"Winter",ku:"Zivistan",c:"time"},{de:"früh",ku:"zû",c:"time"},{de:"spät",ku:"dereng",c:"time"},{de:"immer",ku:"her dem / hertim",c:"time"},{de:"nie",ku:"qet / tu car",c:"time"},

  // VERBEN
  {de:"sein",ku:"bûn",c:"verbs"},{de:"haben",ku:"hebûn",c:"verbs"},{de:"gehen",ku:"çûn",c:"verbs"},{de:"kommen",ku:"hatin",c:"verbs"},{de:"machen",ku:"kirin",c:"verbs"},{de:"sagen",ku:"gotin",c:"verbs"},{de:"sehen",ku:"dîtin",c:"verbs"},{de:"hören",ku:"bîstin",c:"verbs"},{de:"wissen",ku:"zanîn",c:"verbs"},{de:"wollen",ku:"xwestin / vîyan",c:"verbs"},{de:"können",ku:"karîn / şiyan",c:"verbs"},{de:"geben",ku:"dan",c:"verbs"},{de:"nehmen",ku:"standin",c:"verbs"},{de:"essen",ku:"xwarin",c:"verbs"},{de:"trinken",ku:"vexwarin",c:"verbs"},{de:"schlafen",ku:"razîn / xewtin",c:"verbs"},{de:"aufstehen",ku:"rabûn",c:"verbs"},{de:"sitzen",ku:"rûniştin",c:"verbs"},{de:"laufen",ku:"bezîn / revîn",c:"verbs"},{de:"arbeiten",ku:"xebitîn / kar kirin",c:"verbs"},{de:"spielen",ku:"lîstin / yarî kirin",c:"verbs"},{de:"lachen",ku:"kenîn / pêkenîn",c:"verbs"},{de:"weinen",ku:"girîn",c:"verbs"},{de:"sprechen",ku:"axaftin / peyivîn",c:"verbs"},{de:"lesen",ku:"xwendin",c:"verbs"},{de:"schreiben",ku:"nivîsandin",c:"verbs"},{de:"lieben",ku:"hez kirin / evîn kirin",c:"verbs"},{de:"kaufen",ku:"kirîn",c:"verbs"},{de:"verkaufen",ku:"firotin",c:"verbs"},{de:"öffnen",ku:"vekirin",c:"verbs"},{de:"schliessen",ku:"girtin",c:"verbs"},{de:"kochen",ku:"pijandin / çêkirin",c:"verbs"},{de:"schneiden",ku:"birîn",c:"verbs"},{de:"lernen",ku:"hîn bûn / fêr bûn",c:"verbs"},{de:"lehren",ku:"hîn kirin / fêr kirin",c:"verbs"},{de:"helfen",ku:"alîkarî kirin",c:"verbs"},{de:"fragen",ku:"pirsîn",c:"verbs"},{de:"antworten",ku:"bersiv dan",c:"verbs"},{de:"verstehen",ku:"fêm kirin / têgihiştin",c:"verbs"},{de:"vergessen",ku:"ji bîr kirin",c:"verbs"},{de:"suchen",ku:"lêgerîn / gerrîn",c:"verbs"},{de:"finden",ku:"dîtin / peyda kirin",c:"verbs"},{de:"fahren",ku:"ajotin",c:"verbs"},{de:"tanzen",ku:"dîlan kirin / govend girtin",c:"verbs"},{de:"beten",ku:"nimêj kirin / dua kirin",c:"verbs"},

  // ADJEKTIVE
  {de:"gut",ku:"baş",c:"adjectives"},{de:"schlecht",ku:"xirab / bed",c:"adjectives"},{de:"gross",ku:"gewre / mezin",c:"adjectives"},{de:"klein",ku:"biçûk / piçûk",c:"adjectives"},{de:"schön",ku:"xweşik / rind / bedew",c:"adjectives"},{de:"hässlich",ku:"kirêt",c:"adjectives"},{de:"alt (Person)",ku:"pîr / kal",c:"adjectives"},{de:"jung",ku:"ciwan / genç",c:"adjectives"},{de:"neu",ku:"nû",c:"adjectives"},{de:"lang",ku:"dirêj",c:"adjectives"},{de:"kurz",ku:"kurt",c:"adjectives"},{de:"schwer",ku:"giran",c:"adjectives"},{de:"leicht",ku:"sivik",c:"adjectives"},{de:"heiss",ku:"germ",c:"adjectives"},{de:"kalt",ku:"sar",c:"adjectives"},{de:"schnell",ku:"lez / bilez",c:"adjectives"},{de:"langsam",ku:"hêdî / aram",c:"adjectives"},{de:"voll",ku:"tije / pirr",c:"adjectives"},{de:"leer",ku:"vala / bettal",c:"adjectives"},{de:"sauber",ku:"paqij",c:"adjectives"},{de:"schmutzig",ku:"pîs / qirêj",c:"adjectives"},{de:"stark",ku:"qewî / xurt",c:"adjectives"},{de:"schwach",ku:"lawaz",c:"adjectives"},{de:"reich",ku:"dewlemend / zengîn",c:"adjectives"},{de:"arm",ku:"feqîr / belengaz",c:"adjectives"},{de:"glücklich",ku:"kêfxweş / bextewer",c:"adjectives"},{de:"traurig",ku:"xemgîn",c:"adjectives"},{de:"müde",ku:"westiyayî",c:"adjectives"},{de:"richtig",ku:"rast / drust",c:"adjectives"},{de:"falsch",ku:"çewt / xelet",c:"adjectives"},{de:"süss",ku:"şîrîn",c:"adjectives"},{de:"bitter",ku:"tal",c:"adjectives"},

  // GRAMMATIK
  {de:"ich",ku:"ez",c:"grammar"},{de:"du",ku:"tu",c:"grammar"},{de:"er/sie/es",ku:"ew",c:"grammar"},{de:"wir",ku:"em",c:"grammar"},{de:"ihr",ku:"hûn",c:"grammar"},{de:"sie (Pl.)",ku:"ew",c:"grammar"},{de:"mein",ku:"yê min / ya min",c:"grammar",n:"m./f."},{de:"dein",ku:"yê te / ya te",c:"grammar",n:"m./f."},{de:"wer?",ku:"kî?",c:"grammar"},{de:"was?",ku:"çi?",c:"grammar"},{de:"wo?",ku:"li kwê?",c:"grammar"},{de:"wann?",ku:"kengî?",c:"grammar"},{de:"warum?",ku:"çima? / bo çi?",c:"grammar"},{de:"wie?",ku:"çawan?",c:"grammar"},{de:"und",ku:"û",c:"grammar"},{de:"oder",ku:"yan",c:"grammar"},{de:"aber",ku:"lê / ema",c:"grammar"},{de:"nicht",ku:"ne / na",c:"grammar"},{de:"mit",ku:"bi / digel",c:"grammar"},{de:"ohne",ku:"bê",c:"grammar"},{de:"hier",ku:"li vir",c:"grammar"},{de:"dort",ku:"li wir / li wê derê",c:"grammar"},{de:"viel",ku:"gelek / pir / zor",c:"grammar"},{de:"wenig",ku:"hindik / kêm",c:"grammar"},

  // HAUS
  {de:"Haus",ku:"Mal / Xanî",c:"house"},{de:"Zimmer",ku:"Ode",c:"house"},{de:"Küche",ku:"Metbex",c:"house"},{de:"Bad",ku:"Hemam / Banyo",c:"house"},{de:"Tür",ku:"Derî",c:"house"},{de:"Fenster",ku:"Pencere",c:"house"},{de:"Wand",ku:"Dîwar",c:"house"},{de:"Dach",ku:"Ban",c:"house"},{de:"Stuhl",ku:"Kursî",c:"house"},{de:"Tisch",ku:"Mase",c:"house"},{de:"Bett",ku:"Nivîn",c:"house"},{de:"Schlüssel",ku:"Kilît / Mifta",c:"house"},{de:"Garten",ku:"Bax / Baxçe",c:"house"},{de:"Strasse",ku:"Rê / Kolan",c:"house"},

  // KLEIDUNG
  {de:"Kleidung",ku:"Cil / Cilûberg",c:"clothing"},{de:"Hemd",ku:"Kiras",c:"clothing"},{de:"Hose",ku:"Pantol / Şalvar",c:"clothing"},{de:"Kleid",ku:"Fistan",c:"clothing"},{de:"Jacke",ku:"Çaket",c:"clothing"},{de:"Schuh",ku:"Sol / Pêlav",c:"clothing"},{de:"Socke",ku:"Gore",c:"clothing"},{de:"Hut",ku:"Koloz / Kumik",c:"clothing"},{de:"Schal",ku:"Şal / Pêçe",c:"clothing"},{de:"Gürtel",ku:"Qayiş",c:"clothing"},{de:"Tasche",ku:"Çente / Tûrik",c:"clothing"},{de:"Ring",ku:"Gustîl / Xezem",c:"clothing"},{de:"Brille",ku:"Berçavk",c:"clothing"},{de:"Uhr",ku:"Saet / Demjimêr",c:"clothing"},

  // BERUFE
  {de:"Lehrer",ku:"Mamoste",c:"professions"},{de:"Arzt",ku:"Doxtor / Bijîşk",c:"professions"},{de:"Ingenieur",ku:"Endaziyar",c:"professions"},{de:"Bauer",ku:"Cotkar",c:"professions"},{de:"Koch",ku:"Aşpêj",c:"professions"},{de:"Polizist",ku:"Polîs",c:"professions"},{de:"Student",ku:"Xwendekar",c:"professions"},{de:"Journalist",ku:"Rojnamevan",c:"professions"},{de:"Fahrer",ku:"Şofêr / Ajokar",c:"professions"},{de:"Richter",ku:"Dadger",c:"professions"},{de:"Anwalt",ku:"Parêzer",c:"professions"},{de:"Bäcker",ku:"Nanpêj",c:"professions"},{de:"Friseur",ku:"Berber / Delak",c:"professions"},{de:"Architekt",ku:"Mîmar",c:"professions"},

  // ORTE
  {de:"Schule",ku:"Dibistan / Xwendingeh",c:"places"},{de:"Universität",ku:"Zanko",c:"places"},{de:"Krankenhaus",ku:"Nexweşxane",c:"places"},{de:"Moschee",ku:"Mizgeft",c:"places"},{de:"Markt",ku:"Bazêr / Sûq",c:"places"},{de:"Restaurant",ku:"Xwarinxane",c:"places"},{de:"Flughafen",ku:"Balafirxane",c:"places"},{de:"Stadt",ku:"Bajar",c:"places"},{de:"Dorf",ku:"Gund",c:"places"},{de:"Land/Heimat",ku:"Welat",c:"places"},{de:"Brücke",ku:"Pir",c:"places"},{de:"Bibliothek",ku:"Pirtûkxane",c:"places"},

  // GEFÜHLE
  {de:"Liebe",ku:"Evîn / Hezkirin",c:"emotions"},{de:"Freude",ku:"Kêf / Xweşî",c:"emotions"},{de:"Trauer",ku:"Xem / Keder",c:"emotions"},{de:"Angst",ku:"Tirs",c:"emotions"},{de:"Wut",ku:"Hêrs",c:"emotions"},{de:"Hoffnung",ku:"Hêvî",c:"emotions"},{de:"Frieden",ku:"Aştî",c:"emotions"},{de:"Glück",ku:"Bext / Şansî",c:"emotions"},{de:"Schmerz",ku:"Êş / Jan",c:"emotions"},{de:"Freundschaft",ku:"Hevaltî / Dostanî",c:"emotions"},{de:"Vertrauen",ku:"Bawerî",c:"emotions"},{de:"Respekt",ku:"Rêz / Hurmet",c:"emotions"},{de:"Mut",ku:"Wêrekî / Cesaret",c:"emotions"},{de:"Geduld",ku:"Sebir / Bîhnfirehî",c:"emotions"},

  // SÄTZE
  {de:"Ich spreche kein Kurdisch",ku:"Ez kurdî nizanim",c:"phrases",t:1},{de:"Ich verstehe nicht",ku:"Ez fêm nakim",c:"phrases",t:1},{de:"Bitte langsam sprechen",ku:"Zehmet nebe hêdî bipeyive",c:"phrases",t:1},{de:"Was bedeutet das?",ku:"Ev çi wateyê dide?",c:"phrases",t:1},{de:"Wo ist die Toilette?",ku:"Tiwalet li kwê ye?",c:"phrases",t:1},{de:"Wie viel kostet das?",ku:"Ev bi çiqas e?",c:"phrases",t:1},{de:"Hilfe!",ku:"Alîkarî! / Hawar!",c:"phrases",t:1},{de:"Ich liebe dich",ku:"Ez ji te hez dikim",c:"phrases",t:1},{de:"Alles Gute zum Geburtstag",ku:"Rojbûna te pîroz be",c:"phrases",t:1},{de:"Ich bin aus der Schweiz",ku:"Ez ji Swîsreyê me",c:"phrases",t:1},{de:"Wo wohnst du?",ku:"Tu li kwê dijî?",c:"phrases",t:1},{de:"Wie alt bist du?",ku:"Tu çend salî yî?",c:"phrases",t:1},{de:"Kannst du mir helfen?",ku:"Tu dikarî alîkariya min bikî?",c:"phrases",t:1},{de:"Willkommen in Kurdistan",ku:"Bi xêr hatî Kurdistanê",c:"phrases",t:1},
];

export const CATEGORIES: Record<string, { label: string; icon: string }> = {
  all: { label: "Alle", icon: "📚" },
  greetings: { label: "Begrüssungen", icon: "👋" },
  family: { label: "Familie", icon: "👨‍👩‍👧‍👦" },
  numbers: { label: "Zahlen", icon: "🔢" },
  colors: { label: "Farben", icon: "🎨" },
  body: { label: "Körper", icon: "🧍" },
  nature: { label: "Natur", icon: "🌿" },
  animals: { label: "Tiere", icon: "🐾" },
  food: { label: "Essen", icon: "🍞" },
  time: { label: "Zeit", icon: "⏰" },
  verbs: { label: "Verben", icon: "⚡" },
  adjectives: { label: "Adjektive", icon: "✨" },
  grammar: { label: "Grammatik", icon: "📝" },
  house: { label: "Haus", icon: "🏠" },
  clothing: { label: "Kleidung", icon: "👔" },
  professions: { label: "Berufe", icon: "💼" },
  places: { label: "Orte", icon: "📍" },
  emotions: { label: "Gefühle", icon: "❤️" },
  phrases: { label: "Sätze", icon: "💬" },
};

export const LEVELS = [
  { id: 0, name: "Silav!", icon: "👋", cat: "greetings", desc: "Begrüssungen", count: 10 },
  { id: 1, name: "Malbat", icon: "👨‍👩‍👧‍👦", cat: "family", desc: "Familie", count: 10 },
  { id: 2, name: "Hejmar", icon: "🔢", cat: "numbers", desc: "Zahlen 1-20", count: 12 },
  { id: 3, name: "Reng", icon: "🎨", cat: "colors", desc: "Farben", count: 10 },
  { id: 4, name: "Laş", icon: "🧍", cat: "body", desc: "Körperteile", count: 12 },
  { id: 5, name: "Xwarin", icon: "🍞", cat: "food", desc: "Essen & Trinken", count: 12 },
  { id: 6, name: "Xweza", icon: "🌿", cat: "nature", desc: "Natur", count: 12 },
  { id: 7, name: "Ajal", icon: "🐾", cat: "animals", desc: "Tiere", count: 10 },
  { id: 8, name: "Dem", icon: "⏰", cat: "time", desc: "Zeit & Tage", count: 12 },
  { id: 9, name: "Lêker I", icon: "⚡", cat: "verbs", desc: "Verben Basis", count: 12 },
  { id: 10, name: "Rengdêr", icon: "✨", cat: "adjectives", desc: "Adjektive", count: 12 },
  { id: 11, name: "Rêziman", icon: "📝", cat: "grammar", desc: "Grammatik", count: 10 },
  { id: 12, name: "Mal", icon: "🏠", cat: "house", desc: "Haus & Wohnen", count: 10 },
  { id: 13, name: "Cil", icon: "👔", cat: "clothing", desc: "Kleidung", count: 10 },
  { id: 14, name: "Kar", icon: "💼", cat: "professions", desc: "Berufe", count: 10 },
  { id: 15, name: "Cih", icon: "📍", cat: "places", desc: "Orte", count: 10 },
  { id: 16, name: "Hest", icon: "❤️", cat: "emotions", desc: "Gefühle", count: 10 },
  { id: 17, name: "Hevok", icon: "💬", cat: "phrases", desc: "Wichtige Sätze", count: 10 },
  { id: 18, name: "Lêker II", icon: "🔥", cat: "verbs", desc: "Verben Fortgeschritten", count: 12 },
  { id: 19, name: "Meister", icon: "🏆", cat: "all", desc: "Alles gemischt!", count: 15 },
];
