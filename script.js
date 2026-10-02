const questionSets = {
  "Overthinking": [
    "How often do you replay conversations or situations in your head?",
    "When you are uncertain, do you keep looking for more reassurance or information?",
    "Does overthinking make it harder to sleep, focus or make decisions?"
  ],
  "Boundaries": [
    "Do you often say yes when you actually want to say no?",
    "Do you feel guilty when you put your own needs first?",
    "Is it difficult for you to tell someone when their behaviour crosses a line?"
  ],
  "Confidence": [
    "Do you often compare your progress with other people?",
    "Do you avoid opportunities because you worry you won't be good enough?",
    "Do you discount your successes or focus mainly on mistakes?"
  ],
  "Relationship Patterns": [
    "During conflict, do you tend to withdraw, chase reassurance or avoid the conversation?",
    "Do you notice similar problems repeating across different relationships?",
    "Is it difficult to clearly express what you need from someone?"
  ]
};

function openAssessment(type){
  const modal=document.getElementById('modal');
  document.getElementById('modalTitle').textContent=type;
  document.getElementById('result').style.display='none';
  document.getElementById('result').innerHTML='';
  const box=document.getElementById('questions');
  box.innerHTML='';
  questionSets[type].forEach((q,i)=>{
    box.innerHTML += `<div class="question"><p>${i+1}. ${q}</p><div class="options">
      ${['Rarely','Sometimes','Often','Very often'].map((x,j)=>`<label><input type="radio" name="q${i}" value="${j+1}">${x}</label>`).join('')}
    </div></div>`;
  });
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
}
function closeAssessment(){document.getElementById('modal').classList.remove('open')}
function finishAssessment(){
  const checked=[...document.querySelectorAll('#questions input:checked')];
  if(checked.length<3){showToast('Please answer all three questions first.');return}
  const score=checked.reduce((a,b)=>a+Number(b.value),0);
  let text;
  if(score<=5) text="Your answers suggest this may not be a major concern right now. Keep noticing what works for you and return whenever you want to reflect.";
  else if(score<=8) text="You may be noticing this pattern from time to time. A small, consistent change could be a useful place to start.";
  else text="This pattern appears to show up fairly often for you. Consider choosing one small situation to observe this week rather than trying to change everything at once.";
  const result=document.getElementById('result');
  result.innerHTML=`<strong>Your reflection</strong><br><br>${text}<br><br><small>This is a self-reflection prompt, not a psychological diagnosis.</small>`;
  result.style.display='block';
}
function subscribe(e){
  e.preventDefault();
  const email=document.getElementById('email').value;
  if(email){showToast('You’re on the Innerly list ✦');e.target.reset();}
}
function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.style.display='block';
  clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.style.display='none',3000);
}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeAssessment()});
document.querySelector('.menu').addEventListener('click',()=>{const n=document.querySelector('nav');n.style.display=n.style.display==='flex'?'none':'flex';n.style.position='absolute';n.style.top='82px';n.style.left='0';n.style.right='0';n.style.padding='20px 7vw';n.style.background='var(--cream)';n.style.flexDirection='column';});
