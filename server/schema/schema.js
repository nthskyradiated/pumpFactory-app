import Client from '../models/clientModel.js'
import Product from '../models/productModel.js'
import { GraphQLObjectType, GraphQLID, GraphQLEnumType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull } from 'graphql';


//Product type
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
        membershipStatus: { type: GraphQLString},
        product: {
            type: ProductType,
            resolve(parent, args) {
                return Product.findById(parent.productId)
            }
}})
})

//Queries
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        clients: {
            type: new GraphQLList(ClientType),
            resolve(parents,args) {
              return Client.find();
            }
        },
        client: {
            type: ClientType,
            args: { id: {type: GraphQLID} },
            resolve(parent,args) {
                return Client.findById(args.id);
            }
        },
        products: {
            type: new GraphQLList(ProductType),
            resolve(parents,args) {
               return Product.find()
            }
        },
        product: {
            type: ProductType,
            args: { id: {type: GraphQLID} },
            resolve(parent,args) {
                return Product.findById(args.id);
            }
        }
    }
})

//Mutations
const mutation = new GraphQLObjectType ({
    name: 'Mutation',
    fields: {
        //Create new client
        addClient: {
            type: ClientType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                email: { type: GraphQLNonNull(GraphQLString) },
                phone: { type: GraphQLNonNull(GraphQLString) },
                birthday: { type: GraphQLNonNull(GraphQLString) },
                age: { type: GraphQLNonNull(GraphQLInt) },
                waiver: { type: GraphQLNonNull(GraphQLBoolean) },
                productId: {type: (GraphQLID)},
                membershipStatus: { type: new GraphQLEnumType({
                        name: 'MembershipStatus',
                        values: {
                            'active': {value: 'active'},
                            'inactive': {value: 'inactive'},
                        }
                    }),
                    defaultValue: 'inactive'
                },
            },
            resolve(parent,args){
                const client = new Client ({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                    birthday: args.birthday,
                    age: args.age,
                    membershipStatus: args.membershipStatus,
                    waiver: args.waiver,
                    productId: args.productId

                })

                return client.save()
            }
        },
        //Delete a Client
        deleteClient: {
            type: ClientType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                return Client.findByIdAndRemove(args.id)
            }
        },

        //Update a Client
        updateClient: {
            type: ClientType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
                name: { type: (GraphQLString) },
                email: { type: (GraphQLString) },
                phone: { type: (GraphQLString) },
                birthday: { type: (GraphQLString) },
                age: { type: (GraphQLInt) },
                waiver: { type: (GraphQLBoolean) },
                membershipStatus: { type: new GraphQLEnumType({
                    name: 'MembershipStatusUpdate',
                    values: {
                        'active': {value: 'active'},
                        'inactive': {value: 'inactive'},
                    }
                }),
            },
            productId: {type: GraphQLID}
            },
            resolve(parent, args) {
                return Client.findByIdAndUpdate(args.id,
                    {
                        $set: {
                            name: args.name,
                            email: args.email,
                            phone: args.phone,
                            birthday: args.birthday,
                            age: args.age,
                            membershipStatus: args.membershipStatus,
                            waiver: args.waiver,
                            productId: args.productId
                        }
                    }
                    ,{new: true}
                    )
            }

        },

        // Add a product
        addProduct: {
            type: ProductType,
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                description: { type: GraphQLNonNull(GraphQLString) },
                price: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve(parent, args){
                const product = new Product ({
                    name: args.name,
                    description: args.description,
                    price: args.price
            })
            return product.save()
        }},
           //Delete a Product
           deleteProduct: {
            type: ProductType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args) {
                return Product.findByIdAndRemove(args.id)
            }
        },

        //update a Product
        updateProduct: {
            type: ProductType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
                name: { type: (GraphQLString) },
                description: { type: (GraphQLString) },
                price: { type: (GraphQLInt) },

            },
            resolve(parent, args) {
                return Product.findByIdAndUpdate(args.id,
                    {
                        $set: {
                            name: args.name,
                            description: args.description,
                            price: args.price
                        }
                    }
                    ,{new: true}
                    )
            }

        },

    }
})

export default new GraphQLSchema({
    query: RootQuery,
    mutation
})