import { faker } from "@faker-js/faker";
import {
  USER_ROLES,
  ORDER_STATUS,
  DELIVERY_PRIORITY,
  DELIVERY_STATUS,
} from "../constants/index.js";

export const generateMockUser = (role = USER_ROLES.USER) => ({
  _id: faker.database.mongodbObjectId(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  email: faker.internet.email().toLowerCase(),
  password: faker.internet.password({ length: 12 }),
  role,
  documents: [],
});

export const generateMockOrder = ({
  customer,
  store,
  status = ORDER_STATUS.CREATED,
} = {}) => {
  const items = Array.from(
    { length: faker.number.int({ min: 1, max: 4 }) },
    () => ({
      name: faker.commerce.productName(),
      quantity: faker.number.int({ min: 1, max: 3 }),
      price: faker.number.int({ min: 1000, max: 50000 }),
    }),
  );

  return {
    _id: faker.database.mongodbObjectId(),
    customer,
    store,
    items,
    deliveryAddress: faker.location.streetAddress(),
    total: items.reduce((total, item) => total + item.price * item.quantity, 0),
    status,
    priority: faker.helpers.arrayElement(Object.values(DELIVERY_PRIORITY)),
  };
};

export const generateMockDelivery = ({
  order,
  courier = null,
  status = DELIVERY_STATUS.PENDING,
} = {}) => {
  const statusHistory = {
    [DELIVERY_STATUS.PENDING]: [DELIVERY_STATUS.PENDING],

    [DELIVERY_STATUS.ASSIGNED]: [
      DELIVERY_STATUS.PENDING,
      DELIVERY_STATUS.ASSIGNED,
    ],

    [DELIVERY_STATUS.PICKED_UP]: [
      DELIVERY_STATUS.PENDING,
      DELIVERY_STATUS.ASSIGNED,
      DELIVERY_STATUS.PICKED_UP,
    ],

    [DELIVERY_STATUS.IN_TRANSIT]: [
      DELIVERY_STATUS.PENDING,
      DELIVERY_STATUS.ASSIGNED,
      DELIVERY_STATUS.PICKED_UP,
      DELIVERY_STATUS.IN_TRANSIT,
    ],

    [DELIVERY_STATUS.DELIVERED]: [
      DELIVERY_STATUS.PENDING,
      DELIVERY_STATUS.ASSIGNED,
      DELIVERY_STATUS.PICKED_UP,
      DELIVERY_STATUS.IN_TRANSIT,
      DELIVERY_STATUS.DELIVERED,
    ],

    [DELIVERY_STATUS.CANCELLED]: [
      DELIVERY_STATUS.PENDING,
      DELIVERY_STATUS.ASSIGNED,
      DELIVERY_STATUS.CANCELLED,
    ],
  };

  const historyStatuses = statusHistory[status];

  if (!historyStatuses) {
    throw new Error(`Estado de entrega no válido: ${status}`);
  }

  const now = Date.now();

  const history = historyStatuses.map((historyStatus, index) => ({
    status: historyStatus,
    note: `Estado generado automáticamente: ${historyStatus}`,
    changedAt: new Date(now - (historyStatuses.length - index) * 60000),
  }));

  return {
    _id: faker.database.mongodbObjectId(),
    order,
    courier,
    status,
    deliveredAt:
      status === DELIVERY_STATUS.DELIVERED
        ? history[history.length - 1].changedAt
        : null,
    history,
  };
};

export const generateMockStore = ({ owner } = {}) => ({
  _id: faker.database.mongodbObjectId(),
  name: faker.company.name(),
  address: faker.location.streetAddress(),
  owner,
  isActive: true,
});
