# Password Generator Specs

This folder contains a local HTML password generator tool.

## Character Set (Fixed)
- Digits: 0 1 2 3 4 5 6 7 8 9
- Uppercase: A D E F H M N R T Y
- Lowercase: a d e f h m n r t y
- Symbols: @ # $

## Scope
- ASCII-only characters.
- No Japanese or non-ASCII characters.

## UI Requirements
- The user can select character groups via checkboxes:
  - Uppercase letters
  - Lowercase letters
  - Digits
  - Symbols
- The user can input the password length.
  - Default length is 8.
- The generated password should start with a letter (A-Z or a-z).
