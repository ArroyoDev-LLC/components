{
  description = "ArroyoDev components monorepo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            git
            direnv
          ];

          shellHook = ''
            # use corepack for exact pnpm version from package.json packageManager field
            export COREPACK_HOME="''${COREPACK_HOME:-$HOME/.cache/corepack}"
            mkdir -p "$COREPACK_HOME"
            corepack enable --install-directory "$HOME/.local/bin"
          '';
        };
      });
}
