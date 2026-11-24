(function () {
  "use strict";
  const engine = window.EchoMoralRedlineEngine;
  if (!engine) return;
  let lastRes = null;
  const el = (id) => document.getElementById(id);
  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  function applySample(s) {
    el("profileInput").value = s.profile_name;
    el("modeSelect").value = s.mode;
    el("toneSelect").value = s.tone;
    el("contractTextInput").value = s.contract_text;
    runCheck();
  }

  function runCheck() {
    const res = engine.analyzeContractText({
      profile_name: el("profileInput").value,
      mode: el("modeSelect").value,
      tone: el("toneSelect").value,
      contract_text: el("contractTextInput").value,
    });
    lastRes = res;
    el("resultCard").classList.remove("hidden");
    el("kpi1Val").textContent = `${res.readiness_percent.toFixed(1)} %`;
    el("kpi2Val").textContent = `${res.summary.fail_count} FAIL / ${res.summary.warn_count} WARN`;
    el("kpi3Val").textContent = `${res.impact_eur.toFixed(2)} EUR`;
    el("kpi4Val").textContent = `${res.annual_impact_eur.toFixed(2)} EUR`;
    el("resultHeadline").textContent = res.ok
      ? `${res.profile_name}: DACH/EU-Playbook konform`
      : `${res.profile_name}: ${res.summary.fail_count + res.summary.warn_count} Klausel-Risiken erkannt`;
    el("actionBox").value = res.action_text;

    el("entriesBody").innerHTML = res.entries
      .map((e) => {
        const cls = e.status === "PASS" ? "badge-pass" : e.status === "WARN" ? "badge-warn" : "badge-fail";
        const fb = e.redline_de ? `<div class="muted" style="margin-top:4px;">${esc(e.redline_de)}</div>` : "";
        return `<tr>
          <td><code>${esc(e.id)}</code></td>
          <td><strong>${esc(e.label)}</strong><div class="muted">${esc(e.category)}</div></td>
          <td>${e.metric}</td>
          <td>${e.impact_eur.toFixed(2)} EUR</td>
          <td><span class="badge ${cls}">${esc(e.status)}</span></td>
          <td>${esc(e.note)}${fb}</td>
        </tr>`;
      })
      .join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!el("runCheckBtn")) return;
    el("runCheckBtn").addEventListener("click", runCheck);
    el("modeSelect").addEventListener("change", runCheck);
    el("toneSelect").addEventListener("change", runCheck);
    el("sample1Btn").addEventListener("click", () => applySample(engine.SAMPLES.s1));
    el("sample2Btn").addEventListener("click", () => applySample(engine.SAMPLES.s2));
    el("sample3Btn").addEventListener("click", () => applySample(engine.SAMPLES.s3));

    if (el("contractFileInput")) {
      el("contractFileInput").addEventListener("change", (ev) => {
        const file = ev.target.files && ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          el("contractTextInput").value = String(reader.result || "");
          if (!el("profileInput").value) el("profileInput").value = file.name;
          runCheck();
        };
        reader.readAsText(file, "utf-8");
      });
    }

    el("copyActionBtn").addEventListener("click", async () => {
      if (!lastRes || !navigator.clipboard) return;
      await navigator.clipboard.writeText(lastRes.action_text);
      el("copyActionBtn").textContent = "Text kopiert!";
      setTimeout(() => (el("copyActionBtn").textContent = "Redline-Entwurf kopieren"), 1800);
    });
    el("dlCsvBtn").addEventListener("click", () => {
      if (!lastRes) return;
      const blob = new Blob([lastRes.export_csv], { type: "text/csv;charset=utf-8" });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = "echomoral_vertrags_audit.csv";
      a.click();
      URL.revokeObjectURL(u);
    });
    el("dlJsonBtn").addEventListener("click", () => {
      if (!lastRes) return;
      const blob = new Blob([engine.formatAuditReportJson(lastRes)], { type: "application/json" });
      const u = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = u;
      a.download = "echomoral_vertrags_audit.json";
      a.click();
      URL.revokeObjectURL(u);
    });

    applySample(engine.SAMPLES.s1);
  });
})();
