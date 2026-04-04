import { motion } from 'framer-motion';
import { FiPackage, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useState } from 'react';

const STATUS_COLORS = {
  PENDING:          '#f59e0b',
  CONFIRMED:        '#3b82f6',
  PROCESSING:       '#8b5cf6',
  SHIPPED:          '#06b6d4',
  OUT_FOR_DELIVERY: '#f97316',
  DELIVERED:        '#10b981',
  CANCELLED:        '#ef4444',
  REFUNDED:         '#9ca3af',
};

export default function OrderHistoryCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const color = STATUS_COLORS[order.status] || '#6b7280';

  return (
    <motion.div
      className="order-card"
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="order-card__header" onClick={() => setExpanded(e => !e)}>
        <div className="order-card__left">
          <FiPackage size={16} style={{ color }} />
          <div>
            <span className="order-card__number">{order.orderNumber}</span>
            <span className="order-card__date">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
          </div>
        </div>
        <div className="order-card__right">
          <span className="order-card__status" style={{ color, background: color + '1a' }}>
            {order.status.replace(/_/g, ' ')}
          </span>
          <span className="order-card__total">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
          {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </div>
      </div>

      {expanded && (
        <motion.div
          className="order-card__body"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="order-card__items">
            {order.items?.map((item, i) => (
              <div key={i} className="order-item-row">
                <span className="order-item-row__name">{item.productName}</span>
                <span className="order-item-row__qty">× {item.quantity}</span>
                <span className="order-item-row__price">₹{parseFloat(item.totalPrice).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="order-card__footer">
            <span>Payment: <strong>{order.paymentMethod}</strong></span>
            <span>
              Subtotal ₹{parseFloat(order.subtotal).toFixed(2)} + Delivery ₹{parseFloat(order.deliveryFee).toFixed(2)}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
