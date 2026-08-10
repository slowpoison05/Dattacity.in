const fs = require('fs');
const path = 'c:\\dattacity\\index.html';
let content = fs.readFileSync(path, 'utf8');

const cssToAppend = `
<style>
body.intro-active { overflow: hidden; }
.app-intro { position: fixed; inset: 0; z-index: 500; display: grid; place-items: center; overflow: hidden; background: linear-gradient(180deg, rgba(186, 232, 255, 0.96) 0%, rgba(237, 249, 218, 0.96) 55%, rgba(126, 176, 74, 0.96) 55%, rgba(78, 138, 48, 0.98) 100%); color: #173416; transition: opacity 520ms ease, visibility 520ms ease; }
.app-intro.hidden { opacity: 0; visibility: hidden; pointer-events: none; }
.intro-sky, .intro-stage { position: absolute; inset: 0; }
.intro-sun { position: absolute; top: clamp(42px, 9vw, 86px); right: clamp(28px, 12vw, 150px); width: clamp(76px, 12vw, 126px); aspect-ratio: 1; border-radius: 999px; background: #FFD65A; box-shadow: 0 0 48px rgba(255, 214, 90, 0.62); animation: sunPulse 2400ms ease-in-out infinite; }
.intro-cloud { position: absolute; width: 112px; height: 34px; border-radius: 999px; background: rgba(255, 255, 255, 0.88); box-shadow: 28px -12px 0 8px rgba(255, 255, 255, 0.88), 58px 0 0 4px rgba(255, 255, 255, 0.88); }
.cloud-one { top: 18%; left: 9%; animation: cloudDrift 6800ms ease-in-out infinite; }
.cloud-two { top: 12%; left: 48%; transform: scale(0.74); animation: cloudDrift 8200ms ease-in-out infinite reverse; }
.intro-stage { display: grid; grid-template-rows: auto 1fr; align-items: end; width: min(980px, 100%); margin: 0 auto; padding: clamp(28px, 6vw, 64px) clamp(16px, 5vw, 42px); }
.intro-copy { align-self: start; max-width: 560px; animation: introCopyIn 760ms ease both; }
.intro-eyebrow { margin: 0 0 8px; color: #6D4E00; font-size: 13px; font-weight: 900; text-transform: uppercase; }
.intro-copy h1 { margin: 0; color: #1B5E20; font-size: clamp(52px, 11vw, 112px); line-height: 0.9; }
.intro-copy p { max-width: 480px; margin: 12px 0 0; color: #294429; font-size: clamp(16px, 2vw, 21px); font-weight: 700; }
.farmer-scene { position: relative; min-height: min(44vh, 360px); }
.field-lines { position: absolute; left: 50%; bottom: 0; width: min(920px, 110vw); height: 150px; transform: translateX(-50%); background: repeating-linear-gradient(168deg, transparent 0 28px, rgba(29, 91, 25, 0.28) 29px 32px), linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(27, 94, 32, 0.18)); border-radius: 50% 50% 0 0; }
.farmer { position: absolute; left: clamp(12px, 10vw, 96px); bottom: 68px; width: 118px; height: 168px; animation: farmerWalk 3200ms ease-in-out infinite; transform-origin: center bottom; }
.farmer-head, .farmer-hat, .farmer-body, .farmer-arm, .farmer-leg { position: absolute; display: block; }
.farmer-head { top: 31px; left: 43px; width: 42px; height: 46px; border-radius: 45% 45% 48% 48%; background: #B8753A; box-shadow: inset -8px -6px 0 rgba(95, 49, 21, 0.16); }
.farmer-hat { top: 12px; left: 20px; width: 82px; height: 28px; border-radius: 50% 50% 35% 35%; background: #D8A844; box-shadow: 0 14px 0 -3px #8C6723; }
.farmer-body { top: 77px; left: 34px; width: 58px; height: 66px; border-radius: 14px 14px 8px 8px; background: #2368A2; box-shadow: inset 0 -18px 0 #174E7E; }
.farmer-arm { top: 84px; left: 78px; width: 62px; height: 16px; border-radius: 999px; background: #B8753A; transform: rotate(-14deg); transform-origin: left center; animation: farmerReach 3200ms ease-in-out infinite; }
.farmer-leg { top: 136px; width: 17px; height: 54px; border-radius: 999px; background: #24412B; transform-origin: top center; }
.leg-left { left: 43px; animation: stepLeft 760ms ease-in-out infinite; }
.leg-right { left: 70px; animation: stepRight 760ms ease-in-out infinite; }
.intro-open-btn { position: absolute; right: clamp(20px, 12vw, 140px); bottom: 102px; display: inline-flex; align-items: center; gap: 10px; min-height: 56px; border: 0; border-radius: 8px; background: #1B5E20; color: white; padding: 14px 20px; box-shadow: 0 18px 38px rgba(27, 94, 32, 0.25); font-weight: 900; transition: transform 180ms ease, box-shadow 180ms ease; cursor: pointer; }
.intro-open-btn:hover, .intro-open-btn:focus-visible { transform: translateY(-2px); box-shadow: 0 22px 44px rgba(27, 94, 32, 0.32); }
.button-light { width: 14px; height: 14px; border-radius: 999px; background: #FFD65A; box-shadow: 0 0 0 5px rgba(255, 214, 90, 0.22); animation: buttonGlow 1100ms ease-in-out infinite; }
.app-intro.is-opening .farmer { animation: farmerPush 760ms ease both; }
.app-intro.is-opening .farmer-arm { animation: armPush 760ms ease both; }
.app-intro.is-opening .intro-open-btn { animation: buttonPressed 760ms ease both; }
.app-intro.is-opening { animation: introOpen 1180ms ease 320ms both; }
@keyframes sunPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
@keyframes cloudDrift { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(34px); } }
@keyframes introCopyIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
@keyframes farmerWalk { 0%, 100% { transform: translateX(0) rotate(-1deg); } 50% { transform: translateX(18px) rotate(1deg); } }
@keyframes farmerReach { 0%, 100% { transform: rotate(-14deg); } 50% { transform: rotate(-5deg) translateX(8px); } }
@keyframes stepLeft { 0%, 100% { transform: rotate(13deg); } 50% { transform: rotate(-8deg); } }
@keyframes stepRight { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(13deg); } }
@keyframes buttonGlow { 0%, 100% { opacity: 0.68; } 50% { opacity: 1; } }
@keyframes farmerPush { 0% { transform: translateX(0) rotate(-1deg); } 70%, 100% { transform: translateX(clamp(86px, 16vw, 168px)) rotate(2deg); } }
@keyframes armPush { 0% { transform: rotate(-8deg); } 60%, 100% { transform: rotate(-2deg) translateX(22px); } }
@keyframes buttonPressed { 0% { transform: translateY(0) scale(1); } 45% { transform: translateY(8px) scale(0.96); } 100% { transform: translateY(8px) scale(0.96); box-shadow: 0 0 0 999px rgba(232, 245, 233, 0.96); } }
@keyframes introOpen { 0% { clip-path: circle(150% at 50% 50%); opacity: 1; } 100% { clip-path: circle(0% at 82% 69%); opacity: 0; } }
</style>
`;

const jsToAppend = `
  function openDattaCity() {
    const intro = document.getElementById("appIntro");
    const button = document.getElementById("introOpenBtn");
    if (!intro || intro.classList.contains("is-opening")) return;
    if (button) { button.disabled = true; button.setAttribute("aria-label", "Opening DattaCity"); }
    intro.classList.add("is-opening");
    document.body.classList.remove("intro-active");
    window.setTimeout(() => {
      intro.classList.add("hidden");
    }, 1450);
  }
`;

const replaceStr = `  // Set landing view initially
  document.addEventListener("DOMContentLoaded", () => {
    showView('landing');
    renderWeatherForecast();
    const intro = document.getElementById("appIntro");
    if (intro && !intro.classList.contains("hidden")) {
      document.body.classList.add("intro-active");
    }
  });`;

content = content.replace('</body>', cssToAppend + '\n</body>');

content = content.replace(
  \`  // Set landing view initially
  document.addEventListener("DOMContentLoaded", () => {
    showView('landing');
    renderWeatherForecast();
  });\`,
  replaceStr + '\\n' + jsToAppend
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated index.html');
