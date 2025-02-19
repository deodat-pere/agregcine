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
    (flake-utils.lib.eachDefaultSystem (
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
        packages.agregcine_frontend = import ./nix/frontend.nix { inherit pkgs; };
        nixosModule = import ./nix/nixosModule.nix {
          agregcine_backend = packages.agregcine_backend;
          agregcine_frontend = packages.agregcine_frontend;
        };

      }
    ));
}
