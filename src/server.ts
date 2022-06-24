// projects can be start with npm x where x is the name of the script located in package.json
import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import compression from 'compression'
import laundryRoute from './routes/laundry';
import courseRoute from './routes/course';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import cors from "cors";

const router: Express = express();
const compressionFilter = (req: express.Request<ParamsDictionary, any, any, ParsedQs>, res: express.Response) => {
    if (req.header("x-no-compression"))
        return false

    return compression.filter(req, res)
}
/** compression for a bit of performance optimization **/
router.use(compression({ filter: compressionFilter }))
/** Logging */
router.use(morgan('dev'));
/** Parse the request */
router.use(express.urlencoded({ extended: false }));
/** Takes care of JSON data */
router.use(express.json());

router.use(cors())

/** Routes */
router.use('/api/v1/', courseRoute, laundryRoute);

/** Error handling */
router.use((req, res, next) => {
    return res.status(404).json({
        message: 'Not found'
    });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));
