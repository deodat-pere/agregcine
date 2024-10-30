{ pkgs, ... }:
let
  rust = pkgs.rust-bin.stable.latest.default.override {
    extensions = [
      "rust-analyzer"
      "rust-src"
    ];
  };
in
pkgs.mkShell {
  buildInputs = [
    rust
    pkgs.nodejs
  ];
}
