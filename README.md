# next-with-apollo-hoc

Yet another next apollo hoc built on top of [next-with-apollo](https://github.com/lfades/next-with-apollo)

## Example

```ts
// pages/_app.js

import React from 'react'
import App from 'next/app'
import withApollo from 'next-with-apollo-hoc'
import { StylesProvider } from '@material-ui/core/styles'

const graphqlURI = process.env.GRAPHQL_URI || 'http://localhost:5000/graphql'

export default withApollo({
  uri: graphqlURI,
  treeForData: tree => (
    <StylesProvider disableGeneration>
      {tree}
    </StylesProvider>
  ),
})(App)
```

## License

MIT
