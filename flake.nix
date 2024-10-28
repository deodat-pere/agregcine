{
  description = "Rust Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    rust-overlay.url = "github:oxalica/rust-overlay";
    rust-overlay.inputs.nixpkgs.follows = "nixpkgs";

    crane.url = "github:ipetkov/crane";
  };

  outputs =
    {
      self,
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
          overlays = [
            (import rust-overlay)
          ];
        };
        pkgsCross = import nixpkgs {
          system = system;
          crossSystem = "aarch64-linux";
          overlays = [
            (import rust-overlay)
          ];
        };

        craneLib = (crane.mkLib pkgs).overrideToolchain (p: p.rust-bin.stable.latest.default);
        craneLibCross = (crane.mkLib pkgsCross).overrideToolchain (p: p.rust-bin.stable.latest.default);

        mkAgregcine_frontend =
          { base_url, presentation_text }:
          let
            config_json = pkgs.writeText "config.json" (
              builtins.toJSON {
                baseUrl = base_url;
                presentationText = presentation_text;
              }
            );

            sourcesWithConfig = pkgs.stdenv.mkDerivation {
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
            src = sourcesWithConfig;

            npmDeps = pkgs.importNpmLock {
              npmRoot = sourcesWithConfig;
            };
            npmConfigHook = pkgs.importNpmLock.npmConfigHook;

            installPhase = ''
              cp -r dist $out
            '';
          };

        mkNixosModule =
          {
            agregcine_backend,
          }:
          {
            pkgs,
            config,
            lib,
            ...
          }:
          {
            options.services.agregcine = {
              enable = lib.mkEnableOption "Enable agregcine";
              presentationText = lib.mkOption {
                type = lib.types.str;
                default = "Agregcine";
                description = "Text to display on the frontend";
              };
              backendConfig = lib.mkOption {
                type = lib.types.attrsOf lib.types.anything;
                default = { };
                description = "Configuration for the backend, leave the `server.static_files` option empty";
              };
            };

            config = lib.mkIf config.services.agregcine.enable (
              let
                agregcine_frontend = mkAgregcine_frontend {
                  base_url = "/api/";
                  presentation_text = config.services.agregcine.presentationText;
                };

                agregcine_backend_config = pkgs.writeText "config.json" (
                  builtins.toJSON (
                    lib.recursiveUpdate config.services.agregcine.backendConfig {
                      server.static_files = agregcine_frontend;
                    }
                  )
                );
              in
              {
                systemd.services.agregcine = {
                  enable = true;
                  description = "Agregcine";
                  wantedBy = [ "multi-user.target" ];
                  serviceConfig = {
                    Type = "simple";
                    ExecStart = "${lib.getExe agregcine_backend} -p ${agregcine_backend_config}";
                    Restart = "always";
                  };
                };
              }
            );
          };

        rust = pkgs.rust-bin.stable.latest.default.override {
          extensions = [
            "rust-analyzer"
            "rust-src"
          ];
        };
      in
      {
        devShell = pkgs.mkShell {
          buildInputs = [
            rust
            pkgs.nodejs
          ];
        };

        packages.agregcine_frontend = mkAgregcine_frontend {
          base_url = "/api/";
          presentation_text = "Agregcine";
        };

        packages.agregcine_backend = craneLib.buildPackage {
          src = craneLib.cleanCargoSource ./agregcine_backend;
          strictDeps = true;
          meta.mainProgram = "agregcine_backend";
        };

        packages.agregcine_backend-cross-aarch64 = craneLibCross.buildPackage {
          src = craneLibCross.cleanCargoSource ./agregcine_backend;
          strictDeps = true;
          meta.mainProgram = "agregcine_backend";

          CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_RUNNER = "qemu-aarch64";
          CARGO_BUILD_TARGET = "aarch64-unknown-linux-gnu";
          CARGO_TARGET_AARCH64_UNKNOWN_LINUX_GNU_LINKER =
            with pkgsCross.pkgsHostHost;
            "${stdenv.cc.targetPrefix}cc";
        };

        nixosModule = mkNixosModule { agregcine_backend = self.packages."${system}".agregcine_backend; };
        nixosModuleCrossAarch64 = mkNixosModule {
          agregcine_backend = self.packages."${system}".agregcine_backend-cross-aarch64;
        };
      }
    );
}
