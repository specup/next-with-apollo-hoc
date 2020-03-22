import App from 'next/app'
import gql from 'graphql-tag'
import withApolloHOC from '../src'

export const EchoDocument = gql`
  query($message: String!) {
    echo(message: $message)
  }
`

export default withApolloHOC({
  uri: 'http://localhost:3000/api/graphql',
  onRequestInit: async ({ apolloClient }) => {
    console.log('[onRequestInit] begin')
    console.log('[onRequestInit] prefetch echo(message: "hello")')
    await apolloClient.query({
      query: EchoDocument,
      variables: { message: 'hello' },
    })
    console.log('[onRequestInit] end')
  },
})(App)
