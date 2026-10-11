import React from 'react';

// Original vector props, with shared metal, leather and glass materials.
// Details are drawn as shapes so the same artwork works in a slot and close up.
const ART = {
  mems: <>
    <circle cx="64" cy="64" r="45" fill="#7eaaa7"/><path d="M33 97h62l-8 12H41Z" fill="#42636c"/>
    <path d="M37 30v60m18-67v73m18-73v73m18-66v60M24 46h80M20 64h88M24 82h80" stroke="#bed6cb"/>
    <rect x="42" y="39" width="44" height="50" rx="4" fill="#d8c28e"/><path d="M48 49h11v12h10V49h11M48 80h11V68h10v12h11" stroke="#3d7a7b" strokeWidth="5"/>
  </>,
  fluent: <>
    <path d="M18 29h92v71H18Z" fill="#d6c18c"/><path d="M24 35h80v58H24Z" fill="#507c82"/>
    <circle cx="63" cy="63" r="13" fill="#aec9bf"/><path d="M29 45c26 0 40-8 69 0M29 56c17 0 20-17 34-17s18 17 35 17M29 70c18 0 20 17 34 17s18-17 35-17M29 82c28 0 38 8 69 0" stroke="#d4e4c1" strokeWidth="2.5"/>
    <path d="m92 42 6 3-6 3m0 5 6 3-6 3m0 8 6 3-6 3m0 6 6 3-6 3M54 101v9h20v-9M40 112h48" stroke="#d6c18c" strokeWidth="4"/>
  </>,
  matlab: <>
    <path d="M30 19h72v88H29L20 92V30Z" fill="#e1c998"/><path d="M30 19v79h63v9H29L20 92V30Z" fill="#b59864" stroke="none"/>
    <path d="M30 20c-18-13-24 13-10 17h14m68 62c18 0 17 21 3 21H34c-14 0-16-20 0-20" fill="#e9d6ac"/>
    <path d="M36 33v51h48M43 76l12-21 12 8 15-26" stroke="#498b89" strokeWidth="3"/>
    <path d="M42 40h37M42 51h37M42 62h37M53 32v45M65 32v45M77 32v45" stroke="#a0ad90" strokeWidth="1"/>
    <circle cx="55" cy="55" r="4" fill="#d19562"/><circle cx="67" cy="63" r="4" fill="#d19562"/><circle cx="82" cy="37" r="4" fill="#d19562"/>
    <path d="m88 91 15-56 9 3-16 56-7 7Z" fill="#557e82"/><path d="m103 35 9 3 2-10-9-3Z" fill="#d4b777"/><path d="m89 91 7 3-7 7Z" fill="#ead7a5"/>
  </>,
  lab: <>
    <path d="M43 15h37v13h-6v26l29 46c5 8 0 16-10 16H29c-10 0-14-8-9-16l30-46V28h-7Z" fill="#b4d1c6"/>
    <path d="m38 76-14 25c-2 5 0 9 6 9h62c6 0 9-4 6-9L84 78c-20 8-27-8-46-2Z" fill="#609d8c"/><path d="M39 76c17-4 25 10 45 2" stroke="#e0e5b8" strokeWidth="3"/>
    <path d="M49 19h24m-17 9v27L36 87" stroke="#edf1d6" strokeWidth="3"/><path d="M54 12v-4m15 4V8" stroke="#597e78" strokeWidth="3"/>
    <circle cx="43" cy="99" r="5" fill="#d2bb81"/><circle cx="61" cy="91" r="5" fill="#334f55"/><circle cx="74" cy="103" r="5" fill="#d2bb81"/><circle cx="77" cy="66" r="3" fill="#e6d29b"/>
    <path d="M93 44h22v42H93Z" fill="#5d8181"/><path d="M98 37h12v7H98Z" fill="#d6bc7d"/><path d="M98 53h12m-6-6v12m-6 14h12" stroke="#ecdba8" strokeWidth="2"/>
    <path d="M104 37V27c0-11-27-10-27 2v16" stroke="#977649" strokeWidth="3"/>
  </>,
  dft: <>
    <path d="m48 70 48-52 18-5-4 20-49 48Z" fill="#c5dfde"/><path d="m54 75 52-53 8-9-4 20-49 48Z" fill="#6b9caa" stroke="none"/><path d="m51 69 55-47-8 13-43 40Z" fill="#f5f5d7" stroke="none"/><path d="m74 49 10-2-3 10-10 2Z" fill="#549c9c"/>
    <path d="m33 66 7-9 34 34-8 7-11-9-12-12Z" fill="#d2a550"/><path d="m34 66 8-3 25 27 7 1-8 7Z" fill="#94713e" stroke="none"/><path d="m42 80 12 11-22 23-12-12Z" fill="#325f64"/><path d="m38 85 11 9m-16-4 12 9m-16-4 11 9" stroke="#81aaa0" strokeWidth="3"/><path d="m15 101 8-5 14 14-5 9-9-1-9-9Z" fill="#c69e56"/><path d="m21 105 6-3 5 6-5 5Z" fill="#60b0a1"/><path d="m46 70 12 12-7 8-13-12Z" fill="#efd18b"/><path d="m46 73 8 9-4 4-8-8Z" fill="#479b96"/>
  </>,
  md: <>
    <path d="M30 13C52 15 96 42 98 68s-21 42-37 47l-5-10c22-16 25-30 21-42S59 36 31 22Z" fill="#bb8250"/><path d="M30 13c31 16 65 37 68 55s-15 35-37 47" stroke="#efd195" strokeWidth="4"/><path d="m30 17 30 92" stroke="#ece5bb" strokeWidth="2"/><path d="m80 53 11 6-4 24-11-5Z" fill="#3e7572"/><path d="m79 59 11 5m-12 2 10 4m-10 3 10 4" stroke="#9fb6a0" strokeWidth="2"/><path d="m23 88 75-55" stroke="#e1c68f" strokeWidth="4"/><path d="m90 30 26-8-12 23-3-11Z" fill="#b7dada"/><path d="m23 88-8-10 14-1 6 5-1 13-10 7Z" fill="#548f88"/><path d="m23 88-4 7m8-10-8-4m12 2-2 9" stroke="#acd0b6"/><path d="m30 13 7 13m19 77 9 11" stroke="#416b62" strokeWidth="4"/>
  </>,
  mlip: <>
    <path d="M57 78c-17-13-41-6-36 13 5 20 73 27 86 3 9-17-15-28-25-13-6 9 8 12 10 3" stroke="#4b5550" strokeWidth="8"/><path d="M57 78c-17-13-41-6-36 13 5 20 73 27 86 3 9-17-15-28-25-13-6 9 8 12 10 3" stroke="#c8a76e" strokeWidth="4"/><path d="m39 65 16-18 20 10-3 31-19 7-14-12Z" fill="#527e7e"/><path d="m40 66 15-12 17 8-2 18-17 6Z" fill="#87b8ac"/><path d="m54 49 9-18 23 12-9 19Z" fill="#d3ae65"/><path d="m59 46 16 9m-13-14 16 9m-13-14 16 9" stroke="#f2d49a"/><path d="m72 38 9-19 11 5-7 16" fill="#bdd5d3"/><path d="M85 24 76 14 57 23l7 12 4-8 12-4m8 6 13-6 11 18-11 9-1-9-9-10" fill="#b9d1d0"/><path d="m82 24 7-17 5 9-6 13Z" fill="#f0edd0"/><circle cx="54" cy="70" r="9" fill="#d9bc78"/><circle cx="54" cy="70" r="4" fill="#3a6264"/>
  </>,
  dem: <>
    <path d="M54 40c-10-29 23-13 24-28" stroke="#c49a62" strokeWidth="5"/><path d="m75 9 9 3m-4-9-3 13m11-10-7 8" stroke="#f0c16e" strokeWidth="3"/><circle cx="52" cy="76" r="34" fill="#3e5d72"/><path d="M31 50c-14 34 17 55 44 48-21 26-66-2-57-28" fill="#284759" stroke="none"/><path d="M33 59c4-7 11-11 20-11" stroke="#9cbab9" strokeWidth="5"/><path d="m41 43 1-12 22 1 1 13Z" fill="#b4925b"/><path d="m40 37 25 1" stroke="#e0c183" strokeWidth="3"/><path d="m46 74 6-8 7 8-7 9Z" fill="#d5b675"/><circle cx="94" cy="93" r="21" fill="#557e83"/><path d="m87 73 3-10 13 4-1 9Z" fill="#c6a365"/><path d="M98 64c4-13 14-3 15-15" stroke="#c4a276" strokeWidth="3"/><path d="M84 85q3-5 8-5" stroke="#b2cbbe" strokeWidth="3"/><circle cx="29" cy="110" r="5" fill="#9fae9a"/>
  </>,
  p2d: <>
    <circle cx="64" cy="17" r="10" stroke="#d5b775" strokeWidth="5"/><path d="M53 21h22v14H53Z" fill="#95733f"/><circle cx="64" cy="71" r="44" fill="#ae8244"/><path d="M24 72a40 40 0 0 1 77-16" stroke="#efd699" strokeWidth="4"/><circle cx="64" cy="71" r="35" fill="#e8e1b9"/><circle cx="64" cy="71" r="29" stroke="#b1b28c"/><path d="M64 37v7m0 54v7M30 71h7m54 0h7M41 48l4 4m39 39 4 4m0-47-4 4M45 91l-4 4" stroke="#698178" strokeWidth="2"/><path d="m78 45-9 34-20 19 10-34Z" fill="#4a8584"/><path d="m78 45-9 34-10-15Z" fill="#c47559"/><path d="m78 45-14 27-5-8Z" fill="#e1a174" stroke="none"/><circle cx="64" cy="71" r="5" fill="#ecd08b"/><path d="m40 57 7-6" stroke="#fff8d9" strokeWidth="4"/>
  </>,
  gnn: <>
    <path d="m71 75 12-11 30 33-13 15Z" fill="#395e62"/><path d="m88 81 8-8 9 10-8 9Z" fill="#c2a15f"/><path d="m100 96 9-8m-4 13 8-8" stroke="#73968b" strokeWidth="3"/><circle cx="51" cy="49" r="35" fill="#b98e4e"/><circle cx="51" cy="49" r="28" fill="#86b4b2"/><path d="M33 69c32 2 41-16 34-43 26 24 1 61-34 43" fill="#609191" stroke="none"/><path d="m35 40 29-5-8 32Z" stroke="#294f5b" strokeWidth="2"/><path d="m35 40 10 16 19-21m-19 21 11 11" stroke="#416d73" strokeWidth="2"/><circle cx="35" cy="40" r="4" fill="#f1dfab"/><circle cx="64" cy="35" r="4" fill="#f1dfab"/><circle cx="56" cy="67" r="4" fill="#f1dfab"/><circle cx="45" cy="56" r="3" fill="#d2e5cb"/><path d="M29 36q8-13 23-11" stroke="#e2efdc" strokeWidth="4"/><path d="M21 47q-2 22 17 30" stroke="#efd296" strokeWidth="3"/>
  </>,
  bo: <>
    <path d="M57 18c-5-15 22-15 18 0l-5 27H55Z" fill="#417d77"/><path d="m59 14 5 24" stroke="#8ab5a0" strokeWidth="3"/><path d="M55 38h16v15H55Z" fill="#b99150"/><path d="M30 86c18-7 5-41 33-41s17 34 35 41l7 15H21Z" fill="#d2aa5f"/><path d="M64 46c4 17-1 38 25 47l16 8H56c15-14-1-32 8-55" fill="#ac7b43" stroke="none"/><path d="M45 62q-5 9-5 19" stroke="#f5d998" strokeWidth="5"/><path d="m42 81 5-4 5 4-5 5Z" fill="#608d81"/><path d="M27 91q36 12 72 0" stroke="#f1cf89" strokeWidth="3"/><ellipse cx="63" cy="103" rx="42" ry="9" fill="#785c3d"/><ellipse cx="63" cy="102" rx="33" ry="5" fill="#3a5350"/><circle cx="63" cy="105" r="8" fill="#dab979"/><path d="m95 33 6-5m-3 20 9-1m-74-8-7-5" stroke="#b5cdb0" strokeWidth="2"/>
  </>,
  python: <>
    <path d="M20 56C28 41 66 32 100 15l13 7-4 18-20 10c17 33-14 70-45 58C23 101 7 77 20 56Z" fill="#497f9b"/><path d="M17 74c23 36 59 35 72-9 5 40-24 56-47 42-12-7-25-23-25-33" fill="#305d78" stroke="none"/><path d="m93 20 14 11-9 9-13-12Z" fill="#83b0bb"/><path d="m94 26 8 6" stroke="#243f52" strokeWidth="4"/><path d="M27 58c13-11 37-16 50-23" stroke="#9ac9c7" strokeWidth="4"/><ellipse cx="40" cy="61" rx="6" ry="8" transform="rotate(-35 40 61)" fill="#1e4055"/><ellipse cx="64" cy="51" rx="6" ry="8" transform="rotate(-35 64 51)" fill="#1e4055"/><ellipse cx="51" cy="83" rx="6" ry="8" transform="rotate(-35 51 83)" fill="#1e4055"/><ellipse cx="74" cy="72" rx="6" ry="8" transform="rotate(-35 74 72)" fill="#1e4055"/><path d="M38 72q5 2 9-1m25-9q5 2 9-1M31 92q11 11 22 11" stroke="#a2bfb4" strokeWidth="2"/><path d="m28 100-8 6" stroke="#c2aa79" strokeWidth="3"/><circle cx="18" cy="108" r="4" fill="#d3b578"/>
  </>,
  slurm: <>
    <path d="M49 27V17c0-21 30-21 30 0v10" stroke="#bca36c" strokeWidth="5"/><path d="m28 38 36-17 36 17-5 61-31 20-31-20Z" fill="#5c7773"/><path d="m36 44 28-12 28 12-4 49-24 16-24-16Z" fill="#eccb7e"/><path d="m64 32 28 12-4 49-24 16Z" fill="#af944f" stroke="none"/><path d="M64 32v77m-28-65 28 13 28-13M40 93l24-16 24 16" stroke="#465e59" strokeWidth="3"/><path d="m29 36 35 14 35-14 4 8-39 15-39-15Z" fill="#b69b5c"/><path d="m33 96 31 16 31-16 4 8-35 20-35-20Z" fill="#c4a767"/><path d="M47 60v21m5-18v14" stroke="#fff0b4" strokeWidth="3"/><path d="M64 59v52m28-64-4 48M36 47l4 48" stroke="#d4bd7e" strokeWidth="3"/><path d="m62 63-7 21h15Z" fill="#faf0b4"/>
  </>,
  swift: <>
    <path d="M26 103C9 70 49 13 104 10c7 37-21 72-59 85Z" fill="#bd674c"/><path d="M104 10C62 21 43 53 26 103l19-8C59 64 82 39 104 10Z" fill="#e2a172" stroke="none"/><path d="M27 91c-6-25 23-61 48-70" stroke="#efbc83" strokeWidth="3"/><path d="m22 118 14-32 54-58" stroke="#a77b48" strokeWidth="6"/><path d="m22 118 14-32 54-58" stroke="#f1cc89" strokeWidth="2"/><path d="m40 83 24-6m-11-9 25-8m-8-10 22-8M40 72l-2-17m17 1 1-20m13 5 4-15" stroke="#934e40" strokeWidth="2"/><path d="m22 111 7 3m-5-8 7 3" stroke="#548780" strokeWidth="4"/><path d="m26 116-3 7" stroke="#d9b97c" strokeWidth="4"/>
  </>,
  metal: <>
    <path d="m30 84-9-41 3-16 10-2 8 34-1-43 12-3 9 44 5-48 13 2-2 45 11-39 12 4-6 49 13-14 10 9-27 34-52 5Z" fill="#7eaaa7"/><path d="m30 84 15 9 34-8 16-15-4 29-52 5Z" fill="#4d767e" stroke="none"/><path d="m24 30 9-2 5 14-11 3m15-25 10-3 3 15-12 2m25-19 11 1-1 17-11-1m23-11 9 3-4 15-10-3" fill="#cbdbce"/><path d="m32 93 54-9 7 31-52 8Z" fill="#42636c"/><path d="m34 95 53-9 2 8-52 9Z" fill="#baab73"/><path d="m41 115 49-8 3 8-52 8Z" fill="#b7c9b9"/><path d="m48 69 17-14 17 13-5 20-23 4Z" fill="#c3ad70"/><path d="m55 70 11-9 9 9-5 12-12 2Z" fill="#438b87"/><path d="m66 62 9 8-5 12-4-10Z" fill="#235961" stroke="none"/><path d="m32 48 8-2m7-8 11-2m9 2h11m8 5 10 3" stroke="#d9debd" strokeWidth="3"/>
  </>,
  agent: <>
    <path d="M46 29h36v15c0 10 29 17 29 43 0 37-94 37-94 0 0-26 29-33 29-43Z" fill="#abcbbd"/><path d="M78 42c1 16 26 22 24 47-1 20-24 24-48 25 60 8 70-27 48-49L82 44Z" fill="#709e9b" stroke="none"/><path d="M25 78c21 8 42-13 77-1 9 40-86 42-77 1Z" fill="#4e9e90"/><path d="M25 78c21 8 42-13 77-1" stroke="#b7e1b7" strokeWidth="3"/><path d="m44 10 40 1-4 24H48Z" fill="#ad8454"/><path d="m49 12 5 17m8-16 1 17m12-17-3 18" stroke="#ddba7c" strokeWidth="3"/><path d="M41 32h46v10H41Z" fill="#dec48a"/><path d="M34 61q-10 12-9 21" stroke="#edf3d7" strokeWidth="4"/><circle cx="51" cy="87" r="4" fill="#204d52"/><circle cx="77" cy="87" r="4" fill="#204d52"/><path d="M58 97q6 5 12-1" stroke="#245c5a" strokeWidth="3"/><circle cx="52" cy="64" r="4" fill="#d3ebc5"/><circle cx="73" cy="56" r="3" fill="#d3ebc5"/><path d="M85 39q14 4 9 17l-7 6" stroke="#856b47" strokeWidth="2"/><path d="m86 58 12 6-6 15-12-6Z" fill="#e4ce99"/><path d="m87 65 6 4m-8 0 6 4" stroke="#89774c"/>
  </>,
};

export default function Equipment({ id }) {
  return <svg className="atlas-equipment" viewBox="0 0 128 128" fill="none" stroke="#294b4e" style={{strokeWidth:1.8}} strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">{ART[id]}</svg>;
}
