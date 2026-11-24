/**
 * EchoMoral Legal (B10) — Deterministic B2B Contract Clause Scanner & DE/EN Fallback Redline Engine
 * 100 % local in browser or Node.js (zero document uploads).
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.EchoMoralRedlineEngine = api;
  root.CheProjectEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : window, function () {
  "use strict";

  const META = {
    pid: "B10",
    brand: "EchoMoral",
    short_name: "Vertragsprüfung & Playbook",
    slug: "contract_redline",
    default_profile: "CloudVendor SaaS MSA",
    kpi_impact_label: "Abgesichertes Haftungs-/Vertragsvolumen",
    annual_multiplier: 1,
  };

  const CLAUSE_RULES = [
    {
      id: "CL-01",
      category: "Haftungsobergrenze",
      title: "Unbegrenzte Haftung / Fehlender Liability Cap",
      severity: "FAIL",
      risk_eur: 100000,
      appliesTo: ["msa", "avv", "nda"],
      detectFail: (t) => /(unbegrenzte?\s+haftung|unlimited\s+liability|haftet\s+unbeschränkt|without\s+limitation\s+of\s+liability)/i.test(t) || !/(haftung.*begrenzt|liability.*capped|annual\s+fees|jahresvergütung|12\s*monat|12\s*months)/i.test(t),
      note: "Fehlende oder unbegrenzte Haftungsobergrenze auf 12 Monatsgebühren (ausgenommen Vorsatz/grobe Fahrlässigkeit/Personenschäden).",
      redline_de: "Vorschlag DE: „Vorbehaltlich gesetzlich zwingender Haftung (Vorsatz, grobe Fahrlässigkeit, Verletzung von Leben, Körper oder Gesundheit) ist die Gesamthaftung jeder Partei je Vertragsjahr auf 100 % der in den vorangegangenen 12 Monaten gezahlten Vergütung begrenzt.“",
      redline_en: "Suggested EN: \"Except for statutory liability (intent, gross negligence, personal injury), each party's aggregate liability per contract year shall be capped at 100% of the fees paid in the preceding twelve (12) months.\"",
    },
    {
      id: "CL-02",
      category: "KI-Training",
      title: "Fehlendes KI-Trainings-Opt-Out / Model-Training-Klausel",
      severity: "FAIL",
      risk_eur: 45000,
      appliesTo: ["msa", "avv"],
      detectFail: (t) => {
        const hasOptOut = /(no\s+ai\s+training|kein\s+ki[-\s]?training|nicht\s+zum\s+(?:ki[-\s]?)?training|keine\s+nutzung.*training|shall\s+not\s+use.*train|ausgeschlossen.*training)/i.test(t);
        if (hasOptOut) return false;
        return true;
      },
      note: "Explizites Verbot zur Nutzung von Kundendaten für KI-/LLM-Modelltraining fehlt oder Training ist erlaubt.",
      redline_de: "Vorschlag DE: „Der Anbieter verarbeitet Kundendaten ausschließlich zur vertraglichen Leistungserbringung. Eine Nutzung von Eingaben oder Ergebnissen zum Training oder Fine-Tuning von KI-/ML-Modellen ist ausgeschlossen (Zero-Data-Retention für Modelltraining).“",
      redline_en: "Suggested EN: \"Provider shall process Customer Data solely to deliver the Services and shall not use Customer inputs or outputs to train or fine-tune any AI/ML models.\"",
    },
    {
      id: "CL-03",
      category: "Auto-Renewal",
      title: "Lange automatische Verlängerung (> 60 Tage Kündigungsfrist)",
      severity: "WARN",
      risk_eur: 18000,
      appliesTo: ["msa"],
      detectFail: (t) => /(90\s*(?:tage|days)|120\s*(?:tage|days)|automatisch.*12\s*monate|automatically\s+renew\s+for\s+(?:additional\s+)?(?:one|1)\s*year)/i.test(t) && !/(30\s*(?:tage|days)\s*(?:vor|prior))/i.test(t),
      note: "Auto-Renewal mit 90+ Tagen Frist entdeckt; auf 30 Tage vor Laufzeitende reduzieren.",
      redline_de: "Vorschlag DE: „Der Vertrag verlängert sich nur dann um jeweils 12 Monate, wenn er nicht mindestens 30 Tage vor Ablauf der jeweiligen Laufzeit in Textform gekündigt wird.“",
      redline_en: "Suggested EN: \"Either party may prevent renewal by written notice at least thirty (30) days prior to the end of the then-current term.\"",
    },
    {
      id: "CL-04",
      category: "Gerichtsstand & Recht",
      title: "Drittland-Recht / US-Gerichtsstand (z. B. Delaware / Kalifornien)",
      severity: "FAIL",
      risk_eur: 35000,
      appliesTo: ["msa", "nda"],
      detectFail: (t) => /(delaware|california|new\s+york|texas|england\s+and\s+wales)/i.test(t) && !/(deutsches\s+recht|german\s+law|bremen|münchen|frankfurt|berlin|hamburg)/i.test(t),
      note: "Fremdes Recht / Drittland-Gerichtsstand erhöht Prozess- und Durchsetzungskosten erheblich.",
      redline_de: "Vorschlag DE: „Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG). Ausschließlicher Gerichtsstand für Kaufleute ist der Sitz des Auftraggebers.“",
      redline_en: "Suggested EN: \"This Agreement is governed by the laws of Germany (excluding CISG). Exclusive venue for commercial disputes shall be Munich/Bremen, Germany.\"",
    },
    {
      id: "CL-05",
      category: "AVV / DSGVO Art. 28",
      title: "Subunternehmer ohne Vorab-Information & Einspruchsrecht",
      severity: "FAIL",
      risk_eur: 30000,
      appliesTo: ["avv", "msa"],
      detectFail: (t) => /(subprocessor|unterauftragsverarbeiter|subunternehmer)/i.test(t) && !/(30\s*(?:tage|days)|14\s*(?:tage|days)|einspruch|object|vorab)/i.test(t),
      note: "Art. 28 Abs. 2 DSGVO verlangt transparente Vorab-Information und Einspruchsfrist bei neuen Unterauftragsverarbeitern.",
      redline_de: "Vorschlag DE: „Der Auftragsverarbeiter informiert den Verantwortlichen mindestens 30 Kalendertage vor Hinzuziehung oder Änderung eines Unterauftragsverarbeiters schriftlich; bei wichtigem datenschutzrechtlichem Grund besteht ein Widerspruchs- bzw. Sonderkündigungsrecht.“",
      redline_en: "Suggested EN: \"Processor shall notify Controller at least thirty (30) days prior to adding or replacing any subprocessor, granting Controller the right to object on reasonable data protection grounds.\"",
    },
    {
      id: "CL-06",
      category: "Freistellung / Indemnity",
      title: "Einseitige / Unbegrenzte Freistellungspflicht (Indemnity)",
      severity: "WARN",
      risk_eur: 25000,
      appliesTo: ["msa", "nda"],
      detectFail: (t) => /(indemnify\s+and\s+hold\s+harmless|stellt.*von\s+sämtlichen\s+ansprüchen\s+frei)/i.test(t) && !/(mutual|gegenseitig|ip\s+infringement|schutzrechtsverletzung)/i.test(t),
      note: "Einseitige Freistellung sollte auf Dritt-Schutzrechtsverletzungen (IP) begrenzt und dem Liability Cap unterstellt sein.",
      redline_de: "Vorschlag DE: „Freistellungspflichten bestehen ausschließlich bei schuldhafter Verletzung von Schutzrechten Dritter durch die vertragliche Leistung und unterliegen der vereinbarten Haftungsobergrenze.“",
      redline_en: "Suggested EN: \"Indemnification obligations are limited to third-party IP infringement claims and remain subject to the general liability cap.\"",
    },
    {
      id: "CL-07",
      category: "Preisanpassung",
      title: "Einseitige unbegrenzte Preiserhöhungsklausel",
      severity: "WARN",
      risk_eur: 12000,
      appliesTo: ["msa"],
      detectFail: (t) => /(increase\s+fees\s+at\s+any\s+time|preise\s+jederzeit\s+anpassen|price\s+increase)/i.test(t) && !/(5\s*%|vpi|30\s*tage|sonderkündigung)/i.test(t),
      note: "Einseitige Preiserhöhungen ohne Cap (z. B. max. 5 % p.a.) oder Sonderkündigungsrecht markieren.",
      redline_de: "Vorschlag DE: „Preisanpassungen sind frühestens zur Vertragsverlängerung mit 60 Tagen Vorlauf und maximal bis zu 5 % p.a. zulässig; bei höherer Anpassung besteht ein Sonderkündigungsrecht.“",
      redline_en: "Suggested EN: \"Fee adjustments require 60 days prior notice upon renewal and are capped at 5% per annum, with a special termination right if exceeded.\"",
    },
    {
      id: "CL-08",
      category: "NDA Laufzeit & Rückgabe",
      title: "Überlange Geheimhaltungsfrist (>= 5 Jahre) ohne Rückgabepflicht",
      severity: "WARN",
      risk_eur: 10000,
      appliesTo: ["nda"],
      detectFail: (t) => /(5\s*(?:jahre|years)|10\s*(?:jahre|years)|perpetual|unbefristet)/i.test(t),
      note: "Übliche B2B-NDA-Nachlaufzeit beträgt 2–3 Jahre (Ausnahme: Geschäftsgeheimnisse nach GeschGehG).",
      redline_de: "Vorschlag DE: „Die Geheimhaltungspflicht endet 3 Jahre nach Beendigung des Austauschs, sofern kein gesetzliches Geschäftsgeheimnis im Sinne des GeschGehG betroffen ist. Auf Verlangen sind vertrauliche Unterlagen nachweislich zu löschen.“",
      redline_en: "Suggested EN: \"Confidentiality obligations survive for three (3) years following termination, except for statutory trade secrets. Confidential materials shall be returned or deleted upon written request.\"",
    },
    {
      id: "CL-09",
      category: "DSGVO TOMs & Löschung",
      title: "Fehlende Löschfrist nach Vertragsende (Art. 28 Abs. 3 lit. g DSGVO)",
      severity: "FAIL",
      risk_eur: 20000,
      appliesTo: ["avv"],
      detectFail: (t) => !/(löschung|rückgabe|deletion|return\s+of\s+(?:personal\s+)?data|30\s*tage.*lösch)/i.test(t),
      note: "Im AVV muss die Pflicht zur Löschung oder Rückgabe personenbezogener Daten binnen 30 Tagen nach Vertragsende stehen.",
      redline_de: "Vorschlag DE: „Nach Beendigung des Hauptvertrags sind sämtliche personenbezogenen Daten binnen 30 Tagen nach Wahl des Verantwortlichen herauszugeben oder DSGVO-konform zu löschen und dies schriftlich zu bestätigen.“",
      redline_en: "Suggested EN: \"Upon termination, Processor shall within 30 days return or securely delete all Personal Data at Controller's election and confirm deletion in writing.\"",
    },
    {
      id: "CL-10",
      category: "IP & Arbeitsergebnisse",
      title: "Unklare Rechteübertragung / Background-IP-Vermischung",
      severity: "WARN",
      risk_eur: 22000,
      appliesTo: ["msa", "nda"],
      detectFail: (t) => /(all\s+intellectual\s+property.*assign|sämtliche\s+rechte.*übertragen)/i.test(t) && !/(background\s+ip|vorbestehende\s+rechte)/i.test(t),
      note: "Vorbestehendes Background-IP (Methoden, Bibliotheken, Vorlagen) ausdrücklich von der Rechteübertragung ausnehmen.",
      redline_de: "Vorschlag DE: „Vorbestehende Schutzrechte und allgemeine Werkzeuge (Background IP) verbleiben beim jeweiligen Urheber; am vereinbarten Projektergebnis wird nach vollständiger Zahlung ein einfaches/ausschließliches Nutzungsrecht eingeräumt.“",
      redline_en: "Suggested EN: \"Each party retains all pre-existing Background IP. Deliverables are licensed/assigned solely upon full payment of agreed fees.\"",
    },
  ];

  const SAMPLES = {
    s1: {
      profile_name: "US-CloudVendor Enterprise MSA",
      mode: "msa",
      tone: "streng",
      contract_text:
        "1. Term & Auto-Renewal: This SaaS MSA shall automatically renew for additional one year periods unless terminated 90 days prior.\n" +
        "2. Fees: Provider may increase fees at any time with 15 days email notice.\n" +
        "3. Data & AI: Provider may use Customer Data to improve our AI and train machine learning models.\n" +
        "4. Liability & Indemnity: Customer shall indemnify and hold harmless Provider without limitation of liability (unlimited liability).\n" +
        "5. Subprocessors: Provider may engage subprocessors at its sole discretion.\n" +
        "6. Governing Law: Laws of the State of Delaware, USA.",
    },
    s2: {
      profile_name: "DACH-Standard AVV (Art. 28 DSGVO)",
      mode: "avv",
      tone: "partnerschaftlich",
      contract_text:
        "1. Gegenstand & Haftung: Es gilt deutsches Recht (Gerichtsstand Bremen). Die Haftung ist auf die 12-Monats-Jahresvergütung begrenzt.\n" +
        "2. KI-Verbot: Der Auftragsverarbeiter nutzt Kundendaten nicht zum KI-Training (no AI training).\n" +
        "3. Unterauftragsverarbeiter: Neue Subunternehmer werden 30 Tage vorab schriftlich mit Einspruchsrecht angekündigt.\n" +
        "4. Löschung & Rückgabe: Nach Vertragsende erfolgt die vollständige Löschung oder Rückgabe binnen 30 Tagen.",
    },
    s3: {
      profile_name: "B2B NDA mit Alt-Klauseln",
      mode: "nda",
      tone: "partnerschaftlich",
      contract_text:
        "1. Laufzeit: Die Geheimhaltungspflicht gilt 5 Jahre nach Vertragsende.\n" +
        "2. Haftung: Bei Verletzung haftet die empfangende Partei unbeschränkt (unbegrenzte Haftung).\n" +
        "3. Gerichtsstand: Delaware, USA.",
    },
  };

  function r2(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function analyzeContractText(input = {}) {
    const profileName = String(input.profile_name || META.default_profile);
    const mode = ["msa", "avv", "nda"].includes(input.mode) ? input.mode : "msa";
    const tone = String(input.tone || "streng");
    const text = String(input.contract_text || SAMPLES.s1.contract_text);

    const applicable = CLAUSE_RULES.filter((r) => r.appliesTo.includes(mode));
    const entries = [];
    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;
    let riskTotal = 0;
    const redlines = [];

    applicable.forEach((rule) => {
      const triggered = rule.detectFail(text);
      const status = triggered ? rule.severity : "PASS";
      if (status === "PASS") passCount += 1;
      else if (status === "WARN") warnCount += 1;
      else failCount += 1;

      const riskEur = triggered ? rule.risk_eur : 0;
      riskTotal += riskEur;

      if (triggered) {
        redlines.push(`[${rule.id} · ${rule.category}]\n${rule.redline_de}\n${rule.redline_en}`);
      }

      entries.push({
        id: rule.id,
        label: rule.title,
        category: rule.category,
        metric: triggered ? (status === "FAIL" ? 95 : 70) : 100,
        base_eur: rule.risk_eur,
        impact_eur: riskEur,
        status,
        note: triggered ? rule.note : "Klausel entspricht dem EchoMoral DACH/EU Playbook.",
        redline_de: triggered ? rule.redline_de : "",
        redline_en: triggered ? rule.redline_en : "",
      });
    });

    const total = entries.length || 1;
    const score = r2(((passCount + warnCount * 0.4) / total) * 100);
    const intro =
      tone === "partnerschaftlich"
        ? `Sehr geehrte Damen und Herren,\n\nanbei unsere gebündelten Playbook-Hinweise zu "${profileName}" (${mode.toUpperCase()}) für eine schnelle, partnerschaftliche Einigung:`
        : `[LEGAL / EINKAUF FREIGABE-GATE] ${profileName} (${mode.toUpperCase()}) — Folgende Klauseln erfordern vor Unterschrift zwingend Anpassung:`;

    const actionText = [
      intro,
      `Playbook-Compliance: ${score.toFixed(1)} % | FAIL: ${failCount} | WARN: ${warnCount} | Geschätztes Risiko-Exposure: ${riskTotal.toFixed(2)} EUR`,
      "",
      redlines.length ? redlines.join("\n\n") : "Keine Risikoklauseln gefunden — Vertrag entspricht dem DACH/EU-Playbook.",
      "",
      "Hinweis: Automatisierte Vorprüfung (100 % lokal im Browser via EchoMoral Legal by VeriTakt Collective) — keine Rechtsberatung (§ 2 RDG).",
    ].join("\n");

    const csvHeader = "ID;Kategorie;Klausel;Risiko_EUR;Status;Hinweis";
    const csvRows = entries.map((e) =>
      [e.id, e.category, e.label, e.impact_eur.toFixed(2), e.status, e.note]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(";")
    );

    return {
      ok: failCount === 0,
      project_id: META.pid,
      brand: META.brand,
      profile_name: profileName,
      mode,
      tone,
      readiness_percent: score,
      impact_eur: r2(riskTotal),
      annual_impact_eur: r2(riskTotal),
      summary: {
        total_count: entries.length,
        pass_count: passCount,
        warn_count: warnCount,
        fail_count: failCount,
      },
      entries,
      action_text: actionText,
      export_csv: "\uFEFF" + [csvHeader, ...csvRows].join("\n"),
    };
  }

  function formatAuditReportMarkdown(res) {
    return [
      `# EchoMoral Legal — Vertrags-Audit (${res.profile_name})`,
      `- **Playbook-Score:** ${res.readiness_percent} % | **FAIL:** ${res.summary.fail_count} | **WARN:** ${res.summary.warn_count}`,
      `- **Abgesichertes Risiko:** ${res.impact_eur.toFixed(2)} EUR`,
      "",
      res.action_text,
    ].join("\n");
  }

  function formatAuditReportJson(res) {
    return JSON.stringify(res, null, 2);
  }

  return {
    META,
    CLAUSE_RULES,
    SAMPLES,
    analyzeContractText,
    evaluateCase: analyzeContractText,
    formatAuditReportMarkdown,
    formatAuditReportJson,
  };
});
