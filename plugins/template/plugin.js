/**
 * template - starter plugin for surface.tokn.
 *
 * Copy this directory, rename it, and build a pane or status bar item.
 * A plugin may import only '@hermes/plugin-sdk' and 'react' (and
 * 'react/jsx-runtime'). See docs/plugin-sdk.md.
 */
import { jsx } from 'react/jsx-runtime'
import { host } from '@hermes/plugin-sdk'

const ID = 'template'

export default {
  id: ID,
  name: 'Template plugin',
  defaultEnabled: false,
  register(ctx) {
    // A pane in the app shell.
    ctx.register({
      id: 'template-pane',
      area: 'panes',
      title: 'Template',
      render: () =>
        jsx('div', {
          style: { padding: '10px 12px', fontSize: 13 },
          children: 'Hello from the template plugin.',
        }),
    })

    // A status bar item on the right.
    ctx.register({
      id: 'template-status',
      area: 'statusBar.right',
      title: 'Template',
      render: () =>
        jsx('span', {
          style: { padding: '0 8px', fontSize: 11 },
          children: 'template',
        }),
    })

    // host.request performs app RPC. Keep reads optional and guarded.
    host
      .request('config.get', { key: 'full' })
      .then(() => {})
      .catch(() => {})
  },
}
