{
  description = "Rust Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    rust-overlay.url = "github:oxalica/rust-overlay";
    rust-overlay.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      rust-overlay,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          overlays = [
            (import rust-overlay)
          ];
          system = "x86_64-linux";
        };
      in
      {
        packages.agregcine_backend = pkgs.rustPlatform.buildRustPackage {
          pname = "agregcine_backend";
          version = "0.1.0";
          src = ./agregcine_backend;
          cargoLock.lockFile = ./agregcine_backend/Cargo.lock;
        };

        packages.agregcine_frontend = pkgs.buildNpmPackage {
          name = "agregcine_frontend";

          src = ./agregcine_frontend;
          npmDepsHash = "sha256-M1cke/RVzHAwSjNr/zFx39DjUK2mXt2w82zgjAFT5s0=";

          installPhase = ''
            mkdir -p $out/static
            npm run build
            cp -r dist $out/dist
          '';

          buildInputs = [
            pkgs.nodejs_18
          ];
        };
      }
    );
}
