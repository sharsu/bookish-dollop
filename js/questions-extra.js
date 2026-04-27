/* Extra harder question bank: adds generated questions plus topic-specific harder extras. */
(() => {
  if (typeof QUESTIONS === "undefined") return;
  const topics = ["Numbers","Decimals","Fractions","Percentages","BIDMAS","Algebra","Sequences","Ratio","Speed","Measurement","Geometry","Statistics","Probability","Logic"];
  const counts = [72,72,72,72,72,72,71,71,71,71,71,71,71,71];
  let id = QUESTIONS.reduce((max, q) => q && typeof q.id === "number" && q.id > max ? q.id : max, 0) + 1;
  const gcd = (a,b) => b ? gcd(b, a % b) : Math.abs(a);
  const lcm = (a,b) => Math.abs(a * b) / gcd(a,b);
  const simp = (n,d) => { const g = gcd(n,d); return `${n/g}/${d/g}`; };
  const fmt = n => {
    const value = Number(n);
    return Number.isFinite(value)
      ? (Number.isInteger(value) ? `${value}` : `${Number(value.toFixed(3))}`)
      : `${n}`;
  };
  const mk = (topic, question, correct, distractors, difficulty, seed) => {
    const uniq = [];
    [correct, ...distractors].map(v => `${v}`).forEach(v => { if (!uniq.includes(v)) uniq.push(v); });
    const num = Number(correct);
    while (uniq.length < 4) uniq.push(Number.isFinite(num) ? fmt(num + uniq.length) : `${uniq[0]}*${uniq.length}`);
    const pos = seed % 4, options = uniq.slice(1,4); options.splice(pos, 0, uniq[0]);
    return { id: id++, topic, question, options, answer: pos, difficulty };
  };
  const diff = i => i % 7 === 0 ? 4 : 3;
  const dayNames = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const wrapDay = index => dayNames[((index % 7) + 7) % 7];
  const fmtTime = (hour, minute) => `${hour}:${`${minute}`.padStart(2, "0")}`;
  const mirrorClock = (hour, minute) => {
    const totalMinutes = (hour === 12 ? 720 : hour * 60) + minute;
    let mirrorMinutes = 720 - totalMinutes;
    if (mirrorMinutes <= 0) mirrorMinutes += 720;
    if (mirrorMinutes === 720) return { hour: 12, minute: 0 };
    const mirrorHour = Math.floor(mirrorMinutes / 60) || 12;
    return { hour: mirrorHour, minute: mirrorMinutes % 60 };
  };
  const nextPalindrome = n => {
    let candidate = n + 1;
    while (`${candidate}` !== `${candidate}`.split("").reverse().join("")) candidate += 1;
    return candidate;
  };
  const logicPdfExtras = [
    mk("Logic","Find two consecutive integers whose sum is 75.","37 and 38",["36 and 39","35 and 40","38 and 39"],3,1400),
    mk("Logic","Find three consecutive even integers whose sum is 222.","72, 74 and 76",["70, 72 and 74","74, 76 and 78","71, 74 and 77"],3,1401),
    mk("Logic","Find two consecutive odd integers such that the sum of the smaller and 3 times the larger is 330.","81 and 83",["79 and 81","83 and 85","80 and 82"],4,1402),
    mk("Logic","I am a three-digit number and a palindrome. I am less than 500, greater than 200, all my digits are odd, and the sum of my digits is 7. What number am I?","313",["333","515","373"],4,1403),
    mk("Logic","A car's odometer shows 15951 miles, which is a palindrome. What is the minimum number of miles needed to reach the next palindrome?","110 miles",["10 miles","100 miles","111 miles"],4,1404),
    mk("Logic","Which square numbers between 100 and 1,000 are also palindromes?","121, 484 and 676",["121, 676 and 961","144, 484 and 676","121, 242 and 676"],4,1405),
    mk("Logic","What is the first palindrome greater than 5346?","5445",["5335","5435","5454"],3,1406),
    mk("Logic","What is the acute angle between the hour and minute hands of a clock at 2:00?","60°",["30°","90°","120°"],3,1407),
    mk("Logic","When viewed in a mirror, an analogue clock appears to show 10:10. What is the actual time?","1:50",["1:10","2:50","10:50"],3,1408),
    mk("Logic","An analogue clock shows 7:45. What time appears in its mirror image?","4:15",["5:15","4:45","3:15"],3,1409),
    mk("Logic","Which of these years is a leap year?","1600",["1800","1900","2100"],3,1410),
    mk("Logic","If the 23rd of a month is a Sunday, what day was it two weeks and four days earlier?","Wednesday",["Monday","Tuesday","Thursday"],3,1411),
    mk("Logic","Independence Day in 1988 was celebrated on a Wednesday. On which day was it celebrated in 1989?","Thursday",["Tuesday","Wednesday","Friday"],3,1412),
    mk("Logic","Oliver was born on 29 February. He celebrated his birthday on 29 February 2008 for the fourth time. In which year was he born?","1996",["1992","2000","2004"],4,1413),
    mk("Logic","In a 3×3 magic square, each row sums to 75. One row is 30, 5, 40. What is the row total checking this clue?","75",["70","80","85"],3,1414),
    mk("Logic","In an addition pyramid, each block equals the sum of the two blocks below. If the bottom row is 20, 30 and 20, what is the top block?","100",["70","90","120"],3,1415),
    mk("Logic","A multiplication arithmagon has side products 42, 48 and 56. What are the three corner numbers?","6, 7 and 8",["5, 7 and 8","6, 6 and 8","4, 7 and 8"],4,1416),
    mk("Logic","If C + A + T + S = 27 and C + A + T + S + S = 35, what is C + A + T?","19",["17","18","20"],3,1417)
  ];

  function genNumbers(i) {
    switch (i % 6) {
      case 0: { const a=12+(i%9)*4,b=18+(i%8)*6,c=20+(i%7)*5,x=lcm(lcm(a,b),c)+1; return mk("Numbers",`What is the smallest positive integer that leaves remainder 1 when divided by each of ${a}, ${b} and ${c}?`,x,[x-1,x+a,x+b],diff(i),i); }
      case 1: { const g=2+((i*2)%7),a=g*(6+i%5),b=g*(9+i%4),c=g*(12+i%3),d=g*(15+i%4); return mk("Numbers",`What is the Highest Common Factor (HCF) of ${a}, ${b}, ${c} and ${d}?`,g,[g*2,g*3,g*4],diff(i),i); }
      case 2: { const n=25+i%20,m=2*n+1,p=n*m+3*n; return mk("Numbers",`A number is multiplied by ${n} and then ${3*n} is added to give ${p}. What was the original number?`,m,[m-2,m+2,m+4],diff(i),i); }
      case 3: { const a=2+(i%4),b=1+((i+1)%4),c=1+((i+2)%3),x=a+b+c; return mk("Numbers",`How many prime factors are in 2^${a} × 3^${b} × 5^${c}, counting repeats?`,x,[x-1,x+1,a*b*c],diff(i),i); }
      case 4: { const d=7+(i%6),r=1+(i%5),n=d*(30+i)+r,x=(2*n+3)%d; return mk("Numbers",`What is the remainder when 2 × ${n} + 3 is divided by ${d}?`,x,[r,(r+3)%d,(d-r)%d],diff(i),i); }
      default:{ const m=11+i%12,s=4*(m+3); return mk("Numbers",`Four consecutive odd numbers add up to ${s}. What is the largest odd number?`,m+6,[m+4,m+8,s/4],diff(i),i); }
    }
  }
  function genDecimals(i) {
    switch (i % 6) {
      case 0: { const a=(12+i%15)/10,b=(21+i%11)/10,c=(14+i%9)/10,x=fmt(a*b+c); return mk("Decimals",`What is ${fmt(a)} × ${fmt(b)} + ${fmt(c)}?`,x,[fmt(a*(b+c)),fmt(a*b-c),fmt(a+b+c)],diff(i),i); }
      case 1: { const a=(150+i*3)/10,b=(2+(i%7))/10,c=(5+i%6)/10,x=fmt(a/b-c); return mk("Decimals",`What is ${fmt(a)} ÷ ${fmt(b)} - ${fmt(c)}?`,x,[fmt(a*b-c),fmt(a/(b-c)),fmt(a/b+c)],diff(i),i); }
      case 2: { const v=(125+i%20)/10,p=10+5*(i%5),q=5+5*(i%4),x=fmt(v*(1+p/100)*(1-q/100)); return mk("Decimals",`A price of £${fmt(v)} is increased by ${p}% and then reduced by ${q}%. What is the final price?`,x,[fmt(v*(1+(p-q)/100)),fmt(v*(1+p/100-q/100)),fmt(v*(1-q/100))],diff(i),i); }
      case 3: { const x=40+(i%6)+(i%7)/10+(i%9)/100+(i%5)/1000; return mk("Decimals",`Round ${x.toFixed(3)} to 3 significant figures.`,fmt(Number(x.toPrecision(3))),[fmt(Number((x+0.1).toPrecision(3))),fmt(Number(x.toFixed(2))),fmt(Number((x-0.1).toPrecision(3)))],diff(i),i); }
      case 4: { const a=1.2+i/20,b=2.4+i/25,c=3.1+i/30,d=4.5+i/40,target=fmt((a+b+c+d)/4); return mk("Decimals",`The mean of ${fmt(a)}, ${fmt(b)}, ${fmt(c)} and x is ${target}. Find x if the fourth number is ${fmt(d)} less than the total needed.`,fmt(d),[fmt(d+0.2),fmt(d-0.2),fmt((a+b+c)/3)],diff(i),i); }
      default:{ const a=(48+i%30)/100,b=(6+i%5)/100,c=(3+i%4)/10,x=fmt((a/b)*c); return mk("Decimals",`What is (${fmt(a)} ÷ ${fmt(b)}) × ${fmt(c)}?`,x,[fmt(a/(b*c)),fmt(a*b*c),fmt(a/b+c)],diff(i),i); }
    }
  }
  function genFractions(i) {
    switch (i % 6) {
      case 0: { const a=1+i%5,b=3+i%5,c=2+i%4,d=5+i%4,n=(b+a)*d+b*c,m=b*d; return mk("Fractions",`What is 1 ${a}/${b} + ${c}/${d}?`,simp(n,m),[simp(n-b,m),simp(n+b,m),simp(a+c,b+d)],diff(i),i); }
      case 1: { const a=2+i%5,b=4+i%5,c=3+i%4,d=5+i%5,n=a*c,m=b*d; return mk("Fractions",`What is ${a}/${b} of ${c}/${d}?`,simp(n,m),[simp(a*d,b*c),simp(n+c,m),simp(n,m+c)],diff(i),i); }
      case 2: { const a=2+i%6,b=5+i%4,c=1+i%4,d=2+i%5,n=a*d,m=b*c; return mk("Fractions",`Evaluate ${a}/${b} ÷ ${c}/${d} - 1.`,simp(n-m,m),[simp(a*c,b*d),simp(n,m),simp(m-n,m)],diff(i),i); }
      case 3: { const a=2+i%5,b=5+i%4,c=1+i%4,d=3+i%4,n=a*d+c*b,m=b*d; return mk("Fractions",`What is ${a}/${b} + ${c}/${d}? Give your answer in simplest form.`,simp(n,m),[simp(n+b,m),simp(n-b,m),simp(a+c,b+d)],diff(i),i); }
      case 4: { const total=36+6*(i%8),spent=(i%3)+1,frac=simp(spent,4); const left=total*(4-spent)/4; return mk("Fractions",`A tank is ${frac} full and holds ${total} litres when full. How many litres are empty?`,fmt(left),[fmt(total-left/2),fmt(left+6),fmt(left-6)],diff(i),i); }
      default:{ const total=24+6*(i%8),part=6+i%6; return mk("Fractions",`${part} is what fraction of ${total}? Give your answer in simplest form.`,simp(part,total),[simp(part+1,total),simp(part,total-part),simp(total,part)],diff(i),i); }
    }
  }
  function genPercentages(i) {
    switch (i % 6) {
      case 0: { const o=80+5*i,p=10+5*(i%6),q=20; const s=fmt(o*(1-p/100)*(1+q/100)); return mk("Percentages",`After a ${p}% discount and then 20% VAT, a price becomes £${s}. What was the original price?`,fmt(o),[fmt(o*(1-p/100)),fmt(o*(1+q/100)),fmt(s/(1-p/100))],diff(i),i); }
      case 1: { const oldV=120+4*i,newV=oldV+oldV*(10+5*(i%4))/100; const p=fmt(((newV-oldV)/oldV)*100); return mk("Percentages",`A value changes from ${oldV} to ${fmt(newV)}. What is the percentage increase?`,p,[fmt(((newV-oldV)/newV)*100),fmt(newV-oldV),fmt(newV/oldV*100)],diff(i),i); }
      case 2: { const v=200+3*i,p=10+5*(i%5),q=5+5*(i%4),x=fmt(v*(p/100)*(q/100)); return mk("Percentages",`What is ${q}% of ${p}% of ${v}?`,x,[fmt(v*(p+q)/100),fmt(v*(p*q/10)/100),fmt(v*(p/100))],diff(i),i); }
      case 3: { const c=40+3*i,s=60+4*i,p=fmt(((s-c)/c)*100); return mk("Percentages",`An item costs £${c} and sells for £${s}. What is the percentage profit, based on cost price?`,p,[fmt(((s-c)/s)*100),fmt((s/c)*100),fmt(((c-s)/c)*100)],diff(i),i); }
      case 4: { const f=72+4*i,p=20+5*(i%4),x=fmt(f/(1+p/100)); return mk("Percentages",`After an increase of ${p}%, a quantity is ${f}. What was it originally?`,x,[fmt(f*(1+p/100)),fmt(f-p),fmt(f/(p/100))],diff(i),i); }
      default:{ const p=5+i%8,y=2+i%5,amt=100+10*i,x=fmt(amt*Math.pow(1+p/100,y)-amt); return mk("Percentages",`Find the compound interest on £${amt} at ${p}% per year for ${y} years.`,x,[fmt(amt*(p/100)*y),fmt(amt*Math.pow(1+p/100,y)),fmt(amt*(p*y/100))],diff(i),i); }
    }
  }
  function genBIDMAS(i) {
    switch (i % 6) {
      case 0: { const a=3+i%5,b=4+i%4,c=2+i%3,d=5+i%4,x=(a+b)*(c+d)-a*a; return mk("BIDMAS",`Evaluate (${a} + ${b}) × (${c} + ${d}) - ${a}².`,x,[a+b*(c+d)-a*a,(a+b)*(c+d-a),x+2],diff(i),i); }
      case 1: { const a=6+i%5,b=2+i%4,c=2*(2+i%3),d=2+i%3,x=a+b*(c+d)/2; return mk("BIDMAS",`Evaluate ${a} + ${b} × (${c} + ${d}) ÷ 2.`,x,[(a+b)*(c+d)/2,a+b*c+d,x-b],diff(i),i); }
      case 2: { const a=2+i%4,b=3+i%5,c=1+i%4,x=(a+b)*(a+b)-c*c; return mk("BIDMAS",`Evaluate (${a} + ${b})² - ${c}².`,x,[a*a+b*b-c*c,(a+b-c)*(a+b+c),x-2],diff(i),i); }
      case 3: { const a=24+2*i,b=3+i%4,c=2+i%3,d=2+i%4,x=a/b+c*d; return mk("BIDMAS",`Evaluate ${a} ÷ ${b} + ${c} × ${d}.`,x,[a/(b+c)*d,a/(b-c)+d,x+2],diff(i),i); }
      case 4: { const a=10+i%7,b=4+i%4,c=2+i%3,d=3+i%3,x=a-(b-c*d); return mk("BIDMAS",`Evaluate ${a} - (${b} - ${c} × ${d}).`,x,[a-b-c*d,a-(b-c)*d,x+1],diff(i),i); }
      default:{ const a=5+i%6,b=2+i%5,c=3+i%4,x=(a+b)*(a-b)+c*c; return mk("BIDMAS",`Evaluate (${a} + ${b}) × (${a} - ${b}) + ${c}².`,x,[a*a-b*b,a*a+b*b+c*c,x-2],diff(i),i); }
    }
  }
  function genAlgebra(i) {
    switch (i % 6) {
      case 0: { const x=4+i%6,a=2+i%4,b=1+i%4,c=a*(x-b); return mk("Algebra",`Solve ${a}(x - ${b}) = ${c}.`,x,[x-1,x+1,c/a],diff(i),i); }
      case 1: { const x=4+i%7,y=2+i%5,s=x+y,t=x-y; return mk("Algebra",`Solve simultaneously: x + y = ${s} and x - y = ${t}. Find x.`,x,[y,s-t,s/2],diff(i),i); }
      case 2: { const x=2+i%5,y=3+i%4; return mk("Algebra",`If x = ${x} and y = ${y}, find 3x² - 2y + 4.`,3*x*x-2*y+4,[3*x*x+2*y+4,x*x-2*y+4,3*x-2*y+4],diff(i),i); }
      case 3: { const x=3+i%6,a=2+i%4,b=5+i%4,p=3*x+2*a+b; return mk("Algebra",`The perimeter of a rectangle is ${p}. Its sides are x + ${a} and 2x + ${b}. Find x.`,x,[x+1,x-1,p/2],diff(i),i); }
      case 4: { const x=5+i%7,m=2+i%4,c=3+i%5,y=m*x+c; return mk("Algebra",`For y = ${m}x + ${c}, if y = ${y}, find x.`,x,[m+y+c,(y-c)/(m+1),y-c],diff(i),i); }
      default:{ const x=4+i%6,k=2+i%4; return mk("Algebra",`Solve 2(x - 3) = 3(x - 5) + ${k}.`,x,[x-1,x+1,k],diff(i),i); }
    }
  }
  function genSequences(i) {
    switch (i % 5) {
      case 0: { const a=3+i%5,d=2+i%4,n=20+i%8,x=a+(n-1)*d; return mk("Sequences",`An arithmetic sequence starts ${a}, ${a+d}, ${a+2*d}, ... What is term ${n}?`,x,[a+n*d,a+(n-2)*d,x+2*d],diff(i),i); }
      case 1: { const a=2+i%4,b=3+i%5,t1=a*4+b,t2=a*9+b; return mk("Sequences",`A sequence has nth term an + b. If term 4 is ${t1} and term 9 is ${t2}, what is the value of a?`,a,[b,a+b,t2-t1],diff(i),i); }
      case 2: { const a=1+i%4,b=2+i%5,n=7+i%4,x=a*n*n+b; return mk("Sequences",`The nth term is ${a}n² + ${b}. What is term ${n}?`,x,[a*n+b,a*n*n-b,x+a],diff(i),i); }
      case 3: { const a=2+i%4,b=1+i%5,t=a*(10+i%5)+b,x=(t-b)/a; return mk("Sequences",`The nth term is ${a}n + ${b}. Which term is ${t}?`,x,[x-1,x+1,t/a],diff(i),i); }
      default:{ const a=2+i%3,b=5+i%4,next=a*4*4+b; return mk("Sequences",`The sequence begins ${a*1*1+b}, ${a*2*2+b}, ${a*3*3+b}, ... What is the next term?`,next,[next+a,next+b,a*5*5+b],diff(i),i); }
    }
  }
  function genRatio(i) {
    switch (i % 5) {
      case 0: { const a=2+i%5,b=3+i%4,t=(a+b)*(12+i%6),x=t*a/(a+b); return mk("Ratio",`£${t} is shared in the ratio ${a}:${b}. What is the larger share?`,t-x,[x,a+b,t/a],diff(i),i); }
      case 1: { const a=1+i%4,b=2+i%5,s=10+i%5; return mk("Ratio",`A recipe uses flour:sugar = ${a}:${b}. How much sugar is needed when flour is ${a*s} g and the mixture is doubled?`,2*b*s,[a*s,2*(a+b)*s,b*s+s],diff(i),i); }
      case 2: { const a=3+i%4,b=5+i%5,d=(b-a)*(4+i%4),x=(a+b)*(4+i%4); return mk("Ratio",`In the ratio ${a}:${b}, the difference between the parts is ${d}. What is the total quantity?`,x,[x-d,x+d,d*(a+b)],diff(i),i); }
      case 3: { const r=2+i%4,g=3+i%5,b=1+i%4; return mk("Ratio",`If red:green = ${r}:${g} and green:blue = ${g}:${b}, what is red:green:blue?`,`${r}:${g}:${b}`,[`${r}:${b}:${g}`,`${g}:${r}:${b}`,`${r+b}:${g}:${b}`],diff(i),i); }
      default:{ const a=150+50*(i%5),b=250+50*(i%4),g=gcd(a,b); return mk("Ratio",`Simplify the ratio ${a}:${b}.`,`${a/g}:${b/g}`,[`${a}:${b/g}`,`${a/g}:${b}`,`${g}:${a+b}`],diff(i),i); }
    }
  }
  function genSpeed(i) {
    switch (i % 5) {
      case 0: { const a=40+5*(i%6),b=60+5*(i%5),x=fmt((2*a*b)/(a+b)); return mk("Speed",`A car travels the same distance out at ${a} km/h and back at ${b} km/h. What is the average speed for the whole trip?`,x,[fmt((a+b)/2),fmt(a*b/(a+b)),fmt((2*a+b)/3)],diff(i),i); }
      case 1: { const m=18+2*(i%8),x=fmt(m/3.6); return mk("Speed",`Convert ${m} km/h to m/s.`,x,[fmt(m*3.6),fmt(m/36),fmt(x+1)],diff(i),i); }
      case 2: { const d=180+12*i,s=60+5*(i%5),x=fmt(d/s); return mk("Speed",`How many hours does it take to travel ${d} km at ${s} km/h? Give a decimal answer.`,x,[fmt(d*s),fmt(s/d),fmt(d/(s+10))],diff(i),i); }
      case 3: { const s=45+5*(i%6),h=1+i%3,m=15+15*(i%3),x=fmt(s*(h+m/60)); return mk("Speed",`How far is travelled at ${s} km/h in ${h} hour(s) ${m} minutes?`,x,[fmt(s*(h+m)),fmt((h+m/60)/s),fmt(x+5)],diff(i),i); }
      default:{ const avg=50+5*(i%6),t=2+(i%4)/2,x=fmt(avg*t); return mk("Speed",`A journey has average speed ${avg} km/h and lasts ${fmt(t)} hours. What distance is covered?`,x,[fmt(avg/t),fmt(avg+t),fmt(x+avg)],diff(i),i); }
    }
  }
  function genMeasurement(i) {
    switch (i % 5) {
      case 0: { const l=4+i%6,w=5+i%5,h=6+i%4,x=fmt((l*w*h)/1000); return mk("Measurement",`A cuboid measures ${l} cm by ${w} cm by ${h} cm. What is its volume in litres?`,x,[l*w*h,fmt((l*w*h)/100),fmt((l*w*h)/10000)],diff(i),i); }
      case 1: { const l=4+i%6,w=5+i%5,h=6+i%4,x=2*(l*w+l*h+w*h); return mk("Measurement",`What is the total surface area of a cuboid ${l} cm by ${w} cm by ${h} cm?`,x,[l*w*h,l+w+h,2*l*w+h],diff(i),i); }
      case 2: { const m=2+i%8,x=m*100; return mk("Measurement",`Convert ${m} metres to centimetres.`,x,[m*10,m*1000,m/100],diff(i),i); }
      case 3: { const l=10+i%5,w=8+i%4,path=1+i%3,x=(l+2*path)*(w+2*path)-l*w; return mk("Measurement",`A rectangular garden ${l} m by ${w} m has a path of width ${path} m all around the outside. What is the area of the path?`,x,[l*w,(l+path)*(w+path)-l*w,x+2*path],diff(i),i); }
      default:{ const l=10+i%8,w=6+i%6,scale=2+i%3,x=l*w*scale*scale; return mk("Measurement",`A rectangle ${l} cm by ${w} cm is enlarged by scale factor ${scale}. What is the new area?`,x,[l*w*scale,l+w+scale,l*w+scale*scale],diff(i),i); }
    }
  }
  function genGeometry(i) {
    switch (i % 5) {
      case 0: { const sides=5+i%6,ext=360/sides; return mk("Geometry",`A regular polygon has exterior angle ${ext}°. How many sides does it have?`,sides,[360-ext,180-ext,ext/10],diff(i),i); }
      case 1: { const x=40+5*(i%8),y=30+5*(i%6); return mk("Geometry",`Two interior angles of a triangle are ${x}° and ${y}°. What is the third angle?`,180-x-y,[x+y,360-x-y,180-x+y],diff(i),i); }
      case 2: { const a=7+i%6,b=10+i%5,h=4+i%4,x=((a+b)*h)/2; return mk("Geometry",`Find the area of a trapezium with parallel sides ${a} cm and ${b} cm, height ${h} cm.`,x,[a*b*h,(a+b)+h,(a+b)*h],diff(i),i); }
      case 3: { const d=6+2*(i%6),r=d/2,x=fmt(3.14*r*r); return mk("Geometry",`Using π = 3.14, find the area of a circle with diameter ${d} cm.`,x,[fmt(2*3.14*r),fmt(3.14*d*d),fmt(6.28*r*r)],diff(i),i); }
      default:{ const n=6+i%5,x=(n-2)*180; return mk("Geometry",`What is the sum of the interior angles of a ${n}-sided polygon?`,x,[180*n,360/n,((n-2)*180)/n],diff(i),i); }
    }
  }
  function genStatistics(i) {
    switch (i % 5) {
      case 0: { const a=2+i%4,b=4+i%5,c=6+i%4,fa=3+i%5,fb=5+i%4,fc=4+i%3,total=fa+fb+fc,x=fmt((a*fa+b*fb+c*fc)/total); return mk("Statistics",`Estimate the mean from the frequency table: ${a} (${fa}), ${b} (${fb}), ${c} (${fc}).`,x,[fmt((a+b+c)/3),fmt(a*fa+b*fb+c*fc),fmt(total/(a+b+c))],diff(i),i); }
      case 1: { const base=[10+i,12+i,14+i,16+i],target=15+i%6,total=target*5,missing=total-base.reduce((s,v)=>s+v,0); return mk("Statistics",`Four numbers are ${base.join(", ")}. What fifth number gives a mean of ${target}?`,missing,[missing+2,missing-2,target],diff(i),i); }
      case 2: { const p=20+5*(i%7),total=120+10*i,x=fmt(total*p/100); return mk("Statistics",`${p}% of ${total} students chose drama. How many students is that?`,x,[fmt(360*p/100),fmt(total/p),fmt(total*(100-p)/100)],diff(i),i); }
      case 3: { const arr=[5+i,8+i,11+i,14+i,17+i,20+i,23+i,26+i]; return mk("Statistics",`What is the median of ${arr.join(", ")}?`,fmt((arr[3]+arr[4])/2),[arr[3],arr[4],fmt((arr[0]+arr[7])/2)],diff(i),i); }
      default:{ const low=10+i,high=40+i*2; return mk("Statistics",`A data set has minimum ${low} and maximum ${high}. What is the range?`,high-low,[high+low,high/low,low-high],diff(i),i); }
    }
  }
  function genProbability(i) {
    switch (i % 5) {
      case 0: { const r=2+i%4,b=5+i%5,n=simp(r*b,(r+b)*(r+b-1)); return mk("Probability",`A bag has ${r} red and ${b} blue balls. Two are drawn without replacement. What is P(red then blue)?`,n,[simp(r,r+b),simp(b,r+b),simp(r*b,(r+b)*(r+b))],diff(i),i); }
      case 1: { const a=1/(2+i%4),b=1/(3+i%4),x=2*a*b; return mk("Probability",`Two independent events have probabilities ${simp(1,2+i%4)} and ${simp(1,3+i%4)}. What is the probability that exactly one occurs?`,fmt(x),[fmt(a*b),fmt(a+b),fmt(1-x)],diff(i),i); }
      case 2: { const p=0.2+0.1*(i%5); return mk("Probability",`If P(event) = ${fmt(p)}, what is P(not event)?`,fmt(1-p),[fmt(p),fmt(1+p),fmt(p/2)],diff(i),i); }
      case 3: { const p=0.15+0.05*(i%5),tr=80+10*i; return mk("Probability",`The probability of success is ${fmt(p)} in ${tr} trials. What is the expected number of successes?`,fmt(p*tr),[fmt(tr/p),fmt((1-p)*tr),fmt(p+tr)],diff(i),i); }
      default:{ const a=0.2+0.1*(i%3),b=0.3+0.1*(i%3),c=0.1+0.05*(i%3); return mk("Probability",`Three mutually exclusive events have probabilities ${fmt(a)}, ${fmt(b)} and ${fmt(c)}. Find the probability that one of them occurs.`,fmt(a+b+c),[fmt(a*b*c),fmt(1-a-b-c),fmt(a+b-c)],diff(i),i); }
    }
  }
  function genLogic(i) {
    switch (i % 10) {
      case 0: {
        const today = i % 7;
        const clue = wrapDay(today + 2);
        const answer = wrapDay(today - 1);
        return mk("Logic",`If the day after tomorrow is ${clue}, what day was yesterday?`,answer,[wrapDay(today),wrapDay(today + 1),wrapDay(today - 2)],diff(i),i);
      }
      case 1: {
        const variant = Math.floor(i / 10) % 3;
        if (variant === 0) {
          const middle = 24 + 2 * (i % 8);
          const total = 3 * middle;
          return mk("Logic",`Three consecutive even integers add to ${total}. What is the largest integer?`,middle + 2,[middle - 2,middle,total / 3],diff(i),i);
        }
        if (variant === 1) {
          const smaller = 11 + 2 * (i % 10);
          const larger = smaller + 2;
          const total = smaller + 3 * larger;
          return mk("Logic",`Two consecutive odd integers satisfy: smaller + 3 × larger = ${total}. What is the larger integer?`,larger,[smaller,larger + 2,(total - 2) / 4],diff(i),i);
        }
        const smallest = 6 + (i % 8);
        const mean = smallest + 1.5;
        return mk("Logic",`Four consecutive integers have a mean of ${fmt(mean)}. What is the smallest integer?`,smallest,[smallest + 1,smallest + 2,fmt(mean)],diff(i),i);
      }
      case 2: {
        const minutes = [0,5,10,15,20,25,30,40,45,50];
        const h = (i % 11) + 1;
        const m = minutes[(i * 3) % minutes.length];
        const raw = Math.abs(30 * h - 5.5 * m);
        const small = Math.min(raw, 360 - raw);
        const askReflex = Math.floor(i / 10) % 2 === 1;
        const answer = askReflex ? 360 - small : small;
        return mk("Logic",`What is the ${askReflex ? "reflex" : "smaller"} angle between the hands of a clock at ${fmtTime(h, m)}?`,fmt(answer),[fmt(askReflex ? small : 360 - small),fmt(Math.abs(30 * h - 6 * m)),fmt(Math.abs(30 * h - 5 * m))],diff(i),i);
      }
      case 3: {
        const minutes = [5,10,15,20,25,35,40,45,50];
        const actualHour = (i % 11) + 1;
        const actualMinute = minutes[(i * 5) % minutes.length];
        const actual = fmtTime(actualHour, actualMinute);
        const mirror = mirrorClock(actualHour, actualMinute);
        const mirrorLabel = fmtTime(mirror.hour, mirror.minute);
        const shiftedMirror = fmtTime(mirror.hour, (mirror.minute + 10) % 60);
        const shiftedActual = fmtTime(actualHour === 12 ? 1 : actualHour + 1, actualMinute);
        return Math.floor(i / 10) % 2 === 0
          ? mk("Logic",`An analogue clock shows ${actual}. What time appears in its mirror image?`,mirrorLabel,[actual,shiftedMirror,shiftedActual],diff(i),i)
          : mk("Logic",`The mirror image of an analogue clock shows ${mirrorLabel}. What is the actual time?`,actual,[mirrorLabel,shiftedMirror,shiftedActual],diff(i),i);
      }
      case 4: {
        if (Math.floor(i / 10) % 2 === 0) {
          const n = 2300 + 37 * i;
          const answer = nextPalindrome(n);
          return mk("Logic",`What is the first palindrome greater than ${n}?`,answer,[answer - 10,answer + 10,answer - 100],diff(i),i);
        }
        const thousand = 2 + (i % 7);
        return mk("Logic",`How many palindromes are there between ${thousand}000 and ${thousand}999?`,10,[9,11,90],diff(i),i);
      }
      case 5: {
        if (Math.floor(i / 10) % 2 === 0) {
          const leapYears = [1600, 2000, 1996, 2004, 2024];
          const normalYears = [1700, 1800, 1900, 2100, 2200, 1999, 2001, 2023];
          const answer = leapYears[i % leapYears.length];
          const start = (i * 2) % normalYears.length;
          return mk("Logic","Which of these years is a leap year?",answer,[normalYears[start],normalYears[(start + 1) % normalYears.length],normalYears[(start + 2) % normalYears.length]],diff(i),i);
        }
        const givenDayIndex = (i + 2) % 7;
        const givenDay = wrapDay(givenDayIndex);
        const answer = wrapDay(givenDayIndex - 4);
        return mk("Logic",`If the 23rd of a month is a ${givenDay}, what day was it two weeks and four days earlier?`,answer,[wrapDay(givenDayIndex - 3),wrapDay(givenDayIndex - 5),wrapDay(givenDayIndex - 2)],diff(i),i);
      }
      case 6: {
        const missing = 10 + (i % 9);
        const a = 6 + (i % 7);
        const b = 9 + ((i * 2) % 8);
        const total = a + b + missing;
        return mk("Logic",`In a magic square, each row adds to ${total}. One row contains ${a}, ${b} and a blank. What is the blank?`,missing,[total - a,total - b,missing + 5],diff(i),i);
      }
      case 7: {
        const a = 10 + (i % 9);
        const b = 12 + ((i * 2) % 9);
        const c = 8 + ((i * 3) % 9);
        const top = a + 2 * b + c;
        return mk("Logic",`In an addition pyramid, the bottom row is ${a}, ${b} and ${c}. What is the top block?`,top,[a + b + c,a + 2 * b,top + 10],diff(i),i);
      }
      case 8: {
        if (Math.floor(i / 10) % 2 === 0) {
          const a = 2 + (i % 6);
          const b = 4 + (i % 5);
          const c = 3 + (i % 4);
          const ab = a + b, bc = b + c, ca = c + a;
          return mk("Logic",`An addition arithmagon has side totals ${ab}, ${bc} and ${ca}. What is the corner shared by the ${ab} and ${ca} sides?`,a,[b,c,a + 1],diff(i),i);
        }
        const a = 2 + (i % 4);
        const b = 3 + (i % 4);
        const c = 4 + (i % 3);
        const ab = a * b, bc = b * c, ca = c * a;
        return mk("Logic",`A multiplication arithmagon has side products ${ab}, ${bc} and ${ca}. What is the smallest corner number?`,Math.min(a, b, c),[Math.max(a, b, c),b,c],diff(i),i);
      }
      default: {
        if (Math.floor(i / 10) % 2 === 0) {
          const extra = 5 + (i % 8);
          const total = 24 + extra;
          return mk("Logic",`If C + A + T + S = ${total} and C + A + T + S + S = ${total + extra}, what is the value of S?`,extra,[total,total - extra,extra + 2],diff(i),i);
        }
        const extra = 6 + (i % 7);
        const total = 22 + extra;
        return mk("Logic",`If M + A + P = ${total} and M + A + P + P = ${total + extra}, what is M + A?`,total - extra,[extra,total,total - 2 * extra],diff(i),i);
      }
    }
  }

  const gens = { Numbers:genNumbers, Decimals:genDecimals, Fractions:genFractions, Percentages:genPercentages, BIDMAS:genBIDMAS, Algebra:genAlgebra, Sequences:genSequences, Ratio:genRatio, Speed:genSpeed, Measurement:genMeasurement, Geometry:genGeometry, Statistics:genStatistics, Probability:genProbability, Logic:genLogic };
  const extras = [...logicPdfExtras];
  topics.forEach((topic, idx) => { for (let i = 0; i < counts[idx]; i++) extras.push(gens[topic](i)); });
  QUESTIONS.push(...extras);
  console.log(`Loaded ${extras.length} extra harder questions. Total now: ${QUESTIONS.length}`);
})();
