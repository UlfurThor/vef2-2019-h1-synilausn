const express = require('express');
const catchErrors = require('../utils/catchErrors');
const { requireAuth, checkUserIsAdmin } = require('../authentication/auth');

const requireAdmin = [requireAuth, checkUserIsAdmin];

const {
  listCategories,
  listCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('./categories');

const {
  listUsers,
  listUser,
  updateUser,
  currentUser,
  updateCurrentUser,
} = require('./users');

const {
  listProducts,
  createProduct,
  listProduct,
  updateProduct,
  deleteProduct,
} = require('./products');

const {
  listCart,
  addToCart,
  listCartLine,
  updateCartLine,
  deleteCartLine,
} = require('./cart');

const { listOrders, createOrder, listOrder } = require('./orders');

const router = express.Router();

function indexRoute(req, res) {
  return res.json({
    users: {
      users: '/users',
      user: '/users/{id}',
      register: '/users/register',
      login: '/users/login',
      me: '/users/me',
    },
    products: {
      products: '/products?search={query}&category={name}',
      product: '/products/{id}',
    },
    categories: '/categories',
    cart: {
      cart: '/cart',
      line: '/cart/line/{id}',
    },
    orders: {
      orders: '/orders',
      order: '/orders/{id}',
    },
  });
}

function pathLog(req, res, next) {
  const { originalUrl, params, query, body } = req;
  const { origin } = req.headers;
  const p = { originalUrl, params, query, body, origin };
  console.info();
  console.info();
  console.info();
  console.info();
  console.info('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
  console.info(p);
  console.info('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
  return next();
}

router.get('/', pathLog, indexRoute);

router.get('/users', pathLog, requireAdmin, catchErrors(listUsers));
router.get('/users/me', pathLog, requireAuth, catchErrors(currentUser));
router.patch('/users/me', pathLog, requireAuth, catchErrors(updateCurrentUser));
router.get('/users/:id', pathLog, requireAdmin, catchErrors(listUser));
router.patch('/users/:id', pathLog, requireAdmin, catchErrors(updateUser));

router.get('/products', pathLog, catchErrors(listProducts));
router.post('/products', pathLog, requireAdmin, catchErrors(createProduct));
router.get('/products/:id', pathLog, catchErrors(listProduct));
router.patch(
  '/products/:id',
  pathLog,
  requireAdmin,
  catchErrors(updateProduct),
);
router.delete(
  '/products/:id',
  pathLog,
  requireAdmin,
  catchErrors(deleteProduct),
);

router.get('/categories', pathLog, catchErrors(listCategories));
router.post('/categories', pathLog, requireAdmin, catchErrors(createCategory));
router.get('/categories/:id', pathLog, catchErrors(listCategory));
router.patch(
  '/categories/:id',
  pathLog,
  requireAdmin,
  catchErrors(updateCategory),
);
router.delete(
  '/categories/:id',
  pathLog,
  requireAdmin,
  catchErrors(deleteCategory),
);

router.get('/cart', pathLog, requireAuth, catchErrors(listCart));
router.post('/cart', pathLog, requireAuth, catchErrors(addToCart));
router.get('/cart/line/:id', pathLog, requireAuth, catchErrors(listCartLine));
router.patch(
  '/cart/line/:id',
  pathLog,
  requireAuth,
  catchErrors(updateCartLine),
);
router.delete(
  '/cart/line/:id',
  pathLog,
  requireAuth,
  catchErrors(deleteCartLine),
);

router.get('/orders', pathLog, requireAuth, catchErrors(listOrders));
router.post('/orders', pathLog, requireAuth, catchErrors(createOrder));
router.get('/orders/:id', pathLog, requireAuth, catchErrors(listOrder));

module.exports = router;
