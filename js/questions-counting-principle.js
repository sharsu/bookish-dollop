/* Counting Principle question bank: adds 44 questions across difficulty levels 1-4 */
(() => {
  if (typeof QUESTIONS === "undefined") return;

  let id = QUESTIONS.reduce((max, q) => q && typeof q.id === "number" && q.id > max ? q.id : max, 0) + 1;
  const mk = (question, options, answer, difficulty) => ({ id: id++, topic: "Counting Principle", question, options, answer, difficulty });

  const extras = [
    mk("Event A can happen in 3 ways and Event B can happen in 4 ways. If the events are independent, how many total outcomes are there?", ["7", "12", "16", "24"], 1, 1),
    mk("If one thing can be done in m ways and another independent thing can be done in n ways, how many ways can both be done?", ["m + n", "m × n", "m - n", "m ÷ n"], 1, 1),
    mk("You have 3 shirts and 4 pairs of trousers. How many different outfits can you make?", ["8", "12", "16", "24"], 1, 1),
    mk("A lunch menu has 2 sandwich choices and 5 drink choices. How many different lunches can be made by choosing one sandwich and one drink?", ["10", "7", "12", "25"], 0, 1),
    mk("There are 4 routes to school and 3 routes home. How many different journey combinations are there?", ["8", "12", "14", "7"], 1, 1),
    mk("An ice-cream shop has 6 flavours and 2 cone types. How many different single-scoop orders are possible?", ["6", "8", "10", "12"], 3, 1),
    mk("You can choose 1 hat from 3 hats, 1 scarf from 2 scarves and 1 pair of gloves from 4 pairs. How many outfits are possible?", ["9", "18", "24", "12"], 2, 1),
    mk("A fair coin has 2 possible results and a spinner has 3 colours. How many total outcomes are there for one coin flip and one spin?", ["5", "6", "3", "8"], 1, 1),

    mk("You have 3 shirts, 4 pairs of trousers and 2 hats. How many different outfits can you make?", ["20", "24", "9", "12"], 1, 2),
    mk("A meal consists of 1 starter from 2 choices, 1 main from 3 choices and 1 dessert from 4 choices. How many meals are possible?", ["9", "14", "24", "36"], 2, 2),
    mk("Rachel chooses one novel from 4, one poem from 6 and one short story from 5. How many different sets can she choose?", ["15", "30", "120", "720"], 2, 2),
    mk("Derek is choosing a 4-digit PIN. Each digit can be any number from 0 to 9. How many different PINs can he make?", ["5,040", "6,561", "9,000", "10,000"], 3, 2),
    mk("There are 5 buses to town, 2 trains to the city centre and 3 exits from the station. How many different journeys are possible?", ["10", "15", "30", "60"], 2, 2),
    mk("A code is made using 1 first letter from 4 choices, 1 second letter from 5 choices and 1 ending digit from 2 choices. How many codes are possible?", ["20", "40", "11", "80"], 1, 2),
    mk("A tree diagram shows 3 choices at the first stage, 4 choices at the second stage and 2 choices at the third stage. How many complete outcomes are there?", ["12", "18", "24", "36"], 2, 2),
    mk("You can choose 1 top from 6 tops, 1 skirt from 3 skirts and 1 cardigan from 2 cardigans. How many outfits are possible?", ["11", "18", "36", "72"], 2, 2),
    mk("Ben can take 3 routes from school to town, then 5 routes from town to home. How many different ways can he walk home?", ["7", "8", "15", "3⁵"], 2, 2),
    mk("A packed lunch has 4 sandwich fillings, 5 drinks and 3 fruits. How many different lunches can be made?", ["20", "45", "60", "12"], 2, 2),
    mk("Simon chooses 1 burger from 3, 1 side from 2, 1 drink from 4 and 1 ice cream from 2. How many different meals can he choose?", ["11", "24", "40", "48"], 3, 2),
    mk("Sarah chooses a pizza size from 2 choices, a topping from 7 choices and a crust from 3 choices. How many different pizzas can she order?", ["14", "21", "42", "84"], 2, 2),
    mk("A task has 3 independent stages. The first stage can be done in 5 ways, the second in 4 ways and the third in 3 ways. How many total ways are there?", ["12", "20", "60", "64"], 2, 2),
    mk("How many 3-digit numbers are there where all 3 digits are odd?", ["15", "60", "125", "720"], 2, 2),

    mk("How many 3-digit numbers can be made from the digits 1, 2, 3 and 4 without repetition?", ["12", "24", "36", "64"], 1, 3),
    mk("How many 3-letter arrangements can be made from A, B, C, D and E without repetition?", ["15", "30", "60", "125"], 2, 3),
    mk("A class chooses a captain and a vice-captain from 8 pupils. How many different choices are possible?", ["16", "28", "56", "64"], 2, 3),
    mk("How many 3-digit even numbers can be made from the digits 1, 2, 3, 4 and 5 without repetition?", ["20", "24", "30", "60"], 1, 3),
    mk("How many even 5-digit numbers are there?", ["5,000", "45,000", "50,000", "100,000"], 1, 3),
    mk("James chooses 1 subject from each of 5 groups. The groups have 6, 4, 5, 2 and 4 choices. How many different sets of subjects can he choose?", ["480", "960", "1,200", "4,800"], 1, 3),
    mk("How many 4-digit codes can be made from the digits 0, 1, 2, 3, 4, 5 and 6 if the first digit cannot be 0 and no digit is repeated?", ["210", "720", "840", "1260"], 1, 3),
    mk("How many ways can first, second and third prizes be awarded to 6 finalists?", ["18", "60", "120", "216"], 2, 3),
    mk("A school council needs a president, a vice-president and a secretary. There are 8 people to choose from and nobody can do two jobs. How many different teams can be chosen?", ["56", "168", "336", "512"], 2, 3),
    mk("How many 4-letter arrangements can be made from the letters M, A, T, H and S without repetition if the first letter must be a consonant?", ["60", "72", "96", "120"], 2, 3),
    mk("Jenny has 9 skirts, 7 tops, 10 pairs of shoes, 2 necklaces and 5 bracelets. If she chooses one of each, how many different outfits can she make?", ["630", "3,150", "6,300", "12,600"], 2, 3),
    mk("How many 4-digit numbers can be made from the digits 1, 2, 3, 4 and 5 without repetition if the first digit must be odd?", ["48", "60", "72", "120"], 2, 3),

    mk("How many 4-digit even numbers can be made from the digits 0, 1, 2, 3, 4 and 5 without repetition?", ["120", "144", "156", "180"], 2, 4),
    mk("How many 5-digit numbers greater than 30,000 can be made from the digits 0, 1, 2, 3, 4 and 5 without repetition?", ["240", "300", "360", "720"], 2, 4),
    mk("A number plate has 2 letters followed by 3 digits. The letters can repeat, but the digits cannot. How many different plates are possible?", ["175,760", "486,720", "585,000", "676,000"], 1, 4),
    mk("How many 5-letter made-up words start with a vowel and end with S? Letters can repeat, and Y is not a vowel.", ["3,380", "87,880", "105,456", "2,284,880"], 1, 4),
    mk("A password has 2 different letters and then 2 different digits. How many passwords like this are possible?", ["46,800", "58,500", "65,000", "117,000"], 1, 4),
    mk("How many 4-digit numbers can be made from the digits 0, 1, 2, 3, 4 and 5 without repetition if the number must be divisible by 5?", ["96", "100", "108", "120"], 2, 4),
    mk("A meal has 4 starters, 5 mains and 3 desserts. Two of the mains are fish dishes and fish can only be paired with 2 of the desserts. How many meals are possible?", ["40", "48", "52", "60"], 2, 4),
    mk("An ID has 2 different letters followed by 3 different digits, and the last digit must be even. How many IDs are possible?", ["117,000", "234,000", "260,000", "468,000"], 1, 4),
    mk("How many 4-letter arrangements can be made from A, B, C, D and E without repetition if A must appear before B whenever both are used?", ["60", "72", "84", "96"], 2, 4),
    mk("How many 4-digit numbers greater than 3000 can be made from the digits 0, 1, 2, 3, 4 and 5 without repetition if the number must be even?", ["84", "96", "108", "120"], 1, 4)
  ];

  QUESTIONS.push(...extras);
  console.log(`Loaded ${extras.length} Counting Principle questions. Total now: ${QUESTIONS.length}`);
})();