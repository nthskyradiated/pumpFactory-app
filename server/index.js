import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import connectDB from './config/db.js'
import schema from "./schema/schema.js";
import ansi from '../node_modules/ansi-colors-es6/index.js'
import morgan from "morgan";
import helmet from "helmet";
import vhost from "vhost";

const port = process.env.PORT || 5000
dotenv.config()
const app = express()
connectDB()

app.use(morgan('common'));
app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));
app.use(vhost('api.localhost', graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development'
})))
app.listen(port, () => console.log(ansi.green.bold.underline(`server running on port ${port}`)));