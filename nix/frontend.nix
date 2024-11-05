{ pkgs, ... }:
pkgs.buildNpmPackage {
  name = "agregcine_frontend";
  src = ../agregcine_frontend;

  npmDeps = pkgs.importNpmLock {
    npmRoot = ../agregcine_frontend;
  };
  npmConfigHook = pkgs.importNpmLock.npmConfigHook;

  installPhase = ''
    cp -r dist $out
  '';
}
