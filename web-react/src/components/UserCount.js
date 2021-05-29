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
        substancename
        CAS
      }
      product {
        gtin
        name
      }
      rel_list {
        identity
        start
        end
        from
        to
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
  if (error) return <p>Error</p>
  return (
    <React.Fragment>
      <Title>Consist Aluminium</Title>
      <Typography component="p" variant="h4">
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
                      <TableCell>{`${substance.substancename} with CAS:"${substance.CAS}"`}</TableCell>
                      <TableCell>
                        {rel_list.map(
                          ({
                            // identity,
                            // start,
                            // end,
                            // from,
                            // to,
                            // processing_type,
                            amount,
                            unit,
                            type,
                          }) => {
                            return `${amount} ${
                              unit !== 'undefined' ? unit + `s` : 'piece(s)'
                            } ${type} the product `
                          }
                        )}
                      </TableCell>
                      <TableCell>{`${product.name} with gtin: "${product.gtin}"`}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
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
