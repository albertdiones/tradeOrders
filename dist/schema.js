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
export var OrderQuantityUnit;
(function (OrderQuantityUnit) {
    OrderQuantityUnit["BASE"] = "base";
    OrderQuantityUnit["QUOTE"] = "quote";
    OrderQuantityUnit["PERCENT"] = "percent";
})(OrderQuantityUnit || (OrderQuantityUnit = {}));
export var OrderDirection;
(function (OrderDirection) {
    OrderDirection["LONG"] = "long";
    OrderDirection["SHORT"] = "short";
})(OrderDirection || (OrderDirection = {}));
export var OrderType;
(function (OrderType) {
    OrderType["LIMIT"] = "limit";
    OrderType["MARKET"] = "market";
    OrderType["OCO"] = "oco";
    OrderType["STOP_MARKET"] = "stop_market";
})(OrderType || (OrderType = {}));
const orderQuantitySchema = new mongoose.Schema({
    quantity: { type: Number, required: true },
    unit: { type: String, enum: Object.values(OrderQuantityUnit), required: true }
}, { _id: false });
export var OrderStatus;
(function (OrderStatus) {
    OrderStatus["TEST"] = "test";
    OrderStatus["PENDING"] = "pending";
    OrderStatus["SUBMITTED"] = "submitted";
    OrderStatus["PARTIALLY_FILLED"] = "partially_filled";
    OrderStatus["FILLED"] = "filled";
    OrderStatus["CANCELLED"] = "cancelled";
})(OrderStatus || (OrderStatus = {}));
export const OrderSchema = new mongoose.Schema({
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
        type: [mongoose.Schema.Types.Mixed],
        default: null
    },
    full_data: {
        type: Object,
        default: null
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt timestamps
});
export const Order = mongoose.model('Order', OrderSchema);
