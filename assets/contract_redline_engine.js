/**
 * Vertragsprüfung & Redlining (B10) — Deterministic Client-Side & Node.js Engine
 * 100 % local in browser / offline CLI, zero network calls.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.CheProjectEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  const META = {
  "pid": "B10",
  "brand": "EchoMoral",
  "short_name": "Vertragsprüfung & Redlining",
  "slug": "contract_redline",
  "default_profile": "US Cloud Vendor MSA 2026",
  "kpi_impact_label": "Identifiziertes Haftungs-/Vertragsrisiko",
  "annual_multiplier": 1
};
  const SAMPLES = {
  "s1": {
    "profile_name": "US Cloud Vendor MSA 2026",
    "mode": "msa",
    "tone": "streng",
    "items": [
      {
        "id": "CL-01",
        "label": "KI-Trainingsklausel in Section 4.2",
        "category": "IP & KI-Schutz",
        "metric": 95,
        "base_eur": 50000,
        "impact_eur": 25000,
        "status": "FAIL",
        "note": "Fallback: 'Provider shall NOT use Customer Data to train foundation models.'"
      },
      {
        "id": "CL-02",
        "label": "Einseitiger Haftungsausschluss (0 Cap)",
        "category": "Haftung",
        "metric": 88,
        "base_eur": 24000,
        "impact_eur": 18000,
        "status": "FAIL",
        "note": "Gegenvorschlag: Gegenseitiger Cap in Höhe von 12 Monatsgebühren (Ausnahme DSGVO/IP)."
      },
      {
        "id": "CL-03",
        "label": "90-Tage Auto-Renewal-Frist",
        "category": "Laufzeit",
        "metric": 65,
        "base_eur": 12000,
        "impact_eur": 4000,
        "status": "WARN",
        "note": "Auf 30 Tage Kündigungsfrist vor Ablauf reduzieren."
      }
    ]
  },
  "s2": {
    "profile_name": "DACH Muster-AVV (Art. 28 DSGVO)",
    "mode": "avv",
    "tone": "partnerschaftlich",
    "items": [
      {
        "id": "AVV-01",
        "label": "EU/EWR Datenlokation & SCCs",
        "category": "DSGVO",
        "metric": 100,
        "base_eur": 0,
        "impact_eur": 0,
        "status": "PASS",
        "note": "Rechenzentrum Frankfurt/Nürnberg + EU-SCCs Anhang verankert"
      },
      {
        "id": "AVV-02",
        "label": "Subunternehmer-Widerspruch (14 Tage)",
        "category": "Governance",
        "metric": 100,
        "base_eur": 0,
        "impact_eur": 0,
        "status": "PASS",
        "note": "Vorab-Informationspflicht sauber geregelt"
      }
    ]
  },
  "s3": {
    "profile_name": "OEM Geheimhaltungsvereinbarung",
    "mode": "nda",
    "tone": "partnerschaftlich",
    "items": [
      {
        "id": "NDA-01",
        "label": "Einseitige Geheimhaltung + Vertragsstrafe 50k",
        "category": "Balance",
        "metric": 82,
        "base_eur": 50000,
        "impact_eur": 15000,
        "status": "FAIL",
        "note": "Auf gegenseitige (mutual) NDA umstellen & pauschale Vertragsstrafe streichen."
      },
      {
        "id": "NDA-02",
        "label": "Gerichtsstand Delaware statt Bremen/DACH",
        "category": "Rechtswahl",
        "metric": 60,
        "base_eur": 10000,
        "impact_eur": 3500,
        "status": "WARN",
        "note": "Deutsches Recht & Gerichtsstand Sitz des Auftragnehmers vorschlagen."
      },
      {
        "id": "NDA-03",
        "label": "Laufzeit 3 Jahre nach Ende",
        "category": "Frist",
        "metric": 95,
        "base_eur": 0,
        "impact_eur": 0,
        "status": "PASS",
        "note": "Branchenüblicher Zeitrahmen"
      }
    ]
  }
};

  function r2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function evaluateCase(input = {}) {
    const profileName = String(input.profile_name || SAMPLES.s1.profile_name || META.default_profile);
    const mode = String(input.mode || SAMPLES.s1.mode || "standard");
    const tone = String(input.tone || SAMPLES.s1.tone || "executive");
    const rawItems = Array.isArray(input.items) && input.items.length ? input.items : SAMPLES.s1.items;

    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;
    let impactTotal = 0;
    let baseTotal = 0;

    const rows = rawItems.map((it, idx) => {
      const id = String(it.id || `${META.pid}-${String(idx + 1).padStart(2, "0")}`);
      const label = String(it.label || "Position");
      const category = String(it.category || "Prüfpunkt");
      const metric = Number(it.metric) || 0;
      const impact = Number(it.impact_eur) || 0;
      const base = Number(it.base_eur) || 0;
      const statusRaw = String(it.status || "").toUpperCase();
      const status = ["PASS", "WARN", "FAIL"].includes(statusRaw)
        ? statusRaw
        : impact > 0 && metric >= 70
          ? "FAIL"
          : impact > 0
            ? "WARN"
            : "PASS";

      if (status === "PASS") passCount += 1;
      else if (status === "WARN") warnCount += 1;
      else failCount += 1;

      impactTotal += impact;
      baseTotal += base;

      return {
        id,
        label,
        category,
        metric: r2(metric),
        base_eur: r2(base),
        impact_eur: r2(impact),
        status,
        note: String(it.note || (status === "PASS" ? "Regelkonform" : "Maßnahme empfohlen")),
      };
    });

    const totalCount = rows.length || 1;
    const score = r2(Math.max(0, Math.min(100, ((passCount + warnCount * 0.5) / totalCount) * 100)));
    const ok = failCount === 0;
    const annualImpact = r2(impactTotal * (Number(META.annual_multiplier) || 12));

    const headerTone = tone === "streng"
      ? `[FRIST / ESKALATION] ${profileName} (${META.pid} · Modus: ${mode})`
      : `[EXECUTIVE SUMMARY] ${profileName} (${META.pid} · Modus: ${mode})`;

    const actionLines = rows
      .filter((r) => r.status !== "PASS")
      .map((r) => `- [${r.status}] ${r.id} ${r.label}: ${r.note} (Potenzial/Risiko: ${r.impact_eur.toFixed(2)} EUR)`);

    const actionText = [
      headerTone,
      `Readiness-Score: ${score} % | Geprüft: ${rows.length} | PASS: ${passCount} | WARN: ${warnCount} | FAIL: ${failCount}`,
      `${META.kpi_impact_label}: ${impactTotal.toFixed(2)} EUR (Hochgerechnet p.a.: ${annualImpact.toFixed(2)} EUR)`,
      "",
      actionLines.length ? "Priorisierte Maßnahmen:" : "Alle geprüften Punkte erfüllen die DACH-Vorgaben ohne Beanstandung.",
      ...actionLines,
      "",
      `Erstellt lokal mit ${META.brand} ${META.short_name} (by VeriTakt Collective) — 0 Cloud-Upload.`
    ].join("\n");

    const csvHeader = "ID;Kategorie;Position;Kennzahl;Basis_EUR;Effekt_EUR;Status;Hinweis";
    const csvRows = rows.map((r) =>
      [r.id, r.category, r.label, r.metric.toFixed(2), r.base_eur.toFixed(2), r.impact_eur.toFixed(2), r.status, r.note]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";")
    );
    const exportCsv = "\uFEFF" + [csvHeader, ...csvRows].join("\n");

    return {
      ok,
      project_id: META.pid,
      brand: META.brand,
      profile_name: profileName,
      mode,
      tone,
      readiness_percent: score,
      summary: {
        total_count: rows.length,
        pass_count: passCount,
        warn_count: warnCount,
        fail_count: failCount,
      },
      base_total_eur: r2(baseTotal),
      impact_eur: r2(impactTotal),
      annual_impact_eur: annualImpact,
      entries: rows,
      action_text: actionText,
      export_csv: exportCsv,
    };
  }

  function formatAuditReportMarkdown(res) {
    return [
      `# ${META.brand} ${META.short_name} — Audit Report (${res.profile_name})`,
      `- **Score:** ${res.readiness_percent} % | **FAIL:** ${res.summary.fail_count} | **WARN:** ${res.summary.warn_count}`,
      `- **${META.kpi_impact_label}:** ${res.impact_eur.toFixed(2)} EUR (Jahr: ${res.annual_impact_eur.toFixed(2)} EUR)`,
      "",
      "## Maßnahmen & Empfehlung",
      res.action_text,
    ].join("\n");
  }

  function formatAuditReportJson(res) {
    return JSON.stringify(res, null, 2);
  }

  return {
    META,
    SAMPLES,
    evaluateCase,
    formatAuditReportMarkdown,
    formatAuditReportJson,
  };
});
