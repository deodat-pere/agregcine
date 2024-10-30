{ pkgs, ... }:
{
  presentation_text ? "Agregcine",
}:

let
  config_json = pkgs.writeText "config.json" (
    builtins.toJSON {
      baseUrl = "/api/";
      presentationText = presentation_text;
    }
  );

  sourcesWithConfig = pkgs.stdenv.mkDerivation {
    name = "agregcine_frontend_sources";
    src = ../agregcine_frontend;

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
}
