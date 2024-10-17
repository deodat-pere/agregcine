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
          { api_url }:
          pkgs.buildNpmPackage {
            name = "agregcine_frontend";

            src = ./agregcine_frontend;
            npmDepsHash = "sha256-M1cke/RVzHAwSjNr/zFx39DjUK2mXt2w82zgjAFT5s0=";

            installPhase = ''
              mkdir -p $out/static
              npm run build
              cp -r dist $out/dist
            '';

            VITE_API_URL = api_url;

            buildInputs = [
              pkgs.nodejs_18
            ];
          };
      }
    );
}
