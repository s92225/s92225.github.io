import { getObjectSpec } from './object-catalog.js';

const art = {
  bear: `
    <circle cx="27" cy="28" r="13" fill="#ff9bb7" stroke="#b75c83" stroke-width="3"/>
    <circle cx="73" cy="28" r="13" fill="#ff9bb7" stroke="#b75c83" stroke-width="3"/>
    <rect x="18" y="22" width="64" height="66" rx="28" fill="#ffb8ca" stroke="#b75c83" stroke-width="3"/>
    <circle cx="39" cy="50" r="4" fill="#3e2947"/><circle cx="61" cy="50" r="4" fill="#3e2947"/>
    <ellipse cx="50" cy="66" rx="15" ry="11" fill="#ffe7e4"/><path d="M45 64q5 6 10 0" fill="none" stroke="#78455f" stroke-width="3" stroke-linecap="round"/>
    <path d="M31 76l-8 12m46-12 8 12" stroke="#b75c83" stroke-width="6" stroke-linecap="round"/>
    <path d="M50 79l5 7 9 1-7 6 2 9-9-5-9 5 2-9-7-6 9-1z" fill="#ffd65c" stroke="#d59a28" stroke-width="2"/>
  `,
  penguin: `
    <ellipse cx="50" cy="53" rx="31" ry="39" fill="#64caba" stroke="#2f8e82" stroke-width="3"/>
    <path d="M23 47 9 61l14 7M77 47l14 14-14 7" fill="#4cb2a4" stroke="#2f8e82" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="50" cy="61" rx="22" ry="27" fill="#effffb"/>
    <circle cx="40" cy="41" r="4" fill="#263744"/><circle cx="60" cy="41" r="4" fill="#263744"/>
    <path d="M44 50h12l-6 8z" fill="#ffbd57" stroke="#d98937" stroke-width="2" stroke-linejoin="round"/>
    <path d="M32 91h14m8 0h14" stroke="#d98937" stroke-width="5" stroke-linecap="round"/>
  `,
  candy: `
    <path d="M50 12l10 23 25 3-19 17 6 25-22-13-22 13 6-25-19-17 25-3z" fill="#ffd761" stroke="#dc9d28" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="39" cy="47" r="4" fill="#7d5921"/><circle cx="61" cy="47" r="4" fill="#7d5921"/>
    <path d="M41 57q9 8 18 0" fill="none" stroke="#7d5921" stroke-width="3" stroke-linecap="round"/>
    <path d="M26 26l-12-9m60 9 12-9M20 73 9 84m71-11 11 11" stroke="#ff9ab5" stroke-width="5" stroke-linecap="round"/>
  `,
  bigbox: `
    <rect x="16" y="34" width="68" height="54" rx="8" fill="#ffb6cc" stroke="#c45b87" stroke-width="3"/>
    <path d="M12 30h76v19H12z" fill="#ffcfdd" stroke="#c45b87" stroke-width="3" stroke-linejoin="round"/>
    <path d="M43 30v58m14-58v58" stroke="#8c58cf" stroke-width="8"/>
    <path d="M50 30C31 28 27 13 38 13c9 0 12 9 12 17Zm0 0c19-2 23-17 12-17-9 0-12 9-12 17Z" fill="#a87be4" stroke="#7043ad" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="50" cy="30" r="7" fill="#ffd65c"/>
  `,
  wand: `
    <g transform="rotate(-26 50 52)">
      <rect x="41" y="27" width="18" height="64" rx="9" fill="#fff" stroke="#7043ad" stroke-width="3"/>
      <path d="M43 35h14v11H43zm0 18h14v11H43zm0 18h14v11H43z" fill="#ff8dac"/>
      <path d="M43 44h14v11H43zm0 18h14v11H43zm0 18h14v9H43z" fill="#62cfbd"/>
      <path d="M50 4l6 13 14 2-10 10 2 14-12-7-12 7 2-14-10-10 14-2z" fill="#ffd75e" stroke="#d39724" stroke-width="3" stroke-linejoin="round"/>
    </g>
  `,
  jelly: `
    <g transform="rotate(-18 50 50)">
      <rect x="23" y="11" width="54" height="78" rx="27" fill="#8de6d8" stroke="#3b9c90" stroke-width="4"/>
      <path d="M23 50h54v12H23z" fill="#fff7ff" opacity=".92"/>
      <path d="M27 47h46" stroke="#3b9c90" stroke-width="3"/>
      <circle cx="40" cy="35" r="4" fill="#31575b"/><circle cx="60" cy="35" r="4" fill="#31575b"/>
      <path d="M42 43q8 6 16 0" fill="none" stroke="#31575b" stroke-width="3" stroke-linecap="round"/>
      <path d="M34 20c8-6 17-5 23-2" stroke="#d9fff8" stroke-width="6" stroke-linecap="round" opacity=".85"/>
    </g>
  `,
  tissue: `
    <path d="M18 39q0-9 9-10h46q9 1 9 10l4 40q1 10-10 10H24Q13 89 14 79z" fill="#ffc9d7" stroke="#bd6287" stroke-width="3"/>
    <rect x="19" y="43" width="62" height="35" rx="9" fill="#fff0f4"/>
    <rect x="30" y="53" width="40" height="17" rx="8" fill="#a8e7dc"/>
    <path d="M34 33c2-16 15-26 31-23-1 12-9 23-22 28z" fill="#fff" stroke="#d9cbe7" stroke-width="3" stroke-linejoin="round"/>
    <path d="M38 51h24" stroke="#bd6287" stroke-width="3" stroke-linecap="round"/>
  `,
  phone: `
    <g transform="rotate(8 50 50)">
      <rect x="27" y="7" width="46" height="86" rx="12" fill="#7650bd" stroke="#4c2f82" stroke-width="3"/>
      <rect x="31" y="11" width="38" height="72" rx="8" fill="#def8f2"/>
      <circle cx="39" cy="20" r="4" fill="#ff93b0"/><circle cx="49" cy="20" r="4" fill="#ffe072"/><circle cx="39" cy="30" r="4" fill="#62cabb"/>
      <path d="M38 63c8-17 21-20 27-8-4 15-17 21-27 8Z" fill="#f8bed0"/>
      <path d="M43 88h14" stroke="#f6eaff" stroke-width="3" stroke-linecap="round"/>
    </g>
  `,
  mouse: `
    <path d="M23 58c0-28 12-46 27-46s27 18 27 46v8c0 16-11 25-27 25S23 82 23 66Z" fill="#93ddd2" stroke="#348f85" stroke-width="4"/>
    <path d="M50 13v32M24 45h52" fill="none" stroke="#348f85" stroke-width="3"/>
    <rect x="46" y="25" width="8" height="14" rx="4" fill="#7548be"/>
    <path d="M32 64c5 12 31 16 38 0" fill="none" stroke="#c8fff5" stroke-width="5" stroke-linecap="round" opacity=".85"/>
  `,
  bottle: `
    <path d="M41 9h18v15c0 5 3 8 8 13 7 7 9 13 9 22v22c0 8-6 12-14 12H38c-8 0-14-4-14-12V59c0-9 2-15 9-22 5-5 8-8 8-13Z" fill="#9be8dc" fill-opacity=".78" stroke="#32978a" stroke-width="4"/>
    <path d="M39 8h22v13H39z" fill="#7750bd" stroke="#4f3389" stroke-width="3"/>
    <path d="M25 59h50v21H25z" fill="#ffd2df" stroke="#c7668a" stroke-width="3"/>
    <path d="M34 34c4-5 8-7 11-8" stroke="#e8fffb" stroke-width="5" stroke-linecap="round"/>
    <path d="M43 69h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  `,
  mug: `
    <ellipse cx="48" cy="87" rx="35" ry="7" fill="#d8c8ec" opacity=".65"/>
    <path d="M20 31h55v38c0 13-9 20-26 20S20 82 20 69Z" fill="#ffc6d8" stroke="#b65d82" stroke-width="4"/>
    <path d="M74 41h6c14 0 14 25 0 25h-6" fill="none" stroke="#b65d82" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="47" cy="31" rx="27" ry="8" fill="#fff1f4" stroke="#b65d82" stroke-width="3"/><ellipse cx="47" cy="31" rx="20" ry="5" fill="#91664e"/>
    <path d="M38 56c7-9 18-7 19 1 0 8-10 13-10 13S36 64 38 56Z" fill="#fff7dc"/>
    <path d="M38 18q-7-8 1-14m17 14q7-8-1-14" fill="none" stroke="#72cabb" stroke-width="4" stroke-linecap="round"/>
  `,
  remote: `
    <g transform="rotate(-10 50 50)">
      <rect x="29" y="7" width="42" height="86" rx="17" fill="#c7b1ee" stroke="#6d48ac" stroke-width="4"/>
      <rect x="36" y="15" width="28" height="15" rx="6" fill="#f7efff"/><circle cx="50" cy="23" r="5" fill="#f1749c"/>
      <circle cx="50" cy="47" r="12" fill="#fff" stroke="#8060bd" stroke-width="3"/><path d="M50 38v18M41 47h18" stroke="#8060bd" stroke-width="4" stroke-linecap="round"/>
      <circle cx="40" cy="69" r="5" fill="#67cdbd"/><circle cx="60" cy="69" r="5" fill="#ffd663"/><rect x="39" y="79" width="22" height="7" rx="3.5" fill="#f29aba"/>
    </g>
  `,
  keys: `
    <circle cx="37" cy="31" r="17" fill="#bcefe5" stroke="#3a9b8f" stroke-width="5"/><circle cx="37" cy="31" r="7" fill="#fff"/>
    <path d="M48 43 80 75l-9 9-8-8-6 6-9-9 6-6-15-15Z" fill="#ffd45b" stroke="#c58b24" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="68" cy="30" r="12" fill="#ffd5e1" stroke="#b96083" stroke-width="4"/><circle cx="68" cy="30" r="4" fill="#fff"/>
    <path d="M68 42v35h10v10H64V42" fill="#b79ae5" stroke="#6f49ad" stroke-width="4" stroke-linejoin="round"/>
    <path d="M21 18l-7-7m71 14 6-5" stroke="#ff8fad" stroke-width="4" stroke-linecap="round"/>
  `,
  glasses: `
    <path d="M12 39 4 32m84 7 8-7" stroke="#7448b4" stroke-width="5" stroke-linecap="round"/>
    <rect x="10" y="34" width="35" height="31" rx="14" fill="#c9f3ec" fill-opacity=".72" stroke="#7448b4" stroke-width="5"/>
    <rect x="55" y="34" width="35" height="31" rx="14" fill="#ffdbe7" fill-opacity=".72" stroke="#7448b4" stroke-width="5"/>
    <path d="M45 43q5-6 10 0M19 45l10-6m36 6 10-6" fill="none" stroke="#7448b4" stroke-width="4" stroke-linecap="round"/>
    <path d="M28 74q22 18 44 0" fill="none" stroke="#ef82a5" stroke-width="5" stroke-linecap="round"/>
    <circle cx="30" cy="50" r="3" fill="#fff"/><circle cx="67" cy="47" r="3" fill="#fff"/>
  `,
  notebook: `
    <rect x="22" y="10" width="62" height="82" rx="10" fill="#ffd5e2" stroke="#b85c83" stroke-width="4"/>
    <path d="M34 10v82" stroke="#7650bd" stroke-width="8"/><path d="M19 24h20m-20 18h20m-20 18h20m-20 18h20" stroke="#efe7ff" stroke-width="5" stroke-linecap="round"/>
    <rect x="45" y="24" width="29" height="38" rx="8" fill="#fff5fb"/>
    <path d="M59 31l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1Z" fill="#ffd45e" stroke="#d09428" stroke-width="2"/>
    <path d="M65 63v27l-8-6-8 6V63" fill="#77d2c3"/>
  `,
  pen: `
    <g transform="rotate(-35 50 50)">
      <path d="M38 19q0-10 12-10t12 10v55H38Z" fill="#9ce4d9" stroke="#348f85" stroke-width="4"/>
      <path d="M38 74h24L50 94Z" fill="#ffd7a4" stroke="#bc7d43" stroke-width="4"/><path d="m46 88 4 6 4-6" fill="#4d3e58"/>
      <path d="M38 34h24v15H38Z" fill="#ff9cba"/><path d="M43 18h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M62 24h10v32" fill="none" stroke="#7448b4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  `,
  wallet: `
    <rect x="12" y="24" width="76" height="58" rx="14" fill="#d0b8f2" stroke="#7046b2" stroke-width="4"/>
    <path d="M15 40h70v14H15Z" fill="#a98add"/><rect x="55" y="43" width="35" height="27" rx="9" fill="#ffbad0" stroke="#b85c83" stroke-width="4"/>
    <circle cx="68" cy="56" r="4" fill="#fff6cd"/>
    <path d="M25 31h26" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M24 65h20" stroke="#7dcfbe" stroke-width="6" stroke-linecap="round"/>
    <path d="M28 17q22-12 44 0" fill="none" stroke="#ffd45e" stroke-width="5" stroke-linecap="round"/>
  `,
  comb: `
    <g transform="rotate(-12 50 50)">
      <path d="M17 21h66v19H17Z" fill="#ffabc3" stroke="#b65b81" stroke-width="4" stroke-linejoin="round"/>
      <path d="M22 40v39m9-39v33m9-33v39m10-39v33m10-33v39m9-39v33m9-33v39" stroke="#b65b81" stroke-width="5" stroke-linecap="round"/>
      <path d="M27 29h46" stroke="#fff0f5" stroke-width="5" stroke-linecap="round"/>
      <path d="M79 13l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1Z" fill="#ffd359"/>
    </g>
  `,
  earbuds: `
    <rect x="15" y="42" width="70" height="45" rx="20" fill="#c4efe8" stroke="#36958a" stroke-width="4"/>
    <path d="M17 57h66" stroke="#36958a" stroke-width="3"/><circle cx="50" cy="75" r="4" fill="#7850ba"/>
    <path d="M33 16c-9 0-13 8-9 16 3 6 10 7 16 3V58c0 5 9 5 9 0V27c0-7-7-11-16-11Z" fill="#fff" stroke="#7650bd" stroke-width="4"/>
    <path d="M67 16c9 0 13 8 9 16-3 6-10 7-16 3V58c0 5-9 5-9 0V27c0-7 7-11 16-11Z" fill="#ffd4e1" stroke="#b85d83" stroke-width="4"/>
    <path d="M30 26h8m32 0h-8" stroke="#75cebf" stroke-width="4" stroke-linecap="round"/>
  `,
  umbrella: `
    <path d="M10 45Q17 14 50 13t40 32q-10-9-20 0-10-9-20 0-10-9-20 0-10-9-20 0Z" fill="#ffb4ca" stroke="#b95f85" stroke-width="4" stroke-linejoin="round"/>
    <path d="M30 45q4-23 20-32m20 32Q66 22 50 13M50 15v58c0 19 26 19 26 0" fill="none" stroke="#7449b5" stroke-width="5" stroke-linecap="round"/>
    <path d="M76 72q0 13-11 13" fill="none" stroke="#7449b5" stroke-width="5" stroke-linecap="round"/>
    <circle cx="50" cy="11" r="5" fill="#ffd45c"/>
  `,
  soap: `
    <g transform="rotate(-12 50 57)">
      <rect x="18" y="35" width="64" height="48" rx="20" fill="#9ce6da" stroke="#36958b" stroke-width="4"/>
      <path d="M33 61q17-18 34 0-17 17-34 0Z" fill="#effffa"/><path d="M43 58q7 7 14 0" fill="none" stroke="#71cdbd" stroke-width="4" stroke-linecap="round"/>
      <path d="M28 45c10-7 31-8 43 0" fill="none" stroke="#dffff9" stroke-width="5" stroke-linecap="round"/>
    </g>
    <circle cx="25" cy="24" r="9" fill="#ffd6e3" stroke="#fff" stroke-width="3"/><circle cx="43" cy="13" r="6" fill="#d9c4f6" stroke="#fff" stroke-width="3"/><circle cx="59" cy="24" r="4" fill="#ffe177"/>
  `,
  toothpaste: `
    <g transform="rotate(9 50 51)">
      <path d="M27 16h46l-5 64H32Z" fill="#fff" stroke="#7050ad" stroke-width="4" stroke-linejoin="round"/>
      <path d="M32 45h37l-2 25H34Z" fill="#9fe7dc"/><path d="M30 22h41l-1 14H29Z" fill="#ffb3ca"/>
      <path d="M42 50l5 8 10-1-7 7 3 9-9-5-8 5 2-9-7-6 10-1Z" fill="#ffd55f"/>
      <rect x="31" y="80" width="38" height="11" rx="4" fill="#7650ba" stroke="#503184" stroke-width="3"/>
      <path d="M39 29h23" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    </g>
  `,
  camera: `
    <path d="M24 29h17l5-10h20l6 10h9q9 0 9 9v39q0 9-9 9H19q-9 0-9-9V38q0-9 9-9Z" fill="#ffc2d4" stroke="#b75b82" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="52" cy="57" r="23" fill="#f8f2ff" stroke="#7048ad" stroke-width="5"/><circle cx="52" cy="57" r="14" fill="#9fe5da" stroke="#348f85" stroke-width="4"/><circle cx="47" cy="52" r="5" fill="#fff" opacity=".8"/>
    <rect x="20" y="20" width="15" height="10" rx="4" fill="#ffd45c"/><circle cx="78" cy="40" r="5" fill="#fff2a9"/>
    <path d="m82 13 3 7 8 1-6 5 2 7-7-4-7 4 2-7-6-5 8-1Z" fill="#ffd65e"/>
  `,
  watch: `
    <path d="M38 5h24l5 25H33Z" fill="#ffb9ce" stroke="#b75d82" stroke-width="4"/><path d="M33 70h34l-5 25H38Z" fill="#ffb9ce" stroke="#b75d82" stroke-width="4"/>
    <circle cx="50" cy="50" r="27" fill="#c7b0ef" stroke="#6f48ad" stroke-width="5"/><circle cx="50" cy="50" r="20" fill="#f7fffd"/>
    <path d="M50 38v13l10 7" fill="none" stroke="#3a998d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="4" fill="#f27399"/><rect x="76" y="45" width="7" height="12" rx="3" fill="#ffd55e"/>
    <path d="M44 12h12m-12 76h12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
  `,
  shoe: `
    <path d="M22 25c9 18 20 28 41 36 7 3 19 5 24 12 5 8-1 16-13 16H25c-13 0-18-8-14-19 3-9 9-24 11-45Z" fill="#ffd1df" stroke="#b85d83" stroke-width="4" stroke-linejoin="round"/>
    <path d="M31 35c8 13 17 19 31 25l-12 13-29-22Z" fill="#a8e7dd"/>
    <path d="m34 43 19 7m-13 1 19 7m-12 1 17 6" stroke="#7450b6" stroke-width="4" stroke-linecap="round"/>
    <path d="M11 76q37 10 77-1v7q0 9-13 9H24q-13 0-13-9Z" fill="#fff" stroke="#7049ac" stroke-width="4"/>
    <circle cx="24" cy="80" r="3" fill="#ffd45c"/><circle cx="76" cy="82" r="3" fill="#ffd45c"/>
  `,
  cap: `
    <path d="M17 57c0-27 14-43 38-43 22 0 34 18 34 43Z" fill="#9de5da" stroke="#348f85" stroke-width="4" stroke-linejoin="round"/>
    <path d="M54 14v43M23 35q31 10 60-2" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/>
    <path d="M12 57h54c16 0 27 6 27 15 0 8-9 11-21 7L50 71H12q-8 0-8-7t8-7Z" fill="#c9b2ee" stroke="#6f49ad" stroke-width="4"/>
    <circle cx="55" cy="13" r="6" fill="#ff9bb7" stroke="#b65b81" stroke-width="3"/>
    <path d="m32 40 4 7 8 1-6 5 2 8-8-4-7 4 2-8-6-5 8-1Z" fill="#ffd45d"/>
  `,
  lunchbox: `
    <path d="M33 28V18q0-10 17-10t17 10v10" fill="none" stroke="#7449af" stroke-width="7" stroke-linecap="round"/>
    <rect x="12" y="27" width="76" height="61" rx="14" fill="#a6e8dd" stroke="#34958a" stroke-width="4"/>
    <path d="M13 52h74" stroke="#34958a" stroke-width="4"/><rect x="20" y="46" width="12" height="18" rx="4" fill="#ffd55f" stroke="#be8826" stroke-width="3"/><rect x="68" y="46" width="12" height="18" rx="4" fill="#ffd55f" stroke="#be8826" stroke-width="3"/>
    <rect x="34" y="35" width="32" height="13" rx="6" fill="#ffbad0"/>
    <path d="M42 71q8-11 16 0-8 10-16 0Z" fill="#fff"/><circle cx="47" cy="70" r="2" fill="#6f49ad"/><circle cx="55" cy="70" r="2" fill="#6f49ad"/>
  `,
  charger: `
    <rect x="18" y="29" width="46" height="50" rx="12" fill="#cbb5ef" stroke="#7049ad" stroke-width="4"/>
    <path d="M29 29V14m22 15V14" stroke="#7049ad" stroke-width="7" stroke-linecap="round"/>
    <rect x="28" y="42" width="26" height="15" rx="5" fill="#fff"/><path d="m43 43-8 10h7l-4 11 12-14h-7Z" fill="#ffd45d"/>
    <path d="M64 65c26-1 29 22 12 22-10 0-10-14-1-14" fill="none" stroke="#3c9a8e" stroke-width="5" stroke-linecap="round"/>
    <rect x="73" y="67" width="15" height="12" rx="4" fill="#ffadc5" stroke="#b65c82" stroke-width="3"/>
  `,
  flashlight: `
    <g transform="rotate(-27 49 50)">
      <path d="M27 11h46l-8 27H35Z" fill="#ffd363" stroke="#c18a25" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="50" cy="12" rx="23" ry="9" fill="#fff4bf" stroke="#c18a25" stroke-width="4"/><ellipse cx="50" cy="12" rx="13" ry="5" fill="#fff"/>
      <rect x="35" y="37" width="30" height="54" rx="12" fill="#9ce5d9" stroke="#36968b" stroke-width="4"/>
      <rect x="41" y="49" width="18" height="12" rx="6" fill="#ffacc5"/><path d="M43 75h14" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
    </g>
    <path d="M18 14 7 7m12 23H5m76-16 11-7" stroke="#ff8fad" stroke-width="4" stroke-linecap="round"/>
  `,
  toycar: `
    <path d="M17 48 29 29h38l15 19q10 1 10 11v17H8V59q0-10 9-11Z" fill="#ffadc6" stroke="#b65b81" stroke-width="4" stroke-linejoin="round"/>
    <path d="m35 35-8 14h22V35Zm19 0v14h19L63 35Z" fill="#dff9f4" stroke="#6f49ad" stroke-width="3"/>
    <rect x="13" y="55" width="74" height="17" rx="8" fill="#a6e8dd"/>
    <circle cx="28" cy="76" r="11" fill="#7049ad" stroke="#fff" stroke-width="4"/><circle cx="73" cy="76" r="11" fill="#7049ad" stroke="#fff" stroke-width="4"/>
    <circle cx="18" cy="60" r="5" fill="#ffd45d"/><circle cx="82" cy="60" r="5" fill="#ffd45d"/>
  `,
  spoon: `
    <g transform="rotate(25 50 50)">
      <ellipse cx="50" cy="23" rx="20" ry="25" fill="#d3c0f1" stroke="#704aad" stroke-width="4"/>
      <ellipse cx="45" cy="18" rx="8" ry="11" fill="#fff" opacity=".62"/>
      <path d="M44 46h12l7 42q1 8-13 8t-13-8Z" fill="#9fe7db" stroke="#35958a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M44 63h14" stroke="#ffafc6" stroke-width="7" stroke-linecap="round"/>
      <path d="m50 72 3 7 8 1-6 5 2 7-7-4-7 4 2-7-6-5 8-1Z" fill="#ffd45d"/>
    </g>
  `,
  tape: `
    <path d="M14 74 25 27q3-12 15-12h29q12 0 15 12l5 19-18 43H25q-14 0-11-15Z" fill="#ffc2d4" stroke="#b85d83" stroke-width="4" stroke-linejoin="round"/>
    <circle cx="51" cy="40" r="22" fill="#d1bdf1" stroke="#7049ad" stroke-width="4"/><circle cx="51" cy="40" r="10" fill="#fff"/>
    <path d="M51 62h35L72 88H47Z" fill="#9fe5da" stroke="#35958a" stroke-width="4" stroke-linejoin="round"/>
    <path d="M84 49h11l-3 7 3 6-7 4 2 7-12 1" fill="#ffd45d" stroke="#bc8423" stroke-width="3" stroke-linejoin="round"/>
    <path d="M25 76h41" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
  `,
};

export function prizeIcon(kind, className='') {
  const item=getObjectSpec(kind),safeKind=item?kind:'candy',classes=['prize-icon',`prize-icon-${safeKind}`,className].filter(Boolean).join(' ');
  return `<svg class="${classes}" viewBox="0 0 100 100" role="img" aria-label="${item?.name||safeKind}">${art[safeKind]||art.candy}</svg>`;
}
