import React, { FC } from 'react'
import { NextPage } from 'next'
import { useQuery } from '@apollo/react-hooks'
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
    </div>
  )
}

export default IndexPage
