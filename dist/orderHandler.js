import { Model } from "mongoose";
import { Order, OrderDirection, OrderStatus, OrderType } from "./schema";
import { Logger } from "add_logger";
export class TestOrderHandler {
    candles;
    logger;
    constructor(candleSchema, params) {
        this.candles = candleSchema;
        this.logger = params.logger;
    }
    getActiveOrders() {
        return Order.find({
            status: { $in: ["submitted", "pending"] }
        });
    }
    submitOrder(order) {
        this.logger.info(`Submitting order ${order._id}`);
        order.status = OrderStatus.SUBMITTED;
        order.submission_timestamp = Date.now();
        return order.save();
    }
    async checkOrder(order) {
        this.logger.info(`Checking order`);
        this.logger.debug(order);
        return this.candles.find({
            interval_minutes: 1,
            symbol: order.symbol,
            $or: [
                { open_timestamp: { $lte: order.submission_timestamp }, close_timestamp: { $gte: order.submission_timestamp } }, // the candle of the submission time
                { open_timestamp: { $gte: order.submission_timestamp } } // candles after the submission
            ]
        })
            .sort({ open_timestamp: 1 })
            .then((recentCandles) => {
            this.logger.info('Candles found: ', recentCandles.length);
            if (recentCandles.length === 0) {
                return order; // No candles to check against
            }
            let orderFilled = false;
            let filledPrice = null;
            for (const candle of recentCandles) {
                if (order.type === OrderType.LIMIT) {
                    if (order.direction === OrderDirection.LONG && candle.low <= order.price1) {
                        orderFilled = true;
                        filledPrice = order.price1;
                        break;
                    }
                    else if (order.direction === OrderDirection.SHORT && candle.high >= order.price1) {
                        orderFilled = true;
                        filledPrice = order.price1;
                        break;
                    }
                }
                else if (order.type === OrderType.MARKET) {
                    orderFilled = true;
                    filledPrice = candle.high;
                    break;
                }
            }
            if (orderFilled) {
                order.status = OrderStatus.FILLED;
                order.execution_timestamp = Date.now();
                // Simulate filling trades
                if (!order.trades) {
                    order.trades = [];
                }
                order.trades.push({ price: filledPrice, timestamp: order.execution_timestamp });
                this.logger.info(`Order filled: `, filledPrice, order._id, order.trades);
                this.logger.debug(order);
            }
            else {
                this.logger.info(`Order not filled: `, order._id, order.status);
                this.logger.debug(order);
            }
            return order.save();
        });
    }
    async cancelOrder(order) {
        order.status = OrderStatus.CANCELLED;
        return order.save()
            .then((order) => {
            this.logger.info(`Cancelled ${order.symbol} order#${order._id}`);
            return order;
        });
    }
    async cancelAllOrders() {
        return this.getActiveOrders().then((orders) => {
            this.logger.info(`Found ${orders.length} orders to cancel`);
            return Promise.all(orders.map(order => this.cancelOrder(order)));
        });
    }
}
