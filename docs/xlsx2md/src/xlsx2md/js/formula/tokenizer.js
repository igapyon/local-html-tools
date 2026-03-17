(function initXlsx2mdFormulaTokenizer(global) {
    var _a;
    var _b;
    const api = ((_a = (_b = global).__xlsx2mdFormula) !== null && _a !== void 0 ? _a : (_b.__xlsx2mdFormula = {}));
    const CELL_REF_RE = /^\$?[A-Za-z]{1,3}\$?\d+$/;
    const IDENTIFIER_START_RE = /[\p{L}_\\$]/u;
    const IDENTIFIER_PART_RE = /[\p{L}\p{N}_.\\$?]/u;
    function tokenizeFormula(input) {
        const source = normalizeFormulaInput(input);
        const tokens = [];
        let index = 0;
        while (index < source.length) {
            const char = source[index];
            if (/\s/.test(char)) {
                index += 1;
                continue;
            }
            const start = index;
            if (char === "\"") {
                const parsed = readStringLiteral(source, index);
                tokens.push({
                    type: "string",
                    value: parsed.value,
                    start,
                    end: parsed.end
                });
                index = parsed.end;
                continue;
            }
            if (char === "'") {
                const parsed = readQuotedIdentifier(source, index);
                tokens.push({
                    type: "quoted_identifier",
                    value: parsed.value,
                    start,
                    end: parsed.end
                });
                index = parsed.end;
                continue;
            }
            if (char === "#") {
                const parsed = readErrorLiteral(source, index);
                tokens.push({
                    type: "error",
                    value: parsed.value,
                    start,
                    end: parsed.end
                });
                index = parsed.end;
                continue;
            }
            if (/[0-9.]/.test(char)) {
                const parsed = readNumberLiteral(source, index);
                if (parsed) {
                    tokens.push({
                        type: "number",
                        value: parsed.value,
                        start,
                        end: parsed.end
                    });
                    index = parsed.end;
                    continue;
                }
            }
            if ("(),:![]".includes(char)) {
                tokens.push({
                    type: punctuationTypeFor(char),
                    value: char,
                    start,
                    end: start + 1
                });
                index += 1;
                continue;
            }
            const operator = readOperator(source, index);
            if (operator) {
                tokens.push({
                    type: "operator",
                    value: operator,
                    start,
                    end: start + operator.length
                });
                index += operator.length;
                continue;
            }
            if (isIdentifierStart(char)) {
                const parsed = readIdentifierLike(source, index);
                const upperValue = parsed.value.toUpperCase();
                tokens.push({
                    type: upperValue === "TRUE" || upperValue === "FALSE"
                        ? "boolean"
                        : isCellReference(parsed.value)
                            ? "cell"
                            : "identifier",
                    value: parsed.value,
                    start,
                    end: parsed.end
                });
                index = parsed.end;
                continue;
            }
            throw new Error(`Unexpected formula token at ${index}: ${char}`);
        }
        return tokens;
    }
    function normalizeFormulaInput(input) {
        return input.startsWith("=") ? input.slice(1) : input;
    }
    function readStringLiteral(source, start) {
        let index = start + 1;
        let value = "";
        while (index < source.length) {
            const char = source[index];
            if (char === "\"") {
                if (source[index + 1] === "\"") {
                    value += "\"";
                    index += 2;
                    continue;
                }
                return { value, end: index + 1 };
            }
            value += char;
            index += 1;
        }
        throw new Error(`Unterminated string literal at ${start}`);
    }
    function readQuotedIdentifier(source, start) {
        let index = start + 1;
        let value = "";
        while (index < source.length) {
            const char = source[index];
            if (char === "'") {
                if (source[index + 1] === "'") {
                    value += "'";
                    index += 2;
                    continue;
                }
                return { value, end: index + 1 };
            }
            value += char;
            index += 1;
        }
        throw new Error(`Unterminated quoted identifier at ${start}`);
    }
    function readErrorLiteral(source, start) {
        let index = start + 1;
        while (index < source.length && /[A-Za-z0-9/!?#]/.test(source[index])) {
            index += 1;
        }
        return { value: source.slice(start, index), end: index };
    }
    function readNumberLiteral(source, start) {
        const slice = source.slice(start);
        const match = slice.match(/^(?:\d+\.\d*|\.\d+|\d+)(?:[Ee][+\-]?\d+)?/);
        if (!match) {
            return null;
        }
        return {
            value: match[0],
            end: start + match[0].length
        };
    }
    function punctuationTypeFor(char) {
        switch (char) {
            case "(":
                return "lparen";
            case ")":
                return "rparen";
            case ",":
                return "comma";
            case ":":
                return "colon";
            case "!":
                return "bang";
            case "[":
                return "lbracket";
            case "]":
                return "rbracket";
            default:
                throw new Error(`Unknown punctuation: ${char}`);
        }
    }
    function readOperator(source, start) {
        const twoChar = source.slice(start, start + 2);
        if (twoChar === "<>" || twoChar === "<=" || twoChar === ">=") {
            return twoChar;
        }
        const oneChar = source[start];
        return "+-*/&=<>%".includes(oneChar) ? oneChar : null;
    }
    function isIdentifierStart(char) {
        return IDENTIFIER_START_RE.test(char);
    }
    function isIdentifierPart(char) {
        return IDENTIFIER_PART_RE.test(char);
    }
    function readIdentifierLike(source, start) {
        let index = start;
        while (index < source.length && isIdentifierPart(source[index])) {
            index += 1;
        }
        return {
            value: source.slice(start, index),
            end: index
        };
    }
    function isCellReference(value) {
        return CELL_REF_RE.test(value);
    }
    api.tokenizeFormula = tokenizeFormula;
    api.normalizeFormulaInput = normalizeFormulaInput;
    api.isCellReference = isCellReference;
})(globalThis);
