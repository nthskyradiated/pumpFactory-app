import express from "express";
import { graphqlHTTP } from "express-graphql";
import dotenv from "dotenv";
import connectDB from './config/db.js'
import schema from "./schema/schema.js";
import ansi from '../node_modules/ansi-colors-es6/index.js'
import morgan from "morgan";
import helmet from "helmet";
import vhost from "vhost";
import jwt from 'jsonwebtoken';


const port = process.env.PORT || 5000
dotenv.config()
const app = express()
connectDB()

app.use(morgan('common'));
app.use(helmet({ contentSecurityPolicy: (process.env.NODE_ENV === 'production') ? undefined : false }));



app.use(vhost('api.localhost', graphqlHTTP((req,res) =>({
    schema,
    graphiql: process.env.NODE_ENV === 'development' && {
        headerEditorEnabled: true,
        shouldPersistHeader: true,
        headers: true
    },
    context: { user: req.user },
}))));

app.use((req, res, next) => {
    const token = req.header('x-auth-token'); // Assuming you're sending the token in a header
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // You can access the user data in your routes
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
});

app.listen(port, () => console.log(ansi.green.bold.underline(`server running on port ${port}`)));