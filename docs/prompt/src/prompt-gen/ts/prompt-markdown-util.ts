type PromptOutputOptions = {
  hallucinationGuardLevel: "none" | "low" | "high";
  outputMarkdownEnabled: boolean;
  outputTone: "unspecified" | "desumasu" | "dearu";
  selfReview: "unspecified" | "internal" | "report";
};

type PromptHallucinationGuardMode = "none" | "low" | "high";

type PromptOutputInstructionProfile = {
  hallucinationGuardMode: PromptHallucinationGuardMode | null;
  outputMarkdown: boolean;
  outputTone: "unspecified" | "desumasu" | "dearu";
  selfReview: "unspecified" | "internal" | "report";
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

let currentPromptOutputOptions: PromptOutputOptions = {
  hallucinationGuardLevel: "high",
  outputMarkdownEnabled: true,
  outputTone: "unspecified",
  selfReview: "unspecified"
};

function setPromptOutputOptions(options: PromptOutputOptions): void {
  currentPromptOutputOptions = {
    hallucinationGuardLevel: options.hallucinationGuardLevel || "none",
    outputMarkdownEnabled: options.outputMarkdownEnabled !== false,
    outputTone: options.outputTone || "unspecified",
    selfReview: options.selfReview || "unspecified"
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
    reportedSelfReviewInstruction
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
      templates.reportedSelfReviewInstruction,
      templates.internalSelfReviewInstruction,
      templates.dearuToneInstruction,
      templates.desumasuToneInstruction,
      templates.markdownFenceInstruction,
      templates.strictHallucinationPreventionInstruction,
      templates.softHallucinationPreventionInstruction
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

  if (options.hallucinationGuardLevel !== "none") {
    segments.push(
      (options.hallucinationGuardLevel || hallucinationGuardMode) === "low"
        ? softHallucinationPreventionInstruction
        : strictHallucinationPreventionInstruction
    );
  }
  if (options.outputMarkdownEnabled) {
    segments.push(markdownFenceInstruction);
  }
  if (options.outputTone === "desumasu") {
    segments.push(desumasuToneInstruction);
  } else if (options.outputTone === "dearu") {
    segments.push(dearuToneInstruction);
  }
  if (options.selfReview === "internal") {
    segments.push(internalSelfReviewInstruction);
  } else if (options.selfReview === "report") {
    segments.push(reportedSelfReviewInstruction);
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
