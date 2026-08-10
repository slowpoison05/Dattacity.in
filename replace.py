import re

with open('c:/dattacity/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the intro CSS block
content = re.sub(
    r'<style>\s*body\.intro-active\s*\{.*?(?=@keyframes introOpen).*?\} \}\s*</style>',
    '<link rel="stylesheet" href="assets/css/landing-intro.css">',
    content,
    flags=re.DOTALL
)

# Also need to replace the HTML block for app-intro
content = re.sub(
    r'<!-- App Intro Animation -->\s*<div class="app-intro" id="appIntro">.*?<button class="intro-open-btn" id="introOpenBtn" onclick="openDattaCity\(\)">\s*<span class="button-light"></span> गाँव में प्रवेश करें\s*</button>\s*</div>\s*</div>\s*</div>',
    '''<!-- Haryana Village Entrance Experience -->
<div class="village-intro-overlay" id="villageIntroOverlay" role="dialog" aria-modal="true" aria-label="Welcome to Datta City Village">
  <div class="village-sky">
    <div class="sun"></div>
  </div>
  <div class="wheat-fields"></div>
  <div class="tractor-silhouette" aria-hidden="true"></div>
  
  <div class="village-house">
    <div class="mud-wall"></div>
    
    <div class="house-header">
      <h1>DattaCity</h1>
      <p>आपका अपना गांव डिजिटल सेवा केंद्र</p>
    </div>
    
    <div class="door-frame">
      <div class="wooden-door left">
        <div class="door-panel"></div>
        <div class="door-panel"></div>
        <div class="door-handle"></div>
      </div>
      <div class="wooden-door right">
        <div class="door-panel"></div>
        <div class="door-panel"></div>
        <div class="door-handle"></div>
      </div>
    </div>
  </div>

  <div class="intro-controls">
    <button class="enter-btn" id="enterVillageBtn" aria-label="Enter the Village">
      🚜 गांव में प्रवेश करें
    </button>
    <button class="skip-intro" id="skipIntroBtn" aria-label="Skip intro animation">
      Skip Intro
    </button>
  </div>
</div>''',
    content,
    flags=re.DOTALL
)

# Remove the old openDattaCity JS function and DOMContentLoaded block
content = re.sub(
    r'  // Set landing view initially\s*document\.addEventListener\("DOMContentLoaded", \(\) => \{\s*showView\(\'landing\'\);\s*renderWeatherForecast\(\);\s*const intro = document\.getElementById\("appIntro"\);\s*if \(intro && !intro\.classList\.contains\("hidden"\)\) \{\s*document\.body\.classList\.add\("intro-active"\);\s*\}\s*\}\);\s*function openDattaCity\(\) \{.*?\}\s*</script>',
    '''  // Set landing view initially
  document.addEventListener("DOMContentLoaded", () => {
    showView('landing');
    renderWeatherForecast();
    const introOverlay = document.getElementById("villageIntroOverlay");
    if (introOverlay && !localStorage.getItem("dattaCityIntroSeen")) {
      document.body.classList.add("village-intro-active");
    }
  });

</script>
<script src="assets/js/landing-intro.js"></script>''',
    content,
    flags=re.DOTALL
)

with open('c:/dattacity/index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Replacement script executed.")
