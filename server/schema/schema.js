import Client from '../models/clientModel.js'
import Product from '../models/productModel.js'
import { GraphQLObjectType, GraphQLID, GraphQLEnumType, GraphQLString, GraphQLBoolean, GraphQLInt, GraphQLSchema, GraphQLList, GraphQLNonNull, Kind, GraphQLScalarType } from 'graphql';
import { findExistingClient, validateAge } from '../utils/clientUtils.js';
import { error } from 'console';

const DateType = new GraphQLScalarType({
    name: 'Date',
    description: 'Custom date scalar type',
    parseValue(value) {
        if (typeof value === 'number') {
            return new Date(value);
        } else
        throw new Error('GraphQL Date Scalar parser expected a `number`');
    },
    serialize(value) {
        if (value instanceof Date) {
            const dateISOString = value.toISOString();
            return dateISOString.split('T')[0]; // Extract the date part
        }
        throw new Error('Invalid Date value');
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            const dateParts = ast.value.split('-');
            if (dateParts.length === 3) {
                const year = dateParts[2];
                const month = dateParts[0];
                const day = dateParts[1];
                return `${year}-${month}-${day}`;
            }
        }else
        throw new Error('Invalid Date literal');
    },
});


const MembershipStatusType = new GraphQLEnumType({
    name: 'MembershipStatus',
    values: {
        active: { value: 'active' },
        inactive: { value: 'inactive' }
    },
    defaultValue: 'inactive'
});

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
        birthdate: { type: DateType},
        age: {type: GraphQLInt},
        waiver: { type: GraphQLBoolean},
        membershipStatus: {
            type: MembershipStatusType, 
            resolve: async (parent) => {
                // Fetch the product data associated with the client
                const product = await Product.findById(parent.productId);
                if (product) {
                    return 'active';
                }
                return 'inactive';
            },
        },
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
                birthdate: { type: GraphQLNonNull(DateType) },
                waiver: { type: GraphQLNonNull(GraphQLBoolean) },
                productId: {type: (GraphQLID)},
            },
            resolve: async (parent, args) => {
                
                const existingClient = await findExistingClient(args.name, args.email, args.phone);

                if (existingClient) {
                    throw new Error('Client with the same name, email, or phone already exists.');
                }


                const age = validateAge(args.birthdate);

                const membershipStatus = args.productId ? 'active' : 'inactive';
        
                const client = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                    birthdate: args.birthdate,
                    age,
                    membershipStatus,
                    waiver: args.waiver,
                    productId: args.productId,

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

// Update a Client
updateClient: {
    type: ClientType,
    args: {
        id: { type: GraphQLNonNull(GraphQLID) },
        name: { type: GraphQLString },
        email: { type: GraphQLString },
        phone: { type: GraphQLString },
        birthdate: { type: DateType },
        waiver: { type: GraphQLBoolean },
        membershipStatus: { type: MembershipStatusType },
        productId: { type: GraphQLID }
    },
    resolve: async (parent, args) => {
        // Check for duplicates based on name, email, and phone
        if (args.name || args.email || args.phone) {
            const existingClient = await findExistingClient(args.name, args.email, args.phone);
            if (existingClient && existingClient.id.toString() !== args.id) {
                throw new Error('Client with the same name, email, or phone already exists.');
            }
        }

        // Fetch the existing client to get its current age and productId
        const existingClient = await Client.findById(args.id);

        if (!existingClient) {
            throw new Error('Client not found');
        }

        // Calculate the age based on the provided birthdate or use the existing age
        const age = args.birthdate ? validateAge(args.birthdate) : existingClient.age;

        // Determine the membership status based on the productId or use the existing status
        let membershipStatus = 'inactive';

        if (args.productId) {
            // If productId is provided, the client should have 'active' membership status
            membershipStatus = 'active';
        }

        // Create an updateFields object to specify the fields to update. We use the existing values if new values are not provided.
        const updateFields = {
            name: args.name || existingClient.name,
            email: args.email || existingClient.email,
            phone: args.phone || existingClient.phone,
            birthdate: args.birthdate || existingClient.birthdate,
            age,
            membershipStatus,
            waiver: args.waiver !== undefined ? args.waiver : existingClient.waiver,
            productId: args.productId, // To remove the product, set it to null or undefined
        };

        return Client.findByIdAndUpdate(args.id, { $set: updateFields }, { new: true });
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