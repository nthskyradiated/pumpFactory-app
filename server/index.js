import express from "express";
import { graphqlHTTP } from "express-graphql";

import schema from "./schema/schema.js";

import ansi from '../node_modules/ansi-colors-es6/index.js'
import dotenv from "dotenv";

const port = process.env.PORT || 5000
dotenv.config()
const app = express()

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development'
}))
app.listen(port, () => console.log(ansi.green.bold.underline(`server running on port ${port}`)));