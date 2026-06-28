/* Quick QR Code Generator — fully client-side.
   Uses the vendored `qrcode-generator` library (global: qrcode). */

(function () {
  "use strict";

  var state = { mode: "link" };

  var els = {
    tabs: document.querySelectorAll(".tab"),
    forms: document.querySelectorAll(".form"),
    qr: document.getElementById("qr"),
    hint: document.getElementById("empty-hint"),
    dlPng: document.getElementById("dl-png"),
    dlSvg: document.getElementById("dl-svg"),
    fg: document.getElementById("fg"),
    bg: document.getElementById("bg"),
    size: document.getElementById("size"),
  };

  // --- Build the encoded string for the active mode ---------------------

  function escapeWifi(s) {
    return String(s).replace(/([\\;,:"])/g, "\\$1");
  }

  function buildPayload() {
    if (state.mode === "link") {
      return val("link-input");
    }
    if (state.mode === "wifi") {
      var ssid = val("wifi-ssid");
      if (!ssid) return "";
      var enc = val("wifi-enc");
      var pass = val("wifi-pass");
      var hidden = document.getElementById("wifi-hidden").checked;
      var parts = "WIFI:T:" + (enc === "nopass" ? "nopass" : enc) + ";S:" + escapeWifi(ssid) + ";";
      if (enc !== "nopass") parts += "P:" + escapeWifi(pass) + ";";
      if (hidden) parts += "H:true;";
      return parts + ";";
    }
    if (state.mode === "contact") {
      var name = val("c-name");
      var phone = val("c-phone");
      var email = val("c-email");
      var org = val("c-org");
      if (!name && !phone && !email && !org) return "";
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        "N:" + name,
        "FN:" + name,
        org ? "ORG:" + org : "",
        phone ? "TEL;TYPE=CELL:" + phone : "",
        email ? "EMAIL:" + email : "",
        "END:VCARD",
      ].filter(Boolean).join("\n");
    }
    return "";
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  // --- Rendering --------------------------------------------------------

  var current = { svg: "", text: "" };

  function render() {
    var text = buildPayload();
    current.text = text;

    if (!text) {
      els.qr.innerHTML = "";
      els.hint.style.display = "";
      toggleDownloads(false);
      return;
    }

    var fg = els.fg.value;
    var bg = els.bg.value;

    // Auto-pick type number (0) and high error correction for resilience.
    var qr = qrcode(0, "H");
    qr.addData(text);
    qr.make();

    var count = qr.getModuleCount();
    var margin = 4; // quiet zone in modules

    // Build a crisp SVG ourselves so colors + scaling are exact.
    var svg = buildSvg(qr, count, margin, fg, bg);
    current.svg = svg;

    els.qr.innerHTML = svg;
    els.hint.style.display = "none";
    toggleDownloads(true);
  }

  function buildSvg(qr, count, margin, fg, bg) {
    var dim = count + margin * 2;
    var rects = "";
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          rects += '<rect x="' + (c + margin) + '" y="' + (r + margin) + '" width="1" height="1"/>';
        }
      }
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dim + " " + dim +
      '" shape-rendering="crispEdges" width="100%" height="100%">' +
      '<rect width="' + dim + '" height="' + dim + '" fill="' + bg + '"/>' +
      '<g fill="' + fg + '">' + rects + "</g></svg>"
    );
  }

  function toggleDownloads(on) {
    els.dlPng.disabled = !on;
    els.dlSvg.disabled = !on;
  }

  // --- Downloads --------------------------------------------------------

  function filename(ext) {
    return "qrcode." + ext;
  }

  function downloadSvg() {
    var blob = new Blob([current.svg], { type: "image/svg+xml" });
    triggerDownload(URL.createObjectURL(blob), filename("svg"), true);
  }

  function downloadPng() {
    var size = parseInt(els.size.value, 10) || 512;
    var img = new Image();
    var svgBlob = new Blob([current.svg], { type: "image/svg+xml" });
    var url = URL.createObjectURL(svgBlob);
    img.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      var ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      triggerDownload(canvas.toDataURL("image/png"), filename("png"), false);
    };
    img.src = url;
  }

  function triggerDownload(href, name, revoke) {
    var a = document.createElement("a");
    a.href = href;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (revoke) setTimeout(function () { URL.revokeObjectURL(href); }, 1000);
  }

  // --- Wiring -----------------------------------------------------------

  function switchMode(mode) {
    state.mode = mode;
    els.tabs.forEach(function (t) {
      t.classList.toggle("is-active", t.dataset.mode === mode);
    });
    els.forms.forEach(function (f) {
      f.classList.toggle("is-hidden", f.dataset.form !== mode);
    });
    render();
  }

  els.tabs.forEach(function (t) {
    t.addEventListener("click", function () { switchMode(t.dataset.mode); });
  });

  document.addEventListener("input", render);
  document.addEventListener("change", render);
  els.dlPng.addEventListener("click", downloadPng);
  els.dlSvg.addEventListener("click", downloadSvg);

  // Initial render (empty state).
  render();
})();
