/* Extra harder question bank: adds 1000 generated questions (hard + super hard, Q711–Q1710) */
(() => {
  if (typeof QUESTIONS === "undefined") return;
  const topics = ["Numbers","Decimals","Fractions","Percentages","BIDMAS","Algebra","Sequences","Ratio","Speed","Measurement","Geometry","Statistics","Probability","Logic"];
  const counts = [72,72,72,72,72,72,71,71,71,71,71,71,71,71];
  let id = 711;
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
    switch (i % 5) {
      case 0: { const days=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],s=i%7,n=85+i,x=days[(s+n)%7]; return mk("Logic",`${days[s]} is today. What day will it be in ${n} days?`,x,days.filter(d=>d!==x).slice(0,3),diff(i),i); }
      case 1: { const mid=20+i%15,sum=5*mid; return mk("Logic",`Five consecutive integers add up to ${sum}. What is the middle integer?`,mid,[mid-1,mid+1,sum/5+1],diff(i),i); }
      case 2: { const h=(1+i)%12||12,m=30,x=Math.abs(30*h-5.5*m); return mk("Logic",`What is the smaller angle between the hands of a clock at ${h}:30?`,fmt(x),[fmt(360-x),fmt(30*h),fmt(5.5*m)],diff(i),i); }
      case 3: { const p=5+i%8,x=p*(p-1)/2; return mk("Logic",`If ${p} people each shake hands once with every other person, how many handshakes are there?`,x,[p*(p-1),p+p-1,x+p],diff(i),i); }
      default:{ const base=121+i%30,x=Number(`${base}`.split("").reverse().join(""))+base; return mk("Logic",`A number is added to its reverse. If the number is ${base}, what is the total?`,x,[x-9,x+9,Number(`${base}`.split("").reverse().join(""))],diff(i),i); }
    }
  }

  const gens = { Numbers:genNumbers, Decimals:genDecimals, Fractions:genFractions, Percentages:genPercentages, BIDMAS:genBIDMAS, Algebra:genAlgebra, Sequences:genSequences, Ratio:genRatio, Speed:genSpeed, Measurement:genMeasurement, Geometry:genGeometry, Statistics:genStatistics, Probability:genProbability, Logic:genLogic };
  const extras = [];
  topics.forEach((topic, idx) => { for (let i = 0; i < counts[idx]; i++) extras.push(gens[topic](i)); });
  QUESTIONS.push(...extras);
  console.log(`Loaded ${extras.length} extra harder questions. Total now: ${QUESTIONS.length}`);
})();
