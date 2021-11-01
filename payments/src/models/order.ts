import { OrderStatus } from '@hazzard-org/common';
import mongoose, { Mongoose } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus,
}

interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus,
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
  findByEvent(order: { id: string, version: number }): Promise<OrderDoc | null>;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
}, {
  toJSON: {
    transform(_, ret) {
      ret.id = ret._id;
      delete ret._id;
    },
  },
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  const { id, ...rest } = attrs;
  return new Order({
    _id: id,
    ...rest,
  });
};

orderSchema.statics.findByEvent = (order: { id: string, version: number }) => {
  return Order.findOne({
    _id: order.id,
    version: order.version - 1,
  });
}

export const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);