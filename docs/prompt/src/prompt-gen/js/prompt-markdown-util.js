const strictHallucinationPreventionInstruction = `○ハルシネーション防止のため、次のルールに従ってください。
- 禁止: (1)今回のこの会話（セッション）および入力内容に明示されていない情報を、補完して記入してはいけません。 (2)会話にない情報を、もっともらしく埋めてはいけません。 (3)根拠がない内容を、確定情報として記載してはいけません。
- 代替行動: (1)情報不足の項目がある場合は、必要な追加質問を行ってください。 (2)追加質問できない場合、または質問後も根拠が不足する場合は、"不明" "未確認" "要確認" などと明示してください。 (3)判断材料が不足している場合は、無理に結論を書かず、不足している点を明示してください。
- 出力規則: (1)各項目は、今回のこの会話（セッション）および入力内容に根拠があるものだけを記入してください。 (2)推測を書く場合は、事実として断定せず、"推測:" と明示してください。 (3)未確認事項は事実として書かないでください。 (4)要約や整理を行う場合も、新しい事実を追加せず、与えられた情報の範囲内で表現してください。`;
const softHallucinationPreventionInstruction = `○事実誤認を避けるため、次のルールを意識してください。

注意:
- 今回のこの会話（セッション）および入力内容に明示されていない事実は、断定して記載しないでください。
- 与えられた情報から直接は言えない内容は、事実と推測を混同しないでください。

代替行動:
- 情報が不足して判断しきれない場合は、その旨を明示してください。
- 必要であれば、確認すべき追加質問や確認観点を示してください。

出力規則:
- 根拠がある事実と、推測・評価・提案は区別して記載してください。
- 推測や評価を書く場合は、断定を避け、根拠や前提が分かるようにしてください。
- 不明点が残る場合は、不明のまま扱ってください。`;
const markdownFenceInstruction = "○最終的な回答は ~~~~ で囲まれた一塊として出力してください。markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。";
let currentPromptOutputOptions = {
    hallucinationGuardEnabled: true,
    outputMarkdownEnabled: true
};
function setPromptOutputOptions(options) {
    currentPromptOutputOptions = {
        hallucinationGuardEnabled: options.hallucinationGuardEnabled !== false,
        outputMarkdownEnabled: options.outputMarkdownEnabled !== false
    };
}
function getPromptOutputInstructionTemplates() {
    return {
        strictHallucinationPreventionInstruction,
        softHallucinationPreventionInstruction,
        markdownFenceInstruction
    };
}
function getMarkdownFenceInstruction() {
    return currentPromptOutputOptions.outputMarkdownEnabled ? markdownFenceInstruction : "";
}
function appendMarkdownFenceInstruction(body) {
    const instruction = getMarkdownFenceInstruction();
    return instruction ? `${body}\n\n${instruction}` : body;
}
function getStrictHallucinationPreventionInstruction() {
    return currentPromptOutputOptions.hallucinationGuardEnabled ? strictHallucinationPreventionInstruction : "";
}
function getSoftHallucinationPreventionInstruction() {
    return currentPromptOutputOptions.hallucinationGuardEnabled ? softHallucinationPreventionInstruction : "";
}
function getTodoReflectionInstruction() {
    return "必要に応じて、今回の作業結果を TODO.md に反映してください。関連する既存の TODO があれば補強・更新し、該当する記述がなければ新規の TODO を追加してください。";
}
