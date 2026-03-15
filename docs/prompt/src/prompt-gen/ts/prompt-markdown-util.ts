function getMarkdownFenceInstruction(): string {
  return "○最終的な回答は ~~~~ で囲まれた一塊として出力してください。markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。";
}

function appendMarkdownFenceInstruction(body: string): string {
  return `${body}\n\n${getMarkdownFenceInstruction()}`;
}

function getHallucinationPreventionInstruction(): string {
  return `○ハルシネーション防止のため、次のルールに従ってください。

禁止:
- 今回のこの会話（セッション）および入力内容に明示されていない情報を、補完して記入してはいけません。
- 会話にない情報を、もっともらしく埋めてはいけません。

代替行動:
- 情報不足の項目がある場合は、必要な追加質問を行ってください。
- 追加質問できない場合、または質問後も根拠が不足する場合は、"不明" "未確認" "要確認" などと明示してください。

出力規則:
- 各項目は、今回のこの会話（セッション）および入力内容に根拠があるものだけを記入してください。
- 推測を書く場合は、事実として断定せず、"推測:" と明示してください。
- 未確認事項は事実として書かないでください。`;
}

function getTodoReflectionInstruction(): string {
  return "必要に応じて、今回の作業結果を TODO.md に反映してください。関連する既存の TODO があれば補強・更新し、該当する記述がなければ新規の TODO を追加してください。";
}
