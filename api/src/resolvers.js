const resolvers = {
  Query: {
    count: async (_, __, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = `MATCH path=(substance:substance{substancename:'aluminium'})-[*]->(product:product)
            RETURN substance,relationships(path) as rel_list,product
            ORDER BY size(rel_list)
            SKIP 0
            LIMIT 50`
      return await session.run(cypherQuery).then((result) => {
        let productArr = {}
        const resData = result.records.map((record) => {
          const substance = record.get('substance').properties
          const product_id = record.get('product').identity.toString()
          const product = record.get('product').properties
          const rel_list = record.get('rel_list')
          productArr = { ...productArr, [product_id]: product }
          if (substance === null) {
            return {
              substance: { substancename: 'substance' },
            }
          } else {
            let connections = []
            rel_list.map((relationship) => {
              const { identity, start, end, type } = relationship
              const { amount, unit, processing_type } = relationship.properties
              const connection = {
                id: '0',
                identity: identity.toString(),
                start: start.toString(),
                end: end.toString(),
                type: type.toString(),
                amount: amount.toString(),
                unit: unit ? unit.toString() : 'undefined',
                processing_type: processing_type
                  ? processing_type.toString()
                  : 'undefined',
                from: 'product',
                to_gtin: productArr[end.toString()].gtin,
                to_name: productArr[end.toString()].name,
              }
              connections = [...connections, connection]
            })
            const { substancename, CAS, density } = substance
            return {
              id: '0',
              substance: {
                substancename: substancename,
                CAS: CAS,
                density: density.toString(),
              },
              rel_list: connections,
              product: {
                gtin: product.gtin,
                name: product.name,
              },
            }
          }
        })
        return resData
      })
    },
  },
  Mutation: {},
}

export default resolvers
