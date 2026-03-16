type PromptOutputOptions = {
  hallucinationGuardLevel: "none" | "low" | "high";
  outputMarkdownEnabled: boolean;
  outputTone: "unspecified" | "desumasu" | "dearu";
  selfReview: "unspecified" | "internal" | "report";
  minimalDiffReview: "unspecified" | "report";
  misleadingExpressionReview: "unspecified" | "internal" | "report";
  considerationRiskReview: "unspecified" | "internal" | "report";
  discomfortRiskReview: "unspecified" | "internal" | "report";
  aggressiveExpressionReview: "unspecified" | "internal" | "report";
  sensitiveExpressionReview: "unspecified" | "internal" | "report";
  legalComplianceReview: "unspecified" | "internal" | "report";
  publicOrderReview: "unspecified" | "internal" | "report";
};

type PromptHallucinationGuardMode = "none" | "low" | "high";

type PromptOutputInstructionProfile = {
  hallucinationGuardMode: PromptHallucinationGuardMode | null;
  outputMarkdown: boolean;
  outputTone: "unspecified" | "desumasu" | "dearu";
  selfReview: "unspecified" | "internal" | "report";
  minimalDiffReview: "unspecified" | "report";
  misleadingExpressionReview: "unspecified" | "internal" | "report";
  considerationRiskReview: "unspecified" | "internal" | "report";
  discomfortRiskReview: "unspecified" | "internal" | "report";
  aggressiveExpressionReview: "unspecified" | "internal" | "report";
  sensitiveExpressionReview: "unspecified" | "internal" | "report";
  legalComplianceReview: "unspecified" | "internal" | "report";
  publicOrderReview: "unspecified" | "internal" | "report";
};

const strictHallucinationPreventionInstruction = `○ハルシネーション防止のため、次のルールに従ってください。
- 禁止: (1)今回のこの会話（セッション）および入力内容に明示されていない情報を、補完して記入してはいけません。 (2)会話にない情報を、もっともらしく埋めてはいけません。 (3)根拠がない内容を、確定情報として記載してはいけません。
- 代替行動: (1)情報不足の項目がある場合は、必要な追加質問を行ってください。 (2)追加質問できない場合、または質問後も根拠が不足する場合は、"不明" "未確認" "要確認" などと明示してください。 (3)判断材料が不足している場合は、無理に結論を書かず、不足している点を明示してください。
- 出力規則: (1)各項目は、今回のこの会話（セッション）および入力内容に根拠があるものだけを記入してください。 (2)推測を書く場合は、事実として断定せず、"推測:" と明示してください。 (3)未確認事項は事実として書かないでください。 (4)要約や整理を行う場合も、新しい事実を追加せず、与えられた情報の範囲内で表現してください。`;

const softHallucinationPreventionInstruction = `○事実誤認を避けるため、次のルールを意識してください。
- 注意: (1)今回のこの会話（セッション）および入力内容に明示されていない事実は、断定して記載しないでください。 (2)与えられた情報から直接は言えない内容は、事実と推測を混同しないでください。
- 代替行動: (1)情報が不足して判断しきれない場合は、その旨を明示してください。 (2)必要であれば、確認すべき追加質問や確認観点を示してください。
- 出力規則: (1)根拠がある事実と、推測・評価・提案は区別して記載してください。 (2)推測や評価を書く場合は、断定を避け、根拠や前提が分かるようにしてください。 (3)不明点が残る場合は、不明のまま扱ってください。`;

const markdownFenceInstruction = "○最終的な回答は Markdown テキスト形式で出力し、さらに ~~~~ で囲まれた一塊として出力してください。markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。";
const desumasuToneInstruction = "○文体は、です・ます調で統一してください。箇条書きは体言止めでも構いません。";
const dearuToneInstruction = "○文体は、である調で統一してください。箇条書きは体言止めでも構いません。";
const internalSelfReviewInstruction = `○回答案を作成したあと、第三者のレビューアの視点に切り替えて自己レビューしてください。
- 依頼者にとって分かりやすいか、抜け漏れがないか、過不足がないか、構成が自然かを見直してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 自己レビューの途中経過や思考過程は出力しないでください。`;
const reportedSelfReviewInstruction = `○回答案を作成したあと、第三者のレビューアの視点に切り替えて自己レビューしてください。
- 依頼者にとって分かりやすいか、抜け漏れがないか、過不足がないか、構成が自然かを見直してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 最終回答の末尾に \`自己レビュー\` セクションを追加し、見直した観点と、必要に応じて修正点を簡潔に記載してください。
- 自己レビューの途中経過や思考過程は出力せず、レビュー結果だけを簡潔に記載してください。`;
const reportedMinimalDiffReviewInstruction = `○回答案を作成したあと、あなた自身の判断として内容を見直してください。
- 事実、評価、提案を混同していないかを確認してください。
- \`依頼どおりの結果\` とは別に、あなた自身が今回 \`最小差分で割り切った点\` と、\`本来対応すべきだったと考える理想形または代替案\` を整理してください。
- \`最小差分で割り切った点\` や \`本来対応すべきだったと考える理想形または代替案\` がある場合でも、\`依頼どおりの結果\` を先に提示し、その後ろに補足として追記してください。
- \`依頼どおりの結果\` の本文は書き換えず、追加が必要な場合は補足として区別して記載してください。
- 補足は次の順序で記載してください: 1. \`今回の対応を最小差分で割り切った点\`, 2. \`あなたが本来志向していた理想形\`, 3. \`理想形を採ったほうがよい理由\`, 4. \`将来的に整理・再設計の余地があるか\`
- 最終回答の末尾に \`自己判断メモ\` セクションを追加し、見直した観点と、必要に応じて補足した内容を記載してください。
- 自己判断の過程は必要に応じて記載して構いません。補足を記載する場合は、その理由や判断根拠が分かるようにしてください。`;
const internalMisleadingExpressionReviewInstruction = `○回答案を作成したあと、誤解を招く表現がないかを観点として見直してください。
- 読み手が別の意味に受け取りそうな表現、主語や対象が曖昧な表現、断定が強すぎる表現があれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 見直しの途中経過や思考過程は出力しないでください。`;
const reportedMisleadingExpressionReviewInstruction = `○回答案を作成したあと、誤解を招く表現がないかを観点として見直してください。
- 読み手が別の意味に受け取りそうな表現、主語や対象が曖昧な表現、断定が強すぎる表現があれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 最終回答の末尾に \`誤解表現レビュー\` セクションを追加し、見直した観点と、必要に応じて修正点を簡潔に記載してください。
- 見直しの途中経過や思考過程は出力せず、レビュー結果だけを簡潔に記載してください。`;
const internalConsiderationRiskReviewInstruction = `○回答案を作成したあと、配慮不足リスクがないかを観点として見直してください。
- 相手や状況への配慮が不足して見える表現、断定的すぎる言い回し、受け手への負荷が高い表現があれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 見直しの途中経過や思考過程は出力しないでください。`;
const reportedConsiderationRiskReviewInstruction = `○回答案を作成したあと、配慮不足リスクがないかを観点として見直してください。
- 相手や状況への配慮が不足して見える表現、断定的すぎる言い回し、受け手への負荷が高い表現があれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 最終回答の末尾に \`配慮不足レビュー\` セクションを追加し、見直した観点と、必要に応じて修正点を簡潔に記載してください。
- 見直しの途中経過や思考過程は出力せず、レビュー結果だけを簡潔に記載してください。`;
const internalDiscomfortRiskReviewInstruction = `○回答案を作成したあと、不快感リスクがないかを観点として見直してください。
- 読み手に不快感を与えやすい表現、不要にきつい語調、印象を悪くしやすい言い回しがあれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 見直しの途中経過や思考過程は出力しないでください。`;
const reportedDiscomfortRiskReviewInstruction = `○回答案を作成したあと、不快感リスクがないかを観点として見直してください。
- 読み手に不快感を与えやすい表現、不要にきつい語調、印象を悪くしやすい言い回しがあれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 最終回答の末尾に \`不快感レビュー\` セクションを追加し、見直した観点と、必要に応じて修正点を簡潔に記載してください。
- 見直しの途中経過や思考過程は出力せず、レビュー結果だけを簡潔に記載してください。`;
const internalAggressiveExpressionReviewInstruction = `○回答案を作成したあと、攻撃的な表現がないかを観点として見直してください。
- 相手を責めるように読める表現、強すぎる否定、対立を unnecessary に強める言い回しがあれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 見直しの途中経過や思考過程は出力しないでください。`;
const reportedAggressiveExpressionReviewInstruction = `○回答案を作成したあと、攻撃的な表現がないかを観点として見直してください。
- 相手を責めるように読める表現、強すぎる否定、対立を unnecessary に強める言い回しがあれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 最終回答の末尾に \`攻撃性レビュー\` セクションを追加し、見直した観点と、必要に応じて修正点を簡潔に記載してください。
- 見直しの途中経過や思考過程は出力せず、レビュー結果だけを簡潔に記載してください。`;
const internalSensitiveExpressionReviewInstruction = `○回答案を作成したあと、センシティブな表現がないかを観点として見直してください。
- 読み手によっては慎重な扱いが必要な表現、センシティブな話題への不用意な言及、配慮不足に見える言い回しがあれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 見直しの途中経過や思考過程は出力しないでください。`;
const reportedSensitiveExpressionReviewInstruction = `○回答案を作成したあと、センシティブな表現がないかを観点として見直してください。
- 読み手によっては慎重な扱いが必要な表現、センシティブな話題への不用意な言及、配慮不足に見える言い回しがあれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 最終回答の末尾に \`センシティブ表現レビュー\` セクションを追加し、見直した観点と、必要に応じて修正点を簡潔に記載してください。
- 見直しの途中経過や思考過程は出力せず、レビュー結果だけを簡潔に記載してください。`;
const internalLegalComplianceReviewInstruction = `○回答案を作成したあと、法令遵守の観点で問題がないかを見直してください。
- 日本の法令を基準として、違法行為の助長、法的に問題となりうる指示や表現、誤解を招きやすい記述があれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 見直しの途中経過や思考過程は出力しないでください。`;
const reportedLegalComplianceReviewInstruction = `○回答案を作成したあと、法令遵守の観点で問題がないかを見直してください。
- 日本の法令を基準として、違法行為の助長、法的に問題となりうる指示や表現、誤解を招きやすい記述があれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 最終回答の末尾に \`法令遵守レビュー\` セクションを追加し、見直した観点と、必要に応じて修正点を簡潔に記載してください。
- 見直しの途中経過や思考過程は出力せず、レビュー結果だけを簡潔に記載してください。`;
const internalPublicOrderReviewInstruction = `○回答案を作成したあと、公序良俗の観点で問題がないかを見直してください。
- 日本を基準として、公序良俗に反するおそれのある内容、社会通念上不適切に受け取られうる表現、過度に扇情的または有害と受け取られうる記述があれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 見直しの途中経過や思考過程は出力しないでください。`;
const reportedPublicOrderReviewInstruction = `○回答案を作成したあと、公序良俗の観点で問題がないかを見直してください。
- 日本を基準として、公序良俗に反するおそれのある内容、社会通念上不適切に受け取られうる表現、過度に扇情的または有害と受け取られうる記述があれば修正してください。
- 必要があれば本文を修正し、改善後の内容を最終回答として出力してください。
- 最終回答の末尾に \`公序良俗レビュー\` セクションを追加し、見直した観点と、必要に応じて修正点を簡潔に記載してください。
- 見直しの途中経過や思考過程は出力せず、レビュー結果だけを簡潔に記載してください。`;

let currentPromptOutputOptions: PromptOutputOptions = {
  hallucinationGuardLevel: "high",
  outputMarkdownEnabled: true,
  outputTone: "unspecified",
  selfReview: "unspecified",
  minimalDiffReview: "unspecified",
  misleadingExpressionReview: "unspecified",
  considerationRiskReview: "unspecified",
  discomfortRiskReview: "unspecified",
  aggressiveExpressionReview: "unspecified",
  sensitiveExpressionReview: "unspecified",
  legalComplianceReview: "unspecified",
  publicOrderReview: "unspecified"
};

function setPromptOutputOptions(options: PromptOutputOptions): void {
  currentPromptOutputOptions = {
    hallucinationGuardLevel: options.hallucinationGuardLevel || "none",
    outputMarkdownEnabled: options.outputMarkdownEnabled !== false,
    outputTone: options.outputTone || "unspecified",
    selfReview: options.selfReview || "unspecified",
    minimalDiffReview: options.minimalDiffReview || "unspecified",
    misleadingExpressionReview: options.misleadingExpressionReview || "unspecified",
    considerationRiskReview: options.considerationRiskReview || "unspecified",
    discomfortRiskReview: options.discomfortRiskReview || "unspecified",
    aggressiveExpressionReview: options.aggressiveExpressionReview || "unspecified",
    sensitiveExpressionReview: options.sensitiveExpressionReview || "unspecified",
    legalComplianceReview: options.legalComplianceReview || "unspecified",
    publicOrderReview: options.publicOrderReview || "unspecified"
  };
}

function getPromptOutputInstructionTemplates() {
  return {
    strictHallucinationPreventionInstruction,
    softHallucinationPreventionInstruction,
    markdownFenceInstruction,
    desumasuToneInstruction,
    dearuToneInstruction,
    internalSelfReviewInstruction,
    reportedSelfReviewInstruction,
    reportedMinimalDiffReviewInstruction,
    internalMisleadingExpressionReviewInstruction,
    reportedMisleadingExpressionReviewInstruction,
    internalConsiderationRiskReviewInstruction,
    reportedConsiderationRiskReviewInstruction,
    internalDiscomfortRiskReviewInstruction,
    reportedDiscomfortRiskReviewInstruction,
    internalAggressiveExpressionReviewInstruction,
    reportedAggressiveExpressionReviewInstruction,
    internalSensitiveExpressionReviewInstruction,
    reportedSensitiveExpressionReviewInstruction,
    internalLegalComplianceReviewInstruction,
    reportedLegalComplianceReviewInstruction,
    internalPublicOrderReviewInstruction,
    reportedPublicOrderReviewInstruction
  };
}

function trimTrailingPromptSeparators(value: string): string {
  return String(value || "").replace(/(?:\s*\n\s*)+$/g, "").trimEnd();
}

function inferPromptOutputInstructionProfile(body: string): PromptOutputInstructionProfile {
  const templates = getPromptOutputInstructionTemplates();
  const normalizedBody = String(body || "");
  return {
    hallucinationGuardMode: normalizedBody.includes(templates.strictHallucinationPreventionInstruction)
      ? "high"
      : normalizedBody.includes(templates.softHallucinationPreventionInstruction)
        ? "low"
        : "none",
    outputMarkdown: normalizedBody.includes(templates.markdownFenceInstruction),
    outputTone: normalizedBody.includes(templates.desumasuToneInstruction)
      ? "desumasu"
      : normalizedBody.includes(templates.dearuToneInstruction)
        ? "dearu"
        : "unspecified",
    selfReview: normalizedBody.includes(templates.reportedSelfReviewInstruction)
      ? "report"
      : normalizedBody.includes(templates.internalSelfReviewInstruction)
        ? "internal"
        : "unspecified",
    minimalDiffReview: normalizedBody.includes(templates.reportedMinimalDiffReviewInstruction)
      ? "report"
      : "unspecified",
    misleadingExpressionReview: normalizedBody.includes(templates.reportedMisleadingExpressionReviewInstruction)
      ? "report"
      : normalizedBody.includes(templates.internalMisleadingExpressionReviewInstruction)
        ? "internal"
        : "unspecified",
    considerationRiskReview: normalizedBody.includes(templates.reportedConsiderationRiskReviewInstruction)
      ? "report"
      : normalizedBody.includes(templates.internalConsiderationRiskReviewInstruction)
        ? "internal"
        : "unspecified",
    discomfortRiskReview: normalizedBody.includes(templates.reportedDiscomfortRiskReviewInstruction)
      ? "report"
      : normalizedBody.includes(templates.internalDiscomfortRiskReviewInstruction)
        ? "internal"
        : "unspecified",
    aggressiveExpressionReview: normalizedBody.includes(templates.reportedAggressiveExpressionReviewInstruction)
      ? "report"
      : normalizedBody.includes(templates.internalAggressiveExpressionReviewInstruction)
        ? "internal"
        : "unspecified",
    sensitiveExpressionReview: normalizedBody.includes(templates.reportedSensitiveExpressionReviewInstruction)
      ? "report"
      : normalizedBody.includes(templates.internalSensitiveExpressionReviewInstruction)
        ? "internal"
        : "unspecified",
    legalComplianceReview: normalizedBody.includes(templates.reportedLegalComplianceReviewInstruction)
      ? "report"
      : normalizedBody.includes(templates.internalLegalComplianceReviewInstruction)
        ? "internal"
        : "unspecified",
    publicOrderReview: normalizedBody.includes(templates.reportedPublicOrderReviewInstruction)
      ? "report"
      : normalizedBody.includes(templates.internalPublicOrderReviewInstruction)
        ? "internal"
        : "unspecified"
  };
}

function stripPromptOutputInstructions(body: string): string {
  const templates = getPromptOutputInstructionTemplates();
  let normalizedBody = trimTrailingPromptSeparators(body);
  let changed = true;

  while (changed) {
    changed = false;
    for (const template of [
      templates.reportedPublicOrderReviewInstruction,
      templates.internalPublicOrderReviewInstruction,
      templates.reportedLegalComplianceReviewInstruction,
      templates.internalLegalComplianceReviewInstruction,
      templates.reportedSensitiveExpressionReviewInstruction,
      templates.internalSensitiveExpressionReviewInstruction,
      templates.reportedAggressiveExpressionReviewInstruction,
      templates.internalAggressiveExpressionReviewInstruction,
      templates.reportedDiscomfortRiskReviewInstruction,
      templates.internalDiscomfortRiskReviewInstruction,
      templates.reportedConsiderationRiskReviewInstruction,
      templates.internalConsiderationRiskReviewInstruction,
      templates.reportedMisleadingExpressionReviewInstruction,
      templates.internalMisleadingExpressionReviewInstruction,
      templates.reportedSelfReviewInstruction,
      templates.internalSelfReviewInstruction,
      templates.reportedMinimalDiffReviewInstruction,
      templates.strictHallucinationPreventionInstruction,
      templates.softHallucinationPreventionInstruction,
      templates.dearuToneInstruction,
      templates.desumasuToneInstruction,
      templates.markdownFenceInstruction,
    ]) {
      if (!template || !normalizedBody.endsWith(template)) {
        continue;
      }
      normalizedBody = trimTrailingPromptSeparators(normalizedBody.slice(0, normalizedBody.length - template.length));
      changed = true;
    }
  }

  return normalizedBody;
}

function appendPromptOutputInstructions(
  body: string,
  options: PromptOutputOptions,
  hallucinationGuardMode: PromptHallucinationGuardMode = "high"
): string {
  const normalizedBody = trimTrailingPromptSeparators(body);
  if (!normalizedBody) {
    return "";
  }

  const segments = [normalizedBody];

  if (options.outputMarkdownEnabled) {
    segments.push(markdownFenceInstruction);
  }
  if (options.outputTone === "desumasu") {
    segments.push(desumasuToneInstruction);
  } else if (options.outputTone === "dearu") {
    segments.push(dearuToneInstruction);
  }
  if (options.hallucinationGuardLevel !== "none") {
    segments.push(
      (options.hallucinationGuardLevel || hallucinationGuardMode) === "low"
        ? softHallucinationPreventionInstruction
        : strictHallucinationPreventionInstruction
    );
  }
  if (options.selfReview === "internal") {
    segments.push(internalSelfReviewInstruction);
  } else if (options.selfReview === "report") {
    segments.push(reportedSelfReviewInstruction);
  }
  if (options.minimalDiffReview === "report") {
    segments.push(reportedMinimalDiffReviewInstruction);
  }
  if (options.misleadingExpressionReview === "internal") {
    segments.push(internalMisleadingExpressionReviewInstruction);
  } else if (options.misleadingExpressionReview === "report") {
    segments.push(reportedMisleadingExpressionReviewInstruction);
  }
  if (options.considerationRiskReview === "internal") {
    segments.push(internalConsiderationRiskReviewInstruction);
  } else if (options.considerationRiskReview === "report") {
    segments.push(reportedConsiderationRiskReviewInstruction);
  }
  if (options.discomfortRiskReview === "internal") {
    segments.push(internalDiscomfortRiskReviewInstruction);
  } else if (options.discomfortRiskReview === "report") {
    segments.push(reportedDiscomfortRiskReviewInstruction);
  }
  if (options.aggressiveExpressionReview === "internal") {
    segments.push(internalAggressiveExpressionReviewInstruction);
  } else if (options.aggressiveExpressionReview === "report") {
    segments.push(reportedAggressiveExpressionReviewInstruction);
  }
  if (options.sensitiveExpressionReview === "internal") {
    segments.push(internalSensitiveExpressionReviewInstruction);
  } else if (options.sensitiveExpressionReview === "report") {
    segments.push(reportedSensitiveExpressionReviewInstruction);
  }
  if (options.legalComplianceReview === "internal") {
    segments.push(internalLegalComplianceReviewInstruction);
  } else if (options.legalComplianceReview === "report") {
    segments.push(reportedLegalComplianceReviewInstruction);
  }
  if (options.publicOrderReview === "internal") {
    segments.push(internalPublicOrderReviewInstruction);
  } else if (options.publicOrderReview === "report") {
    segments.push(reportedPublicOrderReviewInstruction);
  }

  return segments.join("\n\n");
}

function getMarkdownFenceInstruction(): string {
  return currentPromptOutputOptions.outputMarkdownEnabled ? markdownFenceInstruction : "";
}

function appendMarkdownFenceInstruction(body: string): string {
  const instruction = getMarkdownFenceInstruction();
  return instruction ? `${body}\n\n${instruction}` : body;
}

function getStrictHallucinationPreventionInstruction(): string {
  return currentPromptOutputOptions.hallucinationGuardLevel === "high" ? strictHallucinationPreventionInstruction : "";
}

function getSoftHallucinationPreventionInstruction(): string {
  return currentPromptOutputOptions.hallucinationGuardLevel === "low" ? softHallucinationPreventionInstruction : "";
}

function getTodoReflectionInstruction(): string {
  return "今回の作業結果は、必要に応じて TODO.md に反映してください。関連する既存の TODO があれば補強・更新し、該当する記述がなければ新規の TODO を追加してください。";
}
