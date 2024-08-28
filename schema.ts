import * as mongoose from 'mongoose';

export const ORDER_QUANTITY_UNIT_BASE = 'base';
export const ORDER_QUANTITY_UNIT_QUOTE = 'quote';
export const ORDER_QUANTITY_UNIT_PERCENT = 'percent';

export const ORDER_DIRECTION_LONG = 'long';
export const ORDER_DIRECTION_SHORT = 'short';

export const ORDER_TYPE_LIMIT = 'limit';
export const ORDER_TYPE_MARKET = 'market';
export const ORDER_TYPE_OCO = 'oco';
export const ORDER_TYPE_STOP_MARKET = 'stop_market';

export enum OrderQuantityUnit {
  BASE = ORDER_QUANTITY_UNIT_BASE,
  QUOTE = ORDER_QUANTITY_UNIT_QUOTE,
  PERCENT = ORDER_QUANTITY_UNIT_PERCENT
}

export interface OrderQuantityInterface {
  quantity: number;
  unit: OrderQuantityUnit;
}


export enum OrderDirection {
  LONG = ORDER_DIRECTION_LONG,
  SHORT = ORDER_DIRECTION_SHORT
}

export enum OrderType {
  LIMIT = ORDER_TYPE_LIMIT,
  MARKET = ORDER_TYPE_MARKET,
  OCO = ORDER_TYPE_OCO,
  STOP_MARKET = ORDER_TYPE_STOP_MARKET
}

const orderQuantitySchema = new mongoose.Schema({
  quantity: { type: Number, required: true },
  unit: { type: String, enum: Object.values(OrderQuantityUnit), required: true }
}, { _id: false });


export type OrderQuantity = mongoose.InferSchemaType<typeof OrderSchema> & OrderQuantityInterface;

export enum OrderStatus {
  TEST = 'test',
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled'
}

export interface Instrument {
  type: string, // spot
  symbol: string, // BTCUSDT
}


export interface SubmittedOrder {
  external_id: string;
}


export const OrderSchema = new mongoose.Schema(
  {
    instrument_type: {
      type: String,
      required: true,
      enum: ['spot'],
      default: 'spot'
    },
    symbol: {
      type: String,
      required: true
    },
    direction: {
      type: String,
      enum: Object.values(OrderDirection),
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus)
    },
    type: {
      type: String,
      enum: Object.values(OrderType),
      required: true
    },
    price1: {
      type: Number,
      default: null
    },
    price2: {
      type: Number,
      default: null
    },
    price3: {
      type: Number,
      default: null
    },
    quantity: { type: orderQuantitySchema, required: true },
    time_in_force: { type: String, enum: ['GTC', 'IOC', 'FOK'], default: 'GTC' },
    other_parameters: {
      type: Object,
      default: {}
    },
    submission_timestamp: {
      type: Number,
      default: null
    },
    execution_timestamp: {
      type: Number,
      default: null
    },
    cancellation_timestamp: {
      type: Number,
      default: null
    },
    external_id: {
      type: String,
      default: null,
    },
    trades: {
      type: Array<Object>,
      default: null
    },
    full_data: {
      type: Object,
      default: null
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt timestamps
  },
);

export type Order = mongoose.InferSchemaType<typeof OrderSchema> & mongoose.Document & SubmittedOrder;
export const Order = mongoose.model('Order', OrderSchema);