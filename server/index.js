import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import connectDB from './config/db.js'
import schema from "./schema/schema.js";
import ansi from '../node_modules/ansi-colors-es6/index.js'
import morgan from "morgan";
import helmet from "helmet";
import vhost from "vhost";
import { expressjwt } from "express-jwt";

dotenv.config()

const port = process.env.PORT || 5000
const subdomain = process.env.SUBDOMAIN || 'api'
const domain = process.env.DOMAIN || 'localhost'

const app = express()
connectDB()

app.use(morgan('common'));
app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));


if (process.env.NODE_ENV === 'development' ) {

    app.use(vhost(`${subdomain}.${domain}`, graphqlHTTP((req,res) =>({
        schema,
        graphiql:  {
            headerEditorEnabled: true,
            shouldPersistHeader: true,
            headers: true
        },
        context: { user: req.user },
    }))));
}


const authMiddleware = expressjwt({
    secret: process.env.JWT_SECRET, // Replace with your secret key

    algorithms: ['HS256'], // Use HS256 or the appropriate algorithm for your setup
  });
  
  // Use the authentication middleware for protected routes
  app.use(authMiddleware);
  

app.listen(port, () => console.log(ansi.green.bold.underline(`server running on port ${port}`)));