import React, { useEffect, useRef } from 'react'
import App from 'next/app'
import gql from 'graphql-tag'
import withApolloHOC, { ApolloComponentType } from '../src'

export const EchoDocument = gql`
  query($message: String!) {
    echo(message: $message)
  }
`
function useComponentDidMount(func: () => any) {
  useEffect(func, [])
}

function useComponentWillMount(func: () => any) {
  const willMount = useRef(true)

  if (willMount.current) {
    func()
  }

  useComponentDidMount(() => {
    willMount.current = false
  })
}

const Component: ApolloComponentType = ({ apolloClient, children }) => {
  // Prevent refetch data on initial render
  // https://github.com/apollographql/apollo-client/issues/4814

  useComponentWillMount(() => {
    apolloClient.disableNetworkFetches = true
  })

  useComponentDidMount(() => {
    apolloClient.disableNetworkFetches = false
  })

  return <>{children}</>
}

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
  component: Component,
})(App)
