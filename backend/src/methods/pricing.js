const FREE_DELIVERY_THRESHOLD = 2000; // NPR
const FLAT_DELIVERY_FEE = 100; // NPR — flat COD delivery fee below the threshold

// Delivery fee is free once the cart subtotal clears the threshold, otherwise a flat fee.
function deliveryFee(subtotal) {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;
}

module.exports = { deliveryFee, FREE_DELIVERY_THRESHOLD, FLAT_DELIVERY_FEE };
