import React from 'react'
import { NextPage } from 'next'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'

const SAY_HELLO = gql`
  {
    sayHello
  }
`

const IndexPage: NextPage = () => {
  const { data, loading } = useQuery(SAY_HELLO)

  if (loading) {
    return <div>Loading...</div>
  }

  return <div>{data.sayHello}</div>
}

export default IndexPage
