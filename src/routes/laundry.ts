import express from 'express';
import controller from '../controller/laundry';
const router = express.Router();

router.get('/laundry/:dormitoryId', controller.getByDormitory);

export = router
