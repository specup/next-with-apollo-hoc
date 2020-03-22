import React, { ReactNode } from 'react'
import { NextPage } from 'next'
import App from 'next/app'
import { IncomingHttpHeaders } from 'http'
import { ApolloClient, ApolloClientOptions } from 'apollo-client'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { ApolloLink } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { ApolloProvider } from '@apollo/react-common'
import { getDataFromTree as apolloGetDataFromTree } from '@apollo/react-ssr'
import withApollo from 'next-with-apollo'

const isBrowser = typeof window !== 'undefined'

function defaultInitLink(defaultLink: ApolloLink) {
  return defaultLink
}

function defaultRender(pageOrApp: ReactNode) {
  return pageOrApp
}

function defaultTreeForData(tree: ReactNode): ReactNode {
  return tree
}

interface OnInitOnServerParams {
  apolloClient: ApolloClient<NormalizedCacheObject>
}

export interface WithApolloHOCOptions
  extends Omit<
    Partial<ApolloClientOptions<any>>,
    'ssrMode' | 'cache' | 'link'
  > {
  uri: string
  link?: (defaultLink: ApolloLink, headers: IncomingHttpHeaders) => ApolloLink
  treeForData?: (tree: ReactNode) => ReactNode
  onInitOnServer?: (params: OnInitOnServerParams) => Promise<any>
  render?: (pageOrApp: ReactNode) => ReactNode
}

function withApolloHOC({
  uri,
  link = defaultInitLink,
  treeForData = defaultTreeForData,
  onInitOnServer,
  render = defaultRender,
  ...other
}: WithApolloHOCOptions) {
  function getDataFromTree(
    tree: ReactNode,
    context?: { [key: string]: any },
  ): Promise<string> {
    return apolloGetDataFromTree(treeForData(tree), context)
  }

  const apolloHOC = withApollo(
    ({ initialState, headers }) => {
      const httpLink = new HttpLink({
        uri,
        credentials: 'include', // Additional fetch() options like `credentials` or `headers`
        headers: {
          ...headers,
          'content-type': 'application/json',
        },
      })

      return new ApolloClient({
        ssrMode: !isBrowser, // Disables forceFetch on the server (so queries are only run once)
        link: link(httpLink, headers),
        cache: new InMemoryCache().restore(initialState),
        ...other,
      })
    },
    { getDataFromTree },
  )

  return (PageOrApp: NextPage<any> | typeof App) => {
    function WithApolloHOC({ apollo, ...other }: any) {
      return (
        <ApolloProvider client={apollo}>
          {render(<PageOrApp {...other} />)}
        </ApolloProvider>
      )
    }

    WithApolloHOC.getInitialProps = async (pageCtx: any) => {
      const ctx = 'Component' in pageCtx ? pageCtx.ctx : pageCtx

      if (!isBrowser && onInitOnServer) {
        const apolloClient: ApolloClient<any> = ctx.apolloClient
        await onInitOnServer({ apolloClient })
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
