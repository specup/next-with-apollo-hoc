import React, { ReactNode, createElement, ComponentType } from 'react'
import { NextPage, NextPageContext } from 'next'
import App from 'next/app'
import { IncomingHttpHeaders } from 'http'
import { ApolloClient, ApolloClientOptions } from 'apollo-client'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { ApolloProvider } from '@apollo/react-common'
import { getDataFromTree as apolloGetDataFromTree } from '@apollo/react-ssr'
import { DocumentNode } from 'graphql'
import gql from 'graphql-tag'
import withApollo from 'next-with-apollo'

const uriTypeDefs = gql`
  type Query {
    __GRAPHQL_URI__: String!
  }
`

const uriQuery = gql`
  query {
    __GRAPHQL_URI__ @client
  }
`

const isBrowser = typeof window !== 'undefined'

function defaultInitLink(defaultLink: ApolloLink) {
  return defaultLink
}

const defaultComponent: ApolloComponentType = ({ children }) => {
  return <>{children}</>
}

function defaultTreeForData(tree: ReactNode): ReactNode {
  return tree
}

interface onRequestInitParams {
  apolloClient: ApolloClient<NormalizedCacheObject>
  ctx: NextPageContext
}

export type ApolloComponentType = ComponentType<{
  apolloClient: ApolloClient<any>
}>

export interface WithApolloHOCOptions
  extends Omit<
    Partial<ApolloClientOptions<any>>,
    'ssrMode' | 'cache' | 'link' | 'typeDefs'
  > {
  uri: string
  link?: (defaultLink: ApolloLink, headers: IncomingHttpHeaders) => ApolloLink
  typeDefs?: DocumentNode | DocumentNode[]
  treeForData?: (tree: ReactNode) => ReactNode
  onRequestInit?: (params: onRequestInitParams) => Promise<any>
  component?: ApolloComponentType
}

function withApolloHOC({
  uri,
  link = defaultInitLink,
  typeDefs = [],
  resolvers = [],
  treeForData = defaultTreeForData,
  onRequestInit,
  component = defaultComponent,
  ...other
}: WithApolloHOCOptions) {
  function getDataFromTree(
    tree: ReactNode,
    context?: { [key: string]: any },
  ): Promise<string> {
    return apolloGetDataFromTree(treeForData(tree), context)
  }

  const uriResolvers = {
    Query: {
      __GRAPHQL_URI__: () => uri,
    },
  }

  const apolloHOC = withApollo(
    ({ initialState, headers }) => {
      const cache = new InMemoryCache().restore(initialState)

      let finalURI = uri
      if (isBrowser) {
        const { __GRAPHQL_URI__ } = cache.readQuery({ query: uriQuery })
        finalURI = __GRAPHQL_URI__
      }

      const httpLink = new HttpLink({
        uri: finalURI,
        credentials: 'include', // Additional fetch() options like `credentials` or `headers`
        headers: {
          ...headers,
          'content-type': 'application/json',
        },
      })

      return new ApolloClient({
        ssrMode: !isBrowser, // Disables forceFetch on the server (so queries are only run once)
        link: link(httpLink, headers),
        cache,
        typeDefs: [
          uriTypeDefs,
          ...(Array.isArray(typeDefs) ? typeDefs : [typeDefs]),
        ],
        resolvers: [
          uriResolvers,
          ...(Array.isArray(resolvers) ? resolvers : [resolvers]),
        ],
        ...other,
      })
    },
    { getDataFromTree },
  )

  return (PageOrApp: NextPage<any> | typeof App) => {
    function WithApolloHOC({ apollo, ...other }: any) {
      const content = <PageOrApp {...other} />
      return (
        <ApolloProvider client={apollo}>
          {createElement(component, { apolloClient: apollo }, content)}
        </ApolloProvider>
      )
    }

    WithApolloHOC.getInitialProps = async (pageCtx: any) => {
      const ctx = 'Component' in pageCtx ? pageCtx.ctx : pageCtx

      if (!isBrowser) {
        const apolloClient: ApolloClient<any> = ctx.apolloClient

        // Query on server so that client can access
        // uri value set on server through `initialState`
        await apolloClient.query({ query: uriQuery })

        if (onRequestInit) {
          await onRequestInit({ apolloClient, ctx })
        }
      }

      if (!PageOrApp.getInitialProps) {
        return {}
      }

      return PageOrApp.getInitialProps(pageCtx)
    }

    return apolloHOC(WithApolloHOC as any)
  }
}

export default withApolloHOC
