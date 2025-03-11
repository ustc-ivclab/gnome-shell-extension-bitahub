{ pkgs ? import <nixpkgs> { } }:

with pkgs;
mkShell {
  name = "bitahub@ustc.edu";
  buildInputs = [
    glib
  ];
}
