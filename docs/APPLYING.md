# Applying merged work to a live surface

Merging to this public repo does not deploy anything by itself. A maintainer
moves approved work into the private prompts.ai tree and runs the white-label
install pipeline to reach a live machine.

## The path

```
this repo (public)            private prompts.ai tree             live machine
plugins/<name>/plugin.js  ->  infra/hermes-skins/desktop-plugins/  ->  install-white-label.sh  ->  ~/.hermes/desktop-plugins/<name>/plugin.js
skins/<name>.yaml        ->  infra/hermes-skins/<name>.yaml       ->  install-white-label.sh  ->  ~/.hermes/skins/<name>.yaml
```

## Steps for a maintainer

1. Merge the student PR on this repo.
2. Copy the approved plugin directory into the private repo:

   ```
   cp -R plugins/<name> <private>/infra/hermes-skins/desktop-plugins/<name>
   ```

3. Copy approved skins into the private repo:

   ```
   cp skins/<name>.yaml <private>/infra/hermes-skins/<name>.yaml
   ```

4. Run the white-label install script on the target machine:

   ```
   bash <private>/infra/hermes-skins/install-white-label.sh
   ```

   The script places every directory under
   `infra/hermes-skins/desktop-plugins/` into `~/.hermes/desktop-plugins/`
   (and into each profile's desktop-plugins directory) and copies skins into
   `~/.hermes/skins/`.

5. Quit surface.tokn (Cmd-Q) and reopen.

## Hot reload

Plugin code changes are filesystem watched: editing
`~/.hermes/desktop-plugins/<name>/plugin.js` hot reloads the plugin without a
restart. Chrome-level branding (icons, app bundle content) still needs the
app restart in step 5.

## Notes

- The install script must be re-run after any app update; app updates do not
  preserve `~/.hermes` white-label files by themselves.
- Only approved, CI-clean content crosses this bridge. The banned-content
  scan in CI runs before merge so the bridge never carries billing, keys,
  connection stores, or LAN addresses.
