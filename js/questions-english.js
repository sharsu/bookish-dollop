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
      near: ["Simile", "Metaphor", "Hyperbole"] },
    { text: "The kettle complained, and complained, and finally screamed.",
      devices: ["Personification", "Repetition"],
      near: ["Simile", "Metaphor", "Hyperbole"] },
    { text: "Her laugh was a bell, bright as broken glass.",
      devices: ["Metaphor", "Simile"],
      near: ["Alliteration", "Hyperbole", "Repetition"] },
    { text: "Ten thousand leaves lay listless on the lawn.",
      devices: ["Alliteration", "Hyperbole"],
      near: ["Simile", "Personification", "Onomatopoeia"] },
    { text: "Silence settled on the street, soft as a held breath.",
      devices: ["Alliteration", "Simile"],
      near: ["Metaphor", "Personification", "Repetition"] },
    { text: "Must we wait for ever while the clock stares us down?",
      devices: ["Personification", "Rhetorical question"],
      near: ["Simile", "Metaphor", "Onomatopoeia"] },
    { text: "The gate creaked, creaked again, and then gave up entirely.",
      devices: ["Onomatopoeia", "Repetition"],
      near: ["Simile", "Metaphor", "Alliteration"] },
    { text: "His patience was a thin sheet of ice, thinner every hour.",
      devices: ["Metaphor", "Repetition"],
      near: ["Simile", "Hyperbole", "Alliteration"] },
    { text: "A cheerful gloom hung over the hall, heavy as old curtains.",
      devices: ["Oxymoron", "Simile"],
      near: ["Metaphor", "Personification", "Alliteration"] },
    { text: "Windows watched us. Walls waited. We went in anyway.",
      devices: ["Alliteration", "Personification"],
      near: ["Simile", "Hyperbole", "Onomatopoeia"] },
    { text: "I have climbed a million stairs, and every one of them creaked.",
      devices: ["Hyperbole", "Onomatopoeia"],
      near: ["Simile", "Metaphor", "Personification"] },
    { text: "Is it fair that the same few streets flood every single winter?",
      devices: ["Repetition", "Rhetorical question"],
      near: ["Simile", "Metaphor", "Alliteration"] }
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


  /* ══════════ LITERARY DEVICES, HARDER ══════════
     The scanned papers offer "pathetic fallacy" alongside metaphor, simile,
     personification and alliteration in the same option list, so the harder
     names are fair game. `avoid` names the devices that genuinely also apply to
     a sentence and so must never appear as one of its distractors. */
  const HARD_DEVICE_NAMES = ["Simile", "Metaphor", "Personification", "Alliteration",
    "Onomatopoeia", "Hyperbole", "Oxymoron", "Repetition", "Rhetorical question",
    "Pathetic fallacy", "Sibilance", "Assonance", "Juxtaposition", "Litotes",
    "Symbolism", "Anaphora"];

  const HARD_DEVICE_ITEMS = [
    { text: "The sky wept with her as she folded the last of his shirts.",
      device: "Pathetic fallacy", avoid: ["Personification"] },
    { text: "The storm broke over the house on the morning of the funeral.",
      device: "Pathetic fallacy", avoid: ["Personification", "Symbolism"] },
    { text: "The sea slid softly across the sand and whispered as it settled.",
      device: "Sibilance", avoid: ["Alliteration", "Personification", "Onomatopoeia"] },
    { text: "She sensed the silence spreading through the sleeping house.",
      device: "Sibilance", avoid: ["Alliteration"] },
    { text: "The pale grey waves came scraping up the beach again and again.",
      device: "Assonance", avoid: ["Alliteration"] },
    { text: "He was not unimpressed by the size of the crowd.",
      device: "Litotes", avoid: [] },
    { text: "Winning the prize was no small achievement for a boy of nine.",
      device: "Litotes", avoid: ["Hyperbole"] },
    { text: "Inside the palace, silver dishes; outside the gate, a boy with no shoes.",
      device: "Juxtaposition", avoid: ["Symbolism"] },
    { text: "The old man's garden was neat and clipped; his son's was a tangle of weeds.",
      device: "Juxtaposition", avoid: [] },
    { text: "The single candle in the window stood for everything she still hoped for.",
      device: "Symbolism", avoid: ["Metaphor"] },
    { text: "He kept the broken watch in his pocket, and would not have it mended.",
      device: "Symbolism", avoid: [] },
    { text: "We waited for the letter. We waited for the knock. We waited for the news.",
      device: "Anaphora", avoid: ["Repetition"] },
    { text: "Every window was dark. Every door was locked. Every path was empty.",
      device: "Anaphora", avoid: ["Repetition"] },
    { text: "It was a cruel kindness to tell her the truth so late.",
      device: "Oxymoron", avoid: [] },
    { text: "The room was full of a busy stillness that nobody dared break.",
      device: "Oxymoron", avoid: ["Personification"] },
    { text: "The wind shouldered the gate open and went through the yard.",
      device: "Personification", avoid: ["Pathetic fallacy", "Metaphor"] },
    { text: "Her patience was a thread worn down to its last fibre.",
      device: "Metaphor", avoid: ["Symbolism"] },
    { text: "Have we really nothing better to offer them than this?",
      device: "Rhetorical question", avoid: [] },
    { text: "The gate groaned, the hinges shrieked, and the latch clacked shut.",
      device: "Onomatopoeia", avoid: ["Personification", "Alliteration"] },
    { text: "He had told that story a hundred thousand times before breakfast.",
      device: "Hyperbole", avoid: [] },
    { text: "The shutters slammed as the news came through the door.",
      device: "Pathetic fallacy", avoid: ["Personification", "Onomatopoeia"] },
    { text: "Sunshine broke over the yard on the morning she came home.",
      device: "Pathetic fallacy", avoid: ["Symbolism", "Personification"] },
    { text: "So softly the snow came, settling on the sill and the step.",
      device: "Sibilance", avoid: ["Alliteration", "Personification"] },
    { text: "The deep green weed grew thickly where the stream slept.",
      device: "Assonance", avoid: ["Alliteration", "Personification"] },
    { text: "It was not the worst meal he had eaten that week.",
      device: "Litotes", avoid: ["Hyperbole"] },
    { text: "She was no stranger to hard work, and never had been.",
      device: "Litotes", avoid: [] },
    { text: "New paint on the front door; the back of the house still bare brick.",
      device: "Juxtaposition", avoid: ["Symbolism"] },
    { text: "One brother kept every letter; the other burned his the day it came.",
      device: "Juxtaposition", avoid: [] },
    { text: "She wore her mother's ring to every interview.",
      device: "Symbolism", avoid: ["Metaphor"] },
    { text: "The bare tree outside the window came into every photograph that year.",
      device: "Symbolism", avoid: ["Personification"] },
    { text: "Nobody spoke. Nobody moved. Nobody looked at the door.",
      device: "Anaphora", avoid: ["Repetition"] },
    { text: "Give me the maps. Give me the boots. Give me until Friday.",
      device: "Anaphora", avoid: ["Repetition"] },
    { text: "There was a terrible beauty in the wreck of the old pier.",
      device: "Oxymoron", avoid: [] },
    { text: "His memory was a drawer nobody had tidied for years.",
      device: "Metaphor", avoid: ["Symbolism"] }
  ];

  function litHarderDevice(i) {
    const item = pick(HARD_DEVICE_ITEMS, i);
    /* A device that genuinely also applies cannot be a wrong answer. */
    const banned = [item.device, ...item.avoid];
    const wrong = HARD_DEVICE_NAMES.filter(n => !banned.includes(n));
    const picked = firstDistinct(item.device,
      [pick(wrong, i), pick(wrong, i + 5), pick(wrong, i + 9), pick(wrong, i + 2),
       pick(wrong, i + 11), pick(wrong, i + 7)]);
    if (!picked) return null;
    const q = mkE("Literary Devices",
      `Which technique is being used here?\n\n"${item.text}"`,
      item.device, picked, 4, i);
    if (q) q.explain = DEVICE_NOTES[item.device] ||
      `This is ${item.device.toLowerCase()}.`;
    return q;
  }
  litHarderDevice.poolSize = HARD_DEVICE_ITEMS.length;

  /* One short definition per device, used as the hint wherever a device is
     named, so a child who has never met "litotes" is told what it is. */
  const DEVICE_NOTES = {
    "Pathetic fallacy": "Pathetic fallacy is when the weather or the landscape carries the mood of the scene. It is a kind of personification, but the test is narrower: the thing given feelings has to be the natural world, and the feelings have to match the character's.",
    Sibilance: "Sibilance is a run of s, sh and soft c sounds. It is alliteration narrowed to one family of sounds, so look for a hiss running through the line rather than any repeated letter.",
    Assonance: "Assonance repeats a VOWEL sound inside nearby words, not the first letter. Say the line aloud and listen for the same vowel coming back.",
    Litotes: "Litotes says something by denying the opposite — \"not bad\" for good, \"no small thing\" for important. It understates on purpose, which is the reverse of hyperbole.",
    Juxtaposition: "Juxtaposition sets two contrasting things side by side and lets the gap between them do the work. Nothing is compared or renamed — they are simply placed together.",
    Symbolism: "Symbolism lets an object stand for an idea bigger than itself. Unlike a metaphor, nothing is called something else: the object stays exactly what it is and carries the meaning as well.",
    Anaphora: "Anaphora repeats the same words at the START of consecutive clauses or sentences. Plain repetition can happen anywhere; anaphora is repetition lined up at the beginning.",
    Oxymoron: "An oxymoron puts two words that contradict each other side by side — \"cruel kindness\", \"busy stillness\" — so the contradiction itself is the point.",
    Personification: "Personification gives human behaviour to something that is not human. Ask what the thing is doing: if only a person could do it, that is personification.",
    Metaphor: "A metaphor says one thing IS another, with no \"like\" or \"as\". Check whether the sentence renames something or merely compares it.",
    "Rhetorical question": "A rhetorical question is asked for effect and not for an answer — the writer already knows what the reader will think.",
    Onomatopoeia: "Onomatopoeia is a word that imitates the sound it names. Say the word aloud: if it sounds like the thing itself, that is onomatopoeia.",
    Hyperbole: "Hyperbole is deliberate exaggeration, not meant to be believed. The clue is a quantity nobody could mean literally."
  };

  /* "Which of these is NOT an example of ..." - four short sentences, three of
     which use the device. Harder than naming a device once, because all four
     have to be tested rather than the first convincing one chosen. */
  const NOT_EXAMPLE_SETS = [
    { device: "a simile",
      yes: ["Her hands were as cold as the railings.",
            "He slept like a stone all afternoon.",
            "The kitchen smelled like autumn."],
      no: "The kettle grumbled on the stove." },
    { device: "a metaphor",
      yes: ["The classroom was a beehive that morning.",
            "His voice is sandpaper.",
            "Her memory is a sieve."],
      no: "Her memory is as poor as mine." },
    { device: "personification",
      yes: ["The floorboards complained under his weight.",
            "The wind rattled the letterbox and would not stop asking.",
            "The old clock coughed before it struck."],
      no: "The clock was as loud as a hammer." },
    { device: "alliteration",
      yes: ["Six silver spoons sat on the sill.",
            "Bright banners blew above the bridge.",
            "The dog dozed by the dying fire."],
      no: "The kettle boiled over again." },
    { device: "onomatopoeia",
      yes: ["The bacon spat in the pan.",
            "Gravel crunched under the wheels.",
            "The gate clanged behind them."],
      no: "The evening was perfectly still." },
    { device: "hyperbole",
      yes: ["This bag weighs a tonne.",
            "I have asked you a million times.",
            "The queue went on for ever."],
      no: "The queue was longer than usual." },
    { device: "a rhetorical question",
      yes: ["Who would not want that for their own children?",
            "How much longer must we wait?",
            "Is that really too much to ask?"],
      no: "Which platform does the train leave from?" },
    { device: "repetition",
      yes: ["He walked and walked and walked.",
            "It was cold, cold enough to crack stone.",
            "No, no, no — not that one."],
      no: "He walked a long way that day." },
    { device: "an oxymoron",
      yes: ["a deafening silence", "a bitter sweetness", "an honest thief"],
      no: "a bitter wind" },
    { device: "a simile",
      yes: ["The lane was as narrow as a corridor.",
            "She sang like a bird let out of a cage.",
            "The paper was as thin as a moth's wing."],
      no: "The lane narrowed into a corridor of trees." },
    { device: "personification",
      yes: ["Hunger gnawed at him all morning.",
            "The town went to sleep early.",
            "The chimney breathed smoke into the dark."],
      no: "The town was quiet by nine o'clock." },
    { device: "alliteration",
      yes: ["Cold coins clinked in his coat.",
            "Ten tired travellers trudged on.",
            "Wide white wings crossed the water."],
      no: "The travellers were tired and cold." },
    { device: "a metaphor",
      yes: ["The playground was a battlefield by half past ten.",
            "Her diary is a mirror.",
            "That last week was a tunnel."],
      no: "Her diary is like a mirror." },
    { device: "personification",
      yes: ["The engine coughed twice and died.",
            "The last of the daylight slipped away without a word.",
            "The letterbox swallowed the envelope."],
      no: "The engine was as loud as a drum." },
    { device: "onomatopoeia",
      yes: ["The floorboard squeaked underfoot.",
            "Rain drummed on the corrugated roof.",
            "The lid clattered into the sink."],
      no: "Rain fell steadily until dawn." },
    { device: "hyperbole",
      yes: ["I have been waiting since the beginning of time.",
            "That coat cost a fortune.",
            "He eats enough for a whole village."],
      no: "He eats more than his brother does." },
    { device: "a simile",
      yes: ["His hands were as rough as bark.",
            "The path wound like a ribbon down the hill.",
            "She was as still as a photograph."],
      no: "She stood absolutely still in the doorway." },
    { device: "repetition",
      yes: ["Slowly, slowly, the door began to move.",
            "We tried, and tried, and tried again.",
            "Far, far away the lights of the town."],
      no: "The door began to move at last." },
    { device: "alliteration",
      yes: ["Grey gulls gathered on the groyne.",
            "Peter poured the pale tea patiently.",
            "Salt spray stung his skin."],
      no: "The gulls gathered on the wooden posts." }
  ];

  function litNotAnExample(i) {
    const set = pick(NOT_EXAMPLE_SETS, i);
    const q = mkE("Literary Devices",
      `Which of these is NOT an example of ${set.device}?`,
      set.no, set.yes, 4, i);
    if (q) q.explain =
      `Three of the four use the technique, so test every one rather than ` +
      `stopping at the first that fits. "${set.no}" is the odd one out: the ` +
      `other three are examples of ${set.device}, and this one is not.`;
    return q;
  }
  litNotAnExample.poolSize = NOT_EXAMPLE_SETS.length;

  /* Naming a device is the easy half. The papers also ask what it achieves,
     which cannot be answered from the device's definition alone. */
  const DEVICE_EFFECT_ITEMS = [
    { text: "The fog crept in on quiet feet.", device: "personification",
      effect: "It makes the fog seem deliberate, as though it is arriving on purpose",
      wrong: ["It tells the reader exactly how thick the fog was",
              "It suggests the fog is about to clear",
              "It shows that somebody is walking through the fog"] },
    { text: "The classroom was a zoo that afternoon.", device: "metaphor",
      effect: "It puts the noise and disorder of the room in one word, without listing anything",
      wrong: ["It tells the reader that animals had got into the school",
              "It suggests the children were frightened",
              "It shows the teacher was pleased with the class"] },
    { text: "I have told you a million times.", device: "hyperbole",
      effect: "It conveys the speaker's exasperation rather than a real number",
      wrong: ["It tells the reader precisely how often it was said",
              "It shows the speaker has a very good memory",
              "It suggests the speaker is being patient"] },
    { text: "He ran and ran and ran until his legs gave way.", device: "repetition",
      effect: "It stretches the running out, so the reader feels how long it went on",
      wrong: ["It shows he ran three separate times",
              "It suggests he stopped to rest between each run",
              "It tells the reader how fast he was going"] },
    { text: "Silently the silver snow settled on the slate.", device: "alliteration",
      effect: "The repeated soft sound makes the line itself feel hushed",
      wrong: ["It tells the reader how deep the snow was",
              "It shows the snow fell noisily",
              "It suggests the roof was about to give way"] },
    { text: "It was a deafening silence.", device: "an oxymoron",
      effect: "The contradiction captures a quiet so complete that it presses on the ear",
      wrong: ["It shows the room was extremely loud",
              "It suggests somebody had gone deaf",
              "It tells the reader that nobody was there"] },
    { text: "The old house groaned as the storm arrived.", device: "personification",
      effect: "It makes the house sound like something suffering, which prepares the reader for trouble",
      wrong: ["It explains that the timbers needed repair",
              "It shows somebody inside was in pain",
              "It suggests the storm had already passed"] },
    { text: "Her temper was a firework waiting for a match.", device: "metaphor",
      effect: "It makes her calm feel temporary, and the outburst feel certain",
      wrong: ["It shows she enjoys firework displays",
              "It suggests her temper is easy to control",
              "It tells the reader she was already angry"] },
    { text: "Do we really want to be the generation that let it go?", device: "a rhetorical question",
      effect: "It presses the reader to agree without ever stating the argument",
      wrong: ["It asks the reader for information the writer does not have",
              "It shows the writer is unsure what to think",
              "It invites the reader to answer out loud"] },
    { text: "The bacon sizzled and the kettle hissed.", device: "onomatopoeia",
      effect: "The words carry the sounds themselves, so the kitchen is heard as well as seen",
      wrong: ["It tells the reader what time breakfast was",
              "It shows the cooker was faulty",
              "It suggests the room was silent"] },
    { text: "He was as stubborn as a rusted bolt.", device: "a simile",
      effect: "It measures his stubbornness against something that will not move at all",
      wrong: ["It suggests he was old and unwell",
              "It shows he worked with machinery",
              "It tells the reader he changed his mind easily"] },
    { text: "The sky wept as she folded the last of his shirts.", device: "pathetic fallacy",
      effect: "The weather carries her grief, so the sentence never has to name it",
      wrong: ["It explains why the washing could not be hung out",
              "It shows she was watching the forecast",
              "It suggests she was glad of the rain"] },
    { text: "We waited for the letter. We waited for the knock. We waited for the news.",
      device: "anaphora",
      effect: "The repeated opening makes the waiting feel endless and out of their hands",
      wrong: ["It shows they waited on three separate days",
              "It suggests they had given up waiting",
              "It tells the reader what the news turned out to be"] },
    { text: "Inside the palace, silver dishes; outside the gate, a boy with no shoes.",
      device: "juxtaposition",
      effect: "Setting the two side by side makes the unfairness obvious without a word of comment",
      wrong: ["It explains how the palace kitchens were run",
              "It suggests the boy was about to be invited in",
              "It shows the two places were far apart"] },
    { text: "The playground was a battlefield by half past ten.", device: "metaphor",
      effect: "It makes the noise and aggression of the scene felt without describing any of it",
      wrong: ["It explains that the school was built on a battlefield",
              "It suggests the children were frightened of one another",
              "It shows that a real fight had broken out"] },
    { text: "The engine coughed twice and died.", device: "personification",
      effect: "It makes the engine's failure sound like an illness, which prepares the reader for being stranded",
      wrong: ["It explains that somebody in the car was unwell",
              "It shows that the engine was repaired",
              "It tells the reader how old the car was"] },
    { text: "Slowly, slowly, the door began to move.", device: "repetition",
      effect: "Saying it twice slows the sentence down, so the reader waits as the characters do",
      wrong: ["It shows the door moved twice",
              "It suggests somebody pushed the door hard",
              "It tells the reader who was behind the door"] },
    { text: "Grey gulls gathered on the groyne.", device: "alliteration",
      effect: "The hard repeated sound makes the line feel bleak and clipped",
      wrong: ["It tells the reader how many gulls there were",
              "It shows the gulls were making a noise",
              "It suggests the weather was about to improve"] },
    { text: "Her diary is a mirror.", device: "metaphor",
      effect: "It suggests the diary shows her exactly as she is, without her having to say so",
      wrong: ["It explains that she keeps her diary near a mirror",
              "It shows the diary has a shiny cover",
              "It suggests she writes only about her appearance"] },
    { text: "New paint on the front door; the back of the house still bare brick.",
      device: "juxtaposition",
      effect: "The contrast suggests appearances are being kept up where they will be seen",
      wrong: ["It explains that the painters had not finished",
              "It shows the house was newly built",
              "It suggests the back of the house was the older part"] },
    { text: "It was not the worst meal he had eaten that week.", device: "litotes",
      effect: "The understatement is funnier, and more damning, than calling the meal bad",
      wrong: ["It shows he enjoyed the meal very much",
              "It suggests he had eaten nothing else that week",
              "It tells the reader the meal was the best of the week"] },
    { text: "Nobody spoke. Nobody moved. Nobody looked at the door.", device: "anaphora",
      effect: "The repeated opening builds the tension of a room where everyone is waiting",
      wrong: ["It shows three different people did nothing",
              "It suggests the room was empty",
              "It tells the reader what was behind the door"] },
    { text: "So softly the snow came, settling on the sill and the step.",
      device: "sibilance",
      effect: "The hush of the repeated s sounds imitates the quietness being described",
      wrong: ["It tells the reader how deep the snow lay",
              "It shows the snow was falling heavily",
              "It suggests the window had been left open"] },
    { text: "There was a terrible beauty in the wreck of the old pier.",
      device: "oxymoron",
      effect: "The contradiction holds both feelings at once, which is what the sight actually produced",
      wrong: ["It shows the pier had been rebuilt",
              "It suggests the writer disliked the pier",
              "It tells the reader when the pier collapsed"] },
    { text: "Winning the prize was no small achievement for a boy of nine.",
      device: "litotes",
      effect: "Denying the opposite praises him more quietly, and so more convincingly, than “great” would",
      wrong: ["It suggests the prize was not worth very much",
              "It shows the boy was disappointed",
              "It tells the reader the competition was easy"] }
  ];

  function litDeviceEffect(i) {
    const item = pick(DEVICE_EFFECT_ITEMS, i);
    const q = mkE("Literary Devices",
      `Read this sentence.\n\n"${item.text}"\n\n` +
      `What does the ${item.device} achieve here?`,
      item.effect, item.wrong, 4, i);
    if (q) q.explain =
      `Naming the technique is only half the question — this asks what it does ` +
      `for the reader. Rule out any option that only restates the literal facts, ` +
      `or that the sentence does not support at all. Here the ${item.device} ` +
      `works because ${item.effect.charAt(0).toLowerCase() + item.effect.slice(1)}.`;
    return q;
  }
  litDeviceEffect.poolSize = DEVICE_EFFECT_ITEMS.length;

  /* Four numbered lines, one of which carries the device. The papers set this
     against a stanza, and it is harder than a single sentence because three
     plausible-sounding lines have to be ruled out. */
  const STANZA_ITEMS = [
    { lines: ["The morning came in grey and slow,", "the lane was quiet as a church,",
              "a blackbird turned the fallen leaves,", "and shook the rain from off its perch."],
      device: "a simile", answer: 2 },
    { lines: ["The river is a long brown road", "that carries barges to the sea,",
              "past reed and rush and rotting post,", "past all the fields I used to see."],
      device: "a metaphor", answer: 1 },
    { lines: ["The wind came knocking at the door,", "the shutters answered with a bang,",
              "the lamp went out, the cat sat still,", "and somewhere far away, bells rang."],
      device: "personification", answer: 1 },
    { lines: ["Softly the sea slid up the shore,", "gulls turned above the harbour wall,",
              "a bell was ringing out to sea,", "and no one heard the fishermen call."],
      device: "sibilance", answer: 1 },
    { lines: ["I waited by the garden gate,", "I waited while the light went thin,",
              "I waited till the stars came out,", "and still nobody let me in."],
      device: "anaphora", answer: 1 },
    { lines: ["The kettle shrieked, the fire spat,", "the dog was dreaming on the mat,",
              "the clock was slow, the room was warm,", "outside there gathered up a storm."],
      device: "onomatopoeia", answer: 1 },
    /* Line 2 read "sharper than a knife": a comparative, with no "like" and no
       "as ... as", so it was not the simile the question claimed. */
    { lines: ["Her coat was thin, her boots were old,", "the wind was like a carving knife,",
              "she counted pennies in her hand,", "and thought about another life."],
      device: "a simile", answer: 2 },
    { lines: ["The house had stood a hundred years,", "its windows were a row of eyes,",
              "the ivy climbed towards the roof,", "the chimneys leaned against the skies."],
      device: "a metaphor", answer: 2 },
    { lines: ["Ten thousand miles I would have walked,", "and never once complained of it,",
              "to hear you say my name again,", "or see you by the fire, lit."],
      device: "hyperbole", answer: 1 },
    { lines: ["The lane was empty, dusk was near,", "and was there anybody there?",
              "The gate hung open on its hinge,", "a coat was folded on the chair."],
      device: "a rhetorical question", answer: 2 },
    /* Line 2 used to read "the fence was flat, the field was churned", which
       alliterates on f as plainly as line 1 does on b - two right answers. */
    { lines: ["Big brown bears had broken through,", "the gate hung open, wide and bare,",
              "the farmer stood and shook his head,", "and wondered how they'd got in there."],
      device: "alliteration", answer: 1 },
    { lines: ["Inside, the fire; outside, the frost.", "The table set for one, not two.",
              "A letter propped against the jug.", "A road that only led to you."],
      device: "juxtaposition", answer: 1 },
    { lines: ["The lamp burned low, the room grew cold,", "the cat had gone I know not where,",
              "the night came down as thick as wool,", "and no one climbed the attic stair."],
      device: "a simile", answer: 3 },
    { lines: ["A gull hung still above the bay,", "the harbour was a plate of tin,",
              "the boats came home at half past four,", "and one by one the lights went in."],
      device: "a metaphor", answer: 2 },
    { lines: ["The hedges leaned to hear us pass,", "the lane was narrow, dark and deep,",
              "we counted gates to keep our nerve,", "and neither of us dared to sleep."],
      device: "personification", answer: 1 },
    { lines: ["The train pulled out at ten to nine,", "the platform emptied, cold and grey,",
              "a whistle shrieked, a door banged shut,", "and that was all there was to say."],
      device: "onomatopoeia", answer: 3 },
    { lines: ["Nothing was said about the will,", "nothing was said about the land,",
              "nothing was said at all that day,", "and no one offered me a hand."],
      device: "anaphora", answer: 1 },
    { lines: ["Sea-mist slid softly up the sand,", "the pier stood black against the sky,",
              "a bell was tolling out at sea,", "and no one asked the reason why."],
      device: "sibilance", answer: 1 },
    { lines: ["I would have walked a thousand miles,", "and thought the journey hardly long,",
              "to stand once more beside that gate,", "and hear you humming that same song."],
      device: "hyperbole", answer: 1 },
    { lines: ["The clock struck four. The house was still.", "And was there nobody awake?",
              "The stairs were dark, the hall was cold,", "and every board began to ache."],
      device: "a rhetorical question", answer: 2 }
  ];

  function litWhichLine(i) {
    const item = pick(STANZA_ITEMS, i);
    const body = item.lines.map((l, k) => `${k + 1}  ${l}`).join("\n");
    const label = n => `Line ${n}`;
    const wrong = [1, 2, 3, 4].filter(n => n !== item.answer).map(label);
    const q = mkE("Literary Devices",
      `Read this verse.\n\n${body}\n\nWhich line contains ${item.device}?`,
      label(item.answer), wrong, 4, i);
    if (q) q.explain =
      `Take one line at a time and test it against the definition rather than ` +
      `reading for the general feeling of the verse. ${label(item.answer)} — ` +
      `"${item.lines[item.answer - 1]}" — is the one that uses ${item.device}.`;
    return q;
  }
  litWhichLine.poolSize = STANZA_ITEMS.length;


  /* ══════════ WORD CHOICE, HARDER ══════════ */

  /* Two words can mean the same thing and carry opposite feelings. Every option
     here fits the sentence grammatically and denotes roughly the same action, so
     the answer turns entirely on which feeling the rest of the sentence needs. */
  const CONNOTATION_ITEMS = [
    { sentence: "Exhausted and soaked through, he ______ the last mile home.",
      right: "trudged", wrong: ["strolled", "skipped", "wandered"],
      why: "all four mean walked, but only “trudged” carries the effort and misery the first half of the sentence sets up" },
    { sentence: "Delighted with her news, she ______ into the kitchen to tell them.",
      right: "burst", wrong: ["crept", "shuffled", "edged"],
      why: "the other three are cautious or reluctant, which contradicts “delighted”" },
    { sentence: "Not wanting to be noticed, the boy ______ along the corridor.",
      right: "slipped", wrong: ["marched", "stamped", "strode"],
      why: "the other three are loud and confident, and he is trying not to be seen" },
    { sentence: "The old dog ______ to the fire and lay down with a sigh.",
      right: "padded", wrong: ["bounded", "raced", "charged"],
      why: "“with a sigh” tells you the dog is slow and tired, not energetic" },
    { sentence: "The chairman ______ that the figures had been wrong all along.",
      right: "conceded", wrong: ["boasted", "announced", "insisted"],
      why: "admitting a mistake is reluctant, and only “conceded” carries that reluctance" },
    { sentence: "Her aunt ______ every visitor with the same three questions.",
      right: "interrogated", wrong: ["greeted", "welcomed", "thanked"],
      why: "“the same three questions” every time is relentless, which the friendly verbs do not convey" },
    { sentence: "Rain ______ against the window all night and nobody slept.",
      right: "hammered", wrong: ["drifted", "settled", "brushed"],
      why: "nobody slept, so the rain must be violent rather than gentle" },
    { sentence: "He ______ the letter into his pocket before anyone could read it.",
      right: "stuffed", wrong: ["placed", "arranged", "laid"],
      why: "the hurry and secrecy need a careless verb; the others are careful and unhurried" },
    { sentence: "The crowd ______ when the announcement was finally made.",
      right: "erupted", wrong: ["murmured", "muttered", "whispered"],
      why: "“finally” suggests long-awaited news, and only “erupted” matches the release" },
    { sentence: "She ______ at the suggestion that she might need help.",
      right: "bristled", wrong: ["smiled", "nodded", "agreed"],
      why: "“the suggestion that she might need help” is faintly insulting, and only one verb takes offence" },
    { sentence: "The two children ______ over the last slice for a full ten minutes.",
      right: "squabbled", wrong: ["chatted", "conferred", "debated"],
      why: "ten minutes over a slice of cake is petty, and “conferred” and “debated” are far too dignified" },
    { sentence: "Water ______ from the cracked pipe for weeks before anyone noticed.",
      right: "seeped", wrong: ["gushed", "burst", "surged"],
      why: "nobody noticed for weeks, so the leak must be slow rather than dramatic" },
    { sentence: "The old man ______ his story, leaving nothing out.",
      right: "recounted", wrong: ["mentioned", "hinted", "implied"],
      why: "“leaving nothing out” needs a full telling; the others are all partial" },
    { sentence: "Frost ______ the windows overnight and hid the garden.",
      right: "sealed", wrong: ["dusted", "touched", "brushed"],
      why: "the garden is hidden completely, so the frost must have covered rather than lightly marked" },
    { sentence: "He ______ the accusation without raising his voice once.",
      right: "refuted", wrong: ["shouted", "screamed", "protested"],
      why: "“without raising his voice” rules out every option that involves noise" },
    { sentence: "The children ______ round the storyteller and would not move.",
      right: "clustered", wrong: ["scattered", "dispersed", "drifted"],
      why: "“would not move” means they gathered close, and the other three all mean coming apart" },
    { sentence: "Knowing he was beaten, the champion ______ his opponent's hand.",
      right: "shook", wrong: ["snatched", "seized", "grabbed"],
      why: "the moment is dignified, and the other three are sudden and forceful" },
    { sentence: "The lawyer ______ the same question until the witness gave way.",
      right: "pressed", wrong: ["wondered", "enquired", "mentioned"],
      why: "the witness gives way, so the questioning must have been relentless" },
    { sentence: "She ______ the letter twice before she trusted what it said.",
      right: "reread", wrong: ["skimmed", "glanced at", "flicked through"],
      why: "she needed to trust it, and the other three are all hurried" },
    { sentence: "The old bridge ______ under the weight of the lorry but held.",
      right: "shuddered", wrong: ["collapsed", "shattered", "crumbled"],
      why: "“but held” rules out every option that means it gave way" },
    { sentence: "He ______ the news to her as gently as he could.",
      right: "broke", wrong: ["blurted", "shouted", "announced"],
      why: "“as gently as he could” rules out anything sudden or loud" },
    { sentence: "The queue ______ forward an inch every few minutes.",
      right: "shuffled", wrong: ["surged", "raced", "charged"],
      why: "an inch every few minutes is barely moving at all" },
    { sentence: "Smoke ______ from the chimney all through the still afternoon.",
      right: "curled", wrong: ["exploded", "blasted", "erupted"],
      why: "“still afternoon” needs something slow, and the others are violent" },
    { sentence: "The headmaster ______ the notice without a word of explanation.",
      right: "posted", wrong: ["flung", "hurled", "tossed"],
      why: "the other three throw the notice, which does not fit a headmaster's action" }
  ];

  function wordChoiceConnotation(i) {
    const item = pick(CONNOTATION_ITEMS, i);
    const q = mkE("Word Choice",
      `All four words below have a similar meaning. Which one completes the ` +
      `sentence best?\n\n"${item.sentence}"`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `When every option means roughly the same thing, the answer is decided by ` +
      `feeling rather than by meaning. Read the rest of the sentence first and ` +
      `ask what mood it needs: ${item.why}. So the answer is "${item.right}".`;
    return q;
  }
  wordChoiceConnotation.poolSize = CONNOTATION_ITEMS.length;

  /* Formal and informal are not right and wrong - they depend on who is being
     written to, which the question always states. */
  const REGISTER_ITEMS = [
    { context: "a letter to a head teacher", sentence: "I am writing to ______ about the change to the timetable.",
      right: "enquire", wrong: ["ask around", "have a word", "find out"] },
    { context: "a letter of complaint to a shop", sentence: "The kettle ______ within a week of purchase.",
      right: "developed a fault", wrong: ["packed up", "went kaput", "gave up the ghost"] },
    { context: "a note to a friend", sentence: "______ if you fancy coming to the match on Saturday.",
      right: "Let me know", wrong: ["Kindly inform me", "Please be advised", "I should be grateful to hear"] },
    { context: "a formal report", sentence: "The results ______ that the method needs revising.",
      right: "indicate", wrong: ["reckon", "sort of show", "go to show"] },
    { context: "a letter to a newspaper", sentence: "I ______ with the writer's conclusion for three reasons.",
      right: "disagree", wrong: ["can't be doing", "am not having it", "think it's rubbish"] },
    { context: "a school newsletter", sentence: "Parents are ______ to arrive by half past six.",
      right: "requested", wrong: ["told to", "made to", "meant to" ] },
    { context: "a text to a cousin", sentence: "______ we're running about ten minutes late.",
      right: "Just to say", wrong: ["I regret to inform you that", "Be advised that", "It is with regret that"] },
    { context: "a job application", sentence: "I ______ considerable experience of working in a team.",
      right: "have gained", wrong: ["have got loads of", "have picked up a bit of", "know all about"] },
    { context: "a formal apology", sentence: "I ______ for the inconvenience this has caused.",
      right: "apologise", wrong: ["am dead sorry", "feel bad", "was gutted"] },
    { context: "a letter to a local council", sentence: "The pavement outside the library ______ urgent repair.",
      right: "requires", wrong: ["is crying out for", "wants doing", "needs sorting"] },
    { context: "a message to a teammate", sentence: "______ at the ground for half two.",
      right: "See you", wrong: ["I shall await you", "Kindly attend", "Presenting myself"] },
    { context: "a formal invitation", sentence: "You are ______ to attend the opening of the new hall.",
      right: "invited", wrong: ["welcome to pop along", "free to turn up", "asked along"] },
    { context: "a letter to a librarian", sentence: "I ______ the book was returned on Monday.",
      right: "believe", wrong: ["reckon", "guess", "bet"] },
    { context: "a note left for a neighbour", sentence: "______ take a parcel in for us tomorrow?",
      right: "Could you", wrong: ["Might one request that you", "Would you be so good as to",
                                  "I should be obliged if you would"] },
    { context: "a formal notice", sentence: "The pool will be ______ for repairs until March.",
      right: "closed", wrong: ["shut for good", "out of action", "off limits"] },
    { context: "a letter to a headmaster", sentence: "I hope you will ______ my son's absence.",
      right: "excuse", wrong: ["let off", "overlook a bit", "not mind about"] },
    { context: "a school report", sentence: "Her written work has ______ steadily this year.",
      right: "improved", wrong: ["got loads better", "picked up a bit", "come on nicely"] },
    { context: "a message to a team-mate", sentence: "______ if you can make training.",
      right: "Text me", wrong: ["Kindly confirm your attendance", "Please advise",
                                "I await your response"] },
    { context: "a letter of thanks", sentence: "I am most ______ for the trouble you took.",
      right: "grateful", wrong: ["chuffed", "well pleased", "made up"] }
  ];

  function wordChoiceRegister(i) {
    const item = pick(REGISTER_ITEMS, i);
    const q = mkE("Word Choice",
      `Which words are most suitable for ${item.context}?\n\n"${item.sentence}"`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `Nothing here is bad English — the question is which register fits ` +
      `${item.context}. Ask whether you would say it to a stranger in writing. ` +
      `"${item.right}" matches; the others are pitched at the wrong level of ` +
      `formality for this reader.`;
    return q;
  }
  wordChoiceRegister.poolSize = REGISTER_ITEMS.length;

  /* Words of the same kind, ranked. The papers ask for the strongest or the
     mildest, which needs the whole set held in order at once. */
  const DEGREE_ITEMS = [
    { ask: "strongest", set: ["annoyed", "cross", "furious", "irritated"], answer: "furious",
      order: "irritated, annoyed, cross, furious" },
    { ask: "mildest", set: ["terrified", "frightened", "uneasy", "petrified"], answer: "uneasy",
      order: "uneasy, frightened, terrified, petrified" },
    { ask: "strongest", set: ["damp", "wet", "soaked", "moist"], answer: "soaked",
      order: "moist, damp, wet, soaked" },
    { ask: "mildest", set: ["starving", "peckish", "ravenous", "hungry"], answer: "peckish",
      order: "peckish, hungry, starving, ravenous" },
    { ask: "strongest", set: ["warm", "hot", "scorching", "mild"], answer: "scorching",
      order: "mild, warm, hot, scorching" },
    { ask: "mildest", set: ["exhausted", "weary", "tired", "shattered"], answer: "tired",
      order: "tired, weary, exhausted, shattered" },
    { ask: "strongest", set: ["large", "big", "enormous", "sizeable"], answer: "enormous",
      order: "big, sizeable, large, enormous" },
    { ask: "mildest", set: ["disliked", "loathed", "hated", "detested"], answer: "disliked",
      order: "disliked, hated, detested, loathed" },
    { ask: "strongest", set: ["surprised", "startled", "astounded", "puzzled"], answer: "astounded",
      order: "puzzled, surprised, startled, astounded" },
    { ask: "mildest", set: ["delighted", "pleased", "overjoyed", "thrilled"], answer: "pleased",
      order: "pleased, delighted, thrilled, overjoyed" },
    { ask: "strongest", set: ["cool", "cold", "freezing", "chilly"], answer: "freezing",
      order: "cool, chilly, cold, freezing" },
    { ask: "mildest", set: ["ancient", "elderly", "old", "prehistoric"], answer: "elderly",
      order: "elderly, old, ancient, prehistoric" },
    { ask: "strongest", set: ["clever", "able", "brilliant", "capable"], answer: "brilliant",
      order: "able, capable, clever, brilliant" },
    { ask: "mildest", set: ["appalled", "shocked", "surprised", "horrified"], answer: "surprised",
      order: "surprised, shocked, appalled, horrified" },
    { ask: "strongest", set: ["tidy", "spotless", "clean", "neat"], answer: "spotless",
      order: "neat, tidy, clean, spotless" },
    { ask: "mildest", set: ["desperate", "worried", "frantic", "anxious"], answer: "worried",
      order: "worried, anxious, frantic, desperate" },
    { ask: "strongest", set: ["damaged", "broken", "destroyed", "chipped"], answer: "destroyed",
      order: "chipped, damaged, broken, destroyed" },
    { ask: "mildest", set: ["furious", "livid", "displeased", "enraged"], answer: "displeased",
      order: "displeased, furious, livid, enraged" }
  ];

  function wordChoiceDegree(i) {
    const item = pick(DEGREE_ITEMS, i);
    const wrong = item.set.filter(w => w !== item.answer);
    const q = mkE("Word Choice",
      `Which of these words is the ${item.ask}?`,
      item.answer, wrong, 4, i);
    if (q) q.explain =
      `Put the whole set in order before choosing, rather than comparing them ` +
      `two at a time: ${item.order} — weakest to strongest. The ${item.ask} of ` +
      `them is "${item.answer}".`;
    return q;
  }
  wordChoiceDegree.poolSize = DEGREE_ITEMS.length;

  /* Some pairings are simply what English says. All four options mean much the
     same; only one is the phrase a native speaker would use. */
  const COLLOCATION_ITEMS = [
    { sentence: "She ______ a decision only after hearing both sides.", right: "reached",
      wrong: ["did", "gave", "put"] },
    { sentence: "He ______ a mistake on the very first line.", right: "made",
      wrong: ["did", "took", "gave"] },
    { sentence: "They ______ great care of the borrowed instruments.", right: "took",
      wrong: ["made", "did", "held"] },
    { sentence: "The team ______ a narrow victory in the final minute.", right: "snatched",
      wrong: ["caught", "grabbed", "fetched"] },
    { sentence: "Please ______ attention to the second paragraph.", right: "pay",
      wrong: ["give", "make", "put"] },
    { sentence: "The witness ______ a statement to the police.", right: "gave",
      wrong: ["made up", "took", "did"] },
    { sentence: "She ______ her breath and dived.", right: "held",
      wrong: ["kept", "took", "carried"] },
    { sentence: "The scheme ______ into effect at the end of the month.", right: "comes",
      wrong: ["goes", "arrives", "turns"] },
    { sentence: "He ______ an interest in fossils at about the age of six.", right: "took",
      wrong: ["made", "did", "held"] },
    { sentence: "The story ______ light on what had really happened.", right: "shed",
      wrong: ["threw off", "dropped", "poured"] },
    { sentence: "They ______ a risk that nobody else was willing to.", right: "took",
      wrong: ["made", "did", "gave"] },
    { sentence: "The committee ______ a note of every objection.", right: "made",
      wrong: ["took up", "did", "held"] }
  ];

  function wordChoiceCollocation(i) {
    const item = pick(COLLOCATION_ITEMS, i);
    const q = mkE("Word Choice",
      `Which word completes this sentence in natural English?\n\n"${item.sentence}"`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `Some words simply belong together in English, and no rule explains it — ` +
      `you make a mistake but you take care, and you pay attention rather than ` +
      `giving it. Read each option aloud in the sentence; "${item.right}" is the ` +
      `one that sounds like English.`;
    return q;
  }
  wordChoiceCollocation.poolSize = COLLOCATION_ITEMS.length;

  /* ══════════ VOCABULARY, HARDER ══════════ */

  /* A root learned once unlocks a family of words, which is why the papers set
     unfamiliar words built from familiar parts. */
  const ROOT_ITEMS = [
    { root: "aqua", means: "water", words: "aquarium, aquatic, aquamarine",
      wrong: ["air", "earth", "fire"] },
    { root: "bio", means: "life", words: "biology, biography, antibiotic",
      wrong: ["book", "body", "two"] },
    { root: "chron", means: "time", words: "chronological, chronicle, synchronise",
      wrong: ["colour", "writing", "distance"] },
    { root: "geo", means: "earth", words: "geography, geology, geometry",
      wrong: ["shape", "map", "study"] },
    { root: "phon", means: "sound", words: "telephone, symphony, microphone",
      wrong: ["light", "far", "small"] },
    /* "inscription" and "manuscript" are from the same family but spell the
       root "script", so they belong to a different question. */
    { root: "scrib", means: "write", words: "describe, scribble, inscribe",
      wrong: ["read", "speak", "hand"] },
    { root: "port", means: "carry", words: "transport, portable, export",
      wrong: ["door", "harbour", "heavy"] },
    { root: "spect", means: "look", words: "spectator, inspect, spectacles",
      wrong: ["show", "eye", "glass"] },
    { root: "dict", means: "say", words: "dictate, contradict, verdict",
      wrong: ["rule", "book", "word"] },
    { root: "therm", means: "heat", words: "thermometer, thermal, thermostat",
      wrong: ["measure", "cold", "metal"] },
    { root: "aud", means: "hear", words: "audible, audience, auditorium",
      wrong: ["speak", "room", "large"] },
    { root: "mit", means: "send", words: "transmit, emit, submit",
      wrong: ["allow", "middle", "small"] },
    { root: "graph", means: "write or draw", words: "autograph, photograph, graphite",
      wrong: ["light", "self", "picture frame"] },
    { root: "terr", means: "land", words: "territory, terrain, subterranean",
      wrong: ["fear", "three", "tower"] },
    { root: "vis", means: "see", words: "visible, television, vision",
      wrong: ["far", "screen", "clear"] },
    { root: "cred", means: "believe", words: "incredible, credit, credentials",
      wrong: ["money", "create", "careful"] }
  ];

  function vocRootMeaning(i) {
    const item = pick(ROOT_ITEMS, i);
    const q = mkE("Vocabulary",
      `The words ${item.words} all contain the root "${item.root}".\n\n` +
      `What does this root mean?`,
      item.means, item.wrong, 4, i);
    if (q) q.explain =
      `Find the meaning the three words share rather than working from any one ` +
      `of them. ${item.words} all carry the idea of "${item.means}", so ` +
      `"${item.root}" means ${item.means}. A root you learn once will unlock ` +
      `every other word built from it.`;
    return q;
  }
  vocRootMeaning.poolSize = ROOT_ITEMS.length;

  /* A suffix usually changes what a word DOES in a sentence, not what it means,
     which is the part children miss. */
  const SUFFIX_ITEMS = [
    { base: "care", made: "careless", cls: "an adjective", note: "-less makes an adjective meaning “without”" },
    { base: "happy", made: "happiness", cls: "a noun", note: "-ness turns a describing word into the thing itself" },
    { base: "quick", made: "quickly", cls: "an adverb", note: "-ly usually turns an adjective into an adverb" },
    { base: "beauty", made: "beautify", cls: "a verb", note: "-ify means “to make”, so it builds a verb" },
    { base: "child", made: "childish", cls: "an adjective", note: "-ish makes an adjective, often a disapproving one" },
    { base: "govern", made: "government", cls: "a noun", note: "-ment turns an action into the thing or system that results" },
    { base: "hope", made: "hopeful", cls: "an adjective", note: "-ful makes an adjective meaning “full of”" },
    { base: "act", made: "activate", cls: "a verb", note: "-ate builds a verb meaning to bring something about" },
    { base: "friend", made: "friendship", cls: "a noun", note: "-ship names a state or relationship" },
    { base: "read", made: "readable", cls: "an adjective", note: "-able makes an adjective meaning “can be”" },
    { base: "music", made: "musician", cls: "a noun", note: "-ian names the person who does it" },
    { base: "short", made: "shorten", cls: "a verb", note: "-en builds a verb meaning to make more so" }
  ];

  function vocSuffixClass(i) {
    const item = pick(SUFFIX_ITEMS, i);
    const classes = ["a noun", "a verb", "an adjective", "an adverb"];
    const wrong = classes.filter(c => c !== item.cls);
    const q = mkE("Vocabulary",
      `The word "${item.base}" becomes "${item.made}".\n\n` +
      `What kind of word is "${item.made}"?`,
      item.cls, wrong, 4, i);
    if (q) q.explain =
      `A suffix usually changes what a word DOES in a sentence rather than what ` +
      `it means: ${item.note}. Try the new word in a sentence and see what job ` +
      `it does — "${item.made}" works as ${item.cls}.`;
    return q;
  }
  vocSuffixClass.poolSize = SUFFIX_ITEMS.length;

  /* One word, two sentences, two senses - and the question asks which sentence
     uses it the same way as the first. The papers ask this about words from the
     passage, and the skill transfers exactly. */
  const MULTI_MEANING_ITEMS = [
    { word: "bank", lead: "They sat on the bank and watched the boats go by.",
      right: "The river had worn the bank away on the outside of the bend.",
      wrong: ["She paid the cheque into the bank on Friday.",
              "He could bank on his brother to be late.",
              "The plane began to bank steeply to the left."] },
    { word: "light", lead: "She carried a light bag and nothing else.",
      right: "The coat was light enough to fold into a pocket.",
      wrong: ["The light in the hall had been left on.",
              "He struck a match to light the fire.",
              "Light travels faster than sound."] },
    { word: "record", lead: "Please record the temperature every hour.",
      right: "The nurse had to record his answers on a chart.",
      wrong: ["She broke the school record for the long jump.",
              "He bought an old record in the market.",
              "The record shows that the letter arrived late."] },
    { word: "spring", lead: "A spring of clear water rose behind the cottage.",
      right: "They filled their bottles at the spring on the hillside.",
      wrong: ["The spring in the chair had snapped.",
              "Daffodils appear early in spring.",
              "He would spring out from behind the door."] },
    { word: "fair", lead: "The umpire's decision seemed perfectly fair.",
      right: "It is only fair that everyone gets the same time.",
      wrong: ["We went to the fair on the last day of term.",
              "She has fair hair and freckles.",
              "The weather should be fair by Thursday."] },
    { word: "draw", lead: "The match ended in a draw.",
      right: "A draw would still be enough to win the league.",
      wrong: ["He likes to draw horses.",
              "Draw the curtains before you switch on the lamp.",
              "The story failed to draw a crowd."] },
    { word: "board", lead: "The board met on the first Monday of the month.",
      right: "The board voted to close the factory.",
      wrong: ["Nail a board across the broken window.",
              "Passengers may board at the rear door.",
              "She wrote the date on the board."] },
    { word: "state", lead: "Please state your name clearly.",
      right: "The witness was asked to state what he had seen.",
      wrong: ["The house was in a terrible state.",
              "Texas is the second largest state.",
              "Water can exist in a solid state."] },
    { word: "grave", lead: "He wore a grave expression all evening.",
      right: "The situation was more grave than anyone had admitted.",
      wrong: ["Flowers had been left on the grave.",
              "They dug the grave before the frost came.",
              "The grave was marked by a plain stone."] },
    { word: "current", lead: "The current carried the boat downstream.",
      right: "A strong current runs along that stretch of coast.",
      wrong: ["The current price is higher than last year's.",
              "Keep up with current affairs.",
              "An electric current passes through the wire."] },
    { word: "match", lead: "Her gloves match her scarf exactly.",
      right: "Those two shades of blue do not quite match.",
      wrong: ["The match kicks off at three.",
              "He struck a match against the wall.",
              "She met her match at last."] },
    { word: "check", lead: "Check your answers before you hand the paper in.",
      right: "He stopped to check the figures a second time.",
      wrong: ["The tablecloth had a red check pattern.",
              "A sudden noise brought him up short in check.",
              "She kept her temper in check all afternoon."] }
  ];

  function vocMultipleMeaning(i) {
    const item = pick(MULTI_MEANING_ITEMS, i);
    const q = mkE("Vocabulary",
      `Read this sentence.\n\n"${item.lead}"\n\n` +
      `In which sentence below does "${item.word}" mean the same as it does above?`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `Work out the meaning in the first sentence and put it in your own words ` +
      `before reading on — "${item.word}" has several unrelated senses, and the ` +
      `wrong options each use a real one. Only "${item.right}" uses it in the ` +
      `same sense as the sentence at the top.`;
    return q;
  }
  vocMultipleMeaning.poolSize = MULTI_MEANING_ITEMS.length;


  /* ══════════ WORD CHOICE: the floor ══════════ */

  /* Homophones in context. Every option is a real word, correctly spelled, so
     nothing can be ruled out on spelling alone - only the sentence decides. */
  const HOMOPHONE_ITEMS = [
    { sentence: "The team collected ______ medals and went home.", right: "their",
      wrong: ["there", "they're", "theirs"] },
    { sentence: "______ going to be late if the bus does not come soon.", right: "They're",
      wrong: ["Their", "There", "Theirs"] },
    { sentence: "The dog buried ______ bone under the apple tree.", right: "its",
      wrong: ["it's", "its'", "their"] },
    { sentence: "I think ______ going to rain before lunchtime.", right: "it's",
      wrong: ["its", "its'", "it"] },
    { sentence: "The parcel was ______ heavy for one person to lift.", right: "too",
      wrong: ["to", "two", "towards"] },
    { sentence: "______ coat is this, left hanging on the gate?", right: "Whose",
      wrong: ["Who's", "Whos", "Which"] },
    { sentence: "The noise did not ______ her concentration at all.", right: "affect",
      wrong: ["effect", "affects", "effects"] },
    { sentence: "The full ______ of the change will not be known for years.", right: "effect",
      wrong: ["affect", "affecting", "effecting"] },
    { sentence: "We ______ the turning and had to double back.", right: "passed",
      wrong: ["past", "pasted", "pass"] },
    { sentence: "The hall is just ______ the library on the left.", right: "past",
      wrong: ["passed", "pasted", "passing"] },
    { sentence: "Everyone came ______ Rashid, who was unwell.", right: "except",
      wrong: ["accept", "excepting", "accepted"] },
    { sentence: "She would not ______ the prize on his behalf.", right: "accept",
      wrong: ["except", "excepting", "accepted"] },
    { sentence: "The gate was ______ on its hinges and rattled all night.", right: "loose",
      wrong: ["lose", "loosing", "losing"] },
    { sentence: "Take care not to ______ the key on the way home.", right: "lose",
      wrong: ["loose", "loosen", "loosing"] },
    { sentence: "He needs to ______ the piece before Friday's lesson.", right: "practise",
      wrong: ["practice", "practising", "practiced"] },
    { sentence: "The car remained ______ at the lights for a full minute.", right: "stationary",
      wrong: ["stationery", "stationing", "stationed"] },
    { sentence: "She bought envelopes and paper from the ______ cupboard.", right: "stationery",
      wrong: ["stationary", "stationing", "stationed"] },
    { sentence: "The scarf was the perfect ______ to her winter coat.", right: "complement",
      wrong: ["compliment", "complementing", "complimenting"] },
    { sentence: "She paid him a generous ______ on his handwriting.", right: "compliment",
      wrong: ["complement", "complementing", "complimenting"] },
    { sentence: "The council will ______ on the plans next Tuesday.", right: "advise",
      wrong: ["advice", "advises", "advising"] },
    { sentence: "His ______ was to wait until the morning.", right: "advice",
      wrong: ["advise", "advising", "advises"] },
    { sentence: "The two paths ______ just beyond the bridge.", right: "diverge",
      wrong: ["converge", "diverges", "converging"] },
    { sentence: "The runner had ______ the whole field by the last lap.", right: "passed",
      wrong: ["past", "pasted", "passing"] },
    { sentence: "You must ______ the effects of the change on younger pupils.", right: "assess",
      wrong: ["access", "accesses", "assessing"] },
    { sentence: "Only staff may ______ the store room after six.", right: "access",
      wrong: ["assess", "assesses", "accessing"] },
    { sentence: "The ceremony took place on hallowed ______.", right: "ground",
      wrong: ["grounds", "grinded", "grounded"] }
  ];

  function wordChoiceHomophone(i) {
    const item = pick(HOMOPHONE_ITEMS, i);
    const q = mkE("Word Choice",
      `Which word completes this sentence correctly?\n\n"${item.sentence}"`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `Every option here is a real word spelled correctly, so the spelling ` +
      `cannot tell you which is right — only the job the word does in the ` +
      `sentence can. Read the line with each one in turn and keep the one that ` +
      `still makes sense: "${item.right}".`;
    return q;
  }
  wordChoiceHomophone.poolSize = HOMOPHONE_ITEMS.length;

  /* Dependent prepositions: which preposition a word demands is fixed by usage,
     and the wrong one is a mistake even though the meaning survives. */
  const PREPOSITION_ITEMS = [
    { sentence: "Her handwriting is quite different ______ her brother's.", right: "from",
      wrong: ["than", "to than", "of"] },
    { sentence: "He has always been interested ______ old maps.", right: "in",
      wrong: ["on", "about", "for"] },
    { sentence: "Nobody thought she was capable ______ such patience.", right: "of",
      wrong: ["to", "for", "in"] },
    { sentence: "The result depends ______ how many people turn up.", right: "on",
      wrong: ["of", "from", "to"] },
    { sentence: "She apologised ______ arriving so late.", right: "for",
      wrong: ["of", "about to", "on"] },
    { sentence: "The town is famous ______ its bridge.", right: "for",
      wrong: ["of", "with", "by"] },
    { sentence: "He was accused ______ taking the last biscuit.", right: "of",
      wrong: ["for", "with", "about"] },
    { sentence: "They insisted ______ paying for the damage themselves.", right: "on",
      wrong: ["to", "for", "of"] },
    { sentence: "The report is based ______ figures collected last year.", right: "on",
      wrong: ["of", "from", "with"] },
    { sentence: "She is very similar ______ her grandmother in temperament.", right: "to",
      wrong: ["with", "from", "as"] },
    { sentence: "We must congratulate them ______ a fine performance.", right: "on",
      wrong: ["for", "of", "about"] },
    { sentence: "The shed was full ______ tools nobody had used for years.", right: "of",
      wrong: ["with", "by", "from"] },
    { sentence: "He is responsible ______ locking up each evening.", right: "for",
      wrong: ["of", "to", "about"] },
    { sentence: "The children were bored ______ the long wait.", right: "by",
      wrong: ["of", "from", "at"] },
    { sentence: "She succeeded ______ persuading them at last.", right: "in",
      wrong: ["to", "at", "on"] },
    { sentence: "This box is identical ______ the one we lost.", right: "to",
      wrong: ["with", "from", "as"] }
  ];

  function wordChoicePreposition(i) {
    const item = pick(PREPOSITION_ITEMS, i);
    const q = mkE("Word Choice",
      `Which word completes this sentence in correct English?\n\n"${item.sentence}"`,
      item.right, item.wrong, 3 + (i % 2), i);
    if (q) q.explain =
      `Certain words take a fixed preposition, and no rule predicts which: you ` +
      `are different FROM, interested IN, capable OF and responsible FOR. The ` +
      `meaning survives the wrong one, so trust your ear — "${item.right}" is ` +
      `the form English uses here.`;
    return q;
  }
  wordChoicePreposition.poolSize = PREPOSITION_ITEMS.length;

  /* A word that repeats what its neighbour already says. Each sentence is
     perfectly clear, which is what makes the redundancy hard to see. */
  const REDUNDANT_ITEMS = [
    { sentence: "The lorry reversed back into the loading bay.", word: "back",
      why: "to reverse is already to go backwards" },
    { sentence: "Each customer received a free gift at the door.", word: "free",
      why: "a gift is not paid for, so it is free by definition" },
    { sentence: "They repeated the announcement again at six o'clock.", word: "again",
      why: "to repeat something is to say it again" },
    { sentence: "The two twins arrived within a minute of each other.", word: "two",
      why: "twins already come in twos" },
    { sentence: "She wrote a brief summary of the main points.", word: "brief",
      why: "a summary is short by its nature" },
    { sentence: "In my own personal opinion the plan will not work.", word: "personal",
      why: "\"my own\" already says whose opinion it is" },
    { sentence: "The final outcome surprised everybody in the room.", word: "final",
      why: "an outcome is what happens in the end" },
    { sentence: "He returned back to the house for his gloves.", word: "back",
      why: "to return is to go back" },
    { sentence: "The committee met together on the first Monday.", word: "together",
      why: "you cannot meet on your own" },
    { sentence: "They made an advance warning of the closure.", word: "advance",
      why: "a warning always comes beforehand" },
    { sentence: "The tunnel was completely full of water.", word: "completely",
      why: "full does not come in degrees" },
    { sentence: "She was the sole author who wrote the report.", word: "who wrote",
      why: "the author is the person who wrote it" },
    { sentence: "The parcel arrived at about approximately noon.", word: "approximately",
      why: "\"about\" already makes the time inexact" },
    { sentence: "We must plan ahead for next winter.", word: "ahead",
      why: "planning is always for what has not happened yet" },
    { sentence: "The room was filled with a new innovation.", word: "new",
      why: "an innovation is new by definition" },
    { sentence: "Please revert back to me by Friday.", word: "back",
      why: "to revert is to come back" }
  ];

  function wordChoiceRedundant(i) {
    const item = pick(REDUNDANT_ITEMS, i);
    const other = REDUNDANT_ITEMS.filter(x => x !== item);
    /* Distractors are real words from the same sentence, so the question
       cannot be answered by looking for an odd-looking word. */
    const pool = item.sentence.replace(/[.,]/g, "").split(" ")
      .filter(w => w.toLowerCase() !== item.word.toLowerCase() && w.length > 3);
    const wrong = firstDistinct(item.word, [pick(pool, i), pick(pool, i + 2), pick(pool, i + 4),
                                            pick(pool, i + 1), pick(pool, i + 3)]);
    if (!wrong) return null;
    const q = mkE("Word Choice",
      `One word in this sentence is unnecessary, because another word already ` +
      `says the same thing.\n\n"${item.sentence}"\n\nWhich word could be removed?`,
      item.word, wrong, 4, i);
    if (q) q.explain =
      `The sentence reads perfectly well, which is what makes this hard — look ` +
      `for the word that repeats something already said rather than the word ` +
      `that looks wrong. "${item.word}" can go, because ${item.why}.`;
    return q;
  }
  wordChoiceRedundant.poolSize = REDUNDANT_ITEMS.length;

  /* ══════════ VOCABULARY: the floor ══════════ */

  /* A is to B as C is to ?  The relation has to be named before the answer can
     be chosen, and each distractor is related to C in some other way. */
  const ANALOGY_ITEMS = [
    { a: "cat", b: "kitten", c: "sheep", right: "lamb", wrong: ["flock", "wool", "field"],
      rel: "the adult animal to its young" },
    { a: "author", b: "book", c: "composer", right: "symphony", wrong: ["orchestra", "piano", "concert"],
      rel: "the maker to the thing made" },
    { a: "hot", b: "cold", c: "generous", right: "mean", wrong: ["kind", "wealthy", "giving"],
      rel: "a word to its opposite" },
    { a: "petal", b: "flower", c: "page", right: "book", wrong: ["writing", "paper", "library"],
      rel: "a part to the whole it belongs to" },
    { a: "hive", b: "bee", c: "burrow", right: "rabbit", wrong: ["hole", "garden", "digging"],
      rel: "a home to the creature that lives in it" },
    { a: "listen", b: "hear", c: "look", right: "see", wrong: ["watch", "eye", "glance"],
      rel: "trying to do something, and the result of it" },
    { a: "chapter", b: "novel", c: "act", right: "play", wrong: ["actor", "stage", "scene"],
      rel: "a division to the work it divides" },
    { a: "doctor", b: "hospital", c: "teacher", right: "school", wrong: ["pupil", "lesson", "book"],
      rel: "a worker to the place they work" },
    { a: "knife", b: "cut", c: "pen", right: "write", wrong: ["ink", "paper", "letter"],
      rel: "a tool to what it is used for" },
    { a: "island", b: "sea", c: "oasis", right: "desert", wrong: ["water", "camel", "palm"],
      rel: "a place to what surrounds it" },
    { a: "brave", b: "cowardly", c: "humble", right: "arrogant", wrong: ["modest", "quiet", "gentle"],
      rel: "a word to its opposite" },
    { a: "puppy", b: "dog", c: "sapling", right: "tree", wrong: ["branch", "forest", "leaf"],
      rel: "the young to what it grows into" },
    { a: "conductor", b: "orchestra", c: "captain", right: "team", wrong: ["ship", "match", "player"],
      rel: "a leader to the group they lead" },
    { a: "thermometer", b: "temperature", c: "clock", right: "time", wrong: ["hands", "hour", "alarm"],
      rel: "an instrument to what it measures" },
    { a: "shoal", b: "fish", c: "herd", right: "cattle", wrong: ["field", "grazing", "farmer"],
      rel: "a collective noun to the animal it counts" },
    { a: "whisper", b: "shout", c: "sip", right: "gulp", wrong: ["drink", "thirst", "cup"],
      rel: "a small version of an action to a large one" },
    { a: "bee", b: "honey", c: "cow", right: "milk", wrong: ["field", "calf", "grass"],
      rel: "an animal to what it produces" },
    { a: "sculptor", b: "chisel", c: "painter", right: "brush", wrong: ["canvas", "gallery", "colour"],
      rel: "a worker to the tool they use" },
    { a: "second", b: "minute", c: "penny", right: "pound", wrong: ["coin", "money", "purse"],
      rel: "a small unit to the larger one made of many" },
    { a: "hungry", b: "eat", c: "tired", right: "sleep", wrong: ["yawn", "bed", "rest"],
      rel: "a need to the thing that satisfies it" },
    { a: "library", b: "book", c: "gallery", right: "painting", wrong: ["artist", "wall", "visitor"],
      rel: "a building to what it holds" },
    { a: "cub", b: "lion", c: "foal", right: "horse", wrong: ["stable", "saddle", "mane"],
      rel: "the young to what it grows into" },
    { a: "rain", b: "puddle", c: "snow", right: "drift", wrong: ["cold", "winter", "flake"],
      rel: "what falls to what it collects into" },
    { a: "obedient", b: "defiant", c: "generous", right: "stingy", wrong: ["kind", "rich", "helpful"],
      rel: "a word to its opposite" },
    { a: "flour", b: "bread", c: "clay", right: "pot", wrong: ["kiln", "wheel", "earth"],
      rel: "a raw material to what is made from it" },
    { a: "wick", b: "candle", c: "lace", right: "shoe", wrong: ["foot", "leather", "walking"],
      rel: "a part to the whole it belongs to" }
  ];

  function vocAnalogy(i) {
    const item = pick(ANALOGY_ITEMS, i);
    const q = mkE("Vocabulary",
      `${item.a} is to ${item.b} as ${item.c} is to ______\n\n` +
      `Which word completes the pair?`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `Say the first pair's relationship out loud before looking at the ` +
      `options: ${item.a} is to ${item.b} as ${item.rel}. Now apply exactly ` +
      `that relationship to ${item.c}, and the answer is "${item.right}". Each ` +
      `wrong option is connected to ${item.c} in some other way, which is the trap.`;
    return q;
  }
  vocAnalogy.poolSize = ANALOGY_ITEMS.length;

  /* Odd one out on MEANING, not on word class - vocWordGroup already asks for
     the class. Three words share something specific and the fourth does not. */
  const ODD_ONE_ITEMS = [
    { set: ["violin", "cello", "flute", "viola"], odd: "flute",
      why: "the other three are played with a bow; a flute is blown" },
    { set: ["oak", "birch", "fern", "willow"], odd: "fern",
      why: "the other three are trees; a fern is not" },
    { set: ["gale", "breeze", "drizzle", "gust"], odd: "drizzle",
      why: "the other three describe wind; drizzle is rain" },
    { set: ["copper", "bronze", "iron", "tin"], odd: "bronze",
      why: "bronze is a mixture of metals; the other three are pure metals" },
    { set: ["sprint", "stroll", "dash", "bolt"], odd: "stroll",
      why: "the other three are fast; a stroll is slow" },
    { set: ["mutter", "yell", "whisper", "murmur"], odd: "yell",
      why: "the other three are quiet; a yell is loud" },
    { set: ["triangle", "hexagon", "circle", "square"], odd: "circle",
      why: "the other three have straight sides; a circle has none" },
    { set: ["novel", "diary", "poem", "atlas"], odd: "atlas",
      why: "the other three are written to be read through; an atlas is looked things up in" },
    { set: ["whale", "shark", "dolphin", "seal"], odd: "shark",
      why: "the other three are mammals; a shark is a fish" },
    { set: ["glance", "stare", "peer", "shout"], odd: "shout",
      why: "the other three are ways of looking; shouting is not" },
    { set: ["furious", "irritated", "delighted", "annoyed"], odd: "delighted",
      why: "the other three are degrees of anger; delighted is pleasure" },
    { set: ["chisel", "hammer", "timber", "saw"], odd: "timber",
      why: "the other three are tools; timber is the material worked on" },
    { set: ["Tuesday", "August", "Friday", "Sunday"], odd: "August",
      why: "the other three are days; August is a month" },
    { set: ["thigh", "elbow", "wrist", "knuckle"], odd: "thigh",
      why: "the other three are joints; the thigh is not" },
    { set: ["biography", "atlas", "dictionary", "encyclopedia"], odd: "biography",
      why: "the other three are reference books; a biography tells one life story" },
    { set: ["drought", "flood", "harvest", "famine"], odd: "harvest",
      why: "the other three are disasters; a harvest is not" },
    { set: ["sparrow", "eagle", "bat", "robin"], odd: "bat",
      why: "the other three are birds; a bat is a mammal" },
    { set: ["cotton", "silk", "wool", "plastic"], odd: "plastic",
      why: "the other three are natural fibres; plastic is man-made" },
    { set: ["mountain", "valley", "hill", "peak"], odd: "valley",
      why: "the other three are high ground; a valley is low" },
    { set: ["carpenter", "plumber", "electrician", "apprentice"], odd: "apprentice",
      why: "the other three name a trade; an apprentice is someone learning one" },
    { set: ["gallop", "trot", "canter", "graze"], odd: "graze",
      why: "the other three are ways a horse moves; grazing is eating" },
    { set: ["kilogram", "litre", "gram", "tonne"], odd: "litre",
      why: "the other three measure weight; a litre measures volume" },
    { set: ["cellar", "attic", "basement", "vault"], odd: "attic",
      why: "the other three are below ground; an attic is at the top of a house" },
    { set: ["scowl", "frown", "beam", "glare"], odd: "beam",
      why: "the other three are unfriendly expressions; beaming is a broad smile" },
    { set: ["oboe", "clarinet", "trumpet", "flute"], odd: "trumpet",
      why: "the other three are woodwind; a trumpet is brass" },
    { set: ["dozen", "score", "gross", "digit"], odd: "digit",
      why: "the other three name a fixed quantity; a digit is a single figure" }
  ];

  function vocOddOneOut(i) {
    const item = pick(ODD_ONE_ITEMS, i);
    const q = mkE("Vocabulary",
      `Which word does NOT belong with the others?\n\n${item.set.join(", ")}`,
      item.odd, item.set.filter(w => w !== item.odd), 4, i);
    if (q) q.explain =
      `Find what THREE of them share before deciding which is left out — ` +
      `starting from the odd word and hunting for a reason will always find one. ` +
      `Here ${item.why}.`;
    return q;
  }
  vocOddOneOut.poolSize = ODD_ONE_ITEMS.length;

  /* One word that fits three unrelated sentences. Each sentence rules out some
     of the options, and only the right word satisfies all three at once. */
  const FITS_ALL_ITEMS = [
    { word: "run", wrong: ["walk", "drive", "throw"],
      lines: ["She hopes to ______ the shop on her own one day.",
              "The play will ______ for six weeks.",
              "Don't let the tap ______ while you clean your teeth."] },
    { word: "light", wrong: ["heavy", "bright", "pale"],
      lines: ["The rucksack was ______ enough to carry all day.",
              "Would you ______ the candles before they arrive?",
              "There was not enough ______ to read by."] },
    { word: "sharp", wrong: ["blunt", "sudden", "clever"],
      lines: ["Be careful, the edge is very ______.",
              "There was a ______ rise in prices that spring.",
              "Meet me at nine o'clock ______."] },
    { word: "break", wrong: ["snap", "pause", "rest"],
      lines: ["Try not to ______ the handle when you lift it.",
              "We stopped for a ______ halfway up the hill.",
              "The news will ______ tomorrow morning."] },
    { word: "cold", wrong: ["cool", "chilly", "icy"],
      lines: ["Wrap up warm — it is bitterly ______ outside.",
              "She has had a ______ since the weekend.",
              "His reply was polite but ______."] },
    { word: "point", wrong: ["place", "tip", "reason"],
      lines: ["The ______ of the pencil had snapped again.",
              "There is no ______ in arguing about it now.",
              "Don't ______ at people, it is rude."] },
    { word: "clear", wrong: ["plain", "empty", "obvious"],
      lines: ["The water was so ______ you could see the bottom.",
              "Please ______ the table before you go out.",
              "It is ______ that nobody had read the letter."] },
    { word: "hard", wrong: ["firm", "difficult", "solid"],
      lines: ["The ground was ______ with frost.",
              "That was a ______ question to answer.",
              "She works ______ every single evening."] },
    { word: "fine", wrong: ["good", "thin", "well"],
      lines: ["The weather should be ______ by Thursday.",
              "He paid a ______ for parking on the pavement.",
              "The thread was so ______ you could hardly see it."] },
    { word: "change", wrong: ["alter", "coins", "swap"],
      lines: ["Would you like to ______ your seat?",
              "He counted the ______ into her hand.",
              "There has been no ______ in her condition."] },
    { word: "spell", wrong: ["write", "period", "charm"],
      lines: ["Can you ______ your surname for me?",
              "We had a dry ______ all through July.",
              "The witch put a ______ on the whole village."] },
    { word: "trip", wrong: ["journey", "stumble", "outing"],
      lines: ["Mind the step, or you will ______ over it.",
              "The school ______ was cancelled twice.",
              "That was a nasty ______ on the stairs."] },
    { word: "bear", wrong: ["carry", "stand", "endure"],
      lines: ["I cannot ______ the noise of that drill.",
              "The bridge will not ______ the weight of a lorry.",
              "We saw a ______ on the far bank of the river."] },
    { word: "draft", wrong: ["breeze", "plan", "copy"],
      lines: ["Shut the door — there is a terrible ______ in here.",
              "She wrote a first ______ of the letter and tore it up.",
              "The ______ of the new rules was published on Monday."] },
    { word: "settle", wrong: ["sit", "agree", "sink"],
      lines: ["Let the dust ______ before you sweep.",
              "They could not ______ the argument between them.",
              "The birds ______ on the wires at dusk."] },
    { word: "temper", wrong: ["mood", "anger", "soften"],
      lines: ["He lost his ______ over something very small.",
              "You must ______ the good news with a warning.",
              "She has an even ______ and never shouts."] },
    { word: "stand", wrong: ["bear", "stall", "rise"],
      lines: ["I cannot ______ the smell of boiled cabbage.",
              "They bought programmes at the ______ by the gate.",
              "Please ______ when the judge comes in."] },
    { word: "figure", wrong: ["number", "shape", "guess"],
      lines: ["A ______ appeared at the end of the lane.",
              "Write the ______ in the box on the right.",
              "I cannot ______ out what he meant by it."] },
    { word: "second", wrong: ["moment", "next", "support"],
      lines: ["Wait a ______ while I find my keys.",
              "She came ______ in the county final.",
              "Would anybody like to ______ the proposal?"] },
    { word: "plain", wrong: ["simple", "clear", "field"],
      lines: ["The room was ______ but perfectly comfortable.",
              "It was ______ that nobody had read the notice.",
              "They rode for two days across the open ______."] }
  ];

  function vocFitsAllThree(i) {
    const item = pick(FITS_ALL_ITEMS, i);
    const body = item.lines.map((l, k) => `${k + 1}. ${l}`).join("\n");
    const q = mkE("Vocabulary",
      `Which ONE word completes all three sentences?\n\n${body}`,
      item.word, item.wrong, 4, i);
    if (q) q.explain =
      `Try each option in all three sentences rather than settling on the first ` +
      `that works once — a word that fits two out of three is still wrong. Only ` +
      `"${item.word}" fits every one, because it carries several unrelated ` +
      `meanings.`;
    return q;
  }
  vocFitsAllThree.poolSize = FITS_ALL_ITEMS.length;

  /* ══════════ PUNCTUATION: the floor ══════════ */

  /* QE 16 asks why a word is capitalised mid-sentence, with "it must be a
     typing error" among the options - a question about the PURPOSE of a mark
     rather than about correcting one. */
  const MARK_PURPOSE_ITEMS = [
    { sentence: "There was only one thing left to do: wait.", mark: "colon",
      right: "It introduces the thing the first part of the sentence has been leading up to",
      wrong: ["It joins two sentences that could each stand alone",
              "It shows that a word has been left out",
              "It marks the end of a list"] },
    { sentence: "She had three jobs to finish: the letters, the accounts and the post.",
      mark: "colon",
      right: "It introduces a list",
      wrong: ["It separates two equal statements",
              "It shows somebody is speaking",
              "It replaces the word “because”"] },
    { sentence: "The rain had stopped; the wind had not.", mark: "semicolon",
      right: "It links two closely related statements that could each stand alone",
      wrong: ["It introduces an explanation of the first part",
              "It separates items in a list",
              "It shows that letters have been left out"] },
    { sentence: "My cousin — the one who lives in Leeds — telephoned last night.",
      mark: "pair of dashes",
      right: "It sets off extra information that could be lifted out without spoiling the sentence",
      wrong: ["It shows that the speaker hesitated",
              "It joins two separate sentences",
              "It marks the end of the main clause"] },
    { sentence: "He shouted “Stop!” and everyone froze.", mark: "exclamation mark",
      right: "It shows the force with which the word was said",
      wrong: ["It shows that a question is being asked",
              "It marks the end of the whole sentence",
              "It shows the word is being quoted from a book"] },
    { sentence: "The dog's basket had been moved into the hall.", mark: "apostrophe",
      right: "It shows that the basket belongs to the dog",
      wrong: ["It shows that there is more than one dog",
              "It shows that letters have been left out",
              "It marks the start of some speech"] },
    { sentence: "The dogs' baskets had all been moved into the hall.", mark: "apostrophe",
      right: "It shows that the baskets belong to more than one dog",
      wrong: ["It shows that the baskets belong to one dog",
              "It shows that letters have been left out",
              "It makes the word plural"] },
    { sentence: "It's been raining since Tuesday.", mark: "apostrophe",
      right: "It shows that a letter has been left out of “it is”",
      wrong: ["It shows that the rain belongs to something",
              "It makes the word plural",
              "It shows emphasis"] },
    { sentence: "Marcus, who had said nothing all evening, stood up.", mark: "pair of commas",
      right: "They separate off a description of Marcus that the sentence would still work without",
      wrong: ["They separate two items in a list",
              "They mark where somebody stops speaking",
              "They join two complete sentences"] },
    { sentence: "“When you have finished,” she said, “come and find me.”",
      mark: "comma after “finished”",
      right: "It shows that the speech is interrupted and will carry on afterwards",
      wrong: ["It shows that the sentence has ended",
              "It separates two items in a list",
              "It shows that a word has been left out"] },
    { sentence: "We packed sandwiches, apples, a flask of tea and two blankets.",
      mark: "commas",
      right: "They separate the items of a list",
      wrong: ["They separate off extra information about the sandwiches",
              "They join complete sentences together",
              "They show where the speaker paused for breath"] },
    { sentence: "Did anybody actually read the letter?", mark: "question mark",
      right: "It shows that the sentence is asking something",
      wrong: ["It shows the speaker is surprised",
              "It shows that a word has been left out",
              "It marks the end of a list"] },
    { sentence: "The sign read STRICTLY NO ENTRY in letters a foot high.",
      mark: "use of capital letters",
      right: "They reproduce how the words appeared on the sign itself",
      wrong: ["They show that the words are a proper noun",
              "They must be a printing error",
              "They show the start of a new sentence"] },
    { sentence: "She wrote “impossible” underneath, and underlined it twice.",
      mark: "pair of quotation marks",
      right: "They show that this is the exact word she wrote",
      wrong: ["They show that somebody is speaking aloud",
              "They show the word is spelled wrongly",
              "They show the word is a title"] },
    { sentence: "There were three of us left: Anya, Tom and me.", mark: "colon",
      right: "It introduces the names the first part has promised",
      wrong: ["It joins two sentences that could stand alone",
              "It shows that somebody is speaking",
              "It shows a word has been left out"] },
    { sentence: "He had planned everything; he had forgotten the tickets.", mark: "semicolon",
      right: "It sets two related statements against each other without a joining word",
      wrong: ["It introduces a list of what he had planned",
              "It shows that letters have been left out",
              "It marks the end of the sentence"] },
    { sentence: "The winner — nobody had expected this — was the youngest in the room.",
      mark: "pair of dashes",
      right: "They break into the sentence to add a comment, then hand it back",
      wrong: ["They join two complete sentences",
              "They show the speaker could not finish",
              "They separate the items of a list"] },
    { sentence: "We can't go on like this.", mark: "apostrophe",
      right: "It shows that letters have been left out of “cannot”",
      wrong: ["It shows that something belongs to somebody",
              "It makes the word plural",
              "It shows emphasis"] },
    { sentence: "The women's changing room is along the corridor.", mark: "apostrophe",
      right: "It shows the room belongs to the women, and “women” is already plural",
      wrong: ["It shows there is only one woman",
              "It shows letters have been left out",
              "It makes “women” plural"] },
    { sentence: "Ravi, my oldest friend, had said nothing about it.", mark: "pair of commas",
      right: "They mark off a description of Ravi that could be lifted out",
      wrong: ["They separate three items in a list",
              "They show where the speaker paused",
              "They join two complete sentences"] },
    { sentence: "How on earth did she manage it!", mark: "exclamation mark",
      right: "It shows the sentence is an exclamation and not really a question",
      wrong: ["It shows the sentence is asking for information",
              "It shows a word has been left out",
              "It marks the end of a list"] },
    { sentence: "Rule one: never lend what you cannot spare.", mark: "colon",
      right: "It introduces the rule that the first two words announce",
      wrong: ["It separates two equal statements",
              "It shows somebody is speaking",
              "It replaces the word “and”"] },
    { sentence: "The label said FRAGILE in red capitals.", mark: "use of capital letters",
      right: "They show how the word was printed on the label itself",
      wrong: ["They show the word is a proper noun",
              "They must be a printing error",
              "They show the start of a new sentence"] }
  ];

  function punMarkPurpose(i) {
    const item = pick(MARK_PURPOSE_ITEMS, i);
    const q = mkE("Punctuation",
      `Read this sentence.\n\n"${item.sentence}"\n\n` +
      `Why has the ${item.mark} been used?`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `This asks what the mark is DOING, not whether it is correct. Read the ` +
      `sentence without it and see what is lost — that is the mark's job. Here ` +
      `the ${item.mark} works because ${item.right.charAt(0).toLowerCase() + item.right.slice(1)}.`;
    return q;
  }
  punMarkPurpose.poolSize = MARK_PURPOSE_ITEMS.length;

  /* Direct speech broken in two around the reporting clause is the hardest
     punctuation the papers set, because four things have to be right at once:
     a comma inside the first speech marks, a comma after the reporting clause,
     lower case where the speech resumes, and the closing punctuation inside the
     final speech marks. Every distractor breaks exactly one of those four -
     never the capitalisation of the speaker's name, which is a different skill
     and, for "Grandpa" against "grandpa", not always decidable. */
  const SPLIT_SPEECH_ITEMS = [
    { right: "“Wait here,” he said, “until I come back.”",
      wrong: ["“Wait here”, he said, “until I come back.”",
              "“Wait here,” he said, “Until I come back.”",
              "“Wait here,” he said, “until I come back”."] },
    { right: "“If you ask me,” she added, “nobody has read it.”",
      wrong: ["“If you ask me” she added, “nobody has read it.”",
              "“If you ask me,” she added “nobody has read it.”",
              "“If you ask me,” she added, “Nobody has read it.”"] },
    { right: "“Tomorrow,” said the guard, “the gates open at six.”",
      wrong: ["“Tomorrow” said the guard, “the gates open at six.”",
              "“Tomorrow,” said the guard, “The gates open at six.”",
              "“Tomorrow,” said the guard “the gates open at six”."] },
    { right: "“I would go,” Ravi murmured, “but the bus has gone.”",
      wrong: ["“I would go,” Ravi murmured, “But the bus has gone.”",
              "“I would go”, Ravi murmured, “but the bus has gone.”",
              "“I would go,” Ravi murmured, “but the bus has gone”."] },
    { right: "“Look,” whispered Nell, “the light is still on.”",
      wrong: ["“Look” whispered Nell, “the light is still on.”",
              "“Look,” whispered Nell, “The light is still on.”",
              "“Look,” whispered Nell “the light is still on”."] },
    { right: "“In that case,” the doctor replied, “you must rest.”",
      wrong: ["“In that case,” the doctor replied, “You must rest.”",
              "“In that case”, the doctor replied, “you must rest.”",
              "“In that case,” the doctor replied “you must rest.”"] },
    { right: "“We tried,” admitted Tom, “but the door was locked.”",
      wrong: ["“We tried,” admitted Tom “but the door was locked.”",
              "“We tried” admitted Tom, “but the door was locked.”",
              "“We tried,” admitted Tom, “But the door was locked.”"] },
    { right: "“On Fridays,” she explained, “the library shuts at four.”",
      wrong: ["“On Fridays,” she explained, “The library shuts at four.”",
              "“On Fridays” she explained “the library shuts at four.”",
              "“On Fridays,” she explained, “the library shuts at four”."] },
    { right: "“Be quick,” called his mother, “or we shall miss it.”",
      wrong: ["“Be quick”, called his mother, “or we shall miss it.”",
              "“Be quick,” called his mother “or we shall miss it.”",
              "“Be quick,” called his mother, “Or we shall miss it.”"] },
    { right: "“At last,” muttered the driver, “somebody has noticed.”",
      wrong: ["“At last,” muttered the driver, “Somebody has noticed.”",
              "“At last” muttered the driver, “somebody has noticed.”",
              "“At last,” muttered the driver “somebody has noticed.”"] },
    { right: "“No,” said Grandpa firmly, “not before your tea.”",
      wrong: ["“No” said Grandpa firmly, “not before your tea.”",
              "“No,” said Grandpa firmly, “Not before your tea.”",
              "“No,” said Grandpa firmly, “not before your tea”."] },
    { right: "“Once upon a time,” he began, “there were three sisters.”",
      wrong: ["“Once upon a time,” he began, “There were three sisters.”",
              "“Once upon a time”, he began, “there were three sisters.”",
              "“Once upon a time,” he began “there were three sisters”."] },
    { right: "“If it rains,” warned the coach, “we play indoors.”",
      wrong: ["“If it rains” warned the coach, “we play indoors.”",
              "“If it rains,” warned the coach, “We play indoors.”",
              "“If it rains,” warned the coach, “we play indoors”."] },
    { right: "“By then,” she said quietly, “it was already too late.”",
      wrong: ["“By then,” she said quietly “it was already too late.”",
              "“By then,” she said quietly, “It was already too late.”",
              "“By then” she said quietly, “it was already too late.”"] },
    { right: "“Some of us,” he added, “were never asked at all.”",
      wrong: ["“Some of us,” he added, “Were never asked at all.”",
              "“Some of us,” he added, “were never asked at all”.",
              "“Some of us” he added, “were never asked at all.”"] },
    { right: "“Not yet,” answered the nurse, “but very soon.”",
      wrong: ["“Not yet” answered the nurse, “but very soon.”",
              "“Not yet,” answered the nurse “but very soon.”",
              "“Not yet,” answered the nurse, “But very soon.”"] },
    { right: "“In the end,” wrote the reporter, “nobody was to blame.”",
      wrong: ["“In the end,” wrote the reporter, “Nobody was to blame.”",
              "“In the end”, wrote the reporter, “nobody was to blame.”",
              "“In the end,” wrote the reporter “nobody was to blame.”"] },
    { right: "“That night,” continued the old man, “the river rose again.”",
      wrong: ["“That night,” continued the old man “the river rose again.”",
              "“That night,” continued the old man, “The river rose again.”",
              "“That night,” continued the old man, “the river rose again”."] },
    { right: "“Whatever happens,” insisted Nell, “we finish together.”",
      wrong: ["“Whatever happens” insisted Nell, “we finish together.”",
              "“Whatever happens,” insisted Nell, “We finish together.”",
              "“Whatever happens,” insisted Nell “we finish together.”"] }
  ];

  function punSplitSpeech(i) {
    const item = pick(SPLIT_SPEECH_ITEMS, i);
    const q = mkE("Punctuation",
      `Which sentence is punctuated correctly?`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `Speech broken around the reporting clause needs all of these at once: a ` +
      `comma INSIDE the first set of speech marks, a comma after the reporting ` +
      `clause, no capital letter where the speech picks up again — it is the ` +
      `same sentence continuing — and the closing punctuation inside the final ` +
      `speech marks. Check each option against all four rules.`;
    return q;
  }
  punSplitSpeech.poolSize = SPLIT_SPEECH_ITEMS.length;

  /* Which single mark is missing. The sentence is otherwise correct, so the
     child has to decide what the sense of the line needs. */
  const MISSING_MARK_ITEMS = [
    { sentence: "Although it was late nobody wanted to go home.", mark: "a comma after “late”",
      wrong: ["a full stop after “late”", "a semicolon after “late”", "an apostrophe in “nobody”"] },
    { sentence: "My sisters bicycle has a puncture again.", mark: "an apostrophe in “sisters”",
      wrong: ["a comma after “bicycle”", "a hyphen in “puncture”", "a colon after “sisters”"] },
    { sentence: "Where did you put the tickets", mark: "a question mark at the end",
      wrong: ["a full stop at the end", "an exclamation mark at the end", "a comma after “put”"] },
    { sentence: "We bought apples pears and two melons.", mark: "a comma after “apples”",
      wrong: ["a colon after “bought”", "a semicolon after “pears”", "an apostrophe in “melons”"] },
    { sentence: "The room which had not been used for years smelled of dust.",
      mark: "a pair of commas around “which had not been used for years”",
      wrong: ["a comma after “years” only", "a colon after “room”", "a dash after “dust”"] },
    { sentence: "Stop shouted the guard and the whole platform turned.",
      mark: "speech marks around “Stop”",
      wrong: ["a colon after “Stop”", "a semicolon after “guard”", "an apostrophe in “guards”"] },
    { sentence: "Its going to be a long afternoon.", mark: "an apostrophe in “Its”",
      wrong: ["a comma after “going”", "a hyphen in “long afternoon”", "a question mark at the end"] },
    { sentence: "He had only one wish to see the sea once more.", mark: "a colon after “wish”",
      wrong: ["a comma after “only”", "a full stop after “wish”", "an apostrophe in “seas”"] },
    { sentence: "The path was flooded we had to turn back.", mark: "a semicolon after “flooded”",
      wrong: ["a comma after “flooded”", "a colon after “back”", "an apostrophe in “we”"] },
    { sentence: "What an extraordinary thing to say", mark: "an exclamation mark at the end",
      wrong: ["a question mark at the end", "a comma after “extraordinary”", "a colon after “What”"] },
    { sentence: "My uncle a retired sailor still keeps a telescope by the window.",
      mark: "a pair of commas around “a retired sailor”",
      wrong: ["a comma after “uncle” only", "a colon after “sailor”", "a dash after “window”"] },
    { sentence: "The childrens coats were left on the bus.", mark: "an apostrophe in “childrens”",
      wrong: ["a comma after “coats”", "a hyphen in “childrens”", "a question mark at the end"] },
    { sentence: "Before you leave lock the side gate.", mark: "a comma after “leave”",
      wrong: ["a full stop after “leave”", "a colon after “leave”", "an apostrophe in “gate”"] },
    { sentence: "How many were there in the end", mark: "a question mark at the end",
      wrong: ["a full stop at the end", "an exclamation mark at the end", "a comma after “many”"] },
    { sentence: "We needed three things rope, water and a map.", mark: "a colon after “things”",
      wrong: ["a comma after “things”", "a semicolon after “rope”", "an apostrophe in “things”"] },
    { sentence: "My grandmother who never wrote letters sent a postcard.",
      mark: "a pair of commas around “who never wrote letters”",
      wrong: ["a comma after “letters” only", "a colon after “grandmother”", "a dash after “postcard”"] },
    { sentence: "Theres nothing left to decide.", mark: "an apostrophe in “Theres”",
      wrong: ["a comma after “nothing”", "a question mark at the end", "a hyphen in “nothing”"] },
    { sentence: "The lights went out we sat in the dark for an hour.",
      mark: "a semicolon after “out”",
      wrong: ["a comma after “out”", "a colon after “dark”", "an apostrophe in “lights”"] }
  ];

  function punMissingMark(i) {
    const item = pick(MISSING_MARK_ITEMS, i);
    const q = mkE("Punctuation",
      `This sentence needs one more piece of punctuation.\n\n"${item.sentence}"\n\n` +
      `What is missing?`,
      item.mark, item.wrong, 4, i);
    if (q) q.explain =
      `Read the sentence aloud and notice where the sense stumbles — that is ` +
      `where the mark belongs. Then check what job needs doing there: joining, ` +
      `separating, showing possession or ending. This one needs ${item.mark}.`;
    return q;
  }
  punMissingMark.poolSize = MISSING_MARK_ITEMS.length;

  /* ══════════ GRAMMAR: the floor ══════════ */

  /* Pronoun case. The rule is simple and almost nobody applies it: take the
     other person out of the sentence and the right form is obvious. */
  const PRONOUN_CASE_ITEMS = [
    { sentence: "The letter was addressed to my brother and ______.", right: "me",
      wrong: ["I", "myself", "mine"], test: "the letter was addressed to me" },
    { sentence: "______ and I walked home together.", right: "She",
      wrong: ["Her", "Herself", "Hers"], test: "she walked home" },
    { sentence: "Between you and ______, I think the plan will fail.", right: "me",
      wrong: ["I", "myself", "mine"], test: "between me" },
    { sentence: "It was ______ who found the keys, not Tom.", right: "he",
      wrong: ["him", "himself", "his"], test: "he found the keys" },
    { sentence: "The teacher gave Anya and ______ the same mark.", right: "me",
      wrong: ["I", "myself", "mine"], test: "the teacher gave me the mark" },
    { sentence: "Nobody knew the answer better than ______.", right: "she",
      wrong: ["her", "herself", "hers"], test: "better than she knew it" },
    { sentence: "My cousins and ______ share a birthday.", right: "I",
      wrong: ["me", "myself", "mine"], test: "I share a birthday" },
    { sentence: "The prize went to ______ and his sister.", right: "him",
      wrong: ["he", "himself", "his"], test: "the prize went to him" },
    /* who/whom is not settled by taking the other person out - there is no
       other person. `swap` marks the rows that need the he/him rule instead. */
    { sentence: "______ do you think left the gate open?", right: "Who",
      wrong: ["Whom", "Whose", "Which"], test: "he left the gate open", swap: "he" },
    { sentence: "The man to ______ I spoke was the caretaker.", right: "whom",
      wrong: ["who", "whose", "which"], test: "I spoke to him", swap: "him" },
    { sentence: "Neither Priya nor ______ had seen the notice.", right: "I",
      wrong: ["me", "myself", "mine"], test: "I had seen the notice" },
    { sentence: "They invited my parents and ______ to the opening.", right: "me",
      wrong: ["I", "myself", "mine"], test: "they invited me" },
    { sentence: "My sister and ______ were the last to arrive.", right: "I",
      wrong: ["me", "myself", "mine"], test: "I was the last to arrive" },
    { sentence: "There has always been a rivalry between him and ______.", right: "me",
      wrong: ["I", "myself", "mine"], test: "between me" },
    { sentence: "It was ______ they were waiting for all along.", right: "us",
      wrong: ["we", "ourselves", "ours"], test: "they were waiting for us" },
    { sentence: "The photograph shows my grandfather and ______ on the beach.", right: "me",
      wrong: ["I", "myself", "mine"], test: "the photograph shows me" },
    { sentence: "______ of us knew the way from there.", right: "Neither",
      wrong: ["None", "Either", "Both"], test: "neither one knew the way" },
    { sentence: "The boy ______ won the scholarship is in my form.", right: "who",
      wrong: ["whom", "whose", "which"], test: "he won the scholarship", swap: "he" },
    { sentence: "The friend with ______ I travelled has moved away.", right: "whom",
      wrong: ["who", "whose", "which"], test: "I travelled with him", swap: "him" }
  ];

  function graPronounCase(i) {
    const item = pick(PRONOUN_CASE_ITEMS, i);
    const q = mkE("Grammar",
      `Which word completes this sentence in correct English?\n\n"${item.sentence}"`,
      item.right, item.wrong, 4, i);
    if (q) q.explain = item.swap
      ? `Substitute "he" or "him" and the choice settles itself: "${item.test}" ` +
        `is the version that works, and "${item.swap}" goes with ` +
        `"${item.right.toLowerCase()}" — he with who, him with whom. If "him" ` +
        `fits, the word you want is "whom".`
      : `Take the other person out of the sentence and the right form becomes ` +
        `obvious: "${item.test}" is clearly correct, so "${item.right}" is the ` +
        `form to use when the other person is put back in. "Myself" is only for ` +
        `when you are both the doer and the one done to.`;
    return q;
  }
  graPronounCase.poolSize = PRONOUN_CASE_ITEMS.length;

  /* Subject-verb agreement with something in between. The verb must agree with
     the subject, not with the nearest noun, and the papers always put a
     tempting plural in between. */
  const DISTANT_AGREEMENT_ITEMS = [
    { sentence: "The box of old photographs ______ on the top shelf.", right: "is",
      wrong: ["are", "were", "have"], subj: "box", near: "photographs" },
    { sentence: "A crate of oranges ______ delivered every Tuesday.", right: "is",
      wrong: ["are", "were", "have"], subj: "crate", near: "oranges" },
    { sentence: "The list of names ______ pinned to the door.", right: "was",
      wrong: ["were", "are", "have"], subj: "list", near: "names" },
    { sentence: "One of the windows ______ been left open all night.", right: "has",
      wrong: ["have", "are", "were"], subj: "one", near: "windows" },
    { sentence: "Each of the runners ______ a number on their vest.", right: "has",
      wrong: ["have", "are", "were"], subj: "each", near: "runners" },
    { sentence: "The bunch of keys ______ missing since Friday.", right: "has been",
      wrong: ["have been", "are", "were"], subj: "bunch", near: "keys" },
    { sentence: "Neither of the answers ______ correct.", right: "is",
      wrong: ["are", "were", "have"], subj: "neither", near: "answers" },
    { sentence: "The collection of coins ______ worth a great deal.", right: "is",
      wrong: ["are", "were", "have"], subj: "collection", near: "coins" },
    { sentence: "A packet of biscuits ______ on the table untouched.", right: "sits",
      wrong: ["sit", "are sitting", "have sat"], subj: "packet", near: "biscuits" },
    { sentence: "Every one of the letters ______ been answered.", right: "has",
      wrong: ["have", "are", "were"], subj: "every one", near: "letters" },
    { sentence: "The pile of newspapers by the door ______ growing.", right: "is",
      wrong: ["are", "were", "have"], subj: "pile", near: "newspapers" },
    { sentence: "The captain, along with the other players, ______ waiting outside.", right: "is",
      wrong: ["are", "were", "have"], subj: "captain", near: "players" },
    { sentence: "A row of houses ______ been demolished since we last came.", right: "has",
      wrong: ["have", "are", "were"], subj: "row", near: "houses" },
    { sentence: "The bundle of letters ______ tied with string.", right: "was",
      wrong: ["were", "are", "have"], subj: "bundle", near: "letters" },
    { sentence: "Every one of the windows ______ painted shut.", right: "was",
      wrong: ["were", "are", "have"], subj: "every one", near: "windows" },
    { sentence: "The stack of plates by the sink ______ far too high.", right: "is",
      wrong: ["are", "were", "have"], subj: "stack", near: "plates" },
    { sentence: "One of my cousins ______ moved to Leeds.", right: "has",
      wrong: ["have", "are", "were"], subj: "one", near: "cousins" },
    { sentence: "The teacher, together with all the pupils, ______ gone on ahead.", right: "has",
      wrong: ["have", "are", "were"], subj: "teacher", near: "pupils" }
  ];

  function graDistantAgreement(i) {
    const item = pick(DISTANT_AGREEMENT_ITEMS, i);
    const q = mkE("Grammar",
      `Which words complete this sentence in correct English?\n\n"${item.sentence}"`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `The verb agrees with the SUBJECT, not with whichever noun happens to sit ` +
      `closest to it. Strike out the middle of the sentence and the subject is ` +
      `"${item.subj}", which is singular — so "${item.right}" is right. ` +
      `"${item.near}" is there to tempt you into a plural verb.`;
    return q;
  }
  graDistantAgreement.poolSize = DISTANT_AGREEMENT_ITEMS.length;


  /* The papers ask about the FORM of a poem as well as its figures of speech -
     "why has the poet chosen to end the poem with a question". Naming the
     feature is the part that can be set as a multiple choice. */
  const VERSE_FORM_ITEMS = [
    { lines: ["The road was long, the night was black,", "and neither of us looked back."],
      answer: "A rhyming couplet",
      wrong: ["A refrain", "Enjambment", "A half-rhyme"],
      note: "two lines, one after the other, that rhyme with each other" },
    { lines: ["I stood and watched the water climb", "the wall, the window and the sill,",
              "and thought of nothing else at all."],
      answer: "Enjambment",
      wrong: ["A rhyming couplet", "A refrain", "Alliteration"],
      note: "the sense runs straight over the end of a line without a pause, so the line break falls mid-phrase" },
    { lines: ["Sing hey for the morning, sing hey for the day.", "…",
              "Sing hey for the morning, sing hey for the day."],
      answer: "A refrain",
      wrong: ["A rhyming couplet", "Enjambment", "A simile"],
      note: "a line that comes back unchanged later in the poem" },
    { lines: ["The lane was steep, the hedges high,", "a blackbird sang, and so did I."],
      answer: "A rhyming couplet",
      wrong: ["A refrain", "Enjambment", "Assonance"],
      note: "two lines, one after the other, that rhyme with each other" },
    { lines: ["She never said a word about", "the letter, or the man who brought",
              "it up the path that afternoon."],
      answer: "Enjambment",
      wrong: ["A rhyming couplet", "A refrain", "A rhetorical question"],
      note: "the sense runs straight over the end of a line without a pause, so the line break falls mid-phrase" },
    { lines: ["Down came the rain, and down came the night,", "Down came the dark on the harbour light."],
      answer: "A repeated opening",
      wrong: ["Enjambment", "A refrain", "A half-rhyme"],
      note: "both lines begin with the same words, which drives the rhythm forward" },
    { lines: ["The boat went out, the boat came home,", "the tide went out, the tide came home."],
      answer: "A repeated structure",
      wrong: ["A rhyming couplet", "Enjambment", "A simile"],
      note: "the second line copies the shape of the first, swapping only what it is about" },
    { lines: ["Was it for this we waited half the year?", "Was it for this we counted every day?"],
      answer: "A pair of rhetorical questions",
      wrong: ["A rhyming couplet", "A refrain", "Enjambment"],
      note: "both lines ask something the poet does not expect answered" },
    { lines: ["The kettle sang. The clock replied.", "The cat said nothing, and the fire died."],
      answer: "A rhyming couplet",
      wrong: ["A refrain", "Enjambment", "A repeated opening"],
      note: "two lines, one after the other, that rhyme with each other" },
    { lines: ["and still I cannot tell you why", "the gate was open, or who left", "the lantern burning on the wall."],
      answer: "Enjambment",
      wrong: ["A rhyming couplet", "A refrain", "A repeated opening"],
      note: "the sense runs straight over the end of a line without a pause, so the line break falls mid-phrase" },
    { lines: ["Never a light, never a sound,", "never a footprint on the ground."],
      answer: "A repeated opening",
      wrong: ["Enjambment", "A refrain", "A rhetorical question"],
      note: "both lines begin with the same word, which drives the rhythm forward" },
    { lines: ["O the wind and the rain, O the wind and the rain.", "…",
              "O the wind and the rain, O the wind and the rain."],
      answer: "A refrain",
      wrong: ["Enjambment", "A rhyming couplet", "Assonance"],
      note: "a line that comes back unchanged later in the poem" }
  ];

  function litVerseForm(i) {
    const item = pick(VERSE_FORM_ITEMS, i);
    const body = item.lines.join("\n");
    const q = mkE("Literary Devices",
      `Look at these lines of poetry.\n\n${body}\n\n` +
      `Which feature of the verse do they show?`,
      item.answer, item.wrong, 4, i);
    if (q) q.explain =
      `This is about the shape of the verse rather than any figure of speech. ` +
      `${item.answer} means ${item.note} — check the line endings and the line ` +
      `openings before deciding, because that is where form shows itself.`;
    return q;
  }
  litVerseForm.poolSize = VERSE_FORM_ITEMS.length;

  /* A device inside a few sentences of prose, which is how a comprehension
     paper meets one - the surrounding text has to be read past first. */
  const PROSE_DEVICE_ITEMS = [
    { text: "Marcus reached the top of the hill and stopped. Below him the town lay under a lid of smoke, and the river drew a slow grey line through it. He had not been back for eleven years.",
      device: "Metaphor", quote: "a lid of smoke",
      wrong: ["Simile", "Onomatopoeia", "Hyperbole"] },
    { text: "The kitchen was empty when she came down. The tap dripped. The clock on the shelf ticked and ticked and ticked, and there was nothing else to hear at all.",
      device: "Repetition", quote: "ticked and ticked and ticked",
      wrong: ["Simile", "Metaphor", "Oxymoron"] },
    { text: "Nobody had opened the shed since the spring. The door swung back and the smell of oil came out to meet them, and a spade fell slowly against the wall as if it had been waiting.",
      device: "Personification", quote: "came out to meet them",
      wrong: ["Metaphor", "Alliteration", "Hyperbole"] },
    { text: "The bus was late again. Rain ran down the shelter glass in long threads, and the queue shuffled and said nothing. Ravi counted the cars going past: forty-one, forty-two.",
      device: "Simile", quote: "in long threads",
      wrong: ["Metaphor", "Onomatopoeia", "Anaphora"] },
    { text: "She had promised herself she would not look. But the box was open on the table, and the letters were there, and she had waited a hundred years for this.",
      device: "Hyperbole", quote: "a hundred years",
      wrong: ["Simile", "Personification", "Litotes"] },
    { text: "The hall smelled of polish. Somewhere upstairs a door banged, then banged again, and a voice called out a name that was not his. Tom stood on the mat and did not move.",
      device: "Onomatopoeia", quote: "banged",
      wrong: ["Simile", "Metaphor", "Litotes"] },
    { text: "It was not an easy winter. The pipes froze twice, the coal ran short in February, and by March the whole family had learned to sleep in coats. Nobody complained much.",
      device: "Litotes", quote: "not an easy winter",
      wrong: ["Hyperbole", "Simile", "Personification"] },
    { text: "The lane narrowed. Low leaning laurels lined the last hundred yards, and the light failed sooner than they had expected. Neither of them said they were afraid.",
      device: "Alliteration", quote: "Low leaning laurels lined the last",
      wrong: ["Simile", "Metaphor", "Onomatopoeia"] },
    { text: "Outside the window the sea moved without stopping. It had been there before the house, and would be there after it, and it took no notice of either.",
      device: "Personification", quote: "took no notice",
      wrong: ["Simile", "Hyperbole", "Alliteration"] },
    { text: "Grandad's shed was a museum. Nothing in it worked and nothing in it was thrown away, and every jar had a label written in pencil forty years ago.",
      device: "Metaphor", quote: "was a museum",
      wrong: ["Simile", "Litotes", "Onomatopoeia"] },
    { text: "They waited. They waited while the light went out of the sky, and they waited while the last bus went by, and still nobody came to the door.",
      device: "Anaphora", quote: "They waited",
      wrong: ["Simile", "Metaphor", "Alliteration"] },
    { text: "The room was warm and the chair was deep and the fire was exactly right, which was how she knew something was wrong. It was a comfortable dread, and it would not shift.",
      device: "Oxymoron", quote: "a comfortable dread",
      wrong: ["Simile", "Hyperbole", "Onomatopoeia"] }
  ];

  /* "a simile" / "an oxymoron": the article depends on the device name. */
  const withArticle = d => (/^[AEIOU]/.test(d) ? "an " : "a ") + d.toLowerCase();

  function litDeviceInProse(i) {
    const item = pick(PROSE_DEVICE_ITEMS, i);
    const q = mkE("Literary Devices",
      `Read this extract.\n\n${item.text}\n\n` +
      `Which technique does the writer use in the words "${item.quote}"?`,
      item.device, item.wrong, 4, i);
    if (q) q.explain =
      `The quotation tells you exactly where to look, so ignore the rest of the ` +
      `extract once you have found it. "${item.quote}" is ` +
      `${withArticle(item.device)}. ` + (DEVICE_NOTES[item.device] || "");
    return q;
  }
  litDeviceInProse.poolSize = PROSE_DEVICE_ITEMS.length;


  /* An unfamiliar word, and enough around it to work the meaning out. This is
     the vocabulary skill the comprehension papers lean on hardest, because it
     is the only one that transfers to a word nobody has taught. Each sentence
     carries a real clue - a contrast, a consequence, a definition in apposition
     - and the clue is named in the hint. */
  const CONTEXT_CLUE_ITEMS = [
    { sentence: "The path was so circuitous that a walk of two miles took them most of the afternoon.",
      word: "circuitous", right: "roundabout, not direct",
      wrong: ["steep and rocky", "narrow and overgrown", "poorly signposted"],
      clue: "two miles taking a whole afternoon means the route wandered rather than going straight" },
    { sentence: "Her tone was so brusque that the shopkeeper thought he had offended her.",
      word: "brusque", right: "short and abrupt",
      wrong: ["cheerful and chatty", "quiet and shy", "slow and thoughtful"],
      clue: "the shopkeeper takes offence, so the manner must have been curt rather than friendly" },
    { sentence: "The room was frugally furnished: a bed, a chair and nothing else at all.",
      word: "frugally", right: "sparingly, with very little",
      wrong: ["expensively", "carelessly", "brightly"],
      clue: "the colon lists exactly what was there, and it is almost nothing" },
    { sentence: "Unlike his garrulous brother, Sam could sit through a whole meal without speaking.",
      word: "garrulous", right: "talkative",
      wrong: ["bad-tempered", "generous", "forgetful"],
      clue: "“unlike” sets up an opposite, and the opposite of sitting silently is talking a great deal" },
    { sentence: "The evidence was incontrovertible, and even his own lawyer stopped arguing.",
      word: "incontrovertible", right: "impossible to argue against",
      wrong: ["difficult to understand", "recently discovered", "unfairly obtained"],
      clue: "his own lawyer gives up, so the evidence must have been beyond dispute" },
    { sentence: "She was assiduous in her practice, never missing a single morning for two years.",
      word: "assiduous", right: "hard-working and careful",
      wrong: ["talented", "reluctant", "impatient"],
      clue: "never missing a morning for two years describes steady effort, not talent" },
    { sentence: "The old dog's gait was ungainly, and he rolled from side to side as he walked.",
      word: "gait", right: "way of walking",
      wrong: ["temper", "appetite", "coat"],
      clue: "“as he walked” tells you the word is about movement" },
    { sentence: "His account was so prolix that the committee asked him twice to come to the point.",
      word: "prolix", right: "long-winded",
      wrong: ["untruthful", "confusing", "badly written"],
      clue: "being asked to come to the point means there was too much of it, not that it was false" },
    { sentence: "The two versions of the story were irreconcilable: if one was true the other could not be.",
      word: "irreconcilable", right: "impossible to fit together",
      wrong: ["difficult to remember", "written at different times", "told by strangers"],
      clue: "the colon explains it: one being true rules the other out" },
    { sentence: "He gave a laconic reply of three words and went back to his newspaper.",
      word: "laconic", right: "using very few words",
      wrong: ["rude and angry", "cheerful", "carefully argued"],
      clue: "three words, and then he stops talking altogether" },
    { sentence: "The path was flanked by hedges, so that they could see nothing on either side.",
      word: "flanked", right: "bordered on both sides",
      wrong: ["blocked completely", "recently planted", "kept neatly cut"],
      clue: "“on either side” says where the hedges were" },
    { sentence: "Her handwriting was almost illegible, and the clerk had to ask her to read it aloud.",
      word: "illegible", right: "impossible to read",
      wrong: ["very small", "written in pencil", "full of mistakes"],
      clue: "the clerk has to have it read aloud, so he could not make the writing out" },
    { sentence: "The scheme was untenable from the start: nobody could have paid for it.",
      word: "untenable", right: "impossible to keep going",
      wrong: ["kept secret", "unpopular", "invented recently"],
      clue: "the colon gives the reason - it could not be paid for, so it could not last" },
    { sentence: "He was taciturn at breakfast, though he had talked all evening the night before.",
      word: "taciturn", right: "saying very little",
      wrong: ["bad-tempered", "unwell", "in a hurry"],
      clue: "“though” sets breakfast against an evening of talking, so the word must mean silent" },
    { sentence: "The mixture began to coagulate, thickening until the spoon would hardly move.",
      word: "coagulate", right: "thicken into a solid mass",
      wrong: ["boil rapidly", "change colour", "give off steam"],
      clue: "the second half of the sentence describes exactly what happened: it thickened" },
    { sentence: "She was the most parsimonious person he knew, and grudged even the price of a stamp.",
      word: "parsimonious", right: "extremely unwilling to spend money",
      wrong: ["extremely generous", "very forgetful", "quick to complain"],
      clue: "grudging the price of a stamp is the smallest possible expense to object to" }
  ];

  function vocContextClue(i) {
    const item = pick(CONTEXT_CLUE_ITEMS, i);
    const q = mkE("Vocabulary",
      `Read this sentence.\n\n"${item.sentence}"\n\n` +
      `What does "${item.word}" mean here?`,
      item.right, item.wrong, 4, i);
    if (q) q.explain =
      `You are not expected to know this word — the sentence is built to tell ` +
      `you. Cover the options and find the clue first: ${item.clue}. That gives ` +
      `"${item.right}", and only then is it worth looking at what is offered.`;
    return q;
  }
  vocContextClue.poolSize = CONTEXT_CLUE_ITEMS.length;

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
      [punFullStop],                   // full stop used where it should not be
      [punMarkPurpose, 3, 4],          // what the mark is doing, not whether it is right
      [punSplitSpeech, 4, 4],          // speech broken around the reporting clause
      [punMissingMark, 3, 4]           // which single mark is missing
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
      [graClauseMeaning, 4, 4],        // unpick an inverted clause
      [graPronounCase, 4, 4],          // take the other person out of the sentence
      [graDistantAgreement, 4, 4]      // the verb agrees with the subject, not the nearest noun
    ],
    Vocabulary: [
      [vocSynonym], [vocAntonym], [vocDefinition], [vocIdiom],
      [vocCollective], [vocPrefix], [vocWordGroup],
      [vocRootMeaning, 3, 4],          // a root shared by three words
      [vocSuffixClass, 3, 4],          // what the suffix does to the word class
      [vocMultipleMeaning, 4, 4],      // the same word in two senses
      [vocAnalogy, 4, 4],              // name the relationship, then apply it
      [vocOddOneOut, 3, 4],            // what do THREE of them share
      [vocFitsAllThree, 4, 4],         // one word for three sentences
      [vocContextClue, 4, 4]           // work the word out from the sentence
    ],
    "Word Choice": [
      [wordChoice],
      [wordChoicePrecision, 3, 4],     // the best word, not merely a correct one
      [wordChoiceConnective],
      [wordChoiceConnotation, 4, 4],   // same meaning, different feeling
      [wordChoiceRegister, 3, 4],      // formal or informal, for a stated reader
      [wordChoiceDegree, 3, 4],        // rank the set, then pick an end
      [wordChoiceCollocation, 3, 4],   // the pairing English actually uses
      [wordChoiceHomophone, 4, 4],     // every option is a real word
      [wordChoicePreposition, 3, 4],   // which preposition the word demands
      [wordChoiceRedundant, 4, 4]      // the word that says it twice
    ],
    "Literary Devices": [
      [litIdentify], [litFindExample], [litDefinition],
      [litWordEffect, 3, 4],           // explain the effect of a word choice
      [litTwoDevices, 4, 4],           // two devices at once, as the papers ask
      [litHarderDevice, 3, 4],         // pathetic fallacy, sibilance, litotes
      [litNotAnExample, 3, 4],         // three of four use it; find the fourth
      [litDeviceEffect, 4, 4],         // what the device achieves, not its name
      [litWhichLine, 3, 4],            // which line of the verse carries it
      [litVerseForm, 4, 4],            // couplet, refrain, enjambment
      [litDeviceInProse, 4, 4]         // a device inside a paragraph
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
