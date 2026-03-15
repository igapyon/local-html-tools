function getMarkdownFenceInstruction() {
    return "最終的な回答は ~~~~ で囲まれた一塊として出力してください。markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。";
}
function appendMarkdownFenceInstruction(body) {
    return `${body}\n\n${getMarkdownFenceInstruction()}`;
}
function getTodoReflectionInstruction() {
    return "必要に応じて、今回の作業結果を TODO.md に反映してください。関連する既存の TODO があれば補強・更新し、該当する記述がなければ新規の TODO を追加してください。";
}
