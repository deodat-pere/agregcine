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
    }:
    (
      flake-utils.lib.eachDefaultSystem (
        system:
        let
          pkgs = import nixpkgs {
            system = system;
            overlays = [
              (import rust-overlay)
            ];
          };

        in
        rec {
          devShell = import ./nix/devShell.nix {
            inherit pkgs;
          };
          packages.agregcine_backend = import ./nix/backend.nix { inherit pkgs crane; };
          functions.mkAgregcine_frontend = import ./nix/frontend.nix { inherit pkgs; };
          nixosModule = import ./nix/nixosModule.nix {
            agregcine_backend = packages.agregcine_backend;
            mkAgregcine_frontend = functions.mkAgregcine_frontend;
          };

        }
      )
      // {
        checks = {
          backend = self.packages.aarch64-linux.agregcine_backend;
          frontend = self.functions.aarch64-linux.mkAgregcine_frontend {
            presentation_text = "Découvrez les films diffusés à Rennes cette semaine!";
          };
        };
      }
    );
}
