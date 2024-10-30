{
  agregcine_backend,
  mkAgregcine_frontend,
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
}
