'use strict';
(() => {
 const $=id=>document.getElementById(id), key='cet6-sentence-progress-v1';
 let questions=[],index=0,mode='phrase',done=new Set(),tiles=[],order=[],selected=[],revealed=false;
 const normalize=s=>s.trim().replace(/\s+/g,' ');
 function save(){try{localStorage.setItem(key,JSON.stringify({current:index,completed:[...done]}));}catch{}}
 function restore(){try{const s=JSON.parse(localStorage.getItem(key));if(s && Number.isInteger(s.current) && s.current>=0 && s.current<questions.length)index=s.current;if(Array.isArray(s?.completed))done=new Set(s.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=questions.length));}catch{}}
 function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(a.length>1&&a.every((v,i)=>v===i))a.push(a.shift());return a;}
 function progress(){ $('counter').textContent=`第 ${index+1} / ${questions.length} 题`;$('completed').textContent=`已完成 ${done.size} / ${questions.length}`;$('progress').value=done.size;$('progress').max=questions.length;save();}
 function feedback(text,kind=''){ $('feedback').textContent=text;$('feedback').className='feedback '+kind;}
 function renderTiles(){
  $('answer').replaceChildren();$('bank').replaceChildren();
  if(!selected.length){const p=document.createElement('span');p.className='placeholder';p.textContent='点击下方词块，在这里组成英文句子';$('answer').append(p);}
  function tile(id,inAnswer){const b=document.createElement('button');b.type='button';b.className='tile';b.lang='en';b.textContent=tiles[id];b.dataset.id=id;b.setAttribute('aria-label',(inAnswer?'撤回 ':'选择 ')+tiles[id]);b.disabled=!inAnswer&&selected.includes(id);b.onclick=()=>{if(inAnswer)selected=selected.filter(x=>x!==id);else selected.push(id);feedback('');renderTiles();};return b;}
  selected.forEach(id=>$('answer').append(tile(id,true)));order.forEach(id=>$('bank').append(tile(id,false)));$('selectionCount').textContent=`${selected.length} / ${tiles.length} 个词块`;
 }
 function load(){const q=questions[index];selected=[];revealed=false;tiles=mode==='phrase'?q.phrases:q.english.split(/\s+/);order=shuffle(tiles.map((_,i)=>i));$('chinese').textContent=q.chinese;$('topic').textContent=q.source;$('length').textContent=`${tiles.length} 个词块`;$('hint').hidden=true;$('explanation').hidden=true;$('explanation').querySelector('details').open=false;$('next').textContent=index===questions.length-1?'回到第一题 ↺':'下一题 →';feedback('');progress();renderTiles();}
 function explain(){const q=questions[index];$('explanation').hidden=false;$('reference').textContent=q.english;$('brief').textContent=q.rule;const d=$('detail');d.replaceChildren();for(const [label,text] of [['原文解析主题',q.title],['句子主干',q.backbone],['英文骨架',q.skeleton],['修饰成分',q.modifiers],['逐步还原',q.steps],['语序规律',q.rule],['原文复核说明',q.reviewNote]]){if(!text)continue;const h=document.createElement('h2'),p=document.createElement('p');h.textContent=label;p.textContent=text;if(label==='原文复核说明')p.className='review-note';d.append(h,p);}}
 $('hintButton').onclick=()=>{ $('hint').textContent='语序提示：'+questions[index].rule;$('hint').hidden=!$('hint').hidden;};
 $('reset').onclick=load;
 $('check').onclick=()=>{const q=questions[index];if(selected.length!==tiles.length){feedback(`还差 ${tiles.length-selected.length} 个词块，请把句子补完整。`,'error');return;}if(normalize(selected.map(i=>tiles[i]).join(' '))===normalize(q.english)){if(!revealed)done.add(q.id);progress();feedback(revealed?'顺序正确！本次已查看答案，可重置后独立完成。':'拼对了！看看这句话的语序规律。','success');$('resultLabel').textContent='完整参考译文';explain();}else{feedback('还没与参考语序一致。先找主干，再调整修饰语的位置，继续试试。','error');}};
 $('reveal').onclick=()=>{revealed=true;$('resultLabel').textContent='参考答案 · 本次不计入完成';feedback('已展示参考答案。重置后可重新独立作答。');explain();};
 $('next').onclick=()=>{index=(index+1)%questions.length;load();window.scrollTo({top:0,behavior:'auto'});};
 for(const [id,value] of [['phraseMode','phrase'],['wordMode','word']])$(id).onclick=()=>{if(mode===value)return;mode=value;$('phraseMode').setAttribute('aria-pressed',String(mode==='phrase'));$('wordMode').setAttribute('aria-pressed',String(mode==='word'));load();};
 fetch('questions.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json();}).then(data=>{if(!Array.isArray(data)||data.length!==16||data.some(q=>q.phrases.join(' ')!==q.english))throw Error('题库校验失败');questions=data;restore();load();}).catch(()=>{$('counter').textContent='题库载入失败';$('chinese').textContent='请通过本地 HTTP 服务打开网页，并确认 questions.json 与 index.html 位于同一文件夹。';document.querySelectorAll('button').forEach(b=>b.disabled=true);});
})();

