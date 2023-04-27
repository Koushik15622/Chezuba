var express = require("express");
const shortid = require('shortid');
var LightningDeal = require("../models/dealModel");
var Order = require("../models/orderModel");
const User = require("../models/userModel");
// Customer handler
const custHandler = express.Router();

var sessionChecker = (req, res, next) => {
  if (req.session.user==undefined) {
    res.status(400).json({ error: 'Session expired!! LogIn again' });  }
  else{
      next();
    }
};

// Customer actions handler
custHandler.route('/lightningDeals').get(sessionChecker, async (req, res) => {
    try {
      // Get all available unexpired lightning deals
      const currentTime = new Date();
      const lightningDeals = await LightningDeal.find({ expiryTime: { $gt: currentTime } });
      res.json(lightningDeals);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get lightning deals' });
    }
  });
  
custHandler.route('/order/:dealId').post(sessionChecker, async (req, res) => {
  // Get the lightning deal for the order
  const lightningDeal = await LightningDeal.findOne({ dealId: req.params.dealId });
  if (!lightningDeal) {
    return res.status(404).json({ error: 'Lightning deal not found' });
  }

  // Check if the lightning deal has expired
  const currentTime = new Date();
  if (lightningDeal.expiryTime < currentTime) {
    return res.status(400).json({ error: 'Lightning deal has expired' });
  }

  // Check if the requested quantity is available
  if (lightningDeal.availableUnits < req.body.quantity) {
    return res.status(400).json({ error: 'Insufficient quantity available' });
  }
  //Check for minimum quantity
  if (req.body.quantity < 1) {
    return res.status(400).json({ error: 'Quantity needs to be more than 0' });
  }
  // Create a new order
  var odrId = shortid.generate()
  try {
    const order = await Order.create({
      orderId: odrId,
      dealId: req.params.dealId,
      userId: req.session.user.name,
      quantity: req.body.quantity,
      totalPrice: lightningDeal.finalPrice * req.body.quantity
    });
  } catch (err) {
    console.log(err);
    res.status(400).json(
      { failed: 'failed to place the order' });
  }

  //Update user profile
  try {
    var user = await User.findOne({ name: req.session.user.name });
    user.orders.push(odrId);
    await user.save();
  } catch (err) {
    console.log(err);
    res.status(400).json({ failed: 'failed to update the profile' });
  }

  // Update available units of the lightning deal
  try {
    lightningDeal.availableUnits -= req.body.quantity;
    await lightningDeal.save();
  } catch (err) {
    console.log(err);
    res.status(400).json({ failed: 'failed to update the deal' });
  }

  res.status(200).json({success:"order successfully placed"});

});
  
custHandler.route('/orders/:orderId').get(sessionChecker, async (req, res) => {
    try {
      // Get the order by orderId
      const order = await Order.findOne({orderId:req.params.orderId});
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get order' });
    }
  });

custHandler.route('/profile').get(sessionChecker, async (req,res)=>{
  res.status(200).json(await User.findOne({name: req.session.user.name}));
})
  
  module.exports = custHandler;