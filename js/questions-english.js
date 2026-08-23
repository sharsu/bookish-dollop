/* ═══════════════════════════════════════════════════════════════════
   ENGLISH QUESTION BANK – template generators only

   Built from the scanned papers in question-bank/ (Berry English 1/3/4,
   EPP_QE1–6, QE Mock Papers 1–3, MKT QE English mocks). Those papers all
   follow the GL-style four-part shape:

       Comprehension → Spelling → Punctuation → Word Choice

   so the topics below mirror that, with Vocabulary, Grammar and Literary
   Devices split out of comprehension so the adaptive selector can target
   them individually.

   Format: { id, topic, question, options:[A,B,C,D], answer(0-3), difficulty(1-4) }
   Scale knob: VARIATIONS_PER_TEMPLATE near the bottom.
═══════════════════════════════════════════════════════════════════ */
(() => {
  const root = typeof window !== "undefined" ? window : globalThis;
  const ENGLISH_QUESTIONS = [];
  let id = 60001;

  /* mkE(topic, question, correct, distractors, difficulty, seed) → MCQ object.
     Unlike the maths bank we never pad the option list: if a generator seed
     produces a duplicate option the question is dropped rather than fudged,
     because a near-duplicate wording is a real ambiguity in an English paper. */
  const mkE = (topic, question, correct, distractors, difficulty, seed) => {
    const opts = [`${correct}`];
    distractors.map(v => `${v}`).forEach(v => { if (!opts.includes(v)) opts.push(v); });
    if (opts.length < 4) return null;

    const pos = ((seed % 4) + 4) % 4;
    const rest = opts.slice(1, 4);
    rest.splice(pos, 0, opts[0]);
    return { id: id++, topic, question, options: rest, answer: pos, difficulty };
  };

  /* For the A/B/C/D/N questions the real papers use. The options are labels
     for parts of the question itself, so they must stay in their printed order
     and every label must be offerable — a child who thinks the mistake is in C
     needs to be able to say C. Hence five fixed options, not four shuffled. */
  const mkLabelled = (topic, question, answerIndex, difficulty) => ({
    id: id++,
    topic,
    question,
    options: ["A", "B", "C", "D", "No mistake"],
    answer: answerIndex,
    difficulty
  });

  /* Cycles 1 → 2 → 3 → 4 as the seed advances, the same trick js/questions.js
     uses, extended so every topic also supplies Super Hard (4) questions —
     the quiz selector reserves slots for them. */
  const diff = (i, hardCycle = 5) => {
    if (i % (hardCycle * 2 + 1) === 0) return 4;
    if (i % hardCycle === 0) return 3;
    return i % 2 === 0 ? 2 : 1;
  };
  /* For templates that are intrinsically demanding (effect of a word choice,
     spotting an error in running text) rather than cyclically so. */
  const hardDiff = i => (i % 3 === 0 ? 4 : 3);
  const pick = (arr, i) => arr[((i % arr.length) + arr.length) % arr.length];
  /* Three distinct entries from arr, none of them arr[i]. Used to draw
     distractors out of the same pool the answer came from. */
  const others = (arr, i, count = 3) => {
    const out = [];
    for (let k = 1; out.length < count && k < arr.length; k++) {
      out.push(pick(arr, i + k));
    }
    return out;
  };
  /* Walk a candidate list and keep the first `count` entries that are neither
     the answer nor a repeat, so word-form generators can offer several
     fallbacks without ever emitting a second correct option. */
  const firstDistinct = (correct, candidates, count = 3) => {
    const out = [];
    candidates.forEach(candidate => {
      if (out.length < count && candidate !== correct && !out.includes(candidate)) out.push(candidate);
    });
    return out.length === count ? out : null;
  };

  /* ═══════════════════ COMPREHENSION ═══════════════════
     Original passages written in the register of the scanned papers
     (literary fiction and discursive non-fiction), each followed by the
     question types those papers actually use: retrieval, inference,
     vocabulary-in-context, writer's craft, tone and word class. */

  /* Passages live in js/passages-english.js so the texts can be edited on
     their own. Each is a list of printed lines; every fifth is numbered in the
     margin, the way a real paper sets them, so questions can cite "(line 14)". */
  const PASSAGES = Array.isArray(root.ENGLISH_PASSAGES) ? root.ENGLISH_PASSAGES : [];

  function renderPassage(passage) {
    const heading = passage.attribution ? `${passage.title} ${passage.attribution}` : passage.title;
    // Some texts open mid-story and need a line of context, as the real papers give.
    const intro = passage.intro ? `${passage.intro}\n\n` : "";
    const body = passage.lines.map((line, idx) => {
      const number = idx + 1;
      const margin = number % 5 === 0 ? `${number}`.padStart(2, " ") : "  ";
      return line ? `${margin}  ${line}` : "";
    }).join("\n");
    return `${heading}\n\n${intro}${body}`;
  }

  /* Printed lines, ignoring the blanks between paragraphs. Carried on every
     question so the quiz can tell a long text from a short one. */
  const passageLength = passage => passage.lines.filter(line => line !== "").length;


  /* Comprehension questions are written one at a time rather than generated, so
     the technique is worked out from what the question is asking for. The stems
     are consistent enough across the papers for this to be reliable. */
  function comprehensionTip(stem) {
    const q = stem.toLowerCase();
    if (/closest in meaning|synonym|what does .*mean|which word is closest|\bmeans that\b|tells us that|tells us about/.test(q))
      return "Cover the options and read the sentence the word appears in. Work out the meaning from the surrounding lines first, then find the option that matches.";
    if (/which technique|example of|this is an example/.test(q))
      return "Check the wording, not the feeling. 'Like' or 'as' means a simile; saying one thing IS another is a metaphor; giving something human behaviour is personification.";
    if (/what is the effect|why does the writer|why has the writer|why might the writer|why does the passage|what does .*achieve|what is the writer doing/.test(q))
      return "Ask what the writer gains by this choice. Say what it makes the reader feel or notice, rather than what it describes.";
    if (/what can we infer|what does this suggest|what does this tell us|what does .*reveal|why did|why was|why is/.test(q))
      return "The answer is implied, not stated. Find the line it rests on, then choose the option that line genuinely supports — not the one that merely sounds likely.";
    if (/part of speech|what type of word|what type of words/.test(q))
      return "Ask what the word is doing in that sentence. Naming is a noun, doing is a verb, describing a noun is an adjective, describing a verb is an adverb.";
    if (/\[aside\]|stage direction|which character|who speaks|marked \u201c/.test(q))
      return "In a play nobody narrates, so everything you need is in what the characters say. The name in capitals above a speech tells you whose words follow, and anything in square brackets is an instruction to the actor, not something said aloud.";
    if (/describes[^.?]*\b(tone|mood|atmosphere)\b|the writer's attitude|writer's tone/.test(q))
      return "Tone is the writer's attitude to the subject. Look at the adjectives and verbs they chose, and rule out options that are too strong for the passage.";
    if (/how is the passage organised|structure of|main purpose|writer's purpose|aim of the/.test(q))
      return "Look at what each paragraph does rather than what it says — introduce, explain, give evidence, then challenge or conclude.";
    if (/which two|which of the following statements is true|which sentence from the passage/.test(q))
      return "Test each statement against the passage separately and find the exact line that proves it. Reject anything the passage only implies loosely.";
    if (/what (is|are) .*(describing|proposing|claiming|warning|admitting)|what had made|what do these words|what is .* warning/.test(q))
      return "The quoted words are the whole answer. First say plainly what they describe, then ask what the speaker is doing by choosing to say it that way \u2014 the options are there to separate those two things.";
    if (/what is (strange|odd|surprising|unusual)|what is the contradiction/.test(q))
      return "Something in the wording works against itself. Say what the words claim, then say what they actually do \u2014 the gap between the two is the answer.";
    if (/how does .*(build on|compare|differ)|compared with|difference between .* and/.test(q))
      return "Two things are being set against each other, so hold both in mind. Find what they share first, then the one place they part company.";
    if (/^(who|where|when|how many|what has|what had|what does .*decide)/.test(q))
      return "This one is stated outright in the passage rather than implied. Scan for the name or the thing the question mentions and read the line it sits in \u2014 do not reason it out from memory.";
    return "Go back to the passage and find the line the question points at. Read the sentence before and after it too — the answer usually sits just outside the quoted words.";
  }

  function buildComprehension() {
    const out = [];
    PASSAGES.forEach((passage, pIdx) => {
      /* Every question from one passage carries the same group tag. The quiz
         keeps a group together and consecutive, so a child reads a text once
         and then answers all of its questions before moving to another. */
      const group = `passage:${passage.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
      const rendered = renderPassage(passage);
      passage.questions.forEach((spec, qIdx) => {
        const stem = `Read the passage, then answer the question below.\n\n${rendered}\n\n${spec.q}`;
        const q = mkE("Comprehension", stem, spec.a, spec.d, spec.diff, pIdx * 7 + qIdx);
        if (q) {
          q.group = group;
          q.groupCategory = passage.category;   // Fiction | Non-Fiction | Classic
          q.groupLines = passageLength(passage);
          q.explain = comprehensionTip(spec.q);
          out.push(q);
        }
      });
    });
    return out;
  }

  /* ═══════════════════ SPELLING ═══════════════════ */

  /* [correct, common misspelling, level] — drawn from the spelling sections of
     the Berry and Exam Papers Plus papers, kept in UK spelling throughout.
     The level belongs to the word, not to the template: "friend" and
     "acquiescence" are not the same question with a different noun in it. */
  const SPELLING_PAIRS = [
    ["accommodate", "accomodate", 3], ["achieve", "acheive", 2], ["acquire", "aquire", 3],
    ["acquitted", "aquitted", 4], ["address", "adress", 1], ["amateur", "amature", 3],
    ["apparent", "apparant", 3], ["appearance", "appearence", 2], ["argument", "arguement", 2],
    ["beginning", "begining", 1], ["believe", "beleive", 1], ["business", "buisness", 1],
    ["calendar", "calender", 2], ["ceiling", "cieling", 2], ["cemetery", "cemetary", 3],
    ["colleague", "collegue", 3], ["committee", "commitee", 3], ["conscience", "concience", 4],
    ["conscious", "concious", 3], ["consistently", "consistantly", 3], ["corporate", "coorporate", 4],
    ["courteous", "courtious", 3], ["definitely", "definately", 2], ["desperate", "desperete", 2],
    ["disappear", "dissapear", 2], ["disappoint", "dissapoint", 2], ["embarrass", "embarass", 3],
    ["environment", "enviroment", 2], ["exaggerate", "exagerate", 3], ["excellent", "excelent", 1],
    ["existence", "existance", 3], ["familiar", "familliar", 2], ["fascinate", "facinate", 2],
    ["favourite", "favourate", 1], ["February", "Febuary", 1], ["foreign", "foriegn", 2],
    ["forty", "fourty", 1], ["friend", "freind", 1], ["government", "goverment", 2],
    ["grammar", "grammer", 2], ["guarantee", "garantee", 3], ["harass", "harrass", 4],
    ["height", "heighth", 1], ["humorous", "humerous", 3], ["immaculate", "imaculate", 3],
    ["immediately", "immediatly", 2], ["independent", "independant", 3], ["inoculation", "innoculation", 4],
    ["jewellery", "jewelery", 3], ["knowledge", "knowlege", 2], ["leisure", "liesure", 3],
    ["library", "libary", 1], ["maintenance", "maintainance", 3], ["marvellous", "marvelous", 3],
    ["mischievous", "mischievious", 3], ["necessary", "neccessary", 2], ["neighbour", "nieghbour", 2],
    ["noticeable", "noticable", 3], ["occasion", "ocassion", 2], ["occurred", "occured", 3],
    ["opportunity", "oppertunity", 2], ["parallel", "paralell", 3], ["parliament", "parliment", 3],
    ["perseverance", "perserverance", 4], ["persuade", "pursuade", 2], ["possession", "posession", 3],
    ["potatoes", "potatos", 1], ["precious", "precius", 2], ["privilege", "priviledge", 3],
    ["pronunciation", "pronounciation", 4], ["questionnaire", "questionaire", 4], ["queue", "que", 2],
    ["receive", "recieve", 1], ["recommend", "reccomend", 3], ["restaurant", "restaraunt", 2],
    ["rhythm", "rythm", 3], ["ridiculous", "rediculous", 2], ["secretary", "secratary", 3],
    ["separate", "seperate", 2], ["sincerely", "sincerley", 2], ["successful", "succesful", 2],
    ["surprise", "suprise", 1], ["temperature", "temperture", 2], ["territorial", "terratorial", 4],
    ["thankfully", "thankfuly", 1], ["thorough", "thourough", 3], ["tomorrow", "tomorow", 1],
    ["tongue", "tounge", 2], ["twelfth", "twelth", 3], ["unnecessary", "unecessary", 3],
    ["until", "untill", 1], ["vegetable", "vegtable", 1], ["vengeance", "vengance", 4],
    ["vicious", "visious", 3], ["Wednesday", "Wendsday", 1], ["weird", "wierd", 2],
    /* GL practice papers, question-bank/NewText: the misspellings the papers
       themselves use. */
    ["tournament", "tornament", 3], ["pursued", "persued", 3], ["compulsory", "compulsery", 3],
    ["playful", "playfull", 2], ["climbing", "climing", 2], ["consistent", "consistant", 3],
    ["anticipation", "antisipation", 3], ["nowhere", "knowhere", 2], ["appearance", "appearence", 2],
    ["difference", "differance", 2], ["superior", "superiour", 3], ["elaborate", "elabourate", 3],
    ["obedient", "obediant", 3], ["enthusiastic", "enthusiastick", 2], ["expedition", "expidition", 3],
    ["significant", "significent", 3], ["attendance", "attendence", 3], ["adorable", "adoreable", 2],
    /* QE Boys scholarship spelling workbook (other-papers/Spelling.pdf):
       110 words grouped by letter pattern. The misspelling for each is the
       error its own pattern invites — -able/-ible and -cial/-tial swapped,
       -cies written -cys, doubled letters reduced to one. */
    ["acceptable", "acceptible", 2], ["achievable", "achievible", 2],
    ["advisable", "advisible", 2], ["agreeable", "agreable", 2], ["available", "availible", 2],
    ["avoidable", "avoidible", 2], ["believable", "believible", 2],
    ["breakable", "breakible", 2], ["dependable", "dependible", 2],
    ["enjoyable", "enjoyible", 2], ["comfortable", "comfortible", 3],
    ["considerable", "considerible", 3], ["fashionable", "fashionible", 3],
    ["identifiable", "identifyable", 3], ["knowledgeable", "knowledgable", 3],
    ["manageable", "managable", 3], ["memorable", "memorible", 3],
    ["predictable", "predictible", 3], ["reasonable", "reasonible", 3],
    ["reliable", "relyable", 3], ["remarkable", "remarkible", 3],
    ["respectable", "respectible", 3], ["valuable", "valuible", 3],
    ["accessible", "accessable", 3], ["audible", "audable", 3],
    ["compatible", "compatable", 3], ["comprehensible", "comprehensable", 3],
    ["contemptible", "contemptable", 3], ["credible", "credable", 3], ["edible", "edable", 3],
    ["eligible", "eligable", 3], ["flexible", "flexable", 3], ["gullible", "gullable", 3],
    ["horrible", "horrable", 3], ["illegible", "illegable", 3],
    ["incredible", "incredable", 3], ["irresistible", "irresistable", 3],
    ["invincible", "invincable", 3], ["invisible", "invisable", 3],
    ["permissible", "permissable", 4], ["possible", "possable", 4],
    ["responsible", "responsable", 4], ["reversible", "reversable", 4],
    ["sensible", "sensable", 4], ["susceptible", "susceptable", 4],
    ["terrible", "terrable", 4], ["aggressive", "agressive", 3],
    ["appreciate", "apreciate", 3], ["assessment", "asessment", 3],
    ["brilliant", "briliant", 3], ["communicate", "comunicate", 3],
    ["millennium", "millenium", 3], ["profession", "proffession", 3],
    ["sufficient", "sufficent", 4], ["artificial", "artifitial", 4],
    ["beneficial", "benefitial", 4], ["commercial", "commertial", 4],
    ["crucial", "crutial", 4], ["financial", "finantial", 4], ["official", "offitial", 4],
    ["social", "sotial", 4], ["special", "spetial", 4], ["superficial", "superfitial", 4],
    ["confidential", "confidencial", 4], ["influential", "influencial", 4],
    ["potential", "potencial", 4], ["atrocious", "atrotious", 4],
    ["audacious", "audatious", 4], ["delicious", "delitious", 4],
    ["ferocious", "ferotious", 4], ["gracious", "gratious", 4], ["malicious", "malitious", 4],
    ["suspicious", "suspitious", 4], ["tenacious", "tenatious", 4],
    ["accuracies", "accuracys", 4], ["agencies", "agencys", 4],
    ["conspiracies", "conspiracys", 4], ["delicacies", "delicacys", 4],
    ["democracies", "democracys", 4], ["emergencies", "emergencys", 4],
    ["frequencies", "frequencys", 4], ["inconsistencies", "inconsistencys", 4],
    ["inefficiencies", "inefficiencys", 4], ["legacies", "legacys", 4],
    ["vacancies", "vacancys", 4]
  ];

  /* The trick for a spelling word depends on its own letter pattern, so it is
     derived from the word rather than fixed per template. These are the patterns
     the QE Boys workbook groups its words by. */
  function spellingTip(word) {
    const w = word.toLowerCase();
    if (/cies$/.test(w)) return `Plurals of words ending -cy change the y to i and add es: ${w.slice(0, -3)}y becomes ${w}. Never -cys.`;
    if (/eable$/.test(w)) return `${word} keeps the e of the root before -able, because the e keeps the c or g soft.`;
    if (/iable$/.test(w)) return `${word} ends -iable, not -yable: the y of the root changes to i before the ending.`;
    if (/able$/.test(w)) return `-able is added to a word you can still hear inside it (${w.slice(0, -4)} → ${w}). -ible attaches to roots that cannot stand alone.`;
    if (/ible$/.test(w)) return `${word} takes -ible, because the root cannot stand on its own as a word. Use -able only when it can.`;
    if (/cious$/.test(w)) return `${word} ends -cious, not -tious. The two sound identical, so this one has to be learned by sight.`;
    if (/tious$/.test(w)) return `${word} ends -tious, not -cious. The two sound identical, so learn the whole word.`;
    if (/cial$/.test(w)) return `${word} ends -cial. After a vowel the ending is usually -cial; after a consonant it is usually -tial.`;
    if (/tial$/.test(w)) return `${word} ends -tial. After a consonant the ending is usually -tial; after a vowel it is usually -cial.`;
    const doubled = w.match(/([bcdfglmnprst])\1/);
    if (doubled) return `${word} has a double ${doubled[1]}. Double letters have to be memorised — say the word slowly and picture it written down.`;
    if (/ei|ie/.test(w)) return `Watch the ei/ie order in ${word}. Spelling the letters aloud as you write helps fix it.`;
    return `Break ${word} into syllables and check each one, rather than trusting the overall shape of the word.`;
  }

  function spellFindMisspelt(i) {
    const [right, wrong, level] = pick(SPELLING_PAIRS, i);
    const clean = others(SPELLING_PAIRS, i).map(pair => pair[0]);
    const q = mkE("Spelling",
      "Which one of these four words is spelled incorrectly?",
      wrong, clean, level, i);
    if (q) q.explain = `The correct spelling is "${right}". ${spellingTip(right)}`;
    return q;
  }

  /* Plausible extra misspellings, built by applying the mistakes children
     actually make — never by mangling the start of the word, which produces
     options nobody would ever pick. Returns candidates in priority order. */
  function misspellVariants(word) {
    return [
      word.replace(/ie/, "ei"),
      word.replace(/ei/, "ie"),
      word.replace(/([bcdfglmnprst])\1/, "$1"),                       // lose a doubled letter
      word.replace(/([aeiou])([bcdfglmnprst])([aeiou])/, "$1$2$2$3"),  // double an inner letter
      word.replace(/ent(ly)?$/, "ant$1").replace(/ant(ly)?$/, "ent$1"),
      word.replace(/ence$/, "ance").replace(/ance$/, "ence"),
      word.replace(/able$/, "ible").replace(/ible$/, "able"),
      word.replace(/ary$/, "ery").replace(/ery$/, "ary"),
      word.replace(/ous$/, "ious"),
      word.replace(/([a-z])e$/, "$1")
    ];
  }

  /* These two walk SPELLING_PAIRS, which is far longer than the default
     variation count. Declaring the pool size tells the driver to run enough
     variations to reach every word — without it most of the pool is dead. */
  spellFindMisspelt.poolSize = SPELLING_PAIRS.length;

  function spellChooseCorrect(i) {
    const [right, wrong, level] = pick(SPELLING_PAIRS, i);
    const wrongOptions = firstDistinct(right, [wrong, ...misspellVariants(right)]);
    if (!wrongOptions) return null;
    // Picking the right spelling from four candidates is a shade easier than
    // spotting the odd one out among four different words.
    const q = mkE("Spelling", "Which of these is the correct spelling?",
      right, wrongOptions, Math.max(1, level - 1), i);
    if (q) q.explain = spellingTip(right);
    return q;
  }

  spellChooseCorrect.poolSize = SPELLING_PAIRS.length;

  /* The exam-style "find the mistake in this sentence" question. These are
     written out rather than slotted into a frame: a shared frame cannot host
     both an adverb and a noun without producing nonsense. `ok` lists three
     correctly spelled words from the same sentence to serve as distractors. */
  const SPELL_SENTENCES = [
    { sentence: "The athlete was not consistantly performing well in his races.",
      wrong: "consistantly", ok: ["athlete", "performing", "races"], level: 3 },
    { sentence: "Thankfuly, my new winter coat was not too expensive.",
      wrong: "Thankfuly", ok: ["winter", "expensive", "coat"], level: 1 },
    { sentence: "Mr Evans was an exceedingly polite, honourable and courtious gentleman.",
      wrong: "courtious", ok: ["exceedingly", "honourable", "gentleman"], level: 3 },
    { sentence: "Harjeet was delighted when his mother presented him with his favorite cake.",
      wrong: "favorite", ok: ["delighted", "presented", "mother"], level: 1 },
    { sentence: "The table was laid with imaculate white napkins, folded delicately.",
      wrong: "imaculate", ok: ["napkins", "folded", "delicately"], level: 3 },
    { sentence: "The team needed to aquire lots more information before starting their project.",
      wrong: "aquire", ok: ["information", "starting", "project"], level: 3 },
    { sentence: "Everyone chuckled when they were told about the humerous situation.",
      wrong: "humerous", ok: ["chuckled", "situation", "Everyone"], level: 3 },
    { sentence: "At lunch, the professor passed around a questionnair for the students to complete.",
      wrong: "questionnair", ok: ["professor", "students", "complete"], level: 4 },
    { sentence: "That motorbike is the twelth vehicle which my dad has purchased recently.",
      wrong: "twelth", ok: ["motorbike", "vehicle", "purchased"], level: 3 },
    { sentence: "Apparently, lionesses are more visious than their male counterparts.",
      wrong: "visious", ok: ["Apparently", "lionesses", "counterparts"], level: 3 },
    { sentence: "Many would consider selflessness to be the strongest expresion of love.",
      wrong: "expresion", ok: ["selflessness", "strongest", "consider"], level: 2 },
    { sentence: "Everyone was terrified of the horrors which might lie inside the Egyptian toom.",
      wrong: "toom", ok: ["terrified", "horrors", "Egyptian"], level: 2 },
    { sentence: "My Abyssinian cat causes significant problems because it is terratorial.",
      wrong: "terratorial", ok: ["Abyssinian", "significant", "problems"], level: 4 },
    { sentence: "He vowed to wreak vengance on those who had broken into his house.",
      wrong: "vengance", ok: ["wreak", "vowed", "broken"], level: 4 },
    { sentence: "Some people find his idiosyncrasies endearing, but I find them pretensious.",
      wrong: "pretensious", ok: ["idiosyncrasies", "endearing", "people"], level: 4 },
    { sentence: "His selfish pettiness means he is frequently accused of having a parocial attitude.",
      wrong: "parocial", ok: ["pettiness", "frequently", "accused"], level: 4 },
    { sentence: "I was peturbed by my friend's acquiescence to their unreasonable demands.",
      wrong: "peturbed", ok: ["acquiescence", "unreasonable", "demands"], level: 4 },
    { sentence: "I received my innoculation last week and was relieved to have no side effects.",
      wrong: "innoculation", ok: ["received", "relieved", "effects"], level: 4 },
    { sentence: "Coorporate events can be terribly monotonous and horrifically expensive.",
      wrong: "Coorporate", ok: ["monotonous", "horrifically", "terribly"], level: 4 },
    { sentence: "He was aquitted of theft but convicted of handling stolen goods.",
      wrong: "aquitted", ok: ["convicted", "handling", "theft"], level: 4 },
    { sentence: "The librarian recomended a thoroughly gripping adventure novel.",
      wrong: "recomended", ok: ["thoroughly", "gripping", "adventure"], level: 2 },
    { sentence: "It was necessary to seperate the two arguing children immediately.",
      wrong: "seperate", ok: ["necessary", "arguing", "immediately"], level: 2 },
    { sentence: "The government promised a thorough enviroment policy before the election.",
      wrong: "enviroment", ok: ["government", "thorough", "election"], level: 2 },
    { sentence: "She was embarassed when her friends noticed the enormous stain.",
      wrong: "embarassed", ok: ["noticed", "enormous", "friends"], level: 2 },
    { sentence: "The commitee met on Wednesday to discuss the maintenance budget.",
      wrong: "commitee", ok: ["Wednesday", "maintenance", "discuss"], level: 3 },
    { sentence: "Rhythm and perseverance are neccessary for any successful musician.",
      wrong: "neccessary", ok: ["Rhythm", "perseverance", "successful"], level: 2 },
    { sentence: "He definately intended to acquire a new calendar before February.",
      wrong: "definately", ok: ["acquire", "calendar", "February"], level: 2 }
  ];

  function spellInSentence(i) {
    const item = pick(SPELL_SENTENCES, i);
    const q = mkE("Spelling",
      `One word in this sentence is spelled incorrectly. Which word is it?\n\n"${item.sentence}"`,
      item.wrong, item.ok, item.level, i + 1);
    if (q) q.explain = `"${item.wrong}" is wrong. ${spellingTip(item.wrong)}`;
    return q;
  }

  /* Homophone confusions are marked as spelling mistakes in these papers. */
  const HOMOPHONE_SETS = [
    { sentence: "The children collected {X} coats from the cloakroom.", right: "their", wrong: ["there", "they're", "thier"], level: 1 },
    { sentence: "{X} going to be late if the bus does not come soon.", right: "They're", wrong: ["Their", "There", "Theyre"], level: 2 },
    { sentence: "The dog wagged {X} tail whenever the postman arrived.", right: "its", wrong: ["it's", "its'", "his'"], level: 2 },
    { sentence: "{X} been raining since breakfast, so we stayed indoors.", right: "It's", wrong: ["Its", "Its'", "It,s"], level: 2 },
    { sentence: "Please tell me when {X} ready to leave.", right: "you're", wrong: ["your", "youre", "yours'"], level: 1 },
    { sentence: "I left {X} umbrella by the front door.", right: "your", wrong: ["you're", "youre", "yours'"], level: 1 },
    { sentence: "The parcel was far {X} heavy for one person to carry.", right: "too", wrong: ["to", "two", "tow"], level: 1 },
    { sentence: "We walked {X} the museum after lunch.", right: "to", wrong: ["too", "two", "tow"], level: 1 },
    { sentence: "Nobody knew {X} bicycle had been left in the rain.", right: "whose", wrong: ["who's", "whos", "whoms"], level: 3 },
    { sentence: "Ask the librarian {X} in charge of the reading list.", right: "who's", wrong: ["whose", "whos", "whom's"], level: 3 },
    { sentence: "The noise did not {X} her concentration at all.", right: "affect", wrong: ["effect", "afect", "effekt"], level: 4 },
    { sentence: "The new timetable had an immediate {X} on attendance.", right: "effect", wrong: ["affect", "efect", "affekt"], level: 4 },
    { sentence: "We drove {X} the old bakery on the way home.", right: "past", wrong: ["passed", "pasted", "paste"], level: 3 },
    { sentence: "The runner {X} three rivals on the final bend.", right: "passed", wrong: ["past", "pased", "passt"], level: 3 },
    { sentence: "The orchestra will {X} again on Friday evening.", right: "practise", wrong: ["practice", "practiss", "practicse"], level: 4 },
    { sentence: "Netball {X} takes place in the main hall.", right: "practice", wrong: ["practise", "practiss", "practicse"], level: 4 },
    { sentence: "The judge asked for a piece of {X} advice.", right: "sound", wrong: ["sounde", "sownd", "sounnd"], level: 2 },
    { sentence: "She could not {X} whether to laugh or cry.", right: "decide", wrong: ["descide", "deside", "decyde"], level: 2 },
    { sentence: "A {X} of thunder woke the whole house.", right: "peal", wrong: ["peel", "peil", "pealle"], level: 4 },
    { sentence: "The council gave them {X} to build the extension.", right: "permission", wrong: ["permision", "permittion", "permishion"], level: 2 }
  ];

  function spellHomophone(i) {
    const item = pick(HOMOPHONE_SETS, i);
    return mkE("Spelling",
      `Choose the correct word to complete this sentence.\n\n"${item.sentence.replace("{X}", "______")}"`,
      item.right, item.wrong, item.level, i);
  }

  /* "Misspelt Words — recognising the lack of any spelling errors."
     The real papers offer N for "no mistake", and a child who has learnt that
     something is always wrong gets caught. Roughly one set in three is clean. */
  const SPELLING_SETS = [
    { words: ["separate", "definitely", "necessary", "occasion"], bad: -1, level: 3 },
    { words: ["believe", "friend", "receive", "wierd"], bad: 3, level: 2 },
    { words: ["business", "library", "February", "surprise"], bad: -1, level: 2 },
    { words: ["accomodate", "committee", "embarrass", "possession"], bad: 0, level: 3 },
    { words: ["knowledge", "immediately", "opportunity", "temperature"], bad: -1, level: 2 },
    { words: ["rhythm", "parliment", "privilege", "secretary"], bad: 1, level: 4 },
    { words: ["thorough", "tomorrow", "tongue", "until"], bad: -1, level: 2 },
    { words: ["conscience", "questionaire", "perseverance", "acquitted"], bad: 1, level: 4 },
    { words: ["neighbour", "jewellery", "mischievous", "noticable"], bad: 3, level: 3 },
    { words: ["someone", "somewhere", "somebody", "sometimes"], bad: -1, level: 1 },
    { words: ["somone", "anywhere", "everybody", "nothing"], bad: 0, level: 2 },
    { words: ["carefully", "beautifully", "carefuly", "hopefully"], bad: 2, level: 2 }
  ];

  function spellAnyMistake(i) {
    const set = pick(SPELLING_SETS, i);
    const shown = set.words.map((word, idx) => `${"ABCD"[idx]}  ${word}`).join("\n");
    const stem = `Which of these words is spelled incorrectly?\n\n${shown}\n\n(If they are all spelled correctly, choose "No mistake".)`;
    return mkLabelled("Spelling", stem, set.bad === -1 ? 4 : set.bad, set.level);
  }

  /* ═══════════════════ PUNCTUATION ═══════════════════ */

  const OWNERS = [
    { singular: "the boy", sPoss: "the boy's", plural: "the boys", pPoss: "the boys'", thing: "football" },
    { singular: "the girl", sPoss: "the girl's", plural: "the girls", pPoss: "the girls'", thing: "bags" },
    { singular: "my neighbour", sPoss: "my neighbour's", plural: "my neighbours", pPoss: "my neighbours'", thing: "garden" },
    { singular: "the teacher", sPoss: "the teacher's", plural: "the teachers", pPoss: "the teachers'", thing: "desk" },
    { singular: "the dog", sPoss: "the dog's", plural: "the dogs", pPoss: "the dogs'", thing: "lead" },
    { singular: "my cousin", sPoss: "my cousin's", plural: "my cousins", pPoss: "my cousins'", thing: "bicycle" },
    { singular: "the artist", sPoss: "the artist's", plural: "the artists", pPoss: "the artists'", thing: "studio" },
    { singular: "the player", sPoss: "the player's", plural: "the players", pPoss: "the players'", thing: "kit" }
  ];

  function punApostropheSingular(i) {
    const o = pick(OWNERS, i);
    return mkE("Punctuation",
      `How should this be written if the ${o.thing} belongs to just one person or animal (${o.singular})?`,
      `${o.sPoss} ${o.thing}`,
      [`${o.pPoss} ${o.thing}`, `${o.plural} ${o.thing}`, `${o.singular}s ${o.thing}`],
      diff(i, 4), i);
  }

  function punApostrophePlural(i) {
    const o = pick(OWNERS, i + 2);
    return mkE("Punctuation",
      `How should this be written if the ${o.thing} belongs to several of them (${o.plural})?`,
      `${o.pPoss} ${o.thing}`,
      [`${o.sPoss} ${o.thing}`, `${o.plural} ${o.thing}`, `${o.plural}'s ${o.thing}`],
      diff(i, 3), i + 1);
  }

  const IRREGULAR_POSSESSIVES = [
    ["children", "children's", "toys"], ["men", "men's", "changing room"],
    ["women", "women's", "team"], ["people", "people's", "opinions"],
    ["mice", "mice's", "nest"], ["geese", "geese's", "feathers"]
  ];

  function punIrregularPossessive(i) {
    const [plural, poss, thing] = pick(IRREGULAR_POSSESSIVES, i);
    return mkE("Punctuation",
      `Which is the correct way to write the ${thing} belonging to the ${plural}?`,
      `the ${poss} ${thing}`,
      [`the ${plural}' ${thing}`, `the ${plural}s' ${thing}`, `the ${plural}s ${thing}`],
      diff(i, 3), i);
  }

  const CONTRACTIONS = [
    ["could not", "couldn't"], ["would not", "wouldn't"], ["should not", "shouldn't"],
    ["did not", "didn't"], ["has not", "hasn't"], ["is not", "isn't"],
    ["will not", "won't"], ["cannot", "can't"], ["they are", "they're"],
    ["we have", "we've"], ["I would", "I'd"], ["she will", "she'll"],
    ["you have", "you've"], ["there is", "there's"], ["who is", "who's"]
  ];

  function punContraction(i) {
    const [full, short] = pick(CONTRACTIONS, i);
    const noApos = short.replace("'", "");
    const misplaced = short.replace(/'(\w)/, "$1'");
    const doubled = `${short}'`;
    return mkE("Punctuation",
      `Which is the correct contraction of "${full}"?`,
      short, [noApos, misplaced === short ? `'${noApos}` : misplaced, doubled],
      diff(i, 4), i);
  }

  /* `end` is the mark the speech takes when it finishes the sentence.
     `mid` is the mark it takes when a reporting clause follows: a statement
     switches its full stop for a comma, but ? and ! are kept. */
  const SPEECH_ITEMS = [
    { words: "Where are you going", verb: "asked", who: "Mum", end: "?" },
    { words: "I have finished my homework", verb: "said", who: "Priya", end: "." },
    { words: "Watch out for that step", verb: "shouted", who: "Dad", end: "!" },
    { words: "Have you seen my keys", verb: "asked", who: "Tom", end: "?" },
    { words: "The bus leaves at four", verb: "explained", who: "the driver", end: "." },
    { words: "What an incredible view", verb: "gasped", who: "Nell", end: "!" }
  ];

  const midMark = item => (item.end === "." ? "," : item.end);

  function punDirectSpeech(i) {
    const s = pick(SPEECH_ITEMS, i);
    const mid = midMark(s);
    const speaker = `${s.verb} ${s.who}`;
    const correct = `"${s.words}${mid}" ${speaker}.`;
    const noMark = `"${s.words}" ${speaker}.`;
    const markOutside = `"${s.words}" ${speaker}${s.end}`;
    const capitalSpeaker = `"${s.words}${mid}" ${speaker.charAt(0).toUpperCase()}${speaker.slice(1)}.`;
    return mkE("Punctuation",
      "Which sentence is punctuated correctly?",
      correct, [noMark, markOutside, capitalSpeaker], diff(i, 3), i);
  }

  function punReportedFirst(i) {
    const s = pick(SPEECH_ITEMS, i + 3);
    const who = s.who.charAt(0).toUpperCase() + s.who.slice(1);
    const speaker = `${who} ${s.verb}`;
    const correct = `${speaker}, "${s.words}${s.end}"`;
    return mkE("Punctuation",
      "Which sentence is punctuated correctly?",
      correct,
      [`${speaker} "${s.words}${s.end}"`, `${speaker}, "${s.words}"`, `${speaker}: '${s.words}${s.end}'.`],
      diff(i, 4), i + 2);
  }

  const LIST_ITEMS = [
    ["three things for school", "my reading book", "my homework", "a snack"],
    ["four flavours of sweet", "apple", "toffee", "liquorice"],
    ["three jobs at home", "wash up", "buy milk", "water the plants"],
    ["three tools for the trip", "a compass", "a torch", "a whistle"],
    ["three subjects on Monday", "history", "science", "French"]
  ];

  function punColonList(i) {
    const [intro, a, b, c] = pick(LIST_ITEMS, i);
    const stem = `I need ${intro}`;
    return mkE("Punctuation",
      "Which sentence is punctuated correctly?",
      `${stem}: ${a}, ${b} and ${c}.`,
      [`${stem}, ${a}, ${b} and ${c}.`, `${stem}; ${a}, ${b} and ${c}.`, `${stem} ${a}, ${b}, and ${c}.`],
      diff(i, 3), i);
  }

  const CLAUSE_PAIRS = [
    ["The rain stopped at last", "the match could finally begin"],
    ["Marcus had revised for weeks", "he was still nervous"],
    ["The tide was coming in fast", "we had to leave the cove"],
    ["Nobody answered the door", "the lights were clearly on"],
    ["The recipe looked simple", "it took three hours to make"]
  ];

  function punSemicolon(i) {
    const [a, b] = pick(CLAUSE_PAIRS, i);
    return mkE("Punctuation",
      "Which sentence uses punctuation correctly to join these two complete ideas?",
      `${a}; ${b}.`,
      [`${a}, ${b}.`, `${a} ; ${b}.`, `${a}: ${b}.`],
      diff(i, 2), i);
  }

  function punCommaSplice(i) {
    const [a, b] = pick(CLAUSE_PAIRS, i + 2);
    return mkE("Punctuation",
      `What is wrong with this sentence?\n\n"${a}, ${b}."`,
      "Two complete sentences have been joined with only a comma",
      ["A capital letter is missing at the start", "An apostrophe has been left out", "There is nothing wrong with it"],
      diff(i, 3), i + 1);
  }

  /* Exam-style: the sentence is split into labelled chunks and the child picks
     the chunk containing the error. `bad` is the index of the faulty chunk, or
     -1 when the sentence is already correct. */
  const SEGMENT_SENTENCES = [
    { parts: ["Sarah gasped in shock.", "She couldnt believe", "how tall the mountain", "was!"], bad: 1 },
    { parts: ["The children were not", "allowed to eat", "in their parents car", "after the trip."], bad: 2 },
    { parts: ["The cat, who liked", "to be dramatic", "gave an ear-piercing", "screech."], bad: 1 },
    { parts: ["At the end of the day,", "nothing matters", "apart from", "being happy"], bad: 3 },
    { parts: ["\"What time are you", "going to work today,\"", "Aijaz asked", "his wife."], bad: 1 },
    { parts: ["Alvaro ran into", "the garden; and", "jumped onto", "the trampoline."], bad: 1 },
    { parts: ["The two pet rabbits", "– Flopsy and Buttons –", "were asleep", "in their hutch."], bad: -1 },
    { parts: ["Our breath misted", "in front of us", "in the cold,", "Winter air."], bad: 3 },
    { parts: ["Mum looked at me", "in concern and asked,", "\"are you feeling", "all right?\""], bad: 2 },
    { parts: ["The red apples", "which were tastier", "than the green ones,", "were almost all gone."], bad: 1 },
    { parts: ["With a jolt,", "Ivan realised that", "he hadnt turned", "the oven off!"], bad: 2 },
    { parts: ["My cousins dog", "is bigger than mine,", "but mine", "is fluffier."], bad: 0 },
    { parts: ["There is only one skill", "which you need", "to become a spy,", "determination."], bad: 2 },
    { parts: ["I'd almost forgotten", "how much I loved", "the salty, fresh smell", "of the sea."], bad: -1 },
    { parts: ["I am leaving soon,", "however, I don't intend", "to be gone", "for long."], bad: 0 },
    /* GL practice papers, question-bank/NewText. */
    { parts: ["‘Why don’t you play", "outside today,’", "suggested Tom’s", "aunt."], bad: 1 },
    { parts: ["Even the best,", "most expensive detergent,", "couldn’t remove", "the mud stains."], bad: 1 },
    { parts: ["The recipe had two simple stages:", "finely chop the ingredients", "and then blend", "together."], bad: -1 },
    { parts: ["Caitlin had carelessly lost", "Asaf’s charger", "(his brand", "new one)"], bad: 3 },
    { parts: ["Looking through my", "parents music collection,", "I was amazed to see", "so many CDs!"], bad: 1 },
    { parts: ["If we hadnt seen", "the road sign,", "we would have ended", "up in Wales."], bad: 0 },
    { parts: ["We were lucky to win tickets", "to see The Nutcracker", "this Winter.", "It was wonderful."], bad: 2 },
    { parts: ["Hippo sweat has", "special properties to protect", "the skin from", "the suns harmful rays."], bad: 3 },
    { parts: ["The same fluid,", "red in colour", "also moisturises", "and serves as an antibiotic."], bad: 1 },
    { parts: ["Its true that", "hippos are omnivores,", "but they are not", "gentle creatures."], bad: 0 }
  ];

  function punFindSegment(i) {
    const item = pick(SEGMENT_SENTENCES, i);
    const display = item.parts.map((part, idx) => `${"ABCD"[idx]}  ${part}`).join("\n");
    const stem = `One part of this sentence contains a punctuation mistake. Which part is it?\n\n${display}\n\n(If there is no mistake, choose "No mistake".)`;
    return mkLabelled("Punctuation", stem, item.bad === -1 ? 4 : item.bad, item.bad === -1 ? 4 : diff(i, 3));
  }

  const CAPITAL_ITEMS = [
    ["we visit granny every wednesday in march", "We visit Granny every Wednesday in March"],
    ["the river thames flows through london", "The River Thames flows through London"],
    ["last july, aisha moved to cardiff", "Last July, Aisha moved to Cardiff"],
    ["on friday, mr patel taught us about the tudors", "On Friday, Mr Patel taught us about the Tudors"],
    ["my sister speaks french and german fluently", "My sister speaks French and German fluently"]
  ];

  function punCapitals(i) {
    const [lower, correct] = pick(CAPITAL_ITEMS, i);
    const words = correct.split(" ");
    const onlyFirst = `${lower.charAt(0).toUpperCase()}${lower.slice(1)}`;
    const allCaps = words.map(w => `${w.charAt(0).toUpperCase()}${w.slice(1)}`).join(" ");
    return mkE("Punctuation",
      "Which version uses capital letters correctly?",
      `${correct}.`, [`${onlyFirst}.`, `${allCaps}.`, `${lower}.`],
      diff(i, 4), i);
  }

  /* "Commas, Colons & Semi-Colons — missing comma for separating equal
     adjectives." Two adjectives of the same kind take a comma; an adjective
     that belongs with the noun ("old stone wall") does not. */
  /* Each pair carries its own sentence: one shared frame cannot host both
     "a cold, damp cellar" and "tired, hungry walkers" without producing
     something ungrammatical. {A} is where the two adjectives go. */
  const EQUAL_ADJECTIVES = [
    { frame: "We climbed down into a {A} cellar.", pair: "cold, damp", level: 2 },
    { frame: "The taxi turned into a {A} lane.", pair: "long, winding", level: 2 },
    { frame: "It was a {A} night.", pair: "dark, stormy", level: 2 },
    { frame: "She was a {A} girl.", pair: "quiet, thoughtful", level: 3 },
    { frame: "I had almost forgotten the {A} smell of the sea.", pair: "salty, fresh", level: 3 },
    { frame: "The {A} walkers stopped at the first inn they found.", pair: "tired, hungry", level: 2 },
    { frame: "They hurried down a {A} street.", pair: "narrow, crowded", level: 3 },
    { frame: "A {A} wind blew across the moor.", pair: "bitter, relentless", level: 3 }
  ];

  function punEqualAdjectives(i) {
    const item = pick(EQUAL_ADJECTIVES, i);
    const [first, second] = item.pair.split(", ");
    const build = middle => item.frame.replace("{A}", middle);
    return mkE("Punctuation",
      "Which sentence is punctuated correctly?",
      build(`${first}, ${second}`),
      [build(`${first} ${second}`),
       build(`${first}; ${second}`),
       build(`${first} ${second},`)],
      item.level, i);
  }

  /* "Punctuation and Capitalisation — incorrect punctuation at the end of a
     sentence" and "incorrect use of a full stop". */
  const SENTENCE_ENDINGS = [
    { sentence: "Would you mind passing me the salt", right: "?", wrong: [".", "!", ","], level: 1 },
    { sentence: "What a magnificent view this is", right: "!", wrong: [".", "?", ";"], level: 2 },
    { sentence: "Please close the gate behind you", right: ".", wrong: ["?", ",", ";"], level: 1 },
    { sentence: "I wonder whether the post has arrived", right: ".", wrong: ["?", "!", ","], level: 3 },
    { sentence: "Do you know how far it is to the station", right: "?", wrong: [".", "!", ";"], level: 2 },
    { sentence: "How dare you speak to her like that", right: "!", wrong: [".", ",", ";"], level: 3 },
    { sentence: "She asked whether we were ready to leave", right: ".", wrong: ["?", "!", ":"], level: 4 }
  ];

  function punSentenceEnding(i) {
    const item = pick(SENTENCE_ENDINGS, i);
    return mkE("Punctuation",
      `Which punctuation mark should end this sentence?\n\n"${item.sentence} ___"`,
      item.right, item.wrong, item.level, i);
  }

  const FULL_STOP_ITEMS = [
    { wrong: "We waited for an hour. Then went home without her.",
      right: "We waited for an hour. Then we went home without her.",
      fault: "The second part is not a complete sentence", level: 3 },
    { wrong: "The rain stopped. So we could go outside.",
      right: "The rain stopped, so we could go outside.",
      fault: "A full stop has been used where a comma is needed", level: 3 },
    { wrong: "Miss Shah arrived early. And unpacked her bag.",
      right: "Miss Shah arrived early and unpacked her bag.",
      fault: "A full stop has cut one sentence in two", level: 4 },
    { wrong: "I bought apples, pears. And three lemons.",
      right: "I bought apples, pears and three lemons.",
      fault: "A full stop has been used in the middle of a list", level: 3 }
  ];

  function punFullStop(i) {
    const item = pick(FULL_STOP_ITEMS, i);
    return mkE("Punctuation",
      `What is wrong with the way this is punctuated?\n\n"${item.wrong}"`,
      item.fault,
      ["A capital letter is missing", "An apostrophe has been left out", "There is nothing wrong with it"],
      item.level, i);
  }

  /* ═══════════════════ GRAMMAR ═══════════════════ */

  /* [base, simple past, past participle] */
  const IRREGULAR_VERBS = [
    ["know", "knew", "known"], ["see", "saw", "seen"], ["go", "went", "gone"],
    ["write", "wrote", "written"], ["take", "took", "taken"], ["drink", "drank", "drunk"],
    ["swim", "swam", "swum"], ["ring", "rang", "rung"], ["begin", "began", "begun"],
    ["choose", "chose", "chosen"], ["break", "broke", "broken"], ["speak", "spoke", "spoken"],
    ["fly", "flew", "flown"], ["draw", "drew", "drawn"], ["throw", "threw", "thrown"],
    ["eat", "ate", "eaten"], ["give", "gave", "given"], ["freeze", "froze", "frozen"],
    ["steal", "stole", "stolen"], ["shrink", "shrank", "shrunk"], ["lie", "lay", "lain"],
    ["buy", "bought", "bought"], ["catch", "caught", "caught"], ["teach", "taught", "taught"]
  ];

  /* Asked as verb forms rather than in a sentence: no single frame reads
     naturally with both "she wrote it" and "she lay down". */
  function graPastSimple(i) {
    const [base, past, participle] = pick(IRREGULAR_VERBS, i);
    const regular = base.endsWith("e") ? `${base}d` : `${base}ed`;
    const wrong = firstDistinct(past, [regular, participle, base, `${base}t`]);
    if (!wrong) return null;
    return mkE("Grammar",
      `Which is the simple past tense of the verb "${base}"?\n\n(Today I ${base}… yesterday I ______)`,
      past, wrong, diff(i, 4), i);
  }

  function graPastParticiple(i) {
    const [base, past, participle] = pick(IRREGULAR_VERBS, i + 5);
    const regular = base.endsWith("e") ? `${base}d` : `${base}ed`;
    if (past === participle) return null;
    const wrong = firstDistinct(participle, [past, regular, base, `${base}en`]);
    if (!wrong) return null;
    return mkE("Grammar",
      `Which is the past participle of the verb "${base}"?\n\n(I have ______)`,
      participle, wrong, diff(i, 3), i + 1);
  }

  const PRONOUN_ITEMS = [
    { sentence: "The teacher told Jens and ______ to wait outside.", right: "me", wrong: ["I", "we", "they"], level: 2 },
    { sentence: "______ and my brother walked to school together.", right: "My sister", wrong: ["Me and my sister", "My sister and me", "Us and my sister"], level: 2 },
    { sentence: "Between you and ______, the surprise is already spoilt.", right: "me", wrong: ["I", "myself", "mine"], level: 3 },
    { sentence: "The prize was shared between Ravi and ______.", right: "her", wrong: ["she", "hers", "herself"], level: 2 },
    { sentence: "The old man to ______ I was speaking used to be a pilot.", right: "whom", wrong: ["who", "which", "whose"], level: 4 },
    { sentence: "The scientist ______ discovered penicillin was Alexander Fleming.", right: "who", wrong: ["whom", "which", "whose"], level: 2 },
    { sentence: "That is the house ______ roof was damaged in the storm.", right: "whose", wrong: ["who's", "which", "that"], level: 3 },
    { sentence: "______ were the only two people left in the hall.", right: "We", wrong: ["Us", "Ourselves", "Our"], level: 2 }
  ];

  function graPronoun(i) {
    const item = pick(PRONOUN_ITEMS, i);
    return mkE("Grammar",
      `Choose the word or words that complete this sentence correctly.\n\n"${item.sentence}"`,
      item.right, item.wrong, item.level, i);
  }

  const PLURALS = [
    ["city", "cities", 2], ["leaf", "leaves", 2], ["knife", "knives", 2], ["half", "halves", 2],
    ["child", "children", 1], ["mouse", "mice", 2], ["goose", "geese", 2], ["tooth", "teeth", 1],
    ["sheep", "sheep", 2], ["potato", "potatoes", 2], ["tomato", "tomatoes", 2], ["piano", "pianos", 3],
    ["cactus", "cacti", 4], ["crisis", "crises", 4], ["analysis", "analyses", 4], ["century", "centuries", 2],
    ["church", "churches", 1], ["box", "boxes", 1], ["shelf", "shelves", 2], ["woman", "women", 1]
  ];

  function graPlural(i) {
    const [single, plural, level] = pick(PLURALS, i);
    const wrong = firstDistinct(plural, [
      `${single}s`, `${single}'s`, `${single}es`, `${plural}'`, `${single}s'`
    ]);
    if (!wrong) return null;
    return mkE("Grammar", `What is the correct plural of "${single}"?`, plural, wrong, level, i);
  }

  /* Each word carries its own sentence: a single shared frame cannot host both
     "much better than" and "further away than" without reading oddly. */
  const COMPARATIVES = [
    { base: "good", comp: "better", sup: "best",
      compFrame: "This second attempt was much ______ than the first.",
      supFrame: "Of all her attempts, that one was the ______." },
    { base: "bad", comp: "worse", sup: "worst",
      compFrame: "The traffic this morning was even ______ than yesterday.",
      supFrame: "That was the ______ journey of the whole year." },
    { base: "far", comp: "further", sup: "furthest",
      compFrame: "The village is ______ away than it looks on the map.",
      supFrame: "Of the three villages, that one is the ______ away." },
    { base: "annoyed", comp: "more annoyed", sup: "most annoyed",
      compFrame: "The louder the dog barked, the ______ his owner became.",
      supFrame: "Of everyone waiting in the queue, Dad looked the ______." },
    { base: "careful", comp: "more careful", sup: "most careful",
      compFrame: "You will need to be ______ than that with the glass.",
      supFrame: "She is the ______ driver I know." },
    { base: "happy", comp: "happier", sup: "happiest",
      compFrame: "Nobody could have been ______ about the news than Gran.",
      supFrame: "It was the ______ day of his entire life." },
    { base: "busy", comp: "busier", sup: "busiest",
      compFrame: "The shop is far ______ on a Saturday.",
      supFrame: "December is the ______ month of the year." },
    { base: "difficult", comp: "more difficult", sup: "most difficult",
      compFrame: "This puzzle is ______ than the last one.",
      supFrame: "That was the ______ question on the whole paper." },
    { base: "narrow", comp: "narrower", sup: "narrowest",
      compFrame: "The lane grew ______ as we climbed.",
      supFrame: "It is the ______ bridge in the county." },
    { base: "expensive", comp: "more expensive", sup: "most expensive",
      compFrame: "Train tickets are ______ than they were last year.",
      supFrame: "That is the ______ ticket they sell." }
  ];

  function graComparative(i) {
    const item = pick(COMPARATIVES, i);
    const naive = item.base.endsWith("y") ? `${item.base.slice(0, -1)}ier` : `${item.base}er`;
    const wrong = firstDistinct(item.comp,
      [naive, item.sup, `more ${item.base}`, `${item.base}er`, `${item.base}est`, item.base]);
    if (!wrong) return null;
    return mkE("Grammar",
      `Choose the word or words that complete this sentence correctly.\n\n"${item.compFrame}" (${item.base})`,
      item.comp, wrong, diff(i, 3), i);
  }

  function graSuperlative(i) {
    const item = pick(COMPARATIVES, i + 3);
    const naive = item.base.endsWith("y") ? `${item.base.slice(0, -1)}iest` : `${item.base}est`;
    const wrong = firstDistinct(item.sup,
      [item.comp, naive, `most ${item.base}`, `${item.base}est`, item.base]);
    if (!wrong) return null;
    return mkE("Grammar",
      `Choose the word or words that complete this sentence correctly.\n\n"${item.supFrame}" (${item.base})`,
      item.sup, wrong, diff(i, 4), i + 1);
  }

  const AGREEMENT_ITEMS = [
    { sentence: "Each of the boys ______ a different instrument.", right: "plays", wrong: ["play", "playing", "have played"], level: 3 },
    { sentence: "Neither of the answers ______ correct.", right: "is", wrong: ["are", "were", "be"], level: 3 },
    { sentence: "The team ______ training every Tuesday evening.", right: "has", wrong: ["have got", "having", "haves"], level: 3 },
    { sentence: "There ______ far too many people in the queue.", right: "are", wrong: ["is", "was", "be"], level: 2 },
    { sentence: "One of my cousins ______ in Edinburgh.", right: "lives", wrong: ["live", "living", "have lived"], level: 3 },
    { sentence: "The news ______ better than we expected.", right: "was", wrong: ["were", "are", "have been"], level: 3 }
  ];

  function graAgreement(i) {
    const item = pick(AGREEMENT_ITEMS, i);
    return mkE("Grammar",
      `Choose the word that completes this sentence correctly.\n\n"${item.sentence}"`,
      item.right, item.wrong, item.level, i);
  }

  const POS_ITEMS = [
    { sentence: "The exhausted runner collapsed onto the grass.", word: "exhausted", pos: "Adjective", level: 1 },
    { sentence: "The exhausted runner collapsed onto the grass.", word: "collapsed", pos: "Verb", level: 1 },
    { sentence: "The exhausted runner collapsed onto the grass.", word: "onto", pos: "Preposition", level: 3 },
    { sentence: "She answered the question quickly and confidently.", word: "quickly", pos: "Adverb", level: 2 },
    { sentence: "She answered the question quickly and confidently.", word: "and", pos: "Conjunction", level: 3 },
    { sentence: "They left their bicycles beside the gate.", word: "their", pos: "Pronoun", level: 2 },
    { sentence: "Kindness costs nothing at all.", word: "Kindness", pos: "Noun", level: 2 },
    { sentence: "The storm arrived surprisingly early this year.", word: "surprisingly", pos: "Adverb", level: 2 },
    { sentence: "Although it rained, the fete continued.", word: "Although", pos: "Conjunction", level: 3 },
    { sentence: "He hid the letter beneath a loose floorboard.", word: "beneath", pos: "Preposition", level: 3 },
    { sentence: "She was too frightened to move.", word: "too", pos: "Adverb", level: 4 },
    { sentence: "Nobody knew the answer.", word: "Nobody", pos: "Pronoun", level: 3 },
    /* The papers ask about words that change class with the sentence they are
       in, which is the part of the skill a fixed list of easy examples misses. */
    { sentence: "The dog will snake through the gap in the hedge.", word: "snake", pos: "Verb", level: 4 },
    { sentence: "He will present the prizes at noon.", word: "present", pos: "Verb", level: 4 },
    { sentence: "Her worst fears were confirmed that evening.", word: "fears", pos: "Noun", level: 4 },
    { sentence: "They water the seedlings every evening.", word: "water", pos: "Verb", level: 4 },
    { sentence: "She had a light lunch and went back out.", word: "light", pos: "Adjective", level: 4 },
    { sentence: "We must weather the storm together.", word: "weather", pos: "Verb", level: 4 },
    { sentence: "He walked round the corner without looking back.", word: "round", pos: "Preposition", level: 4 },
    { sentence: "The road was rough, but the path was rougher still.", word: "still", pos: "Adverb", level: 4 }
  ];

  const POS_NAMES = ["Noun", "Verb", "Adjective", "Adverb", "Pronoun", "Preposition", "Conjunction"];

  function graPartOfSpeech(i) {
    const item = pick(POS_ITEMS, i);
    const wrong = POS_NAMES.filter(name => name !== item.pos);
    return mkE("Grammar",
      `What part of speech is the word "${item.word}" in this sentence?\n\n"${item.sentence}"`,
      item.pos, [pick(wrong, i), pick(wrong, i + 2), pick(wrong, i + 4)], item.level, i);
  }
  graPartOfSpeech.poolSize = POS_ITEMS.length;

  const SENTENCE_TYPES = [
    ["Close the door behind you.", "Command"],
    ["What a beautiful morning it is!", "Exclamation"],
    ["Where did you leave the tickets?", "Question"],
    ["The library closes at five o'clock.", "Statement"],
    ["Please pass me the atlas.", "Command"],
    ["How on earth did she manage that?", "Question"],
    ["We arrived long before the others.", "Statement"],
    ["How dreadful that sounds!", "Exclamation"]
  ];

  function graSentenceType(i) {
    const [sentence, type] = pick(SENTENCE_TYPES, i);
    const wrong = ["Statement", "Question", "Command", "Exclamation"].filter(t => t !== type);
    return mkE("Grammar",
      `What type of sentence is this?\n\n"${sentence}"`,
      type, wrong, diff(i, 4), i);
  }

  const TENSE_ITEMS = [
    { sentence: "I plan to go on holiday once I ______ my course.", right: "have finished", wrong: ["finished", "will finish", "am finishing"], level: 3 },
    { sentence: "By the time we arrived, the film ______ already started.", right: "had", wrong: ["has", "have", "was"], level: 3 },
    { sentence: "She ______ the piano every day since she was six.", right: "has played", wrong: ["played", "plays", "is playing"], level: 3 },
    { sentence: "While I ______ my homework, the lights went out.", right: "was doing", wrong: ["did", "have done", "will do"], level: 3 },
    { sentence: "If it rains tomorrow, we ______ the trip.", right: "will cancel", wrong: ["cancelled", "have cancelled", "would have cancelled"], level: 2 },
    { sentence: "They ______ in that house for twenty years before they moved.", right: "had lived", wrong: ["have lived", "live", "are living"], level: 4 }
  ];

  function graTense(i) {
    const item = pick(TENSE_ITEMS, i);
    return mkE("Grammar",
      `Choose the word or words that complete this sentence correctly.\n\n"${item.sentence}"`,
      item.right, item.wrong, item.level, i);
  }

  /* ── Grammar: super hard ──
     These go beyond choosing a correct form: they need the child to recognise
     a mood, a voice or a clause type by name. */

  const SUBJUNCTIVE_ITEMS = [
    { sentence: "If I ______ you, I would apologise at once.", right: "were", wrong: ["was", "am", "had been"] },
    { sentence: "She wishes she ______ a little taller.", right: "were", wrong: ["was", "is", "has been"] },
    { sentence: "The head teacher insisted that every pupil ______ present at the rehearsal.", right: "be", wrong: ["is", "was", "will be"] },
    { sentence: "If he ______ harder, he would have passed the examination.", right: "had worked", wrong: ["worked", "has worked", "would work"] },
    { sentence: "Had I known about the delay, I ______ quite differently.", right: "would have acted", wrong: ["would act", "had acted", "will act"] },
    { sentence: "It is essential that she ______ told before Friday.", right: "be", wrong: ["is", "was", "will be"] }
  ];

  function graSubjunctive(i) {
    const item = pick(SUBJUNCTIVE_ITEMS, i);
    return mkE("Grammar",
      `Choose the word or words that complete this sentence correctly.\n\n"${item.sentence}"`,
      item.right, item.wrong, 4, i);
  }

  /* One passive sentence among three active ones. */
  const VOICE_ITEMS = [
    { passive: "The window was broken by the storm.",
      active: ["The storm broke the window.", "The storm was breaking windows all night.", "Storms break windows every winter."] },
    { passive: "The letter had been posted before breakfast.",
      active: ["She had posted the letter before breakfast.", "She was posting the letter before breakfast.", "She posts the letter before breakfast."] },
    { passive: "The prize is awarded every summer.",
      active: ["The school awards the prize every summer.", "The school is awarding the prize this summer.", "The school awarded the prize last summer."] },
    { passive: "Our fence was blown down in the night.",
      active: ["The wind blew our fence down in the night.", "The wind was blowing all night.", "Our fence blew down in the night."] }
  ];

  function graPassiveVoice(i) {
    const item = pick(VOICE_ITEMS, i);
    return mkE("Grammar",
      "Which one of these sentences is written in the passive voice?",
      item.passive, item.active, 4, i);
  }

  /* Naming the subordinate clause, not merely feeling where the comma goes. */
  const CLAUSE_ITEMS = [
    { sentence: "Although it was raining, we walked all the way to school.",
      sub: "Although it was raining", other: ["we walked", "all the way", "to school"] },
    { sentence: "The dog that had chased the postman was hiding under the table.",
      sub: "that had chased the postman", other: ["The dog", "was hiding", "under the table"] },
    { sentence: "We will set off early because the traffic is always dreadful.",
      sub: "because the traffic is always dreadful", other: ["We will set off", "early", "always dreadful"] },
    { sentence: "Whenever the bell rang, the whole class fell silent.",
      sub: "Whenever the bell rang", other: ["the whole class", "fell silent", "the bell"] },
    { sentence: "The book, which I had not read, sat on the shelf for years.",
      sub: "which I had not read", other: ["The book", "sat on the shelf", "for years"] }
  ];

  function graSubordinateClause(i) {
    const item = pick(CLAUSE_ITEMS, i);
    return mkE("Grammar",
      `Which part of this sentence is the subordinate clause?\n\n"${item.sentence}"`,
      item.sub, item.other, 4, i);
  }

  /* ═══════════════════ VOCABULARY ═══════════════════ */

  const SYNONYMS = [
    ["reluctant", "unwilling", 2], ["abundant", "plentiful", 2], ["conceal", "hide", 1],
    ["courteous", "polite", 1], ["diminish", "shrink", 2], ["essential", "necessary", 1],
    ["fragile", "delicate", 1], ["genuine", "authentic", 2], ["hazardous", "dangerous", 1],
    ["immense", "enormous", 1], ["jovial", "cheerful", 3], ["lenient", "merciful", 3],
    ["monotonous", "repetitive", 3], ["novice", "beginner", 2], ["obstinate", "stubborn", 3],
    ["peculiar", "strange", 1], ["rapid", "swift", 1], ["scarce", "rare", 2],
    ["tranquil", "peaceful", 2], ["vivid", "bright", 2], ["wary", "cautious", 2],
    ["grappling", "wrestling", 3], ["intrinsic", "inherent", 4], ["clinging", "grasping", 2],
    ["tarnished", "dulled", 3], ["formidable", "daunting", 3], ["prudent", "sensible", 3],
    ["arduous", "gruelling", 4], ["candid", "frank", 3], ["meticulous", "painstaking", 4]
  ];

  function vocSynonym(i) {
    const [word, syn, level] = pick(SYNONYMS, i);
    const wrong = others(SYNONYMS, i).map(pair => pair[1]);
    if (wrong.includes(syn)) return null;
    return mkE("Vocabulary",
      `Which word is closest in meaning to "${word}"?`,
      syn, wrong, level, i);
  }

  const ANTONYMS = [
    ["ancient", "modern", 1], ["ascend", "descend", 2], ["brave", "cowardly", 1],
    ["complex", "simple", 1], ["condense", "expand", 3], ["deliberate", "accidental", 2],
    ["expand", "contract", 2], ["generous", "mean", 1], ["humble", "arrogant", 3],
    ["increase", "decrease", 1], ["innocent", "guilty", 1], ["permanent", "temporary", 2],
    ["rigid", "flexible", 2], ["shrunken", "enlarged", 2], ["transparent", "opaque", 4],
    ["urban", "rural", 3], ["victory", "defeat", 1], ["voluntary", "compulsory", 3],
    ["abundant", "scarce", 3], ["praise", "criticise", 2], ["hostile", "friendly", 2],
    ["frequent", "rare", 1], ["reveal", "conceal", 2], ["accept", "reject", 1]
  ];

  function vocAntonym(i) {
    const [word, ant, level] = pick(ANTONYMS, i);
    const wrong = others(ANTONYMS, i).map(pair => pair[0]);
    if (wrong.includes(ant) || wrong.includes(word)) return null;
    return mkE("Vocabulary",
      `Which word is most nearly the opposite of "${word}"?`,
      ant, wrong, level, i);
  }

  const DEFINITIONS = [
    ["benevolent", "kind and generous", 3], ["candid", "honest and direct", 3],
    ["diligent", "hard-working and careful", 2], ["eloquent", "fluent and persuasive in speech", 3],
    ["frugal", "careful with money", 3], ["gregarious", "sociable and fond of company", 4],
    ["impartial", "not favouring one side", 3], ["lucid", "clear and easy to understand", 4],
    ["nocturnal", "active at night", 1], ["obsolete", "no longer in use", 3],
    ["perpetual", "never ending", 3], ["resilient", "able to recover quickly", 2],
    ["sceptical", "doubtful and unconvinced", 3], ["tenacious", "holding on determinedly", 4],
    ["unanimous", "agreed by everyone", 3], ["versatile", "able to do many things well", 2],
    ["auspicious", "promising a good outcome", 4], ["parochial", "narrow in outlook", 4],
    ["idiosyncrasy", "an unusual personal habit", 4], ["acquiescence", "reluctant agreement", 4]
  ];

  function vocDefinition(i) {
    const [word, meaning, level] = pick(DEFINITIONS, i);
    const wrong = others(DEFINITIONS, i).map(pair => pair[1]);
    if (wrong.includes(meaning)) return null;
    return mkE("Vocabulary",
      `What does the word "${word}" mean?`,
      meaning, wrong, level, i);
  }

  const IDIOMS = [
    ["a ray of hope", "light at the end of the tunnel", 2],
    ["once in a blue moon", "very rarely indeed", 1],
    ["bite the bullet", "face something unpleasant bravely", 3],
    ["let the cat out of the bag", "give away a secret", 1],
    ["a piece of cake", "something very easy", 1],
    ["under the weather", "feeling slightly unwell", 1],
    ["burn the midnight oil", "work late into the night", 3],
    ["cost an arm and a leg", "be extremely expensive", 1],
    ["steal someone's thunder", "take the attention they deserved", 3],
    ["the last straw", "the final problem that makes things unbearable", 2],
    ["beat about the bush", "avoid coming to the point", 3],
    ["throw in the towel", "give up on something", 2]
  ];

  function vocIdiom(i) {
    const [idiom, meaning, level] = pick(IDIOMS, i);
    const wrong = others(IDIOMS, i).map(pair => pair[1]);
    if (wrong.includes(meaning)) return null;
    return mkE("Vocabulary",
      `What does the phrase "${idiom}" mean?`,
      meaning, wrong, level, i);
  }

  const COLLECTIVE_NOUNS = [
    ["crows", "a murder", 4], ["geese", "a gaggle", 3], ["fish", "a shoal", 2],
    ["lions", "a pride", 1], ["bees", "a swarm", 1], ["wolves", "a pack", 1],
    ["sheep", "a flock", 1], ["cattle", "a herd", 1], ["puppies", "a litter", 2],
    ["monkeys", "a troop", 3], ["ants", "a colony", 2], ["ships", "a fleet", 2],
    ["musicians", "an orchestra", 1], ["judges", "a bench", 4], ["owls", "a parliament", 4]
  ];

  function vocCollective(i) {
    const [animal, term, level] = pick(COLLECTIVE_NOUNS, i);
    const wrong = others(COLLECTIVE_NOUNS, i).map(pair => pair[1]);
    if (wrong.includes(term)) return null;
    return mkE("Vocabulary",
      `Which is the correct collective noun for ${animal}?`,
      `${term} of ${animal}`, wrong.map(w => `${w} of ${animal}`), level, i);
  }

  const PREFIXES = [
    ["mis", "wrongly", 1], ["pre", "before", 1], ["post", "after", 2], ["sub", "under", 2],
    ["trans", "across", 3], ["anti", "against", 2], ["auto", "self", 2], ["circum", "around", 3],
    ["inter", "between", 2], ["super", "above or beyond", 2], ["re", "again", 1], ["bi", "two", 1]
  ];

  function vocPrefix(i) {
    const [prefix, meaning, level] = pick(PREFIXES, i);
    const wrong = others(PREFIXES, i).map(pair => pair[1]);
    if (wrong.includes(meaning)) return null;
    return mkE("Vocabulary",
      `What does the prefix "${prefix}-" mean?`,
      meaning, wrong, level, i);
  }

  const WORD_GROUPS = [
    [["awkward", "thoughtful", "comfortable"], "Adjectives", 2],
    [["challenge", "wellbeing", "silence"], "Nouns", 2],
    [["scattered", "whispered", "collapsed"], "Verbs", 2],
    [["carefully", "rarely", "suddenly"], "Adverbs", 2],
    [["beneath", "towards", "during"], "Prepositions", 3],
    [["although", "because", "unless"], "Conjunctions", 3],
    [["huge", "wild", "irreversible"], "Adjectives", 2],
    [["nobody", "themselves", "which"], "Pronouns", 4]
  ];

  function vocWordGroup(i) {
    const [words, type, level] = pick(WORD_GROUPS, i);
    const wrong = ["Nouns", "Verbs", "Adjectives", "Adverbs", "Pronouns", "Prepositions", "Conjunctions"]
      .filter(t => t !== type);
    return mkE("Vocabulary",
      `What type of words are these?\n\n${words.join(", ")}`,
      type, [pick(wrong, i), pick(wrong, i + 2), pick(wrong, i + 4)], level, i);
  }

  /* ═══════════════════ WORD CHOICE ═══════════════════
     The GL "Sentence Completion" section: pick the word that makes the line
     both sensible and correct English. */

  const WORD_CHOICE_ITEMS = [
    { sentence: "If you haven't finished your homework ______ dinner time, you will have to do it at the weekend.", right: "by", wrong: ["buy", "when", "on"], level: 1 },
    { sentence: "Fatima was absolutely certain that the teacher ______ find out about her behaviour.", right: "would not", wrong: ["will not", "willn't", "doesn't"], level: 2 },
    { sentence: "______ the hot weather, the child stubbornly refused to wear suncream.", right: "Despite", wrong: ["Yet", "As", "Because of"], level: 2 },
    { sentence: "The government officials used secret codes to communicate ______ the spies.", right: "with", wrong: ["on", "of", "in"], level: 2 },
    { sentence: "The red sweets were more popular ______ the green ones.", right: "than", wrong: ["then", "for", "with"], level: 1 },
    { sentence: "The old man ______ I was speaking looked strangely familiar.", right: "to whom", wrong: ["with who", "who", "which"], level: 4 },
    { sentence: "She decided that she wouldn't go to school ______ she felt so unwell.", right: "because", wrong: ["since when", "despite", "although"], level: 2 },
    { sentence: "The criminal was convicted ______ a terrible crime.", right: "of", wrong: ["in", "by", "to"], level: 3 },
    { sentence: "One ______ afternoon, some years ago, we rested on an old stone bridge.", right: "sultry", wrong: ["serenity", "severe", "September"], level: 3 },
    { sentence: "We sat on the ______ of a little old bridge that spanned a sleepy stream.", right: "parapet", wrong: ["post", "passage", "podium"], level: 4 },
    { sentence: "In England it would be hard to find a more ______ and monotonous view.", right: "featureless", wrong: ["featuring", "features", "featureful"], level: 3 },
    { sentence: "Sky and horizon seemed to melt away into one pale ______.", right: "blur", wrong: ["blush", "blunder", "bluff"], level: 3 },
    { sentence: "The children sat in silence and ______ to every word.", right: "listened", wrong: ["were listening to", "had listened", "listening"], level: 2 },
    { sentence: "There are a large number of exciting ______ to visit in Europe.", right: "cities", wrong: ["citys", "city's", "cities'"], level: 2 },
    { sentence: "Qiang went to the shop and ______ six oranges.", right: "bought", wrong: ["buyed", "buy", "brought"], level: 1 },
    { sentence: "Damian looked up and ______ a cat stuck in the tree.", right: "saw", wrong: ["sore", "seed", "sawn"], level: 1 },
    { sentence: "Most of the students had forgotten ______ folders.", right: "their", wrong: ["there", "they're", "thier"], level: 1 },
    { sentence: "The louder the dog barked, the ______ his owner became.", right: "more annoyed", wrong: ["annoyeder", "most annoyed", "annoyedder"], level: 2 },
    { sentence: "Mr Khan had ______ Bob his whole life.", right: "known", wrong: ["knowed", "knew", "nown"], level: 2 },
    { sentence: "The policeman told Jens and ______ that we should both go home.", right: "me", wrong: ["I", "we", "he"], level: 2 },
    { sentence: "I was ______ by my friend's willingness to agree to such demands.", right: "perturbed", wrong: ["peturbed", "purturbed", "pertubed"], level: 4 },
    { sentence: "The bridge had been closed ______ repairs for over a year.", right: "for", wrong: ["since", "during", "by"], level: 2 },
    { sentence: "Hardly ______ we sat down when the fire alarm sounded.", right: "had", wrong: ["did", "have", "were"], level: 4 },
    { sentence: "Neither the players ______ the coach knew about the change.", right: "nor", wrong: ["or", "and", "but"], level: 3 },
    /* GL practice paper cloze passage, question-bank/NewText. */
    { sentence: "Today was my first day at my new school and it ______ awful.", right: "was", wrong: ["be", "were", "does"], level: 2 },
    { sentence: "It's what we were all worried ______, but I actually did it.", right: "we'd do", wrong: ["we'd done", "I'd do", "we'll do"], level: 4 },
    { sentence: "Mum ______ drive me to school in her pink van.", right: "had to", wrong: ["has to", "have to", "must have"], level: 3 },
    { sentence: "What's ______, she kissed me goodbye in front of all the Year 7s.", right: "worse", wrong: ["more worse", "worser", "most bad"], level: 2 },
    { sentence: "All the Year 7s who ______ waiting to be shown their form rooms saw it.", right: "were", wrong: ["was", "is", "are"], level: 2 },
    { sentence: "I had to take a detour in order ______ wash the lipstick off my face.", right: "to", wrong: ["too", "that", "for"], level: 3 },
    { sentence: "I had to wash the lipstick mark ______ my face.", right: "off", wrong: ["of", "onto", "into"], level: 2 },
    { sentence: "______ lunch, everyone seemed to have forgotten my disastrous start.", right: "By", wrong: ["In", "Until", "To"], level: 3 },
    { sentence: "Everyone seemed to ______ my disastrous start.", right: "have forgotten", wrong: ["had forgot", "have forgot", "has forgotten"], level: 4 },
    { sentence: "On each biscuit ______ a word in bright pink icing.", right: "was written", wrong: ["was wrote", "wrote", "write"], level: 4 }
  ];

  function wordChoice(i) {
    const item = pick(WORD_CHOICE_ITEMS, i);
    return mkE("Word Choice",
      `Choose the word or words that complete this sentence so that it makes sense and is written in correct English.\n\n"${item.sentence}"`,
      item.right, item.wrong, item.level, i);
  }

  /* The cloze pool outgrew the default variation count once the GL paper items
     were added, so declare its size or the tail is never reached. */
  wordChoice.poolSize = WORD_CHOICE_ITEMS.length;

  const PRECISION_ITEMS = [
    { sentence: "The crowd ______ through the narrow gate when the gates finally opened.", right: "surged", wrong: ["walked", "went", "moved"], why: "most vivid" },
    { sentence: "Her voice ______ with anger as she read the letter aloud.", right: "trembled", wrong: ["was", "went", "did"], why: "most vivid" },
    { sentence: "The old floorboards ______ under his weight.", right: "groaned", wrong: ["made a noise", "were loud", "sounded"], why: "most vivid" },
    { sentence: "Snow ______ silently against the window all night.", right: "drifted", wrong: ["came", "happened", "did"], why: "most vivid" },
    { sentence: "The detective ______ the room for the smallest clue.", right: "scoured", wrong: ["saw", "watched", "noticed"], why: "most vivid" }
  ];

  function wordChoicePrecision(i) {
    const item = pick(PRECISION_ITEMS, i);
    return mkE("Word Choice",
      `Which word completes this sentence most effectively?\n\n"${item.sentence}"`,
      item.right, item.wrong, hardDiff(i), i);
  }

  const CONNECTIVE_ITEMS = [
    { sentence: "It rained all morning; ______, the match went ahead as planned.", right: "however", wrong: ["therefore", "because", "meanwhile"], level: 2 },
    { sentence: "The road was flooded; ______, we had to turn back.", right: "therefore", wrong: ["however", "although", "nevertheless"], level: 2 },
    { sentence: "______ she had revised for weeks, Marcus was still nervous.", right: "Although", wrong: ["Therefore", "However", "Because"], level: 2 },
    { sentence: "We packed the tent, the stove and the maps; ______, we set off.", right: "finally", wrong: ["however", "although", "because"], level: 3 },
    { sentence: "The film was long; ______, nobody left before the end.", right: "nevertheless", wrong: ["therefore", "consequently", "similarly"], level: 3 },
    { sentence: "He missed the bus ______ he had overslept.", right: "because", wrong: ["although", "however", "therefore"], level: 1 }
  ];

  function wordChoiceConnective(i) {
    const item = pick(CONNECTIVE_ITEMS, i);
    return mkE("Word Choice",
      `Choose the word that completes this sentence correctly.\n\n"${item.sentence}"`,
      item.right, item.wrong, item.level, i);
  }

  /* ═══════════════════ LITERARY DEVICES ═══════════════════ */

  const DEVICE_EXAMPLES = [
    ["The wind howled through the empty streets.", "Personification", 2],
    ["Her eyes were as bright as polished glass.", "Simile", 1],
    ["The classroom was a zoo that afternoon.", "Metaphor", 2],
    ["Silently the silver snow settled on the slate.", "Alliteration", 1],
    ["The bacon sizzled and the kettle hissed.", "Onomatopoeia", 2],
    ["I have told you a million times already.", "Hyperbole", 2],
    ["It was a deafening silence.", "Oxymoron", 4],
    ["He ran and ran and ran until his legs gave way.", "Repetition", 2],
    ["The old house groaned as the storm arrived.", "Personification", 2],
    ["Her temper was a firework waiting for a match.", "Metaphor", 2],
    ["The fog crept in on quiet feet.", "Personification", 2],
    ["He was as stubborn as a rusted bolt.", "Simile", 1],
    ["Buzzing, clattering, thudding — the workshop never rested.", "Onomatopoeia", 2],
    ["Big brown bears blundered through the bracken.", "Alliteration", 1],
    ["This suitcase weighs a tonne.", "Hyperbole", 2],
    ["Do we really want to be the generation that let it go?", "Rhetorical question", 3]
  ];

  const DEVICE_NAMES = ["Simile", "Metaphor", "Personification", "Alliteration",
                        "Onomatopoeia", "Hyperbole", "Oxymoron", "Repetition", "Rhetorical question"];

  function litIdentify(i) {
    const [example, device, level] = pick(DEVICE_EXAMPLES, i);
    const wrong = DEVICE_NAMES.filter(name => name !== device);
    return mkE("Literary Devices",
      `Which technique is being used here?\n\n"${example}"`,
      device, [pick(wrong, i), pick(wrong, i + 3), pick(wrong, i + 6)], level, i);
  }

  function litFindExample(i) {
    const [example, device, level] = pick(DEVICE_EXAMPLES, i + 5);
    const wrong = DEVICE_EXAMPLES.filter(pair => pair[1] !== device);
    return mkE("Literary Devices",
      `Which of these is an example of ${device.toLowerCase()}?`,
      example, [pick(wrong, i)[0], pick(wrong, i + 4)[0], pick(wrong, i + 8)[0]], level, i + 1);
  }

  const DEVICE_DEFINITIONS = [
    ["Simile", "A comparison that uses 'like' or 'as'", 1],
    ["Metaphor", "A comparison that says one thing IS another", 2],
    ["Personification", "Giving human qualities to something that is not human", 2],
    ["Alliteration", "Repeating the same sound at the start of nearby words", 1],
    ["Onomatopoeia", "A word that imitates the sound it describes", 2],
    ["Hyperbole", "Deliberate exaggeration for effect", 2],
    ["Oxymoron", "Two words of opposite meaning placed together", 4],
    ["Rhetorical question", "A question asked for effect, not for an answer", 3]
  ];

  function litDefinition(i) {
    const [device, meaning, level] = pick(DEVICE_DEFINITIONS, i);
    const wrong = others(DEVICE_DEFINITIONS, i).map(pair => pair[1]);
    if (wrong.includes(meaning)) return null;
    return mkE("Literary Devices",
      `What is ${/^[aeiou]/i.test(device) ? "an" : "a"} ${device.toLowerCase()}?`,
      meaning, wrong, level, i);
  }

  const WORD_EFFECT_ITEMS = [
    { quote: "the little town was anchored on a windy plain", word: "anchored",
      right: "It suggests the town is holding on against a force strong enough to move it",
      wrong: ["It tells us the town is beside the sea", "It shows the town is newly built", "It proves the town has a harbour"] },
    { quote: "the traffic crawled towards the roundabout", word: "crawled",
      right: "It makes the traffic seem painfully slow",
      wrong: ["It shows the cars were damaged", "It suggests the drivers were children", "It tells us the road was uphill"] },
    { quote: "she spat the words at him", word: "spat",
      right: "It makes her speech sound bitter and forceful",
      wrong: ["It shows she was eating at the time", "It suggests she was whispering", "It tells us she was unwell"] },
    { quote: "the sunlight dripped through the leaves", word: "dripped",
      right: "It makes the light seem to fall slowly, like liquid",
      wrong: ["It shows that it had been raining", "It suggests the leaves were wet", "It proves the tree was dying"] },
    { quote: "hope flickered for a moment", word: "flickered",
      right: "It suggests the hope was faint and might go out",
      wrong: ["It shows the lights were failing", "It suggests the hope was permanent", "It tells us a fire had started"] },
    { quote: "the mountains guarded the valley", word: "guarded",
      right: "It gives the mountains a protective, human role",
      wrong: ["It shows soldiers were stationed there", "It suggests the valley was a prison", "It tells us the mountains were tall"] }
  ];

  function litWordEffect(i) {
    const item = pick(WORD_EFFECT_ITEMS, i);
    return mkE("Literary Devices",
      `Why might the writer have chosen the word "${item.word}" here?\n\n"${item.quote}"`,
      item.right, item.wrong, hardDiff(i), i);
  }

  /* ═══════════════════ METHODS ═══════════════════
     The technique behind each template, shown when a child gets the question
     wrong. Keyed by generator name. Spelling and homophone templates set their
     own q.explain from the word itself, which is more useful than a general
     rule, and that takes precedence. */

  /* ── Counting a word class in a sentence ──────────────────────────────
     The papers ask "how many adjectives are there in the sentence starting
     ...". `words` is the list the count is of, so the hint can name them and
     the count is checked against the list rather than asserted. Determiners
     (a, the, this, my) are not adjectives, which is the national curriculum
     line and the line the papers mark to; the sentences avoid anything where
     that decision would change the answer. */
  const COUNT_ITEMS = [
    { sentence: "A cold wind rattled the loose shutters of the empty cottage.",
      cls: "adjectives", words: ["cold", "loose", "empty"], level: 3 },
    { sentence: "The old man carried a heavy bucket up the steep hill.",
      cls: "adjectives", words: ["old", "heavy", "steep"], level: 3 },
    { sentence: "Bright lanterns swung above the narrow street, and the warm air smelled of dust.",
      cls: "adjectives", words: ["Bright", "narrow", "warm"], level: 4 },
    { sentence: "She opened the gate, crossed the yard and knocked twice.",
      cls: "verbs", words: ["opened", "crossed", "knocked"], level: 3 },
    { sentence: "He read until the bell rang, then stood up and left.",
      cls: "verbs", words: ["read", "rang", "stood", "left"], level: 4 },
    { sentence: "The kettle boiled, the toast burned, and nobody noticed.",
      cls: "verbs", words: ["boiled", "burned", "noticed"], level: 3 },
    { sentence: "She told him that they would meet us at the station.",
      cls: "pronouns", words: ["She", "him", "they", "us"], level: 4 },
    { sentence: "I gave it to her because she asked me twice.",
      cls: "pronouns", words: ["I", "it", "her", "she", "me"], level: 4 },
    { sentence: "He spoke quietly, then suddenly stopped altogether.",
      cls: "adverbs", words: ["quietly", "suddenly", "altogether"], level: 4 },
    { sentence: "The farmer loaded hay onto the cart while the dog watched.",
      cls: "nouns", words: ["farmer", "hay", "cart", "dog"], level: 3 },
    { sentence: "Rain fell on the roof, the path and the garden all afternoon.",
      cls: "nouns", words: ["Rain", "roof", "path", "garden", "afternoon"], level: 4 },
    { sentence: "She waited beside the door until after the storm.",
      cls: "prepositions", words: ["beside", "until", "after"], level: 4 }
  ];

  function graCountWordClass(i) {
    const item = pick(COUNT_ITEMS, i);
    const n = item.words.length;
    /* Offer the neighbouring counts: the mistakes worth catching are counting
       one too many or one too few, not a wild guess. */
    const wrong = firstDistinct(`${n}`, [`${n - 1}`, `${n + 1}`, `${n + 2}`, `${n - 2}`]);
    if (!wrong) return null;
    const q = mkE("Grammar",
      `How many ${item.cls} are there in this sentence?\n\n"${item.sentence}"`,
      `${n}`, wrong, item.level, i);
    if (q) q.explain = `Go through the sentence one word at a time. The ${item.cls} are: ` +
      `${item.words.join(", ")} — that is ${n}. Remember that a, the, this and my are ` +
      `determiners, not adjectives.`;
    return q;
  }
  graCountWordClass.poolSize = COUNT_ITEMS.length;

  /* ── The meaning of an inverted or archaic clause ─────────────────────
     "What is the meaning of this clause?" in the papers. These constructions
     ("Had I known", "No sooner had") carry their meaning in their word order
     rather than in any one word, which is what makes them hard. */
  const CLAUSE_MEANING_ITEMS = [
    { sentence: "Had I known the road was flooded, I should have taken the train.",
      clause: "Had I known the road was flooded",
      meaning: "If I had known the road was flooded",
      wrong: ["When I found out the road was flooded",
              "I did not know the road was flooded",
              "I asked whether the road was flooded"] },
    { sentence: "Little did she suspect what was waiting in the hall.",
      clause: "Little did she suspect",
      meaning: "She had no idea",
      wrong: ["She suspected a small thing", "She slightly suspected something",
              "She was suspected by somebody"] },
    { sentence: "Much as I admire his courage, I cannot agree with him.",
      clause: "Much as I admire his courage",
      meaning: "Although I admire his courage very much",
      wrong: ["Because I admire his courage so much",
              "As soon as I began to admire his courage",
              "I admire his courage more than he does"] },
    { sentence: "Were it not for the fog, we should see the whole valley.",
      clause: "Were it not for the fog",
      meaning: "If the fog were not there",
      wrong: ["The fog was not there", "Whenever the fog clears",
              "Because of the fog"] },
    { sentence: "No sooner had the bell rung than the corridor filled with children.",
      clause: "No sooner had the bell rung",
      meaning: "Immediately after the bell rang",
      wrong: ["Before the bell rang", "The bell had not rung yet",
              "Long after the bell rang"] },
    { sentence: "Come what may, the ship sails at dawn.",
      clause: "Come what may",
      meaning: "Whatever happens",
      wrong: ["When May arrives", "If anybody comes", "As the weather allows"] },
    { sentence: "Try as he might, he could not lift the lid.",
      clause: "Try as he might",
      meaning: "However hard he tried",
      wrong: ["He might try later", "He did not try at all",
              "He tried in the same way as before"] },
    { sentence: "Not that it matters now, but the letter arrived a week late.",
      clause: "Not that it matters now",
      meaning: "Although it is no longer important",
      wrong: ["It does not matter what happens next",
              "Nothing about it matters at all",
              "It matters now more than it did"] },
    { sentence: "Should the weather turn, the match will be moved indoors.",
      clause: "Should the weather turn",
      meaning: "If the weather changes",
      wrong: ["The weather ought to change", "The weather has already changed",
              "Whenever the weather is good"] },
    { sentence: "Seldom had the town seen such a crowd.",
      clause: "Seldom had the town seen such a crowd",
      meaning: "The town had rarely seen a crowd like this",
      wrong: ["The town saw crowds like this often",
              "The town had never seen a crowd before",
              "The crowd had not seen the town"] }
  ];

  function graClauseMeaning(i) {
    const item = pick(CLAUSE_MEANING_ITEMS, i);
    const q = mkE("Grammar",
      `Read this sentence.\n\n"${item.sentence}"\n\nWhat is the meaning of the clause "${item.clause}"?`,
      item.meaning, item.wrong, 4, i);
    if (q) q.explain = `Rewrite the clause in ordinary word order and the meaning appears: ` +
      `"${item.clause}" says the same as "${item.meaning}". The unusual order is there for ` +
      `effect, and does not change what is being said.`;
    return q;
  }
  graClauseMeaning.poolSize = CLAUSE_MEANING_ITEMS.length;

  /* ── Two devices at once ──────────────────────────────────────────────
     "Which two literary devices are used in lines 21-22?" is asked in four of
     the scanned papers, and is harder than naming one: a child who spots the
     obvious device still has to rule out three pairings that each contain it.
     Every distractor pair therefore shares one device with the answer. */
  const TWO_DEVICE_ITEMS = [
    { text: "The wind whispered its worries to the waiting willows.",
      devices: ["Alliteration", "Personification"],
      near: ["Simile", "Metaphor", "Onomatopoeia"] },
    { text: "Her voice was a silver bell, ringing and ringing across the yard.",
      devices: ["Metaphor", "Repetition"],
      near: ["Simile", "Hyperbole", "Alliteration"] },
    { text: "The thunder grumbled like a giant turning over in his sleep.",
      devices: ["Personification", "Simile"],
      near: ["Metaphor", "Onomatopoeia", "Oxymoron"] },
    { text: "Crash! Bang! The morning was a battlefield of noise.",
      devices: ["Metaphor", "Onomatopoeia"],
      near: ["Simile", "Repetition", "Personification"] },
    { text: "Sad, silent and still, the seashore said nothing at all.",
      devices: ["Alliteration", "Personification"],
      near: ["Hyperbole", "Simile", "Repetition"] },
    { text: "I have waited a thousand years for this bus, and still the road stares back at me.",
      devices: ["Hyperbole", "Personification"],
      near: ["Simile", "Metaphor", "Alliteration"] },
    { text: "The clock ticked, and ticked, and ticked, as loud as a hammer.",
      devices: ["Repetition", "Simile"],
      near: ["Metaphor", "Onomatopoeia", "Hyperbole"] },
    { text: "Do we really want to be the city whose cold heart turns them away?",
      devices: ["Personification", "Rhetorical question"],
      near: ["Metaphor", "Alliteration", "Simile"] },
    { text: "The frost fingered the fence, and the fence flinched.",
      devices: ["Alliteration", "Personification"],
      near: ["Onomatopoeia", "Simile", "Oxymoron"] },
    { text: "His temper was a firework, fizzing and flashing and finally exploding.",
      devices: ["Alliteration", "Metaphor"],
      near: ["Simile", "Hyperbole", "Repetition"] },
    { text: "It was a deafening silence, heavy as a held breath.",
      devices: ["Oxymoron", "Simile"],
      near: ["Metaphor", "Personification", "Alliteration"] },
    { text: "Buzzing and clattering, the workshop shouted at anyone who came near.",
      devices: ["Onomatopoeia", "Personification"],
      near: ["Simile", "Metaphor", "Hyperbole"] }
  ];

  /* "Alliteration and personification" - the pair is printed in a fixed order
     so that the same two devices never appear as two differently worded
     options, which would be two correct answers. */
  const pairLabel = (a, b) => {
    const [x, y] = [a, b].sort();
    return `${x} and ${y.toLowerCase()}`;
  };

  function litTwoDevices(i) {
    const item = pick(TWO_DEVICE_ITEMS, i);
    const [a, b] = item.devices;
    /* Each distractor keeps one of the two real devices and swaps the other,
       so no option can be dismissed without reading the sentence properly. */
    const candidates = [
      pairLabel(a, item.near[0]), pairLabel(b, item.near[1]),
      pairLabel(a, item.near[2]), pairLabel(b, item.near[0]),
      pairLabel(item.near[0], item.near[1])
    ];
    const wrong = firstDistinct(pairLabel(a, b), candidates);
    if (!wrong) return null;
    const q = mkE("Literary Devices",
      `Which TWO literary devices are used here?\n\n"${item.text}"`,
      pairLabel(a, b), wrong, 4, i);
    if (q) q.explain = `Two devices are at work at once, so check each option's ` +
      `halves separately — three of them name one device that is really there and ` +
      `one that is not. Here it is ${pairLabel(a, b).toLowerCase()}.`;
    return q;
  }
  litTwoDevices.poolSize = TWO_DEVICE_ITEMS.length;

  const METHODS = {
    spellFindMisspelt: "Read each word slowly, syllable by syllable, and check the tricky letter pattern rather than the overall shape.",
    spellChooseCorrect: "Cover the options and write the word yourself first, then look for the one that matches.",
    spellInSentence: "Read the sentence aloud. Short familiar words are usually right, so check the longest, least common word first.",
    spellHomophone: "These words sound alike but mean different things. Replace the gap with the full meaning and see which still makes sense.",
    spellAnyMistake: "Check every word before deciding. Sometimes all four are correct, and 'No mistake' is the answer.",

    punApostropheSingular: "One owner: put the apostrophe straight after the owner, then add s — the boy's football.",
    punApostrophePlural: "Several owners: the plural already ends in s, so the apostrophe goes after it — the girls' bags.",
    punIrregularPossessive: "Plurals that do not end in s take apostrophe-s like a singular — children's, women's, people's.",
    punContraction: "The apostrophe stands exactly where the missing letters were: could not loses the o, so could'nt is wrong and couldn't is right.",
    punDirectSpeech: "The closing mark goes inside the speech marks, and a statement takes a comma there, not a full stop. The reporting clause then stays lower case.",
    punReportedFirst: "When the speaker comes first, a comma goes before the speech marks, and the words spoken keep their own end mark inside.",
    punColonList: "A colon introduces a list after a complete statement. A comma is not strong enough to do that job.",
    punSemicolon: "A semicolon joins two complete sentences that are closely related. Both halves must stand on their own.",
    punCommaSplice: "Two complete sentences cannot be joined by a comma alone. Use a full stop, a semicolon, or add a joining word.",
    punFindSegment: "Read each labelled part on its own and ask what punctuation it needs. Check apostrophes and speech marks first — and remember nothing may be wrong.",
    punCapitals: "Capitals go on names, places, days, months, languages and the start of a sentence — but not on ordinary nouns like winter or school.",
    punEqualAdjectives: "Two adjectives of the same kind take a comma between them. If one belongs with the noun as a pair, leave it out.",
    punSentenceEnding: "Decide what the sentence is doing. A question asks, an exclamation exclaims, a statement tells — even a sentence containing 'whether' can still be a statement.",
    punFullStop: "A full stop must leave a complete sentence on both sides. If one side cannot stand alone, it needed a comma or a joining word instead.",

    graPastSimple: "The simple past stands alone: yesterday I went. If you need 'have' or 'had' in front of it, you have the wrong form.",
    graPastParticiple: "The past participle is the form used after have, has or had — I have gone, not I have went.",
    graPronoun: "Take the other person out of the sentence and read it again. 'Told I' sounds wrong, so it must be 'told me'.",
    graPlural: "Most plurals add s or es, but many everyday words change completely. An apostrophe never makes a plural.",
    graComparative: "Comparing two things: short words add -er, longer ones take 'more'. Never use both together.",
    graSuperlative: "Comparing three or more: short words add -est, longer ones take 'most'. Some words change altogether — good, better, best.",
    graAgreement: "Find the real subject. Words like each, neither and one of are singular however many nouns follow them.",
    graPartOfSpeech: "Ask what the word is doing. Naming is a noun, doing is a verb, describing a noun is an adjective, describing a verb is an adverb.",
    graSentenceType: "A statement tells, a question asks, a command instructs, an exclamation shows strong feeling.",
    graTense: "Match the tenses across the sentence so the order of events is clear. Once and by the time signal that one action finished before the other.",
    graSubjunctive: "For something imagined rather than real, use 'were' rather than 'was' — if I were you. After insist or essential, the verb stays as 'be'.",
    graPassiveVoice: "In the passive the subject has the action done to it, and the verb uses a form of 'be' plus a past participle — was broken, had been posted.",
    graSubordinateClause: "The subordinate clause cannot stand on its own. It usually starts with a word like although, because, when, which or that.",

    vocSynonym: "Put each option into the original sentence in place of the word. The synonym is the one that leaves the meaning unchanged.",
    vocAntonym: "Look for the true opposite, not just a word that is different. Check the part of speech matches too.",
    vocDefinition: "Look for a root or prefix you recognise inside the word, then choose the meaning that fits it.",
    vocIdiom: "An idiom does not mean what its words say. Think about when you have heard the phrase used.",
    vocCollective: "Collective nouns must be learned individually. Many are unexpected — a murder of crows, a parliament of owls.",
    vocPrefix: "The prefix carries the meaning. Think of other words that begin the same way and work out what they share.",
    vocWordGroup: "Test all the words against one class. If they all describe a noun they are adjectives; if they all describe a verb they are adverbs.",

    wordChoice: "Read the whole sentence with each option in place. The right one must be both sensible and correct English.",
    wordChoicePrecision: "All the options may fit grammatically, so choose the one that gives the sharpest picture rather than the first that works.",
    wordChoiceConnective: "Decide what the connective must do — add, contrast, or show a result — then pick the one that does it.",

    litIdentify: "A simile compares using like or as; a metaphor says one thing IS another; personification gives human qualities to something that is not human.",
    litFindExample: "Check each option against the definition rather than choosing the one that sounds most poetic.",
    litDefinition: "Learn these by their distinguishing feature: the word 'like' or 'as' marks a simile, and only personification gives human behaviour to an object.",
    litWordEffect: "Ask what the word suggests beyond its plain meaning, and what the writer gains by choosing it over an ordinary alternative."
  };

  /* ═══════════════════ DRIVER ═══════════════════ */

  /* Two kinds of entry, because English difficulty has two sources.

     [template]              — the item decides. Knowing that "acquiescence" is
                               misspelled is nothing like knowing "friend" is,
                               so those templates read the level off the word
                               and the driver leaves it alone.
     [template, lo, hi]      — the rule decides. Every apostrophe-of-possession
                               question is worth about the same, whichever noun
                               it happens to use, so the band applies. */
  const generators = {
    Spelling: [
      [spellFindMisspelt], [spellChooseCorrect], [spellInSentence], [spellHomophone],
      [spellAnyMistake]                // includes sets with no mistake at all
    ],
    Punctuation: [
      [punApostropheSingular, 1, 2],   // one owner, apostrophe before the s
      [punApostrophePlural, 2, 3],     // several owners, apostrophe after
      [punIrregularPossessive, 2, 3],  // children's, women's
      [punContraction, 1, 2],
      [punDirectSpeech, 2, 3],
      [punReportedFirst, 2, 3],
      [punColonList, 2, 3],
      [punSemicolon, 3, 3],
      [punCommaSplice, 3, 4],          // name the fault, not just spot it
      [punFindSegment, 3, 4],          // find the error in running text
      [punCapitals, 1, 2],
      [punEqualAdjectives],            // comma between adjectives of equal weight
      [punSentenceEnding],             // the mark a sentence should end on
      [punFullStop]                    // full stop used where it should not be
    ],
    Grammar: [
      [graPastSimple, 1, 2], [graPastParticiple, 2, 3],
      [graPronoun], [graPlural],
      [graComparative, 2, 3], [graSuperlative, 2, 3],
      [graAgreement], [graPartOfSpeech],
      [graSentenceType, 1, 2], [graTense],
      [graSubjunctive, 4, 4],          // the unreal conditional
      [graPassiveVoice, 4, 4],         // recognise the passive
      [graSubordinateClause, 4, 4],    // name the clause type
      [graCountWordClass, 3, 4],       // how many adjectives in the sentence
      [graClauseMeaning, 4, 4]         // unpick an inverted clause
    ],
    Vocabulary: [
      [vocSynonym], [vocAntonym], [vocDefinition], [vocIdiom],
      [vocCollective], [vocPrefix], [vocWordGroup]
    ],
    "Word Choice": [
      [wordChoice],
      [wordChoicePrecision, 3, 4],     // the best word, not merely a correct one
      [wordChoiceConnective]
    ],
    "Literary Devices": [
      [litIdentify], [litFindExample], [litDefinition],
      [litWordEffect, 3, 4],           // explain the effect of a word choice
      [litTwoDevices, 4, 4]            // two devices at once, as the papers ask
    ]
  };

  // Single scale knob, matching js/questions.js.
  const VARIATIONS_PER_TEMPLATE = 30;

  ENGLISH_QUESTIONS.push(...buildComprehension());

  Object.values(generators).forEach(gens => {
    gens.forEach(([gen, lo, hi], gIdx) => {
      const span = lo ? hi - lo + 1 : 0;
      // A generator backed by a pool bigger than the default needs one variation
      // per pool entry, or the tail of the pool is never reached.
      const variations = Math.max(VARIATIONS_PER_TEMPLATE, gen.poolSize || 0);
      for (let v = 0; v < variations; v++) {
        try {
          const q = gen(v + gIdx * 13);
          if (!q) continue;
          if (span) q.difficulty = lo + (v % span);
          q.template = gen.name;
          if (!q.explain && METHODS[gen.name]) q.explain = METHODS[gen.name];
          ENGLISH_QUESTIONS.push(q);
        } catch (e) { /* skip bad seed */ }
      }
    });
  });

  /* Generators cycle through fixed pools, so the same question can be produced
     more than once. Keep the first of each. */
  const seen = new Set();
  root.ENGLISH_QUESTIONS = ENGLISH_QUESTIONS.filter(q => {
    const key = `${q.topic}|${q.question}|${q.options.join("|")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
})();
