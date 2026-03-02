import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  } catch { /* file not found */ }
}
loadEnv(resolve(process.cwd(), '.env.local'));
loadEnv(resolve(process.cwd(), '.env'));

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const W = [
  // ============================
  // FOOD — Kurdish dishes, drinks, cooking
  // ============================
  { de: "Dolma", ku: "Dolma / Yaprax", c: "food" },
  { de: "Kebab", ku: "Kebab", c: "food" },
  { de: "Biryani", ku: "Biryani", c: "food" },
  { de: "Fladenbrot", ku: "Nanê tenûrê / Nanê sac", c: "food" },
  { de: "Linsensuppe", ku: "Şorbeya nîsk", c: "food" },
  { de: "Lammfleisch", ku: "Goştê berx / Goştê mî", c: "food" },
  { de: "Hühnerfleisch", ku: "Goştê mirîşkê", c: "food" },
  { de: "Rindfleisch", ku: "Goştê ga", c: "food" },
  { de: "gebratenes Fleisch", ku: "Goştê biraştî / Goştê qelandî", c: "food" },
  { de: "gegrillt", ku: "biraştî / li ser agir", c: "food" },
  { de: "gekocht", ku: "kelandî / pijandî", c: "food" },
  { de: "roh", ku: "xav", c: "food" },
  { de: "frisch", ku: "teze / nû", c: "food" },
  { de: "verdorben", ku: "xerabûyî / riziyayî", c: "food" },
  { de: "Frühstück", ku: "Taştê / Nîvanê sibê", c: "food" },
  { de: "Mittagessen", ku: "Firavîn / Nîvro", c: "food" },
  { de: "Abendessen", ku: "Şîv / Êvarî", c: "food" },
  { de: "Vorspeise", ku: "Meze / Pêşxwarin", c: "food" },
  { de: "Hauptgericht", ku: "Xwarina sereke", c: "food" },
  { de: "Nachspeise", ku: "Şîranî / Paşxwarin", c: "food" },
  { de: "Baklava", ku: "Beqlawa", c: "food" },
  { de: "Marmelade", ku: "Merbaye / Reçel", c: "food" },
  { de: "Essig", ku: "Sîrke", c: "food" },
  { de: "Zimt", ku: "Darçîn", c: "food" },
  { de: "Kreuzkümmel", ku: "Kemyon / Zîre", c: "food" },
  { de: "Kurkuma", ku: "Zerdçov / Zerdeçav", c: "food" },
  { de: "Minze", ku: "Pûng / Nane", c: "food" },
  { de: "Petersilie", ku: "Bextenûz / Cafer", c: "food" },
  { de: "Spinat", ku: "Spînax / Îspanax", c: "food" },
  { de: "Kohl", ku: "Kelem", c: "food" },
  { de: "Blumenkohl", ku: "Gulbehar / Kelema gul", c: "food" },
  { de: "Zucchini", ku: "Kundir / Kabak", c: "food" },
  { de: "Linsen", ku: "Nîsk", c: "food" },
  { de: "Kichererbsen", ku: "Nok / Leblebî", c: "food" },
  { de: "Bohnen", ku: "Fasûlye", c: "food" },
  { de: "Oliven", ku: "Zeytûn", c: "food" },
  { de: "Sesam", ku: "Kincî / Simsim", c: "food" },
  { de: "Sumach", ku: "Simaq", c: "food" },
  { de: "Safran", ku: "Zeferan", c: "food" },
  { de: "Pfanne", ku: "Tawa / Tabe", c: "food" },
  { de: "Topf", ku: "Tencere / Mencel", c: "food" },
  { de: "Messer", ku: "Kêr", c: "food" },
  { de: "Gabel", ku: "Çetel / Çetal", c: "food" },
  { de: "Löffel", ku: "Kevçî", c: "food" },
  { de: "Teller", ku: "Dewrî / Teyfik", c: "food" },
  { de: "Glas", ku: "Bardax / Cam", c: "food" },
  { de: "Tasse", ku: "Fincan / Qedeh", c: "food" },
  { de: "Schüssel", ku: "Tas / Leyen", c: "food" },
  { de: "Serviette", ku: "Peçete / Desmal", c: "food" },
  { de: "Wasserkocher", ku: "Ketirî / Çaydank", c: "food" },

  // ============================
  // VERBS — daily, emotional, cognitive
  // ============================
  { de: "aufräumen", ku: "paqij kirin / rêxistin kirin", c: "verbs" },
  { de: "bügeln", ku: "ûtû kirin", c: "verbs" },
  { de: "putzen", ku: "paqij kirin / şûştin", c: "verbs" },
  { de: "kehren", ku: "maliştin / gêzîn kirin", c: "verbs" },
  { de: "staubsaugen", ku: "toz kişandin", c: "verbs" },
  { de: "abwaschen", ku: "firaqan şûştin", c: "verbs" },
  { de: "trocknen", ku: "zuha kirin / wişk kirin", c: "verbs" },
  { de: "backen", ku: "nan pêjin / firnê kirin", c: "verbs" },
  { de: "braten", ku: "qelandin / sorkirin", c: "verbs" },
  { de: "mischen", ku: "tevlî kirin / tê hev kirin", c: "verbs" },
  { de: "schälen", ku: "qalix kirin / pêst kirin", c: "verbs" },
  { de: "einladen", ku: "vexwendin / dawet kirin", c: "verbs" },
  { de: "besuchen", ku: "serdana kirin / ziyaret kirin", c: "verbs" },
  { de: "begrüssen", ku: "silav kirin / pêşwazî kirin", c: "verbs" },
  { de: "verabschieden", ku: "xatir xwestin / oxir kirin", c: "verbs" },
  { de: "versprechen", ku: "soz dan / wede dan", c: "verbs" },
  { de: "entschuldigen", ku: "lêborîn xwestin / efû kirin", c: "verbs" },
  { de: "streiten", ku: "şer kirin / pevçûn", c: "verbs" },
  { de: "versöhnen", ku: "lihev hatin / aştî kirin", c: "verbs" },
  { de: "beneiden", ku: "çavnebarî kirin", c: "verbs" },
  { de: "bewundern", ku: "heyran bûn / ecêb man", c: "verbs" },
  { de: "bereuen", ku: "poşman bûn / peşîman bûn", c: "verbs" },
  { de: "sich schämen", ku: "şerm kirin / şermezar bûn", c: "verbs" },
  { de: "erschrecken", ku: "tirsîn / bihejîn", c: "verbs" },
  { de: "sich freuen", ku: "kêfxweş bûn / şa bûn", c: "verbs" },
  { de: "sich ärgern", ku: "hêrs bûn / aciz bûn", c: "verbs" },
  { de: "sich langweilen", ku: "bêzar bûn / aciz bûn", c: "verbs" },
  { de: "sich sorgen", ku: "xem xwarin / fikar kirin", c: "verbs" },
  { de: "hoffen", ku: "hêvî kirin / ûmîd kirin", c: "verbs" },
  { de: "vermuten", ku: "texmîn kirin / guman kirin", c: "verbs" },
  { de: "planen", ku: "plan kirin / bernameya çêkirin", c: "verbs" },
  { de: "entscheiden", ku: "biryar dan", c: "verbs" },
  { de: "vergleichen", ku: "berawird kirin / dan ber hev", c: "verbs" },
  { de: "wählen", ku: "hilbijartin / bijart kirin", c: "verbs" },
  { de: "berechnen", ku: "hesab kirin / jimêr kirin", c: "verbs" },
  { de: "übersetzen", ku: "wergerandin", c: "verbs" },
  { de: "erklären", ku: "rave kirin / şirove kirin", c: "verbs" },
  { de: "unterrichten", ku: "ders dan / hîn kirin", c: "verbs" },
  { de: "studieren", ku: "xwendin / lez xwendin", c: "verbs" },
  { de: "forschen", ku: "lêkolîn kirin", c: "verbs" },
  { de: "beobachten", ku: "temaşe kirin / çav lê bûn", c: "verbs" },
  { de: "messen", ku: "pîvandin", c: "verbs" },
  { de: "zählen", ku: "jimartin / hejmartin", c: "verbs" },
  { de: "teilen", ku: "parve kirin / dabeş kirin", c: "verbs" },
  { de: "sammeln", ku: "berhev kirin / civand kirin", c: "verbs" },
  { de: "ordnen", ku: "rêz kirin / rêxistin kirin", c: "verbs" },
  { de: "verbinden", ku: "girêdan / pêve kirin", c: "verbs" },
  { de: "trennen", ku: "veqetandin / cuda kirin", c: "verbs" },
  { de: "befestigen", ku: "zeliqandin / girê kirin", c: "verbs" },
  { de: "beschützen", ku: "parastin / parastinî kirin", c: "verbs" },

  // ============================
  // ADJECTIVES — personality, physical, quality
  // ============================
  { de: "aufmerksam", ku: "hay ji xwe / bîhna xwe", c: "adjectives" },
  { de: "nachlässig", ku: "guhêşt / bêhay", c: "adjectives" },
  { de: "zuverlässig", ku: "pişt pê tê girtin / misoger", c: "adjectives" },
  { de: "verantwortungsvoll", ku: "berpirsyar", c: "adjectives" },
  { de: "egoistisch", ku: "xweparêz / hodî", c: "adjectives" },
  { de: "hilfsbereit", ku: "alîkar / destiyar", c: "adjectives" },
  { de: "romantisch", ku: "romantîk / evîndar", c: "adjectives" },
  { de: "schüchtern", ku: "şermok / kêmziman", c: "adjectives" },
  { de: "selbstbewusst", ku: "pişta xwe bi xwe ye / xwebawer", c: "adjectives" },
  { de: "abenteuerlich", ku: "serpêhatîdar / macerayî", c: "adjectives" },
  { de: "kreativ", ku: "afirîner / kreatîf", c: "adjectives" },
  { de: "intelligent", ku: "jîr / aqilmend / zîrek", c: "adjectives" },
  { de: "talentiert", ku: "jêhatî / hunermend", c: "adjectives" },
  { de: "erfahren", ku: "serpêhatî / tecrûbeyî", c: "adjectives" },
  { de: "unerfahren", ku: "bê tecrûbe / nû", c: "adjectives" },
  { de: "breit", ku: "fireh / pan", c: "adjectives" },
  { de: "schmal", ku: "teng / zirav", c: "adjectives" },
  { de: "dick", ku: "qelew / stûr", c: "adjectives" },
  { de: "dünn", ku: "zirav / barik", c: "adjectives" },
  { de: "rund", ku: "girdover / gilover", c: "adjectives" },
  { de: "eckig", ku: "goşedar / quncikdar", c: "adjectives" },
  { de: "gerade", ku: "rast / rasterast", c: "adjectives" },
  { de: "krumm", ku: "xwar / çewt", c: "adjectives" },
  { de: "hohl", ku: "qul / vala", c: "adjectives" },
  { de: "fest", ku: "saxlem / hişk", c: "adjectives" },
  { de: "locker", ku: "sist / firax", c: "adjectives" },
  { de: "transparent", ku: "zelal / şefaf", c: "adjectives" },
  { de: "trübe", ku: "tîrewar / nezelal", c: "adjectives" },
  { de: "glänzend", ku: "biriqandî / şewq", c: "adjectives" },
  { de: "matt", ku: "mat / bêşewq", c: "adjectives" },
  { de: "rostig", ku: "jengarî / zengî", c: "adjectives" },
  { de: "staubig", ku: "tozdar / tizî", c: "adjectives" },
  { de: "elegant", ku: "şik / xweşûx", c: "adjectives" },
  { de: "hässlich", ku: "kirêt / nexweşik", c: "adjectives" },
  { de: "gemütlich", ku: "rihet / aramdar", c: "adjectives" },
  { de: "ungemütlich", ku: "nerihet / bêaram", c: "adjectives" },
  { de: "nützlich", ku: "bi kêr / kêrhatî", c: "adjectives" },
  { de: "nutzlos", ku: "bêkêr / bêfêde", c: "adjectives" },
  { de: "möglich", ku: "mimkin / gengaz", c: "adjectives" },
  { de: "unmöglich", ku: "ne mumkin / ne gengaz", c: "adjectives" },

  // ============================
  // PHRASES — more daily conversations
  // ============================
  { de: "Guten Appetit", ku: "Bi xêr bixwin / Nûş can be", c: "phrases", t: 1 },
  { de: "Gesundheit! (beim Niesen)", ku: "Xwedê te biparêze / Elhamdulîllah", c: "phrases", t: 1 },
  { de: "Wie heisst du?", ku: "Navê te çi ye?", c: "phrases", t: 1 },
  { de: "Mein Name ist...", ku: "Navê min ... e", c: "phrases", t: 1 },
  { de: "Woher kommst du?", ku: "Tu ji kwê yî?", c: "phrases", t: 1 },
  { de: "Ich komme aus der Schweiz", ku: "Ez ji Swîsreyê me", c: "phrases", t: 1 },
  { de: "Was machst du beruflich?", ku: "Tu çi kar dikî?", c: "phrases", t: 1 },
  { de: "Ich bin Student", ku: "Ez xwendekar im", c: "phrases", t: 1 },
  { de: "Ich bin verheiratet", ku: "Ez zewicî me", c: "phrases", t: 1 },
  { de: "Ich bin ledig", ku: "Ez bêjin/bêmêr im", c: "phrases", t: 1 },
  { de: "Hast du Kinder?", ku: "Zarokên te hene?", c: "phrases", t: 1 },
  { de: "Ich habe zwei Kinder", ku: "Du zarokên min hene", c: "phrases", t: 1 },
  { de: "Wo arbeitest du?", ku: "Tu li kwê dixebitî?", c: "phrases", t: 1 },
  { de: "Ich mag kurdisches Essen", ku: "Ez ji xwarina kurdî hez dikim", c: "phrases", t: 1 },
  { de: "Das Wetter ist heute schön", ku: "Îro hewa xweş e", c: "phrases", t: 1 },
  { de: "Es regnet", ku: "Baran dibare", c: "phrases", t: 1 },
  { de: "Es schneit", ku: "Berf dibare", c: "phrases", t: 1 },
  { de: "Es ist heiss heute", ku: "Îro germ e", c: "phrases", t: 1 },
  { de: "Es ist kalt heute", ku: "Îro sar e", c: "phrases", t: 1 },
  { de: "Wie geht es deiner Familie?", ku: "Malbata te çawa ye?", c: "phrases", t: 1 },
  { de: "Grüsse deine Familie von mir", ku: "Silava min bide malbata xwe", c: "phrases", t: 1 },
  { de: "Wann hast du Geburtstag?", ku: "Rojbûna te kengî ye?", c: "phrases", t: 1 },
  { de: "Ich bin ... Jahre alt", ku: "Ez ... salî me", c: "phrases", t: 1 },
  { de: "Was ist deine Telefonnummer?", ku: "Jimareya telefonê te çi ye?", c: "phrases", t: 1 },
  { de: "Kannst du das buchstabieren?", ku: "Tu dikarî tîp bi tîp bibêjî?", c: "phrases", t: 1 },
  { de: "Ich habe nicht verstanden", ku: "Min fêm nekir", c: "phrases", t: 1 },
  { de: "Nochmal bitte", ku: "Cardin / Dubare bike", c: "phrases", t: 1 },
  { de: "Was bedeutet dieses Wort?", ku: "Ev peyv çi wateyê dide?", c: "phrases", t: 1 },
  { de: "Wie sagt man ... auf Kurdisch?", ku: "Bi kurdî çawa tê gotin ...?", c: "phrases", t: 1 },
  { de: "Ich übe jeden Tag", ku: "Ez her roj pratîk dikim", c: "phrases", t: 1 },
  // Kurdish proverbs
  { de: "Der Apfel fällt nicht weit vom Stamm", ku: "Sêv ji dara xwe dûr nakeve", c: "phrases", t: 1 },
  { de: "Wer fragt, verirrt sich nicht", ku: "Yê ku dipirse winda nabe", c: "phrases", t: 1 },
  { de: "Geduld bringt Rosen", ku: "Sebir gul dide", c: "phrases", t: 1 },
  { de: "Die Zunge hat keine Knochen", ku: "Di zimanî de hestî tune", c: "phrases", t: 1 },
  { de: "Ein Wort der Wahrheit wiegt schwer", ku: "Peyva rastiyê giran e", c: "phrases", t: 1 },

  // ============================
  // TRAVEL — airport, hotel, transport
  // ============================
  { de: "Flughafen", ku: "Balafirxane / Firokexane", c: "travel" },
  { de: "Check-in", ku: "Tomarkirin / Check-in", c: "travel" },
  { de: "Boarding", ku: "Siwarûn / Ketin balafirê", c: "travel" },
  { de: "Landung", ku: "Daketina balafirê / Nîştin", c: "travel" },
  { de: "Verspätung", ku: "Derengmayîn / Dereng", c: "travel" },
  { de: "Taxi", ku: "Taksî", c: "travel" },
  { de: "Mietwagen", ku: "Erebeya kirêkirî", c: "travel" },
  { de: "Führerschein", ku: "Destûrnameya ajotinê / Ehliyetname", c: "travel" },
  { de: "Strassenkarte", ku: "Nexşeya rê", c: "travel" },
  { de: "Einbahnstrasse", ku: "Rêya yek alî", c: "travel" },
  { de: "Autobahn", ku: "Otoban / Rêya giştî", c: "travel" },
  { de: "Kreisverkehr", ku: "Meydan / Dor", c: "travel" },
  { de: "Ampel", ku: "Çiraya trafîkê / Işiqê rê", c: "travel" },
  { de: "Stau", ku: "Qerebalixî / Trafîk", c: "travel" },
  { de: "Parkplatz", ku: "Parkîng / Cihê parkkirinê", c: "travel" },
  { de: "Einzelzimmer", ku: "Odeyeke yek-kesî", c: "travel" },
  { de: "Doppelzimmer", ku: "Odeyeke du-kesî", c: "travel" },
  { de: "Rezeption", ku: "Resepsîyon / Pêşwergeh", c: "travel" },
  { de: "Schlüssel", ku: "Kilît / Mifteh", c: "travel" },
  { de: "Aufzug", ku: "Asansor / Elevator", c: "travel" },

  // ============================
  // HEALTH — symptoms, medicine
  // ============================
  { de: "Rückenschmerzen", ku: "Piştêş / Êşa piştê", c: "health" },
  { de: "Magenschmerzen", ku: "Zikêş / Êşa zikê", c: "health" },
  { de: "Ohrenschmerzen", ku: "Guhêş / Êşa guh", c: "health" },
  { de: "Halsschmerzen", ku: "Qirikêş / Êşa qirikê", c: "health" },
  { de: "Schwindel", ku: "Gêjbûn / Sersuwar", c: "health" },
  { de: "Übelkeit", ku: "Dilêşandin / Gêjbûna zikê", c: "health" },
  { de: "Durchfall", ku: "Íshal / Zikçûn", c: "health" },
  { de: "Verstopfung", ku: "Qebzî / Zagirtûn", c: "health" },
  { de: "Blutung", ku: "Xwînrêjî / Xwîn çûn", c: "health" },
  { de: "Verstauchung", ku: "Birîndarkirin / Xweberzirandin", c: "health" },
  { de: "Bruch (Knochen)", ku: "Şikestina hestiyê", c: "health" },
  { de: "Wunde", ku: "Birîn", c: "health" },
  { de: "Narbe", ku: "Nîşan / Nîşaneya birînê", c: "health" },
  { de: "Spritze", ku: "Derzî / Îgne", c: "health" },
  { de: "Rezept (ärztlich)", ku: "Reçete / Destore", c: "health" },
  { de: "Bluttest", ku: "Testa xwînê / Tehlîla xwînê", c: "health" },
  { de: "Röntgen", ku: "Rontgen / Tîşka X", c: "health" },
  { de: "Diagnose", ku: "Teşxîs / Diyagnoz", c: "health" },
  { de: "Therapie", ku: "Dermankirinî / Tedawî", c: "health" },
  { de: "Genesung", ku: "Başbûn / Qencbûn", c: "health" },

  // ============================
  // EDUCATION — school, university
  // ============================
  { de: "Vorlesung", ku: "Ders / Waneh", c: "education" },
  { de: "Seminar", ku: "Semînar", c: "education" },
  { de: "Referat", ku: "Pêşkêşkirin / Rapor", c: "education" },
  { de: "Note", ku: "Not / Nîşan", c: "education" },
  { de: "bestehen (Prüfung)", ku: "derbas bûn / serkeftin", c: "education" },
  { de: "durchfallen", ku: "têk çûn / serneketin", c: "education" },
  { de: "Professor", ku: "Profesor / Mamostayê zanistgehê", c: "education" },
  { de: "Semester", ku: "Semesterek / Nîvsalî", c: "education" },
  { de: "Forschung", ku: "Lêkolîn / Vekolîn", c: "education" },
  { de: "Experiment", ku: "Cerribandin / Tecrûbe", c: "education" },
  { de: "Labor", ku: "Laborator / Ezmûngeh", c: "education" },
  { de: "Aufsatz", ku: "Watar / Nivîsarê xwendinê", c: "education" },
  { de: "Zusammenfassung", ku: "Kurtebîr / Nasname", c: "education" },
  { de: "Wissenschaft", ku: "Zanist", c: "education" },
  { de: "Chemie", ku: "Kîmya", c: "education" },
  { de: "Physik", ku: "Fîzîk", c: "education" },
  { de: "Biologie", ku: "Biyolojî / Jiyanzan", c: "education" },
  { de: "Kunst", ku: "Huner", c: "education" },
  { de: "Philosophie", ku: "Felsefe / Filozofî", c: "education" },
  { de: "Informatik", ku: "Înformatîk / Zanista kompûterê", c: "education" },

  // ============================
  // TECHNOLOGY — internet, social media
  // ============================
  { de: "Website", ku: "Malpera înternetê / Websayt", c: "technology" },
  { de: "Browser", ku: "Gerok / Brawzer", c: "technology" },
  { de: "Suchmaschine", ku: "Motora lêgerînê", c: "technology" },
  { de: "Link", ku: "Girêdan / Lînk", c: "technology" },
  { de: "Profil", ku: "Profîl / Danasîn", c: "technology" },
  { de: "Benutzername", ku: "Navê bikarhêner", c: "technology" },
  { de: "Kommentar", ku: "Şîrove / Koment", c: "technology" },
  { de: "Teilen (online)", ku: "Parve kirin / Share kirin", c: "technology" },
  { de: "Folgen (social media)", ku: "Dûv kirin / Şopandin", c: "technology" },
  { de: "liken", ku: "Hez kirin / Layk kirin", c: "technology" },
  { de: "Hashtag", ku: "Hashtag", c: "technology" },
  { de: "Benachrichtigung", ku: "Agahdarî / Notification", c: "technology" },
  { de: "Einstellungen", ku: "Sazkarî / Mîheng", c: "technology" },
  { de: "Virus", ku: "Vîrus", c: "technology" },
  { de: "Firewall", ku: "Dîwarê agir / Firewall", c: "technology" },
  { de: "Server", ku: "Pêşkêşker / Server", c: "technology" },
  { de: "Cloud", ku: "Ewr / Cloud", c: "technology" },
  { de: "Datenbank", ku: "Bingeha daneyan", c: "technology" },
  { de: "Algorithmus", ku: "Algorîtma", c: "technology" },
  { de: "künstliche Intelligenz", ku: "Aqilê destkerdî / AI", c: "technology" },

  // ============================
  // NATURE — trees, landscapes
  // ============================
  { de: "Eiche", ku: "Berû / Dara berû", c: "nature" },
  { de: "Kiefer", ku: "Çam", c: "nature" },
  { de: "Weide", ku: "Bî", c: "nature" },
  { de: "Obstbaum", ku: "Dara fêkiyan", c: "nature" },
  { de: "Olivenbaum", ku: "Dara zeytûnê", c: "nature" },
  { de: "Feigenbaum", ku: "Dara hêjîrê", c: "nature" },
  { de: "Nussbaum", ku: "Dara gûzê", c: "nature" },
  { de: "Grasland", ku: "Deşt / Çîmenistan", c: "nature" },
  { de: "Höhle", ku: "Şikeft / Qelaw", c: "nature" },
  { de: "Klippe", ku: "Zinar / Lat", c: "nature" },
  { de: "Schlucht", ku: "Gelî / Gelîyê kûr", c: "nature" },
  { de: "Gletscher", ku: "Qeşa / Heşara", c: "nature" },
  { de: "Küste", ku: "Perava deryayê / Kenara", c: "nature" },
  { de: "Sumpf", ku: "Çol / Bêlik", c: "nature" },
  { de: "Teich", ku: "Gola biçûk / Birke", c: "nature" },
  { de: "Bach", ku: "Çemê biçûk / Co", c: "nature" },
  { de: "Staudamm", ku: "Bendav", c: "nature" },
  { de: "Marmor", ku: "Mermer", c: "nature" },
  { de: "Lehm", ku: "Herî / Gel", c: "nature" },
  { de: "Felsen", ku: "Kevir / Lat / Zinar", c: "nature" },

  // ============================
  // ANIMALS — more species
  // ============================
  { de: "Papagei", ku: "Papagan / Tûtî", c: "animals" },
  { de: "Storch", ku: "Leqleq / Hacîleqleq", c: "animals" },
  { de: "Spatz", ku: "Çolê / Çûk", c: "animals" },
  { de: "Nachtigall", ku: "Bilbil", c: "animals" },
  { de: "Falke", ku: "Baz / Şahîn", c: "animals" },
  { de: "Eule", ku: "Kund / Bûm", c: "animals" },
  { de: "Krähe", ku: "Qirrereşk / Qijik", c: "animals" },
  { de: "Schwan", ku: "Qû", c: "animals" },
  { de: "Delphin", ku: "Delfîn", c: "animals" },
  { de: "Wal", ku: "Balena / Nehenga deryayê", c: "animals" },
  { de: "Hai", ku: "Köpekbaliqê / Seqê deryayê", c: "animals" },
  { de: "Krake", ku: "Heştpê", c: "animals" },
  { de: "Krabbe", ku: "Qevjî / Kençer", c: "animals" },
  { de: "Garnele", ku: "Tevnazik / Meyîrkeya deryayê", c: "animals" },
  { de: "Skorpion", ku: "Dûpişk", c: "animals" },
  { de: "Eidechse", ku: "Marmêlok / Sasar", c: "animals" },
  { de: "Schildkröte (Meer)", ku: "Kûsî / Kevjal", c: "animals" },
  { de: "Gazelle", ku: "Xezal", c: "animals" },
  { de: "Hirsch", ku: "Kewroşn / Axkêvî", c: "animals" },
  { de: "Wildschwein", ku: "Beraz", c: "animals" },

  // ============================
  // SPORTS — more types
  // ============================
  { de: "Leichtathletik", ku: "Atletîzm / Werzîşa sivik", c: "sports" },
  { de: "Marathon", ku: "Maraton / Bezên dirêj", c: "sports" },
  { de: "Gewichtheben", ku: "Hilgirtina giranan / Halterfîl", c: "sports" },
  { de: "Turnen", ku: "Jîmnastîk", c: "sports" },
  { de: "Fechten", ku: "Şûrjenî / Eskrîm", c: "sports" },
  { de: "Tischtennis", ku: "Pingpong / Tenîsa maseyê", c: "sports" },
  { de: "Handball", ku: "Topê destî / Handbol", c: "sports" },
  { de: "Hockey", ku: "Hokî", c: "sports" },
  { de: "Skifahren", ku: "Kayakê berf / Skî", c: "sports" },
  { de: "Eislaufen", ku: "Sûrçeka qeşayê", c: "sports" },
  { de: "Bogenschiessen", ku: "Tîrandazî / Tîravêjî", c: "sports" },
  { de: "Reiten", ku: "Hespsiwarî / Siwarî", c: "sports" },
  { de: "Tauchen (Sport)", ku: "Xweberîna avê / Dîvîng", c: "sports" },
  { de: "Rudern", ku: "Belemswarî / Avjenî", c: "sports" },
  { de: "Karate", ku: "Karate", c: "sports" },

  // ============================
  // MUSIC — genres, performance
  // ============================
  { de: "Volksmusik", ku: "Muzîka gelêrî / Stranên gelêrî", c: "music" },
  { de: "Pop-Musik", ku: "Muzîka pop", c: "music" },
  { de: "klassische Musik", ku: "Muzîka klasîk", c: "music" },
  { de: "Rap", ku: "Rap", c: "music" },
  { de: "Jazz", ku: "Jaz / Caz", c: "music" },
  { de: "Oper", ku: "Opera", c: "music" },
  { de: "Orchester", ku: "Orkestra", c: "music" },
  { de: "Album", ku: "Albûm", c: "music" },
  { de: "Bühnne", ku: "Sahnê / Şano", c: "music" },
  { de: "Mikrofon", ku: "Mîkrofon", c: "music" },
  { de: "Aufnahme", ku: "Tomar / Tomarkirin", c: "music" },
  { de: "Playlist", ku: "Rêzika stranan / Playlist", c: "music" },
  { de: "Kopfhörer", ku: "Guhîlk / Kulaklîk", c: "music" },
  { de: "Lautsprecher", ku: "Dengbilindker / Hoparlor", c: "music" },
  { de: "Probe (Musik)", ku: "Prova / Rahênan", c: "music" },

  // ============================
  // HOUSE — furniture, appliances
  // ============================
  { de: "Sofa", ku: "Sofê / Dîwan", c: "house" },
  { de: "Tisch", ku: "Mase / Tawile", c: "house" },
  { de: "Stuhl", ku: "Kursî / Sandalye", c: "house" },
  { de: "Bett", ku: "Nivîn / Textê razanê", c: "house" },
  { de: "Schrank", ku: "Dolap", c: "house" },
  { de: "Spiegel", ku: "Neynik / Awêne", c: "house" },
  { de: "Vorhang", ku: "Perde", c: "house" },
  { de: "Teppich", ku: "Xalîçe / Bermal", c: "house" },
  { de: "Kissen", ku: "Balif / Serîn", c: "house" },
  { de: "Decke (Bettdecke)", ku: "Lihêf / Yorgan", c: "house" },
  { de: "Handtuch", ku: "Xavik / Havlû", c: "house" },
  { de: "Seife", ku: "Sabûn", c: "house" },
  { de: "Shampoo", ku: "Şampûan / Sabûna por", c: "house" },
  { de: "Zahnbürste", ku: "Firçeya diran", c: "house" },
  { de: "Zahnpasta", ku: "Macûna diran", c: "house" },
  { de: "Besen", ku: "Gêzî / Malişt", c: "house" },
  { de: "Eimer", ku: "Setal / Hewr", c: "house" },
  { de: "Staubsauger", ku: "Tozkêş", c: "house" },
  { de: "Ventilator", ku: "Vantilatûr / Hewaker", c: "house" },
  { de: "Ofen", ku: "Sobê / Firn", c: "house" },

  // ============================
  // PLACES — more locations
  // ============================
  { de: "Rathaus", ku: "Şaredarî / Belediye", c: "places" },
  { de: "Polizeistation", ku: "Qereqola polîs", c: "places" },
  { de: "Feuerwache", ku: "Îstasyona agirkujiyê", c: "places" },
  { de: "Gericht", ku: "Dadgeh / Mehkeme", c: "places" },
  { de: "Gefängnis", ku: "Girtîgeh / Zîndan", c: "places" },
  { de: "Friedhof", ku: "Goristange / Qebirstan", c: "places" },
  { de: "Park", ku: "Park / Baxçe", c: "places" },
  { de: "Zoo", ku: "Baxçeya ajalan", c: "places" },
  { de: "Schwimmbad", ku: "Hewza avjeniyê", c: "places" },
  { de: "Sportstudio", ku: "Salona werzîşê / Jîm", c: "places" },
  { de: "Einkaufszentrum", ku: "Navenda bazêrkirinê / Mall", c: "places" },
  { de: "Fabrik", ku: "Karxane / Fabrîka", c: "places" },
  { de: "Bauernhof", ku: "Kebanî / Mezra", c: "places" },
  { de: "Botschaft", ku: "Balyozxane / Safaret", c: "places" },
  { de: "Konsulat", ku: "Konsûlxane", c: "places" },
  { de: "Wechselstube", ku: "Sarrafxane", c: "places" },
  { de: "Waschsalon", ku: "Cilşûştin / Laundry", c: "places" },
  { de: "Büro", ku: "Nivîsgeh / Ofîs", c: "places" },
  { de: "Werkstatt", ku: "Kargehk / Tamîrxane", c: "places" },
  { de: "Lager", ku: "Depo / Embar", c: "places" },

  // ============================
  // POLITICS — more terms
  // ============================
  { de: "Premierminister", ku: "Serokwezîr", c: "politics" },
  { de: "Präsident", ku: "Serok / Serokkomar", c: "politics" },
  { de: "Minister", ku: "Wezîr", c: "politics" },
  { de: "Abgeordneter", ku: "Parlamenter / Endamê parlemanê", c: "politics" },
  { de: "Partei", ku: "Partî / Hizb", c: "politics" },
  { de: "Opposition", ku: "Muxalefet / Opozîsyon", c: "politics" },
  { de: "Verhandlung", ku: "Danûstandin / Muzakere", c: "politics" },
  { de: "Vertrag", ku: "Peyman / Miqawele", c: "politics" },
  { de: "Sanktion", ku: "Ceza / Sîxuriyê", c: "politics" },
  { de: "Korruption", ku: "Gendelî / Fesad", c: "politics" },

  // ============================
  // GRAMMAR — more connectors and question words
  // ============================
  { de: "warum", ku: "çima / bo çi", c: "grammar" },
  { de: "wann", ku: "kengî / kengê", c: "grammar" },
  { de: "wo", ku: "kwê / li kwê", c: "grammar" },
  { de: "wie", ku: "çawa / çiqas", c: "grammar" },
  { de: "welcher", ku: "kîjan / kamê", c: "grammar" },
  { de: "überall", ku: "her derê / li her cih", c: "grammar" },
  { de: "nirgendwo", ku: "tu derê / li tu cih", c: "grammar" },
  { de: "schon", ku: "berê / jixwe", c: "grammar" },
  { de: "noch nicht", ku: "hîn na / hêj na", c: "grammar" },
  { de: "fast", ku: "hema / nêzîkî", c: "grammar" },
  { de: "genug", ku: "bes / têr", c: "grammar" },
  { de: "zu viel", ku: "pir zêde / zêde", c: "grammar" },
  { de: "ungefähr", ku: "nêzîkî / dora", c: "grammar" },
  { de: "besonders", ku: "bi taybetî / nemaze", c: "grammar" },
  { de: "eigentlich", ku: "bi rastî / di rastiyê de", c: "grammar" },

  // ============================
  // CLOTHING — accessories, materials
  // ============================
  { de: "Wolle", ku: "Hirî / Sûf", c: "clothing" },
  { de: "Baumwolle", ku: "Pembû / Loke", c: "clothing" },
  { de: "Seide", ku: "Hevrîşm / Harîr", c: "clothing" },
  { de: "Leder", ku: "Çerm", c: "clothing" },
  { de: "Schmuck", ku: "Zêr û zîv / Xemilandin", c: "clothing" },
  { de: "Ring", ku: "Gustîl / Xizêm", c: "clothing" },
  { de: "Armband", ku: "Bazin / Destband", c: "clothing" },
  { de: "Halskette", ku: "Stûyê / Gerdenk", c: "clothing" },
  { de: "Ohrringe", ku: "Guhark / Guhîlk", c: "clothing" },
  { de: "Uhr (Armband)", ku: "Demjimêr / Saet", c: "clothing" },
  { de: "Schal", ku: "Şal / Gerdenî", c: "clothing" },
  { de: "Stiefel", ku: "Çizme / Potîn", c: "clothing" },
  { de: "Sandalen", ku: "Çarox / Sandalet", c: "clothing" },
  { de: "Turnschuhe", ku: "Pêlavên werzîşê / Spor", c: "clothing" },
  { de: "Pyjama", ku: "Pîjama / Cilê xewê", c: "clothing" },
];

async function seed() {
  console.log(`Inserting ${W.length} new words...`);

  let inserted = 0;
  let skipped = 0;

  for (const word of W) {
    try {
      const result = await db.execute({
        sql: `INSERT INTO words (de, ku, category, is_phrase) VALUES (?, ?, ?, ?)
              ON CONFLICT(de, ku, category) DO NOTHING`,
        args: [word.de, word.ku, word.c, word.t || 0],
      });
      if (result.rowsAffected > 0) inserted++;
      else skipped++;
    } catch {
      skipped++;
    }
  }

  const result = await db.execute('SELECT COUNT(*) as cnt FROM words');
  const total = result.rows[0].cnt;

  console.log(`Done! Inserted: ${inserted}, Skipped (duplicates): ${skipped}`);
  console.log(`Total words in DB: ${total}`);
  process.exit(0);
}

seed().catch((e) => { console.error('Error:', e); process.exit(1); });
