import { Order, OrderDirection, type OrderQuantity, type OrderQuantityInterface, OrderType, type Instrument } from "./schema"


export const marketOrder = (instrument: Instrument, quantity: OrderQuantityInterface, direction: OrderDirection): Order => {
    const order: Order = new Order(
        {
            instrument_type: instrument.type,
            symbol: instrument.symbol,
            direction: direction,
            status: 'pending',
            type: OrderType.MARKET,
            quantity
        }
    );

    return order;
}

const limitorder = (instrument: Instrument, price: Number, quantity: OrderQuantity, direction: OrderDirection) => {
    const order: Order = new Order(
        {
            instrument_type: instrument.type,
            symbol: instrument.symbol,
            direction: direction,
            status: 'pending',
            type: OrderType.LIMIT,
            price1: price,
        }
    );

    return order;

}