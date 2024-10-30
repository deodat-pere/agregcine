{ pkgs, crane, ... }:
let
  craneLib = (crane.mkLib pkgs).overrideToolchain (p: p.rust-bin.stable.latest.default);
in
craneLib.buildPackage {
  src = craneLib.cleanCargoSource ../agregcine_backend;
  strictDeps = true;
  meta.mainProgram = "agregcine_backend";
}
