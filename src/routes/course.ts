import express from 'express';
import controller from '../controller/course';
const router = express.Router();

router.get('/course/:termId/:courseId', controller.getById);

export = router
