const resolvers = {
  Query: {
    substances: async (_, { filter }, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = `CALL db.index.fulltext.queryNodes('searchSubstance', '${filter}') YIELD node 
            WITH node
            MATCH path=(node)-[*]->(product:Product)
            RETURN node as substance,relationships(path) as rel_list,product
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
                identity: identity.toString(),
                source: start.toString(),
                target: end.toString(),
                type: type.toString(),
                amount: amount ? amount.toString() : 'undefined',
                unit: unit ? unit.toString() : 'undefined',
                processing_type: processing_type
                  ? processing_type.toString()
                  : 'undefined',
                to_gtin: productArr[end.toString()].gtin,
                to_name: productArr[end.toString()].name,
              }
              connections = [...connections, connection]
            })
            const { substancename, CAS, density } = substance
            return {
              id: '0',
              substance: {
                id: record.get('substance').identity.toString(),
                name: substancename,
                CAS: CAS,
                density: density ? density.toString() : 'undefined',
              },
              rel_list: connections,
              product: {
                id: product_id,
                gtin: product.gtin,
                name: product.name,
              },
            }
          }
        })
        return resData
      })
    },

    prodpaths: async (_, { filter }, ctx) => {
      let session = ctx.driver.session()
      const cypherQuery = `CALL db.index.fulltext.queryNodes('searchProduct', '${filter}') YIELD node 
        WITH node
        MATCH path=(mnf:Mnfplant)-[:MANUFACTURES]->(node)<-[:IS_A_PART_OF*0..]-(p2:Product)
        OPTIONAL MATCH (p2)<-[rs:IS_A_SUBSTANCE_IN]-(sub:Substance)
        OPTIONAL MATCH (sub)<-[:MANUFACTURES]-(subMnf:Mnfplant)
        RETURN DISTINCT node as product,
        relationships(path) AS productRelations, 
        p2 AS productMatch, 
        rs AS isSubstanceIn, 
        sub AS substance, 
        mnf AS manufacturingPlant, 
        subMnf AS substanceManufacturer`
      return await session.run(cypherQuery).then((result) => {
        let productArr = {}
        let i = 0
        const resData = result.records.map((record) => {

          const productMatchData = record.get('productMatch')
          let productMatch = null
          if (productMatchData) {
            const { identity } = productMatchData
            const { name, gtin } = record.get('productMatch').properties
            productMatch = {
              identity: identity ? identity.toString() : null,
              name: name,
              gtin: gtin,
            }
            productArr = { ...productArr, [identity.toString()]: productMatch }
          }

          let connections = []
          const rel_list = record.get('productRelations')
          rel_list.map((relationship) => {
            const { identity, start, end, type } = relationship
            if (type !== 'MANUFACTURES') {
              const { amount, unit, processing_type } = relationship.properties
              const connection = {
                identity: identity.toString(),
                source: start.toString(),
                target: end.toString(),
                type: type.toString(),
                amount: amount ? amount.toString() : 'undefined',
                unit: unit ? unit.toString() : 'undefined',
                processing_type: processing_type
                  ? processing_type.toString()
                  : 'undefined',
                to_gtin: productArr[end.toString()].gtin,
                to_name: productArr[end.toString()].name,
              }
              connections = [...connections, connection]
            }
          })

          const isSubstanceInData = record.get('isSubstanceIn')
          let isSubstanceIn = null

          if (isSubstanceInData) {
            const { identity, start, end, type } = isSubstanceInData
            const { unit, amount, processing_type } =
              isSubstanceInData.properties

            isSubstanceIn = {
              identity: identity ? identity.toString() : null,
              start: start ? start.toString() : null,
              end: end ? end.toString() : null,
              type: type ? type.toString() : null,
              unit: unit ? unit.toString() : null,
              amount: amount ? amount.toString() : null,
              processing_type: processing_type
                ? processing_type.toString()
                : null,
            }
          }

          const substanceData = record.get('substance')
          let substance = null
          if (substanceData) {
            const substanceDataProperties = record.get('substance').properties
            substance = {
              CAS: substanceDataProperties.CAS,
              name: substanceDataProperties.substancename,
              identity: substanceData.identity.toString(),
            }
          }

          const manufacturingPlant = record.get('manufacturingPlant')
          let mnfPlant = null
          if (manufacturingPlant) {
            const manufacturingPlantProperies =
              record.get('manufacturingPlant').properties
            mnfPlant = {
              identity: manufacturingPlant.identity.toString(),
              name: manufacturingPlantProperies.name,
              country: manufacturingPlantProperies.country,
              address: manufacturingPlantProperies.adress,
            }
          }

          const substanceManufacturer = record.get('substanceManufacturer')
          let interlayer = null
          if (substanceManufacturer) {
            const substanceManufacturerProperties = record.get(
              'substanceManufacturer'
            ).properties

            interlayer = {
              identity: substanceManufacturer.identity.toString(),
              name: substanceManufacturerProperties.name,
              country: substanceManufacturerProperties.country,
              address: substanceManufacturerProperties.adress,
            }
          }

          const productData = record.get('product')

          let product = null
          if (productData) {
            const productDataProperties = record.get('product').properties
            product = {
              gtin: productDataProperties.gtin,
              identity: productData.identity.toString(),
              name: productDataProperties.name,
            }
          }

          const dataToReturn = {
            id: i,
            mnfplant: mnfPlant,
            rel_list: ['undefined'],
            product: product,
            interlayer: interlayer,
            substance: substance,
            isSubstanceIn: isSubstanceIn,
            productMatch: productMatch,
            parts: connections,
          }
          i++
          return dataToReturn
        })
        return resData
      })
    },
  },
}

export default resolvers
