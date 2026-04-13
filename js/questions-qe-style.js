/* QE-style 11+ question bank: adds 1000 paper-inspired questions */
(() => {
  if (typeof QUESTIONS === "undefined") return;
  const topics = ["Numbers","Decimals","Fractions","Percentages","BIDMAS","Algebra","Sequences","Ratio","Speed","Measurement","Geometry","Statistics","Probability","Logic"];
  const counts = [72,72,72,72,72,72,71,71,71,71,71,71,71,71];
  let id = QUESTIONS.reduce((max, q) => q && typeof q.id === "number" && q.id > max ? q.id : max, 0) + 1;
  const gcd = (a,b) => b ? gcd(b, a % b) : Math.abs(a);
  const simp = (n,d) => { const g = gcd(n,d); return `${n/g}/${d/g}`; };
  const fmt = n => { const v = Number(n); return Number.isFinite(v) ? (Number.isInteger(v) ? `${v}` : `${Number(v.toFixed(3))}`) : `${n}`; };
  const dayNames = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const mk = (topic, question, correct, distractors, difficulty, seed) => {
    const uniq = [];
    [correct, ...distractors].map(v => `${v}`).forEach(v => { if (!uniq.includes(v)) uniq.push(v); });
    const num = Number(correct);
    while (uniq.length < 4) uniq.push(Number.isFinite(num) ? fmt(num + uniq.length + 1) : `${uniq[0]}*${uniq.length}`);
    const pos = seed % 4, options = uniq.slice(1,4); options.splice(pos, 0, uniq[0]);
    return { id: id++, topic, question, options, answer: pos, difficulty };
  };
  const diff = i => i % 8 === 0 ? 4 : 3;

  function genNumbers(i) {
    switch (i % 6) {
      case 0: { const n=10+i%5, digits=new Set(); for(let k=1;k<=n;k++) `${k*k}`.split("").forEach(d=>digits.add(d)); const miss=[1,2,3,4,5,6,7,8,9].find(d=>!digits.has(`${d}`)); return mk("Numbers",`Jen writes out the first ${n} square numbers. Which digit from 1 to 9 does she not write?`,miss,[miss===9?8:miss+1,miss===1?2:miss-1,((miss+3)%9)||9],diff(i),i); }
      case 1: { const base=9000000+50000+17+1000*(i%40)+83, target=10000000, ans=target-base; return mk("Numbers",`How much must be added to ${base.toLocaleString()} to make 10,000,000?`,ans,[ans+1000,ans-1000,ans+100],diff(i),i); }
      case 2: { const limit=90+10*(i%6); let count=0; for(let k=3;k<=limit;k+=3) count += `${k}`.length; return mk("Numbers",`Mary writes down all the multiples of 3 from 1 to ${limit}. How many digits does she write altogether?`,count,[count-3,count+3,Math.floor(limit/3)],diff(i),i); }
      case 3: { const sq=10+i%12, n=sq*sq; return mk("Numbers",`Which of these numbers has an odd number of factors?`,n,[n-1,n+2,n+6],diff(i),i); }
      case 4: { const p=5+i%6, sum=1+p+p*p, n=p*p; return mk("Numbers",`Which number has factors that add up to ${sum}?`,n,[p*(p+1),n+p,p*p*p],diff(i),i); }
      default:{ const sq=4+i%6, num=sq*sq-1; const ans=[...Array(num).keys()].map(x=>x+1).find(v=>v%7===0&&v===num); return mk("Numbers",`A 2-digit number is less than 70, is 1 less than a square number and is divisible by 7. What is the number?`,ans,[ans-7,ans+7,sq*sq],diff(i),i); }
    }
  }

  function genDecimals(i) {
    switch (i % 6) {
      case 0: { const a=0.6+0.1*(i%4), b=0.3+0.1*(i%5), c=0.012+0.002*(i%4), x=fmt(a*b/c); return mk("Decimals",`What is ${fmt(a)} × ${fmt(b)} ÷ ${fmt(c)}?`,x,[fmt(a*b*c),fmt(a+b/c),fmt((a+b)/c)],diff(i),i); }
      case 1: { const total=2+0.2*(i%4), half=1.1+0.1*(i%4), flask=fmt(2*half-total); return mk("Decimals",`A flask filled with coffee weighs ${fmt(total)} kg. When half the coffee is poured out, it weighs ${fmt(half)} kg. What is the weight of the empty flask?`,flask,[fmt(total-half),fmt(half/2),fmt(total-2*half)],diff(i),i); }
      case 2: { const kg=10+0.13*(i%8)+0.4, grams=Math.round(kg*10)*100; return mk("Decimals",`What is ${fmt(kg)} kg rounded to the nearest 100 g?`,`${grams} g`,[`${grams+100} g`,`${grams-100} g`,`${Math.round(kg*1000)} g`],diff(i),i); }
      case 3: { const flat=15+0.5*(i%4), alt=14+0.25*(i%4), charge=5+2*(i%3), cheaper=fmt(flat-alt*(1+charge/100)); return mk("Decimals",`One restaurant charges £${fmt(flat)}. Another charges £${fmt(alt)} with a ${charge}% service charge. How much do you save by choosing the cheaper option?`,`£${cheaper}`,[`£${fmt(Number(cheaper)+0.1)}`,`£${fmt(alt*(charge/100))}`,`£${fmt(flat-alt)}`],diff(i),i); }
      case 4: { const p1=5+i%4, a=1.1+0.1*(i%4), p2=2+i%3, b=1.45+0.05*(i%4), avg=fmt((p1*a+p2*b)/(p1+p2)); return mk("Decimals",`A pack of ${p1} bulbs costs £${fmt(p1*a)} and a pack of ${p2} bulbs costs £${fmt(p2*b)}. What is the average cost per bulb across both packs?`,`£${avg}`,[`£${fmt((a+b)/2)}`,`£${fmt((p1*a+p2*b)/2)}`,`£${fmt(avg-0.1)}`],diff(i),i); }
      default:{ const total=10, a=2.25+0.1*(i%3), b=0.9+0.1*(i%2), c=0.02+0.01*(i%3), d=3.33+0.1*(i%3), left=fmt(100*(total-a-b-c-d)/total); return mk("Decimals",`A 10 m pipe is cut into lengths of ${fmt(a)} m, ${fmt(b)} m, ${fmt(c)} m and ${fmt(d)} m. What percentage of the original pipe is left?`,`${left}%`,[`${fmt(Number(left)+5)}%`,`${fmt(Number(left)-5)}%`,`${fmt(100-(Number(left)))}%`],diff(i),i); }
    }
  }

  function genFractions(i) {
    switch (i % 6) {
      case 0: { const a=2+i%4, used1=simp(a,6), used2=60+5*(i%4), used3=0.75+0.05*(i%3); const remain=1-a/6-used2/100-used3; return mk("Fractions",`Three identical packets are used up as follows: ${used1}, ${used2}% and ${fmt(used3)} of each packet. What fraction of one whole packet remains altogether?`,simp(Math.round(remain*100),100),[simp(Math.round((1-remain)*100),100),simp(Math.round((remain+0.1)*100),100),simp(Math.round((remain-0.1)*100),100)],diff(i),i); }
      case 1: { const den=6+2*(i%4), sq=(3+i%4)**2, ans=fmt(8*sq/den); return mk("Fractions",`How many ${den===8?"eighths":`${den}ths`} are there in the square of ${3+i%4}?`,ans,[fmt(sq/den),fmt(den*sq),fmt(den/sq)],diff(i),i); }
      case 2: { const opts=[[5,11],[4,9],[7,13],[9,20]], pick=opts[i%opts.length], ans=pick[0]/pick[1]; return mk("Fractions",`Which of these fractions is closest to 0.5?`,simp(pick[0],pick[1]),[simp(pick[0]-1,pick[1]),simp(pick[0]+1,pick[1]+2),simp(1,3)],diff(i),i); }
      case 3: { const total=24+6*(i%5), frac=simp(1+i%3,4), empty=fmt(total*(1-(1+i%3)/4)); return mk("Fractions",`A tank is ${frac} full when full capacity is ${total} litres. How many litres are empty?`,empty,[fmt(total-empty),fmt(Number(empty)+3),fmt(Number(empty)-3)],diff(i),i); }
      case 4: { const a=2+i%4,b=5+i%4,c=1+i%3,d=2+i%4,n=a*d+b*c,m=b*d; return mk("Fractions",`What is ${a}/${b} + ${c}/${d}? Give your answer in simplest form.`,simp(n,m),[simp(n+b,m),simp(n-b,m),simp(a+c,b+d)],diff(i),i); }
      default:{ const total=30+5*(i%6), part=10+5*(i%4); return mk("Fractions",`${part} is what fraction of ${total}? Give your answer in simplest form.`,simp(part,total),[simp(part+5,total),simp(part,total-part),simp(total,part)],diff(i),i); }
    }
  }

  function genPercentages(i) {
    switch (i % 6) {
      case 0: { const pay=1600+200*(i%5), angle=36+9*(i%4), spend=pay*angle/360; return mk("Percentages",`A pie chart shows a salary of £${pay}. If hobbies take ${angle}° of the chart, how much is spent on hobbies?`,fmt(spend),[fmt(spend+50),fmt(pay*angle/100),fmt(pay-angle)],diff(i),i); }
      case 1: { const t=26+4*(i%5), w=fmt(t/0.4); return mk("Percentages",`If t is 40% of w and t = ${t}, what is w?`,w,[fmt(t*2),fmt(t*2.5),fmt(t/4)],diff(i),i); }
      case 2: { const hours=3+i%8, pct=Math.round(hours/48*100); return mk("Percentages",`What percentage of 2 days is ${hours} hours? Give your answer to the nearest whole percent.`,pct,[pct+1,pct+2,Math.round(hours/24*100)],diff(i),i); }
      case 3: { const oranges=80+10*(i%4), cost=24+3*(i%4), bad=4+i%3, profit=20+5*(i%4), sell=fmt((cost+profit)/(oranges-oranges/bad)); return mk("Percentages",`A shopkeeper buys ${oranges} oranges for £${cost}. One in ${bad} are bad. At what price must each remaining orange be sold to make a profit of £${profit}?`,`${sell} £`,[`${fmt(Number(sell)+0.05)} £`,`${fmt(cost/oranges)} £`,`${fmt((profit)/(oranges-oranges/bad))} £`],diff(i),i); }
      case 4: { const g=120+10*(i%6), ans=fmt((g/0.4)*2); return mk("Percentages",`If ${g} is 40% of g and 2g = ?, what is the value of 2g?`,ans,[fmt(g*2),fmt(g/0.4),fmt(g*0.8)],diff(i),i); }
      default:{ const flat=20+5*(i%4), zooA=flat*0.2, musA=(flat-zooA)/2, bParts=[3,5,2], zooB=30*bParts[0]/10, musB=30*bParts[2]/10, cMuseum=5+i%4, cZoo=2*cMuseum, diffZoo=(zooA+zooB+cZoo)-(musA+musB+cMuseum); return mk("Percentages",`Three classes choose the zoo, museum or theatre. Class A has ${flat} pupils with 20% choosing the zoo and the rest split equally. Class B has 30 pupils choosing zoo:theatre:museum in the ratio 3:5:2. Class C has ${cMuseum} choosing the museum and twice as many choosing the zoo. How many more pupils choose the zoo than the museum altogether?`,diffZoo,[diffZoo-1,diffZoo+1,zooA+zooB+cZoo],diff(i),i); }
    }
  }

  function genBIDMAS(i) {
    switch (i % 6) {
      case 0: { const a=3+i%4,b=5+i%3,x=2+i%4,total=(a+b)**x; return mk("BIDMAS",`What is (${a} + ${b})^${x}?`,total,[a+b*x,(a*b)**x,total-a],diff(i),i); }
      case 1: { const a=2+i%3,b=3+i%4,x=2+i%3,total=(a+b)**x; return mk("BIDMAS",`${a}(${b} + ${a})^x = ${a*total}. What is x?`,x,[x+1,x-1,a+b],diff(i),i); }
      case 2: { const h=8+i%5,j=3+i%4; const ans=`${8*h+7*j+1}`; return mk("BIDMAS",`Which expression is equivalent to 12h + 9j - (4h + 2j - 1) when h = ${h} and j = ${j}?`,ans,[`${8*h+7*j-1}`,`${16*h+7*j+1}`,`${8*h+11*j+1}`],diff(i),i); }
      case 3: { const a=45+5*(i%4), b=672, c=85+5*(i%3), d=531, total=a*b+(100-a)*b+c*d+(100-c)*d; return mk("BIDMAS",`Evaluate ${a} × ${b} + ${100-a} × ${b} + ${c} × ${d} + ${100-c} × ${d}.`,total,[a*b+c*d,(a+c)*(b+d),total-1000],diff(i),i); }
      case 4: { const x=2+i%4, total=(2*(3+2))**x; return mk("BIDMAS",`2(3 + 2)^x = ${total}. What is x?`,x,[x+1,x+2,x-1],diff(i),i); }
      default:{ const a=5+i%4,b=6+i%5,c=30+i%4,d=4+i%3,x=((c*d)-b)/a; return mk("BIDMAS",`Solve ${a}x + ${b} = ${c} × ${d}.`,x,[x+1,x-1,c+d],diff(i),i); }
    }
  }

  function genAlgebra(i) {
    switch (i % 6) {
      case 0: { const p=2+i%4, val=p*p+(p+1)**3; return mk("Algebra",`p² + (p + 1)³ = ${val}, where p is a positive integer. What is p?`,p,[p+1,p+2,p-1],diff(i),i); }
      case 1: { const n=24+3*(i%6); return mk("Algebra",`Philip thinks of a number N. 4N < 100, N² > ${n*n-5} and N ÷ 3 is a whole number. What is N - 10?`,n-10,[n-9,n-11,Math.floor(n/3)],diff(i),i); }
      case 2: { const abi=8+i%5, amy=abi+2.5, ava=amy+4.5, total=abi+amy+ava; return mk("Algebra",`Abi, Amy and Ava have £${fmt(total)} between them. Amy has £2.50 more than Abi and Ava has £4.50 more than Amy. How much money does Ava have?`,`£${fmt(ava)}`,[`£${fmt(amy)}`,`£${fmt(abi)}`,`£${fmt(ava+2.5)}`],diff(i),i); }
      case 3: { const n=12+3*(i%5), x=n*25-200; return mk("Algebra",`Harry has N pounds. He spends three-quarters of his money and then £2 more. How much money does he have left in pence when N = ${n}?`,x,[n*25+200,n*100-200,x+100],diff(i),i); }
      case 4: { const c=3+i%4, ans=(30-c*4)/5; return mk("Algebra",`5C + 4x = 30. If C = ${c}, what is x?`,ans,[ans+1,ans-1,c+ans],diff(i),i); }
      default:{ const a=2+i%3,b=3+i%4,x=4+i%5; return mk("Algebra",`If y = ${a}x + ${b} and x = ${x}, what is y?`,a*x+b,[a+b*x,a*x-b,x+b],diff(i),i); }
    }
  }

  function genSequences(i) {
    switch (i % 5) {
      case 0: { const a=2+i%4,b=3+i%5,c=4+i%4; const seq=[a*a+b,a*a+2*b+c,(a+2)*(a+2)+3*b+2*c]; const next=(a+3)*(a+3)+4*b+3*c; return mk("Sequences",`What is the next term in the sequence ${seq[0]}, ${seq[1]}, ${seq[2]}?`,next,[next-2,next+2,seq[2]+b],diff(i),i); }
      case 1: { const a=2+i%4,b=1+i%4,n=8+i%5; return mk("Sequences",`What is term ${n} of the sequence with nth term ${a}n + ${b}?`,a*n+b,[a*(n+1)+b,a*n-b,(a+b)*n],diff(i),i); }
      case 2: { const p=20+i%10, gap=2*p-2; return mk("Sequences",`Pattern 1 has 2 triangles. Pattern 2 has 2 quadrilaterals and 2 triangles. Pattern 3 has 4 quadrilaterals and 2 triangles. How many more quadrilaterals than triangles are there in Pattern ${p}?`,gap,[gap-2,gap+2,2*p],diff(i),i); }
      case 3: { const a=1+i%3,b=2+i%4,n=6+i%4; return mk("Sequences",`The nth term of a sequence is ${a}n² + ${b}. What is term ${n}?`,a*n*n+b,[a*n+b,a*n*n-b,(a+b)*n],diff(i),i); }
      default:{ const arr=[3+i,6+2*i,11+3*i,18+4*i]; const next=arr[3]+(9+i); return mk("Sequences",`What number comes next in the sequence ${arr.join(", ")}?`,next,[next-1,next+1,arr[3]+(8+i)],diff(i),i); }
    }
  }

  function genRatio(i) {
    switch (i % 5) {
      case 0: { const a=2+i%4,b=3+i%4,total=(a+b)*(10+i%5); return mk("Ratio",`£${total} is shared in the ratio ${a}:${b}. What is the larger share?`,total*b/(a+b),[total*a/(a+b),a+b,total/(a+b)],diff(i),i); }
      case 1: { const a=3+i%4,b=5+i%4,d=(b-a)*(4+i%4), total=(a+b)*(4+i%4); return mk("Ratio",`In the ratio ${a}:${b}, the difference between the parts is ${d}. What is the total quantity?`,total,[total-d,total+d,d*(a+b)],diff(i),i); }
      case 2: { const r=2+i%3,g=3+i%4,b=1+i%3; return mk("Ratio",`If red:green = ${r}:${g} and green:blue = ${g}:${b}, what is red:green:blue?`,`${r}:${g}:${b}`,[`${r}:${b}:${g}`,`${g}:${r}:${b}`,`${r+b}:${g}:${b}`],diff(i),i); }
      case 3: { const w=4+i%4,x=5+i%4,y=3+i%4,z=2+i%4; return mk("Ratio",`Shape A has area y(w + z) and Shape B has area wx. What is the ratio of the area of Shape A to Shape B when w=${w}, x=${x}, y=${y}, z=${z}?`,`${y*(w+z)}:${w*x}`,[`${y*(z+w)}:${w*z}`,`${z*(y+w)}:${w*x}`,`${x*z}:${w*x}`],diff(i),i); }
      default:{ const flour=120+20*(i%4), a=2+i%3,b=3+i%3, sugar=flour*b/a; return mk("Ratio",`A recipe uses flour:sugar = ${a}:${b}. How much sugar is needed for ${flour} g of flour?`,`${sugar} g`,[`${flour} g`,`${flour*(a+b)/a} g`,`${sugar+20} g`],diff(i),i); }
    }
  }

  function genSpeed(i) {
    switch (i % 5) {
      case 0: { const run=10+2*(i%4), speed1=12+2*(i%3), walk=5+2*(i%3), speed2=3+i%3, mean=fmt((run+walk)/(run/speed1+walk/speed2)); return mk("Speed",`A runner covers ${run} km at ${speed1} km/h, then ${walk} km at ${speed2} km/h. What is the mean speed over the whole journey?`,`${mean} km/h`,[`${fmt((speed1+speed2)/2)} km/h`,`${fmt((run+walk)/(speed1+speed2))} km/h`,`${fmt(speed1-speed2)} km/h`],diff(i),i); }
      case 1: { const men=4+i%3, days=12+2*(i%4), area=men*days*25, moreMen=men*3, target=area*2, ans=target/(moreMen*25); return mk("Speed",`It takes ${men} men ${days} days to clear ${area} m² of woodland. How many days would ${moreMen} men take to clear ${target} m²?`,ans,[ans/2,ans*2,days],diff(i),i); }
      case 2: { const hoses=2+i%3, hours=2+i%2, target=hoses*hours, newHoses=hoses*2, ans=fmt(target/newHoses); return mk("Speed",`${hoses} hoses fill a pool in ${hours} hours. How long would ${newHoses} such hoses take to fill the same pool?`,`${ans} hours`,[`${fmt(Number(ans)+0.5)} hours`,`${fmt(hours*2)} hours`,`${fmt(hours/newHoses)} hours`],diff(i),i); }
      case 3: { const speed=48+8*(i%4), mins=30+15*(i%2), dist=fmt(speed*mins/60); return mk("Speed",`A car travels at ${speed} km/h for ${mins} minutes. How far does it travel?`,`${dist} km`,[`${fmt(dist/2)} km`,`${fmt(speed+mins)} km`,`${fmt(speed*mins)} km`],diff(i),i); }
      default:{ const d=120+20*(i%5), t=1.5+0.5*(i%3), s=fmt(d/t); return mk("Speed",`A journey of ${d} km takes ${fmt(t)} hours. What is the average speed?`,`${s} km/h`,[`${fmt(d*t)} km/h`,`${fmt(t/d)} km/h`,`${fmt(s-10)} km/h`],diff(i),i); }
    }
  }

  function genMeasurement(i) {
    switch (i % 5) {
      case 0: { const big=10+2*(i%4), small=2+i%3, ans=(big/small)**2; return mk("Measurement",`An equilateral triangle has side length ${big} cm. What is the maximum number of equilateral triangles of side ${small} cm that can fit inside it with no overlap?`,ans,[ans-2,ans+2,big/small],diff(i),i); }
      case 1: { const x=6+i%4,y=3+i%3,z=2+i%3, a=x*y,b=x*z,c=y*z, vol=x*y*z; return mk("Measurement",`A cuboid has face areas ${a} cm², ${b} cm² and ${c} cm². What is its volume?`,vol,[a+b+c,a*b,vol+6],diff(i),i); }
      case 2: { const side=3+i%4, x1=-3,y1=-4; const x2=x1+side,y2=y1+side; return mk("Measurement",`A cube is placed on a grid. The base vertices are (${x1}, ${y1}), (${x1}, ${y2}), (${x2}, ${y2}) and (${x2}, ${y1}). What is the volume of the cube?`,side**3,[side**2,side*6,(side+1)**3],diff(i),i); }
      case 3: { const d1=10+2*(i%3), d2=d1-2, d3=d2-2, ans=d1+d2/2+d3/2; return mk("Measurement",`Three circles have diameters ${d1} cm, ${d2} cm and ${d3} cm. Each circle touches the centre of the next. What is the total length of the combined shape in a straight line?`,`${ans} cm`,[`${d1+d2+d3} cm`,`${d1+d2} cm`,`${ans-1} cm`],diff(i),i); }
      default:{ const side=2+i%3, length=8+2*(i%4), sa=2*side*side+4*side*length, vol=side*side*length; return mk("Measurement",`A cuboid has square ends of side ${side} cm and total surface area ${sa} cm². What is its volume?`,`${vol} cm³`,[`${sa} cm³`,`${vol+side*side} cm³`,`${side*length} cm³`],diff(i),i); }
    }
  }

  function genGeometry(i) {
    switch (i % 5) {
      case 0: { const x=2+i%4,y=-(1+i%3), ans=`(${y}, ${-x})`; return mk("Geometry",`The point (${x}, ${y}) is reflected in the line y = x and then reflected in the y-axis. What are the new coordinates?`,ans,[`(${y}, ${x})`,`(${x}, ${-y})`,`(${-y}, ${-x})`],diff(i),i); }
      case 1: { const m=2+i%3,c=1+i%4; return mk("Geometry",`Which pair of lines is perpendicular?`,`y = ${m}x + ${c} and y = ${fmt(-1/m)}x`,[`y = ${m}x and y = ${m}x - 1`,`y = ${m} and x = ${c}`,`y = ${m}x and y = ${m+1}x`],diff(i),i); }
      case 2: { const h=3+i%4, area=2*h*h; return mk("Geometry",`A triangle is formed by the lines y = x, y = -x and y = ${2*h}. What is its area?`,`${area} cm²`,[`${area/2} cm²`,`${area+4} cm²`,`${4*h} cm²`],diff(i),i); }
      case 3: { const x=40+5*(i%4); const y=180-2*x; return mk("Geometry",`An isosceles trapezium has one angle of ${x}°. What is the angle adjacent to it on the same leg?`,`${180-x}°`,[`${x}°`,`${y}°`,`${90-x/2}°`],diff(i),i); }
      default:{ const line=10+i%4,width=4+i%4,height=2*width; return mk("Geometry",`A kite has line of symmetry x = ${line} and width ${width}. If its height is twice the width and the lowest point is ${height/2} units below the centre, what could be the coordinates of the top vertex?`,`(${line}, ${height})`,[`(${line+width/2}, ${height})`,`(${line}, ${width})`,`(${line}, ${height-width})`],diff(i),i); }
    }
  }

  function genStatistics(i) {
    switch (i % 5) {
      case 0: { const arr=[4+i,5+i,6+i,6+i,7+i,8+i,8+i,9+i,10+i]; return mk("Statistics",`What is the median of the data set ${arr.join(", ")}?`,arr[4],[arr[3],arr[5],Math.round((arr[3]+arr[5])/2)],diff(i),i); }
      case 1: { const mode=5+i%5; const arr=[mode-1,mode,mode,mode+1,mode+2,mode]; return mk("Statistics",`What is the modal number in the set ${arr.join(", ")}?`,mode,[mode-1,mode+1,mode+2],diff(i),i); }
      case 2: { const mean=36+i%6, mode=35+i%3, largest=mean*3-2*mode; return mk("Statistics",`Three positive numbers have a mean of ${mean} and a mode of ${mode}. What is the largest of the three numbers?`,largest,[largest-1,largest+1,mean],diff(i),i); }
      case 3: { const a=2+i%4,b=4+i%4,c=6+i%4,fa=3+i%3,fb=4+i%3,fc=5+i%3,total=fa+fb+fc, ans=fmt((a*fa+b*fb+c*fc)/total); return mk("Statistics",`Estimate the mean from the frequency table: ${a} (${fa}), ${b} (${fb}), ${c} (${fc}).`,ans,[fmt((a+b+c)/3),fmt(total/(a+b+c)),fmt(a*fa+b*fb+c*fc)],diff(i),i); }
      default:{ const low=120+10*(i%5), high=420+20*(i%4); return mk("Statistics",`A chart shows the nearest shop for a class. If the minimum distance is ${low} m and the maximum distance is ${high} m, what is the range?`,`${high-low} m`,[`${high+low} m`,`${high/low} m`,`${low-high} m`],diff(i),i); }
    }
  }

  function genProbability(i) {
    switch (i % 5) {
      case 0: { const total=26+2*(i%4), piano=14+i%4, flute=10+i%4, neither=6+i%3, both=piano+flute-(total-neither); return mk("Probability",`In a group of ${total} children, ${piano} play the piano, ${flute} play the flute and ${neither} play neither. How many play both instruments?`,both,[both-1,both+1,total-neither],diff(i),i); }
      case 1: { const total=30, girls=12+i%4, boys=total-girls, black=14+i%4, girlsBrown=8+i%3, boysBrown=boys-(black-(girls-girlsBrown)); return mk("Probability",`There are ${total} children. ${black} wear black shoes. ${girlsBrown} girls wear brown shoes and there are ${boys-girls} more boys than girls. How many boys wear brown shoes?`,boysBrown,[boysBrown-1,boysBrown+1,boys-girlsBrown],diff(i),i); }
      case 2: { const total=56+4*(i%3), men=(total+6)/2, women=total-men, pass=Math.round(total*0.75), menFail=8, womenPass=pass-(men-menFail); return mk("Probability",`${total} people take a test. There are 6 more men than women. 75% pass, and ${menFail} men fail. How many women pass?`,womenPass,[womenPass-2,womenPass+2,pass-menFail],diff(i),i); }
      case 3: { const red=3+i%4, blue=5+i%4, ans=simp(red*blue,(red+blue)*(red+blue-1)); return mk("Probability",`A bag has ${red} red and ${blue} blue counters. Two are drawn without replacement. What is the probability of red then blue?`,ans,[simp(red,red+blue),simp(blue,red+blue),simp(red*blue,(red+blue)*(red+blue))],diff(i),i); }
      default:{ const a=1/(2+i%3), b=1/(3+i%3), x=fmt(a+b-a*b); return mk("Probability",`Two independent events have probabilities ${simp(1,2+i%3)} and ${simp(1,3+i%3)}. What is the probability that at least one occurs?`,x,[fmt(a*b),fmt(a+b),fmt(1-a-b)],diff(i),i); }
    }
  }

  function genLogic(i) {
    switch (i % 5) {
      case 0: { const start=new Date(Date.UTC(2024,0,1+(i%7),5,0,0)), later=new Date(start.getTime()+1000000*1000); return mk("Logic",`If it is 05:00 on ${dayNames[start.getUTCDay()]} now, on what day of the week will it be in exactly 1,000,000 seconds?`,dayNames[later.getUTCDay()],[dayNames[(later.getUTCDay()+1)%7],dayNames[(later.getUTCDay()+6)%7],dayNames[start.getUTCDay()]],diff(i),i); }
      case 1: { const hour=1+i%10, minute=hour<10? hour : Math.floor(hour/10)+hour%10*10, now=`${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}`; let h=hour,m=minute; do { m++; if(m===60){m=0;h=(h+1)%24;} } while(`${String(h).padStart(2,"0")}${String(m).padStart(2,"0")}` !== `${String(m).padStart(2,"0")}${String(h).padStart(2,"0")}`); const diffMin=((h-hour+24)%24)*60+(m-minute); return mk("Logic",`The time is ${now}. How long is it until the next palindrome time?`,`${Math.floor(diffMin/60)} hour(s) and ${diffMin%60} minutes`,[`${Math.floor((diffMin+10)/60)} hour(s) and ${(diffMin+10)%60} minutes`,`15 minutes`,`${Math.floor(diffMin/30)} hour(s)`],diff(i),i); }
      case 2: { const year=2015+i%3, date=1+i%20, start=new Date(Date.UTC(year,9,date)); start.setUTCDate(start.getUTCDate()+((1-start.getUTCDay()+7)%7)); let y=year+1; while(true){ const d=new Date(Date.UTC(y,9,start.getUTCDate())); if(d.getUTCDay()===1) break; y++; } return mk("Logic",`A birthday was on a Monday in October ${year}. In what year will it next fall on a Monday?`,y,[y+1,y-1,y+2],diff(i),i); }
      case 3: { const turns={"north":"southeast","east":"southwest"}; const ans=135; return mk("Logic",`I am facing north. What is the fewest degrees I must turn to face southeast?`,`${ans}°`,[`90°`,`125°`,`225°`],diff(i),i); }
      default:{ const start=new Date(Date.UTC(2024,6,10+(i%5),8,0,0)), hours=870+24*(i%3), later=new Date(start.getTime()+hours*3600*1000); const ans=`${later.getUTCDate()} ${later.toLocaleString('en-US',{month:'long',timeZone:'UTC'})} at ${String(later.getUTCHours()).padStart(2,'0')}:00`; return mk("Logic",`If it is 08:00 on ${start.getUTCDate()} July and someone is leaving in exactly ${hours} hours, when are they leaving?`,ans,[`${later.getUTCDate()+1} ${later.toLocaleString('en-US',{month:'long',timeZone:'UTC'})} at ${String(later.getUTCHours()).padStart(2,'0')}:00`,`${later.getUTCDate()} July at 12:00`,`${later.getUTCDate()} August at 08:00`],diff(i),i); }
    }
  }

  const gens = { Numbers:genNumbers, Decimals:genDecimals, Fractions:genFractions, Percentages:genPercentages, BIDMAS:genBIDMAS, Algebra:genAlgebra, Sequences:genSequences, Ratio:genRatio, Speed:genSpeed, Measurement:genMeasurement, Geometry:genGeometry, Statistics:genStatistics, Probability:genProbability, Logic:genLogic };
  const extras = [];
  topics.forEach((topic, idx) => { for (let i = 0; i < counts[idx]; i++) extras.push(gens[topic](i)); });
  QUESTIONS.push(...extras);
  console.log(`Loaded ${extras.length} QE-style questions. Total now: ${QUESTIONS.length}`);
})();