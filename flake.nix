{
  description = "Rust Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    rust-overlay.url = "github:oxalica/rust-overlay";
    crane.url = "github:ipetkov/crane";
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      rust-overlay,
      crane,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          system = system;
        };
        pkgsCross = import nixpkgs {
          system = system;
          crossSystem = "aarch64-linux";
          overlays = [
            (import rust-overlay)
          ];
        };

        craneLib = (crane.mkLib pkgsCross).overrideToolchain (p: p.rust-bin.stable.latest.default);
      in
      {
        packages.agregcine_backend = craneLib.buildPackage {
          src = craneLib.cleanCargoSource ./agregcine_backend;
          strictDeps = true;

          CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_RUNNER = "qemu-aarch64";
          CARGO_BUILD_TARGET = "aarch64-unknown-linux-gnu";
          CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER =
            with pkgsCross.pkgsHostHost;
            "${stdenv.cc.targetPrefix}cc";
        };

        packages.agregcine_frontend =
          { base_url, presentation_text }:
          let
            config_json = pkgs.writeText "config.json" (
              builtins.toJSON {
                baseUrl = base_url;
                presentationText = presentation_text;
              }
            );

            sources = pkgs.stdenv.mkDerivation {
              name = "agregcine_frontend_sources";
              src = ./agregcine_frontend;

              installPhase = ''
                mkdir -p $out
                cp -r $src/* $out
                cp ${config_json} $out/config.json
              '';

            };
          in
          pkgs.buildNpmPackage {
            name = "agregcine_frontend";

            src = sources;
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
