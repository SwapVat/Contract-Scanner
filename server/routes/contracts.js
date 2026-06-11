const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getContracts, getContractById } = require('../controllers/scanController');

router.get('/', auth, getContracts);
router.get('/:id', auth, getContractById);

module.exports = router;