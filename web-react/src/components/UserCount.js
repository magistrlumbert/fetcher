import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Title from './Title'
import { useQuery, gql } from '@apollo/client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core'
import ForceGraph3D from 'react-force-graph-3d'

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
  navLink: {
    textDecoration: 'none',
  },
})

const GET_DATA_QUERY = gql`
  {
    count {
      substance {
        id
        name
        CAS
        density
      }
      product {
        id
        gtin
        name
      }
      rel_list {
        identity
        source
        target
        to_name
        processing_type
        amount
        unit
        type
        __typename
      }
    }
  }
`

export default function Deposits() {
  const classes = useStyles()

  const { loading, error, data } = useQuery(GET_DATA_QUERY)

  let product = false
  let rel_list = false
  let substance = false
  let nodes = false

  if (data && data.count) {
    product = data.count.map(({ product }) => {
      return product
    })
    product = [...new Set(product)]
  }

  if (data && data.count) {
    rel_list = data.count.map(({ rel_list }) => {
      const answer = rel_list.map((rel_list) => {
        return rel_list
      })
      return answer
    })

    rel_list = JSON.parse(JSON.stringify(rel_list.flat(Infinity)))
  }

  if (data && data.count) {
    substance = data.count[0].substance
  }

  if (product && substance) {
    nodes = JSON.parse(JSON.stringify([substance, ...product]))
  }

  if (error) return <p>Error</p>
  return (
    <React.Fragment>
      <Title>Consist Aluminium</Title>
      <Typography component="div" variant="h4">
        {data && !error && !loading && (
          <div width="100%">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>substance</TableCell>
                  <TableCell>relation list</TableCell>
                  <TableCell>product</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.count.map(({ product, rel_list, substance }, index) => {
                  return (
                    <TableRow key={`row-${index}`}>
                      <TableCell>{`${substance.name} with CAS:"${substance.CAS}"`}</TableCell>
                      <TableCell>
                        {rel_list.map(
                          ({
                            // identity,
                            // start,
                            // end,
                            // from,
                            // to_gtin,
                            to_name,
                            // processing_type,
                            amount,
                            unit,
                            type,
                          }) => {
                            return `${amount} ${
                              unit !== 'undefined' ? unit + `s` : 'piece(s)'
                            } ${type} the ${to_name} `
                          }
                        )}
                      </TableCell>
                      <TableCell>{`${product.name} with gtin: "${product.gtin}"`}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            {product && rel_list && substance && !error && !loading && (
              <ForceGraph3D
                // JSON.parse(JSON.stringify(data.costData))
                graphData={{
                  nodes: nodes,
                  links: rel_list,
                }}
                nodeId="id"
                linkCurvature={0.2}
                linkDirectionalArrowRelPos={1}
                linkDirectionalArrowLength={10}
              />
            )}
          </div>
        )}
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        consist aluminium
      </Typography>
      <div>
        <Link to="/users" className={classes.navLink}>
          View substances
        </Link>
      </div>
    </React.Fragment>
  )
}
