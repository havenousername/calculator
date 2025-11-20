import {Router} from "express";
import {postCalculation} from "./controller";

const router = Router();
router.post('/calculation', (req, res) => {
  const state = postCalculation(req);
  res.send({ ...state, stateName: state.fx.name, operation: state.operation?.name });
});


router.get('/health', (_, res) => {
  res.status(200).send({
    message: process.env.MESSAGE ?? 'OK',
  });
})

export default router;