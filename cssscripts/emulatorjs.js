document.documentElement.classList.add('js-loading');

const themes = {
  default: {
    backgroundColor: "#00070a",
    buttonBorderColor: "#1aafff",
    buttonBackgroundColor: "#00141f",
    articleBackgroundColor: "#00141f",
    boxBackgroundColor: "#00141f",
    boxBorderColor: "#1aafff",
    textColor: "#1aafff",
  },
  pink: {
    backgroundColor: "#080203",
    buttonBorderColor: "#e37383",
    buttonBackgroundColor: "#190508",
    articleBackgroundColor: "#190508",
    boxBackgroundColor: "#190508",
    boxBorderColor: "#e37383",
    textColor: "#e37383",
  },
  green: {
    backgroundColor: "#020802",
    buttonBorderColor: "#32cd32",
    buttonBackgroundColor: "#061906",
    articleBackgroundColor: "#061906",
    boxBackgroundColor: "#061906",
    boxBorderColor: "#32cd32",
    textColor: "#32cd32",
  },
  purple: {
    backgroundColor: "#050308",
    buttonBorderColor: "#7842bd",
    buttonBackgroundColor: "#0e0817",
    articleBackgroundColor: "#0e0817",
    boxBackgroundColor: "#0e0817",
    boxBorderColor: "#7842bd",
    textColor: "#7842bd",
  },
  yellow: {
    backgroundColor: "#090701",
    buttonBorderColor: "#eac456",
    buttonBackgroundColor: "#1b1503",
    articleBackgroundColor: "#1b1503",
    boxBackgroundColor: "#1b1503",
    boxBorderColor: "#eac456",
    textColor: "#eac456",
  },
  orange: {
    backgroundColor: "#0a0600",
    buttonBorderColor: "#F28500",
    buttonBackgroundColor: "#1f1100",
    articleBackgroundColor: "#1f1100",
    boxBackgroundColor: "#1f1100",
    boxBorderColor: "#F28500",
    textColor: "#F28500",
  },
  rose: {
    backgroundColor: '#090402',
    buttonBorderColor: '#ec7c42',
    buttonBackgroundColor: '#1c0b04',
    articleBackgroundColor: '#1c0b04',
    boxBackgroundColor: '#1c0b04',
    boxBorderColor: '#ec7c42',
    textColor: '#ec7c42'
  },
  amber: {
    backgroundColor: '#0a0800',
    buttonBorderColor: '#f9c200',
    buttonBackgroundColor: '#1f1800',
    articleBackgroundColor: '#1f1800',
    boxBackgroundColor: '#1f1800',
    boxBorderColor: '#f9c200',
    textColor: '#f9c200'
  },
  lime: {
    backgroundColor: '#060901',
    buttonBorderColor: '#99e619',
    buttonBackgroundColor: '#131c03',
    articleBackgroundColor: '#131c03',
    boxBackgroundColor: '#131c03',
    boxBorderColor: '#99e619',
    textColor: '#99e619'
  },
  teal: {
    backgroundColor: '#010806',
    buttonBorderColor: '#26bd99',
    buttonBackgroundColor: '#031713',
    articleBackgroundColor: '#031713',
    boxBackgroundColor: '#031713',
    boxBorderColor: '#26bd99',
    textColor: '#26bd99'
  },
  lavender: {
    backgroundColor: '#030509',
    buttonBorderColor: '#4979de',
    buttonBackgroundColor: '#070e1b',
    articleBackgroundColor: '#070e1b',
    boxBackgroundColor: '#070e1b',
    boxBorderColor: '#4979de',
    textColor: '#4979de'
  },
  magenta: {
    backgroundColor: '#070306',
    buttonBorderColor: '#ae5bb0',
    buttonBackgroundColor: '#140710',
    articleBackgroundColor: '#140710',
    boxBackgroundColor: '#140710',
    boxBorderColor: '#ae5bb0',
    textColor: '#ae5bb0'
  },
  bw: {
    backgroundColor: '#000000',
    buttonBorderColor: '#f9f9f9',
    buttonBackgroundColor: '#111111',
    articleBackgroundColor: '#111111',
    boxBackgroundColor: '#111111',
    boxBorderColor: '#f9f9f9',
    textColor: '#f9f9f9'
  },
  beige: {
    backgroundColor: '#060504',
    buttonBorderColor: '#d2b48c',
    buttonBackgroundColor: '#1a140d',
    articleBackgroundColor: '#1a140d',
    boxBackgroundColor: '#1a140d',
    boxBorderColor: '#d2b48c',
    textColor: '#d2b48c'
  }
};

window.cdn = "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@main/data/";

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('input');
  const box = document.getElementById('box');
  
  input.addEventListener("change", async () => {
    const url = input.files[0];
    const parts = input.files[0].name.split(".");
    
    const core = await (async (ext) => {
      if (["fds", "nes", "unif", "unf"].includes(ext)) return "nes";

      if (
        ["smc", "fig", "sfc", "gd3", "gd7", "dx2", "bsx", "swc"].includes(
          ext
        )
      )
        return "snes";

      if (["z64", "n64"].includes(ext)) return "n64";

      if (["pce"].includes(ext)) return "pce";

      if (["ngp", "ngc"].includes(ext)) return "ngp";

      if (["ws", "wsc"].includes(ext)) return "ws";

      if (["col", "cv"].includes(ext)) return "coleco";

      if (["d64"].includes(ext)) return "vice_x64";

      if (["nds", "gba", "gb", "z64", "n64"].includes(ext)) return ext;

      return await new Promise((resolve) => {
      const cores = {
        "Nintendo NES": "nes",
        "Nintendo GB": "gb",
        "Nintendo SNES": "snes",
        "Nintendo VB": "vb",
        "Nintendo 64": "n64",
        "Nintendo GBC": "gba",
        "Nintendo GBA": "gba",
        "Nintendo DS": "nds",
        "Sega MS": "segaMS",
        "Sega Gen/MD": "segaMD",
        "Sega GG": "segaGG",
        "Sega CD": "segaCD",
        "Sega 32X": "sega32x",
        "Sega Saturn": "segaSaturn",
        "Sony PS1": "psx",
        "Atari 2600": "atari2600",
        "Atari 5200": "atari5200",
        "Atari 7800": "atari7800",
        "Atari Lynx": "lynx",
        "Atari Jaguar": "jaguar",
        "Arcade": "arcade",
        "3DO": "3do",
        "ColecoVision": "coleco",
        "NEC TG 16": "pce",
        "SNK NGP": "ngp",
        "Bandai WS": "ws",
        "Commodore PET": "pet",
        "Commodore VIC20": "vic20",
        "Commodore Amiga": "amiga",
        "Commodore 64": "c64",
        "Commodore 128": "c128",
        "Commodore P/4": "plus4",
        "NEC PC-FX": "pcfx",
        "MAME 2003 ": "mame2003",
      };

      const button = document.createElement("button");
      const select = document.createElement("select");

      for (const type in cores) {
        const option = document.createElement("option");

        option.value = cores[type];
        option.textContent = type;
        select.appendChild(option);
      }

      button.onclick = () => resolve(select[select.selectedIndex].value);
      button.textContent = "load game";

      const savedTheme = localStorage.getItem("theme") || "default";

      button.style.borderColor = themes[savedTheme].buttonBorderColor;
      button.style.backgroundColor =
        themes[savedTheme].buttonBackgroundColor;
      button.style.color = "#f9f9f9";

      select.style.borderColor = themes[savedTheme].buttonBorderColor;
      select.style.backgroundColor =
        themes[savedTheme].buttonBackgroundColor;
      select.style.color = "#f9f9f9";

      box.innerHTML = "";
      
      box.classList.add("file-picked");
      
      box.appendChild(select);
      box.appendChild(button);
    });
    })(parts.pop());

    const div = document.createElement("div");
    const sub = document.createElement("div");
    const loaderScript = document.createElement("script");

    sub.id = "game";
    div.id = "display";

    const top = document.getElementById("top");
    const version = document.getElementById("version");
    top.remove();
    version.remove();
    box.remove();
    div.appendChild(sub);
    document.body.appendChild(div);

    const cdn = "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@main/data/";

    window.EJS_player = "#game";
    const savedTheme = localStorage.getItem("theme") || "default";
    EJS_color = themes[savedTheme].buttonBorderColor;
    window.EJS_gameName = parts.shift();
    window.EJS_biosUrl = "";
    window.EJS_gameUrl = url;
    window.EJS_core = core;
    window.EJS_pathtodata = "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@main/data/";
    window.EJS_startOnLoaded = true;
    if (core === "psp") {
      window.EJS_threads = true;
    }
    window.EJS_ready = function () {
    };

    loaderScript.src = "https://cdn.jsdelivr.net/gh/EmulatorJS/EmulatorJS@main/data/loader.js";
    document.body.appendChild(loaderScript);
  });
});

function loadJSON(url, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", url, true);

  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4) {
      if (xobj.status === 200) {
        callback(xobj.responseText);
      } else {
        callback(null);
      }
    }
  };

  xobj.send();
}

function addOptions(select, options, default_option, github) {
  for (const version in options) {
    const option = document.createElement("option");
    option.value = options[version];
    if (version == "stable") {
      option.textContent = "stable (" + github + ")";
    } else {
      option.textContent = version;
    }
    if (
      localStorage.getItem("version") &&
      localStorage.getItem("version") === version
    ) {
      option.selected = true;
      window.cdn = "data";
    } else if (version.includes(default_option)) {
      option.selected = true;
      window.cdn = "data";
    }
    select.appendChild(option);
  }
}

function switchTheme(theme) {
  const selectedTheme = themes[theme];
  
  document.documentElement.style.setProperty('--body-bg-color', selectedTheme.backgroundColor);
  document.documentElement.style.setProperty('--button-bg-color', selectedTheme.buttonBackgroundColor);
  document.documentElement.style.setProperty('--button-border-color', selectedTheme.buttonBorderColor);
  document.documentElement.style.setProperty('--text-color', '#f9f9f9');
  document.documentElement.style.setProperty('--article-bg-color', selectedTheme.articleBackgroundColor);
  document.documentElement.style.setProperty('--scrollbar-track-color', selectedTheme.backgroundColor);
  document.documentElement.style.setProperty('--scrollbar-thumb-color', selectedTheme.buttonBorderColor);
  document.documentElement.style.setProperty('--button-text-color', selectedTheme.textColor);
  
  document.body.style.transition = "background-color 0.3s";
  document.body.style.backgroundColor = selectedTheme.backgroundColor;
  localStorage.setItem("theme", theme);

  const containers = document.querySelectorAll(".enhanced-container");
  containers.forEach((container) => {
    container.style.transition = "background-color 0.3s, border-color 0.3s";
  });

  const buttons = document.querySelectorAll("button:not(.theme-button)");
  buttons.forEach((button) => {
    button.style.transition = "border-color 0.3s, background-color 0.3s";
  });

  const articles = document.querySelectorAll("article");
  articles.forEach((article) => {
    article.style.transition = "background-color 0.3s";
  });

  const boxes = document.querySelectorAll("#box");
  boxes.forEach((box) => {
    box.style.transition = "background-color 0.3s, border-color 0.3s";
  });

  const boxSpans = document.querySelectorAll("#box span");
  boxSpans.forEach((span) => {
    span.style.transition = "color 0.3s";
  });

  const dropdowns = document.querySelectorAll("select");
  dropdowns.forEach((dropdown) => {
    dropdown.style.transition = "border-color 0.3s, background-color 0.3s";
    dropdown.style.color = "#f9f9f9";
  });
}

const savedTheme = localStorage.getItem("theme") || "default";
switchTheme(savedTheme);

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "default";
  switchTheme(savedTheme);

  const elements = document.querySelectorAll("a, h1, h2, h3, span, p");
  elements.forEach((element) => {
    const color = window.getComputedStyle(element).color;
    if (
      color.startsWith("rgb(26, 175, 255") ||
      element.style.color === "#1aafff" ||
      element.style.color === "#e37383" ||
      element.style.color === "#32cd32" ||
      element.style.color === "#7842bd" ||
      element.style.color === "#eac456" ||
      element.style.color === "#F28500"
    ) {
      element.setAttribute("data-theme-color", "true");
    }
  });

  switchTheme(savedTheme);
  
  setTimeout(() => {
    document.body.classList.add('visible');
  }, 10);
});

window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme") || "default";
  switchTheme(savedTheme);
});