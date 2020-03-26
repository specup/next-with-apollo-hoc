import React, { FC } from 'react'
import { NextPage } from 'next'
import { useQuery } from '@apollo/react-hooks'
import Link from 'next/link'
import { EchoDocument } from './_app'

const Hello: FC = ({ children }) => {
  const { data, loading } = useQuery(EchoDocument, {
    variables: { message: 'hello' },

    // data prefetched in `onRequestInit` handler
    fetchPolicy: 'cache-only',
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {data.echo}
      {children}
    </div>
  )
}

const World: FC = () => {
  const { data, loading } = useQuery(EchoDocument, {
    variables: { message: 'world' },
    fetchPolicy: 'cache-and-network',
  })

  if (loading) {
    return <div>Loading...</div>
  }

  return <div>{data.echo}</div>
}

const IndexPage: NextPage = () => {
  return (
    <div>
      <Hello>
        <World />
      </Hello>
      <Link href="/about">Go about</Link>
    </div>
  )
}

export default IndexPage
