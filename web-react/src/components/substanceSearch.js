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
  TextField,
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
  query substancesPaginateQuery($filter: String) {
    substances(filter: $filter) {
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

  const [filterState, setFilterState] = React.useState({ substanceFilter: '' })

  const getFilter = () => {
    return filterState.substanceFilter.length > 0
      ? '*' + filterState.substanceFilter + '*'
      : '*'
  }

  const handleFilterChange = (filterName) => (event) => {
    const val = event.target.value
    setFilterState((oldFilterState) => ({
      ...oldFilterState,
      [filterName]: val,
    }))
  }

  const { loading, error, data } = useQuery(GET_DATA_QUERY, {
    variables: {
      filter: getFilter(),
    },
  })

  if (error) return <p>Error</p>
  return (
    <React.Fragment>
      <Title>Consist Substance</Title>
      <TextField
        id="search"
        label="substance's Name Contains"
        className={classes.textField}
        value={filterState.substanceFilter}
        onChange={handleFilterChange('substanceFilter')}
        margin="normal"
        variant="outlined"
        type="text"
        InputProps={{
          className: classes.input,
        }}
      />
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
                {data.substances.map(
                  ({ product, rel_list, substance }, index) => {
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
                  }
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        substance data search
      </Typography>
      <div>
        <Link to="/users" className={classes.navLink}>
          View substances
        </Link>
      </div>
    </React.Fragment>
  )
}
