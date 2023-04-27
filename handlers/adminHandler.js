var express = require("express");
var LightningDeal = require("../models/dealModel");
var Order = require("../models/orderModel");
var Deal = require("../models/dealModel");
// Admin handler
const adminHandler = express.Router();

var adminChecker = (req, res, next) => {
  if (req.session.user.role != "admin") {
    res.status(400).json({ error: 'You are not admin' });  }
    else{
      next();
    }
};

// Create a new lightning deal
adminHandler.route("/addDeal").post(adminChecker, async (req, res) => {
  try {
    var newDeal = new Deal({
      dealId: req.body.dealId,
      productName: req.body.productName,
      actualPrice: req.body.actualPrice,
      finalPrice: req.body.finalPrice,
      totalUnits: req.body.totalUnits,
      availableUnits: req.body.availableUnits,
      expiryTime: req.body.expiryTime
    });
    await newDeal.save();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to create lightning deal' });
    return;
  }
  res.status(200).json({success:"Deal created"});
});

// Update a lightning deal
adminHandler.route('/updateDeal/:dealId').put(adminChecker, async (req, res) => {
  const dealId = req.params.dealId;
  try {
    const updatedDeal = await LightningDeal.updateOne({dealId: dealId}, req.body, { new: true });
    if (updatedDeal) {
      res.json(updatedDeal);
    } else {
      res.status(404).json({ error: 'Deal not found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to update lightning deal' });
  }
});

// Approve an order
adminHandler.route('/orders/approve/:orderId').put(adminChecker, async (req, res) => {
  const orderId = req.params.orderId;
  try {
    const updatedOrder = await Order.updateOne({orderId: orderId}, { status: 'Approved' }, { new: true });
    if (updatedOrder) {
      res.json(updatedOrder);
    } else {
      res.status(404).json({ error: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve order' });
  }
});

//See all placed orders
adminHandler.route('/orders').get(adminChecker, async(req,res)=> {
try{
  var orders = await Order.find({status:"Placed"});
  if(orders==null){
    res.status(201).json({note : "No new orders placed"})
    return;
  }
  res.status(200).json(orders);
} catch(err) {
  console.log(err);
  res.status(500).json({err:"error in fetching orders"});
  return;
}
});

module.exports = adminHandler;
