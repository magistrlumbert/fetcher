import React from 'react'
import { useQuery, gql } from '@apollo/client'
import { withStyles } from '@material-ui/core/styles'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Paper,
  TableSortLabel,
  TextField,
} from '@material-ui/core'

import Title from './Title'

const styles = (theme) => ({
  root: {
    maxWidth: 1000,
    marginTop: theme.spacing(3),
    overflowX: 'auto',
    margin: 'auto',
  },
  table: {
    minWidth: 700,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    minWidth: 300,
  },
})

const GET_PRODUCT_PATH = gql`
  query productPath($filter: String) {
    prodpaths(filter: $filter) {
      id
      mnfplant {
        identity
        name
      }
      interlayer {
        identity
        name
      }
      product {
        identity
        name
      }
      substance {
        identity
        name
      }
      isSubstanceIn {
        identity
        type
        start
        end
      }
      productMatch {
        identity
        name
        gtin
      }
      parts {
        identity
        to_name
        to_gtin
        type
      }
    }
  }
`

function GtinSearch(props) {
  const { classes } = props
  const [order, setOrder] = React.useState('ASC')
  const [orderBy, setOrderBy] = React.useState('name')
  const [filterState, setFilterState] = React.useState({
    productnameFilter: '',
  })

  const getFilter = () => {
    return filterState.productnameFilter.length > 0
      ? '*' + filterState.productnameFilter + '*'
      : '*'
  }

  const { loading, data, error } = useQuery(GET_PRODUCT_PATH, {
    variables: {
      filter: getFilter(),
    },
  })

  const handleSortRequest = (property) => {
    const newOrderBy = property
    let newOrder = 'DESC'

    if (orderBy === property && order === 'DESC') {
      newOrder = 'ASC'
    }

    setOrder(newOrder)
    setOrderBy(newOrderBy)
  }

  const handleFilterChange = (filterName) => (event) => {
    const val = event.target.value

    setFilterState((oldFilterState) => ({
      ...oldFilterState,
      [filterName]: val,
    }))
  }

  return (
    <Paper className={classes.root}>
      <Title>Products Path</Title>
      <TextField
        id="search"
        label="Product Name or Gtin Contains"
        className={classes.textField}
        value={filterState.productnameFilter}
        onChange={handleFilterChange('productnameFilter')}
        margin="normal"
        variant="outlined"
        type="text"
        InputProps={{
          className: classes.input,
        }}
      />
      {loading && !error && <p>Loading...</p>}
      {error && !loading && <p>Error</p>}
      {data && !loading && !error && (
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell
                key="name"
                sortDirection={orderBy === 'name' ? order.toLowerCase() : false}
              >
                <Tooltip title="Sort" placement="bottom-start" enterDelay={300}>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={order.toLowerCase()}
                    onClick={() => handleSortRequest('name')}
                  >
                    Plant Name
                  </TableSortLabel>
                </Tooltip>
              </TableCell>
              <TableCell key="avgStars">Path</TableCell>
              <TableCell key="numReviews">Product Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.prodpaths.map(
              (
                {
                  mnfplant,
                  product,
                  interlayer,
                  substance,
                  isSubstanceIn,
                  productMatch,
                  parts,
                },
                index
              ) => {
                console.log(interlayer)
                return (
                  <TableRow key={index}>
                    <TableCell component="th" scope="row">
                      {interlayer !== null ? interlayer.name : mnfplant.name}
                    </TableCell>
                    <TableCell>
                      {interlayer !== null
                        ? `${interlayer.name} manufactures ${substance.name} which ${isSubstanceIn.type} of the ${productMatch.name} `
                        : 'manufactures'}
                      {parts.map(
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
                          return `${amount ? amount : ``} ${
                            unit !== 'undefined' ? `` : 'piece(s)'
                          } which ${type} the ${to_name} `
                        }
                      )}
                    </TableCell>
                    <TableCell>
                      {product !== null ? product.name : 'null'}
                    </TableCell>
                  </TableRow>
                )
              }
            )}
          </TableBody>
        </Table>
      )}
    </Paper>
  )
}

export default withStyles(styles)(GtinSearch)
