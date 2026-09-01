# The shared client-side gate injected into every brand-preview page.
# Not real security -- consistent with the Drafting Room / proposals pattern
# already used across this project: the unlisted subdomain is the real
# boundary, the password is friction. sessionStorage means each visitor
# re-enters it once per browser session, per subdomain (separate origins).

NOINDEX = '<meta name="robots" content="noindex,nofollow,noarchive">'

GATE_SNIPPET = '''<script>(function(){
var KEY='pp_gate_ok';
try{if(sessionStorage.getItem(KEY)==='1')return;}catch(e){}
var ov=document.createElement('div');
ov.id='ppgate';
ov.innerHTML='<div class="ppgate__panel"><p class="ppgate__eyebrow">Paris Pullen &#8212; Private Preview</p><h1>This is a client build in progress.</h1><form id="ppgateform" autocomplete="off"><input id="ppgateinput" type="password" autocomplete="new-password" placeholder="Password" aria-label="Password"><button type="submit">Enter</button></form><p class="ppgate__err" id="ppgateerr" hidden>Incorrect password.</p></div>';
var css=document.createElement('style');
css.textContent='#ppgate{position:fixed;inset:0;z-index:2147483647;background:#0A0A0B;color:#EDE7DA;display:flex;align-items:center;justify-content:center;padding:1.5rem}'+
'.ppgate__panel{max-width:380px;width:100%;text-align:center;padding:2.5rem 2rem;border:1px solid rgba(201,169,97,.35);font-family:Georgia,\\'Times New Roman\\',serif}'+
'.ppgate__eyebrow{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.68rem;letter-spacing:.22em;text-transform:uppercase;color:#C9A961;margin:0 0 1rem}'+
'#ppgate h1{font-size:1.4rem;font-weight:400;line-height:1.3;margin:0 0 1.75rem;color:#EDE7DA}'+
'#ppgateform{display:flex;gap:.5rem}'+
'#ppgateinput{flex:1;min-width:0;background:transparent;border:1px solid rgba(237,231,218,.28);color:#EDE7DA;padding:.75em .9em;font-size:1rem;font-family:ui-monospace,Menlo,Consolas,monospace;border-radius:0}'+
'#ppgateinput:focus{outline:none;border-color:#C9A961}'+
'#ppgateform button{background:#C9A961;color:#0A0A0B;border:0;padding:.75em 1.2em;font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;font-family:ui-monospace,Menlo,Consolas,monospace}'+
'#ppgateform button:hover{background:#EDE7DA}'+
'.ppgate__err{color:#C0555A;font-size:.78rem;margin-top:1rem;font-family:ui-monospace,Menlo,Consolas,monospace;letter-spacing:.04em}';
document.head.appendChild(css);
document.body.appendChild(ov);
var prevOverflow=document.documentElement.style.overflow;
document.documentElement.style.overflow='hidden';
document.getElementById('ppgateform').addEventListener('submit',function(e){
e.preventDefault();
var v=document.getElementById('ppgateinput').value.trim().toLowerCase();
if(v==='legend'){
try{sessionStorage.setItem(KEY,'1');}catch(e){}
ov.remove();
document.documentElement.style.overflow=prevOverflow;
}else{
document.getElementById('ppgateerr').hidden=false;
document.getElementById('ppgateinput').value='';
document.getElementById('ppgateinput').focus();
}
});
setTimeout(function(){var i=document.getElementById('ppgateinput');if(i)i.focus();},50);
})();</script>'''
