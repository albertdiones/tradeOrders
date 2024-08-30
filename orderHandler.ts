import { Model } from "mongoose";
import { Order, OrderDirection, OrderStatus, OrderType, type SubmittedOrder } from "./schema";
import { Logger } from "add_logger";



export interface OrderHandler {

    /**
     * Submit the order to the exchange
     * 
     * @param order 
     */
    submitOrder(order: Order): Promise<Order>;

    /**
     * check the status of the order on the exchange,
     * update the Order document if applicable
     * 
     * @param tradeIntent 
     */
    checkOrder(order: SubmittedOrder): Promise<Order | null>;

    /**
     * fetches all the orders from the exchange
     * 
     * @param tradeIntent 
     */
    getActiveOrders(order: SubmittedOrder): Promise<Order[]>;

    /**
     * Cancel a singular order on the exchange
     */
    cancelOrder(order: SubmittedOrder): Promise<Order>;

    /**
     * Cancel all active orders on the exchange
     */
    cancelAllOrders(): Promise<Order[]>;
}




export class TestOrderHandler implements OrderHandler {

    candles: Model<any>;
    logger: Logger;

    constructor(candleSchema: Model<any>, params: { logger: Logger}) {
        this.candles = candleSchema;
        this.logger = params.logger;
    }

    submitOrder(order: Order): Promise<Order> {
        this.logger.info(`Submitting order ${order._id}`);

        order.status = OrderStatus.SUBMITTED;
        order.submission_timestamp = Date.now();

        return order.save();
    }

    async checkOrder(order: Order): Promise<Order | null> {
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
        .then(
            (recentCandles) => {
                this.logger.info('Candles found: ', recentCandles.length);
                if (recentCandles.length === 0) {
                    return order; // No candles to check against
                }
        
                let orderFilled: boolean = false;
                let filledPrice: number | null = null;
        
                for (const candle of recentCandles) {
                    if (order.type === OrderType.LIMIT) {
                        if (order.direction === OrderDirection.LONG && candle.low <= order.price1) {
                            orderFilled = true;
                            filledPrice = order.price1;
                            break;
                        } else if (order.direction === OrderDirection.SHORT && candle.high >= order.price1) {
                            orderFilled = true;
                            filledPrice = order.price1;
                            break;
                        }
                    } else if (order.type === OrderType.MARKET) {
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
            }
        )
    }    

    async cancelOrder(order: Order): Promise<Order> {
        order.status = OrderStatus.CANCELLED;
        return order.save()
            .then(
                (order) => {
                    this.logger.info(`Cancelled ${order.symbol} order#${order._id}`);
                    return order;
                }
            );
    }

    async cancelAllOrders(): Promise<Order[]> {
        return Order.find(
            {
                status: { $in: ["submitted", "pending"] }
            }
        ).then(
            (orders: Order[]) => {
                this.logger.info(`Found ${orders.length} orders to cancel`);
                return Promise.all(
                    orders.map(
                        order => this.cancelOrder(order)
                    )
                );
            }
        );
    }
}