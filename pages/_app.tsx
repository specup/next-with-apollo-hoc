import App from 'next/app'
import withApolloHOC from '../src'

export default withApolloHOC({
  uri: 'http://localhost:3000/api/graphql',
})(App)
