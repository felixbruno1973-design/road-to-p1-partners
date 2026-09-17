(()=>{'use strict';
const s=document.createElement('style');
s.textContent=`
#view-research .r2{display:block!important}
#view-research .r2>.panel:first-child{margin-bottom:14px}
#view-research .r2>div:nth-child(2){min-width:0;width:100%}
#view-research .r2f{grid-template-columns:repeat(3,minmax(0,1fr))!important;align-items:end}
#view-research .r2f>.field:nth-child(7),#view-research .r2f>.r2note,#view-research .r2f>div[style*="display:flex"]{grid-column:1/-1}
#view-research .r2f textarea{min-height:58px!important}
#view-research .r2tabs{flex-wrap:wrap!important;overflow-x:visible!important;padding-bottom:4px!important}
#view-research .r2tab{white-space:normal!important;text-align:left!important;max-width:280px}
#view-research .r2tools{grid-template-columns:minmax(180px,1fr) minmax(150px,190px) minmax(150px,190px) auto!important}
#view-research .panel-body{overflow-x:hidden}
#view-research .r2list{height:min(55vh,620px)!important;min-height:360px!important;overflow-y:auto!important;overflow-x:hidden!important;padding-right:6px;scrollbar-gutter:stable}
#view-research .r2row{grid-template-columns:minmax(165px,.85fr) minmax(250px,1.7fr) 82px 125px 96px!important;width:100%!important;box-sizing:border-box!important}
@media(max-width:1050px){#view-research .r2f{grid-template-columns:repeat(2,minmax(0,1fr))!important}#view-research .r2row{grid-template-columns:minmax(150px,.8fr) minmax(220px,1.5fr) 75px 115px 90px!important}}
@media(max-width:760px){#view-research .r2f,#view-research .r2tools,#view-research .r2row{grid-template-columns:1fr!important}#view-research .r2f>*{grid-column:1!important}}
`;
document.head.appendChild(s);
})();
