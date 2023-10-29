import { clients, products } from '../sampleData.js'

import { GraphQLObjectType, GraphQLID, GraphQLEnumType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLSchema, GraphQLList } from 'graphql';



const ProductType = new GraphQLObjectType({
    name: 'Product',
    fields: () => ({
        id: { type: GraphQLID},
        name: { type: GraphQLString},
        description: { type: GraphQLString},
        price: { type: GraphQLInt}
    })
})
//Client type
const ClientType = new GraphQLObjectType({
    name: 'Client',
    fields: () => ({
        id: { type: GraphQLID},
        name: { type: GraphQLString},
        email: { type: GraphQLString},
        phone: { type: GraphQLString},
        birthday: { type: GraphQLString},
        age: { type: GraphQLInt},
        waiver: { type: GraphQLBoolean},
        membershipType: { type: GraphQLString},
        product: {
            type: ProductType,
            resolve(parent, args) {
                return products.find(product => product.id === parent.productId)
            }
}})
})

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parents,args) {
                return clients
            }
        },
        client: {
            type: ClientType,
            args: { id: {type: GraphQLID} },
            resolve(parent,args) {
                return clients.find(client => client.id === args.id);
            }
        },
        products: {
            type: new GraphQLList(ProductType),
            resolve(parents,args) {
                return products
            }
        },
        product: {
            type: ProductType,
            args: { id: {type: GraphQLID} },
            resolve(parent,args) {
                return products.find(product => product.id === args.id);
            }
        }
    }
})
export default new GraphQLSchema({
    query: RootQuery
})