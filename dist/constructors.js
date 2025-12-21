import { Order, OrderDirection, OrderType } from "./schema";
export const marketOrder = (instrument, quantity, direction) => {
    const order = new Order({
        instrument_type: instrument.type,
        symbol: instrument.symbol,
        direction: direction,
        status: 'pending',
        type: OrderType.MARKET,
        quantity
    });
    return order;
};
const limitorder = (instrument, price, quantity, direction) => {
    const order = new Order({
        instrument_type: instrument.type,
        symbol: instrument.symbol,
        direction: direction,
        status: 'pending',
        type: OrderType.LIMIT,
        price1: price,
    });
    return order;
};
