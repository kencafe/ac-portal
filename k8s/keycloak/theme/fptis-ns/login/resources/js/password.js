/* FPT IS NS Content Hub — login theme client JS.
   Two behaviors only: password show/hide toggle and a client-side strength meter.
   No framework. Progressive enhancement — the form works with JS disabled. */
(function () {
  "use strict";

  function initToggles() {
    var toggles = document.querySelectorAll("[data-pw-toggle]");
    Array.prototype.forEach.call(toggles, function (btn) {
      var input = document.getElementById(btn.getAttribute("data-target"));
      if (!input) return;
      var eye = btn.querySelector(".ns-eye");
      var eyeOff = btn.querySelector(".ns-eye-off");
      btn.addEventListener("click", function () {
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        if (eye) eye.style.display = show ? "none" : "";
        if (eyeOff) eyeOff.style.display = show ? "" : "none";
        var label = show ? btn.getAttribute("data-label-hide") : btn.getAttribute("data-label-show");
        if (label) btn.setAttribute("aria-label", label);
      });
    });
  }

  function score(v) {
    if (!v) return 0;
    var s = 0;
    if (v.length >= 12) s++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    // Map 0..4 raw checks to 0..3 segments.
    if (s >= 4) return 3;
    if (s >= 2) return 2;
    if (s >= 1) return 1;
    return 0;
  }

  function initStrength() {
    var inputs = document.querySelectorAll("[data-pw-strength]");
    Array.prototype.forEach.call(inputs, function (input) {
      var meter = document.getElementById(input.getAttribute("data-meter"));
      var labelEl = document.getElementById(input.getAttribute("data-meter-label"));
      if (!meter) return;
      var segs = meter.querySelectorAll("span");
      var strengthLabel = (window.NS_MSG && NS_MSG.strengthLabel) || "";
      var names = (window.NS_MSG && NS_MSG.levels) || ["", "", ""];
      var hint = labelEl ? labelEl.getAttribute("data-hint") || labelEl.textContent : "";

      function render() {
        var n = score(input.value);
        Array.prototype.forEach.call(segs, function (seg, i) {
          if (i < n) seg.classList.add("ns-on"); else seg.classList.remove("ns-on");
        });
        if (labelEl) {
          if (!input.value) { labelEl.textContent = hint; return; }
          var idx = Math.max(0, n - 1);
          var cls = ["ns-str-weak", "ns-str-fair", "ns-str-strong"][idx] || "ns-str-weak";
          labelEl.innerHTML = strengthLabel + ' <strong class="' + cls + '">' +
            (names[idx] || "") + "</strong> · " + hint;
        }
      }
      input.addEventListener("input", render);
      render();
    });
  }

  function boot() { initToggles(); initStrength(); }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
