import express, { Request, Response } from 'express';
import { NotFoundError, requireAuth, UnauthorizedError, validateRequest } from '@hazzard-org/common';
import mongoose from 'mongoose';
import { param } from 'express-validator';
import { Order } from '../models/order';
const router = express.Router()

router.get(
  '/api/orders/:orderId',
  requireAuth,
  [
    param('orderId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Order id must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket');
    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new UnauthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };