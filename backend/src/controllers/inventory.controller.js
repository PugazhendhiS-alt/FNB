const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function genNo(prefix) {
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

// ─── Categories ───────────────────────────────────────────────────────────────

async function getCategories(req, res, next) {
  try {
    const items = await prisma.inventoryCategory.findMany({
      include: { _count: { select: { items: true, children: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function createCategory(req, res, next) {
  try {
    const { name, description, parentId } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const item = await prisma.inventoryCategory.create({ data: { name, description, parentId } });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function updateCategory(req, res, next) {
  try {
    const { name, description, parentId, isActive } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (parentId !== undefined) data.parentId = parentId || null;
    if (isActive !== undefined) data.isActive = isActive;
    const item = await prisma.inventoryCategory.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) { next(err); }
}

async function deleteCategory(req, res, next) {
  try {
    await prisma.inventoryCategory.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Items ────────────────────────────────────────────────────────────────────

async function getItems(req, res, next) {
  try {
    const { restaurantId, categoryId, isActive } = req.query;
    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (categoryId) where.categoryId = categoryId;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    const items = await prisma.inventoryItem.findMany({
      where,
      include: { category: true, vendor: true, stock: true },
      orderBy: { name: 'asc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function getItem(req, res, next) {
  try {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
      include: { category: true, vendor: true, stock: true },
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) { next(err); }
}

async function createItem(req, res, next) {
  try {
    const { name, sku, barcode, categoryId, unit, costPrice, sellingPrice, vendorId,
      reorderLevel, reorderQty, minStock, maxStock, storageLocation, batchNo, expiryDate,
      image, restaurantId } = req.body;
    if (!name || !sku) return res.status(400).json({ message: 'Name and SKU are required' });
    const item = await prisma.inventoryItem.create({
      data: { name, sku, barcode, categoryId, unit: unit || 'pcs', costPrice: costPrice || 0,
        sellingPrice: sellingPrice || 0, vendorId, reorderLevel: reorderLevel || 0,
        reorderQty: reorderQty || 0, minStock: minStock || 0, maxStock: maxStock || 0,
        storageLocation, batchNo, expiryDate: expiryDate ? new Date(expiryDate) : null,
        image, restaurantId, stock: { create: { quantity: 0, reserved: 0, available: 0 } } },
      include: { stock: true },
    });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function updateItem(req, res, next) {
  try {
    const { id } = req.params;
    const { name, sku, barcode, categoryId, unit, costPrice, sellingPrice, vendorId,
      reorderLevel, reorderQty, minStock, maxStock, storageLocation, batchNo, expiryDate,
      image, isActive } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (sku !== undefined) data.sku = sku;
    if (barcode !== undefined) data.barcode = barcode;
    if (categoryId !== undefined) data.categoryId = categoryId || null;
    if (unit !== undefined) data.unit = unit;
    if (costPrice !== undefined) data.costPrice = costPrice;
    if (sellingPrice !== undefined) data.sellingPrice = sellingPrice;
    if (vendorId !== undefined) data.vendorId = vendorId || null;
    if (reorderLevel !== undefined) data.reorderLevel = reorderLevel;
    if (reorderQty !== undefined) data.reorderQty = reorderQty;
    if (minStock !== undefined) data.minStock = minStock;
    if (maxStock !== undefined) data.maxStock = maxStock;
    if (storageLocation !== undefined) data.storageLocation = storageLocation;
    if (batchNo !== undefined) data.batchNo = batchNo;
    if (expiryDate !== undefined) data.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (image !== undefined) data.image = image;
    if (isActive !== undefined) data.isActive = isActive;
    const item = await prisma.inventoryItem.update({ where: { id }, data, include: { stock: true } });
    res.json(item);
  } catch (err) { next(err); }
}

async function deleteItem(req, res, next) {
  try {
    await prisma.inventoryItem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Stock ────────────────────────────────────────────────────────────────────

async function updateStock(req, res, next) {
  try {
    const { itemId, quantity } = req.body;
    const stock = await prisma.inventoryStock.findUnique({ where: { itemId } });
    if (!stock) return res.status(404).json({ message: 'Stock record not found' });
    const available = stock.available + quantity;
    if (available < 0) return res.status(400).json({ message: 'Insufficient stock' });
    const updated = await prisma.inventoryStock.update({
      where: { itemId },
      data: { quantity: stock.quantity + quantity, available, updatedAt: new Date() },
    });
    await prisma.inventoryMovement.create({
      data: {
        itemId, type: quantity > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(quantity),
        balanceBefore: stock.available,
        balanceAfter: available,
        reference: 'MANUAL',
        createdById: req.user?.id,
      },
    });
    res.json(updated);
  } catch (err) { next(err); }
}

// ─── Vendors ──────────────────────────────────────────────────────────────────

async function getVendors(req, res, next) {
  try {
    const items = await prisma.vendor.findMany({
      include: { _count: { select: { items: true, purchaseOrders: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function createVendor(req, res, next) {
  try {
    const { name, contactPerson, email, phone, gstNo, address, paymentTerms } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const item = await prisma.vendor.create({ data: { name, contactPerson, email, phone, gstNo, address, paymentTerms } });
    res.status(201).json(item);
  } catch (err) { next(err); }
}

async function updateVendor(req, res, next) {
  try {
    const { name, contactPerson, email, phone, gstNo, address, paymentTerms, isActive } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (contactPerson !== undefined) data.contactPerson = contactPerson;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (gstNo !== undefined) data.gstNo = gstNo;
    if (address !== undefined) data.address = address;
    if (paymentTerms !== undefined) data.paymentTerms = paymentTerms;
    if (isActive !== undefined) data.isActive = isActive;
    const item = await prisma.vendor.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) { next(err); }
}

async function deleteVendor(req, res, next) {
  try {
    await prisma.vendor.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Purchase Orders ──────────────────────────────────────────────────────────

async function getPurchaseOrders(req, res, next) {
  try {
    const { restaurantId, status } = req.query;
    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (status) where.status = status;
    const items = await prisma.purchaseOrder.findMany({
      where,
      include: { vendor: true, restaurant: true, items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function createPurchaseOrder(req, res, next) {
  try {
    const { vendorId, restaurantId, notes, items } = req.body;
    if (!vendorId || !items?.length) return res.status(400).json({ message: 'Vendor and items required' });
    let totalAmount = 0;
    const poItems = items.map(i => {
      const total = (i.unitPrice || 0) * (i.quantity || 0);
      totalAmount += total;
      return { itemId: i.itemId, quantity: i.quantity, unitPrice: i.unitPrice || 0, totalPrice: total };
    });
    const po = await prisma.purchaseOrder.create({
      data: {
        poNumber: genNo('PO'), vendorId, restaurantId, notes,
        totalAmount, status: 'DRAFT', items: { create: poItems },
      },
      include: { vendor: true, items: { include: { item: true } } },
    });
    res.status(201).json(po);
  } catch (err) { next(err); }
}

async function updatePurchaseOrder(req, res, next) {
  try {
    const { status, notes } = req.body;
    const data = {};
    if (status) data.status = status;
    if (notes !== undefined) data.notes = notes;
    const po = await prisma.purchaseOrder.update({
      where: { id: req.params.id }, data,
      include: { vendor: true, items: { include: { item: true } } },
    });
    res.json(po);
  } catch (err) { next(err); }
}

// ─── Goods Receipt ────────────────────────────────────────────────────────────

async function getGoodsReceipts(req, res, next) {
  try {
    const { restaurantId, purchaseOrderId } = req.query;
    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (purchaseOrderId) where.purchaseOrderId = purchaseOrderId;
    const items = await prisma.goodsReceipt.findMany({
      where, include: { vendor: true, purchaseOrder: true, items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function createGoodsReceipt(req, res, next) {
  try {
    const { purchaseOrderId, vendorId, restaurantId, notes, items } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Items required' });
    const grn = await prisma.goodsReceipt.create({
      data: {
        grnNumber: genNo('GRN'), purchaseOrderId, vendorId, restaurantId, notes,
        receivedBy: req.user?.id,
        items: { create: items.map(i => ({
          itemId: i.itemId, quantity: i.quantity, damagedQty: i.damagedQty || 0,
          unitPrice: i.unitPrice || 0, batchNo: i.batchNo, expiryDate: i.expiryDate ? new Date(i.expiryDate) : null,
        })) },
      },
      include: { items: { include: { item: true } } },
    });
    for (const i of items) {
      const qty = (i.quantity || 0) - (i.damagedQty || 0);
      if (qty > 0) {
        const stock = await prisma.inventoryStock.findUnique({ where: { itemId: i.itemId } });
        if (stock) {
          const bal = stock.available + qty;
          await prisma.inventoryStock.update({ where: { itemId: i.itemId }, data: { quantity: stock.quantity + qty, available: bal, updatedAt: new Date() } });
          await prisma.inventoryMovement.create({ data: { itemId: i.itemId, type: 'IN', quantity: qty, balanceBefore: stock.available, balanceAfter: bal, reference: 'GRN', referenceId: grn.id, notes: `GRN ${grn.grnNumber}`, restaurantId } });
        }
      }
    }
    if (purchaseOrderId) {
      await prisma.purchaseOrder.update({ where: { id: purchaseOrderId }, data: { status: 'RECEIVED' } });
    }
    res.status(201).json(grn);
  } catch (err) { next(err); }
}

// ─── Stock Transfers ──────────────────────────────────────────────────────────

async function getTransfers(req, res, next) {
  try {
    const { fromRestaurantId, toRestaurantId, status } = req.query;
    const where = {};
    if (fromRestaurantId) where.fromRestaurantId = fromRestaurantId;
    if (toRestaurantId) where.toRestaurantId = toRestaurantId;
    if (status) where.status = status;
    const items = await prisma.stockTransfer.findMany({
      where, include: { fromRestaurant: true, toRestaurant: true, items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function createTransfer(req, res, next) {
  try {
    const { fromRestaurantId, toRestaurantId, notes, items } = req.body;
    if (!fromRestaurantId || !toRestaurantId || !items?.length) return res.status(400).json({ message: 'From, To, and items required' });
    for (const i of items) {
      const stock = await prisma.inventoryStock.findUnique({ where: { itemId: i.itemId } });
      if (!stock || stock.available < i.quantity) {
        const item = await prisma.inventoryItem.findUnique({ where: { id: i.itemId } });
        return res.status(400).json({ message: `Insufficient stock for ${item?.name || i.itemId}` });
      }
    }
    const transfer = await prisma.stockTransfer.create({
      data: {
        transferNo: genNo('TFR'), fromRestaurantId, toRestaurantId, notes,
        requestedBy: req.user?.id,
        items: { create: items.map(i => ({ itemId: i.itemId, quantity: i.quantity })) },
      },
      include: { fromRestaurant: true, toRestaurant: true, items: { include: { item: true } } },
    });
    res.status(201).json(transfer);
  } catch (err) { next(err); }
}

async function updateTransfer(req, res, next) {
  try {
    const { status } = req.body;
    const transfer = await prisma.stockTransfer.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!transfer) return res.status(404).json({ message: 'Transfer not found' });
    if (status === 'APPROVED') {
      for (const i of transfer.items) {
        const stock = await prisma.inventoryStock.findUnique({ where: { itemId: i.itemId } });
        if (stock) {
          const bal = stock.available - i.quantity;
          await prisma.inventoryStock.update({ where: { itemId: i.itemId }, data: { quantity: stock.quantity - i.quantity, available: bal, updatedAt: new Date() } });
          await prisma.inventoryMovement.create({ data: { itemId: i.itemId, type: 'OUT', quantity: i.quantity, balanceBefore: stock.available, balanceAfter: bal, reference: 'TRANSFER_OUT', referenceId: transfer.id, notes: `Transfer ${transfer.transferNo}`, restaurantId: transfer.fromRestaurantId } });
        }
      }
    } else if (status === 'RECEIVED') {
      for (const i of transfer.items) {
        const stock = await prisma.inventoryStock.findUnique({ where: { itemId: i.itemId } });
        const qty = stock ? i.quantity : 0;
        if (stock) {
          const bal = stock.available + qty;
          await prisma.inventoryStock.update({ where: { itemId: i.itemId }, data: { quantity: stock.quantity + qty, available: bal, updatedAt: new Date() } });
          await prisma.inventoryMovement.create({ data: { itemId: i.itemId, type: 'IN', quantity: qty, balanceBefore: stock.available, balanceAfter: bal, reference: 'TRANSFER_IN', referenceId: transfer.id, notes: `Transfer ${transfer.transferNo}`, restaurantId: transfer.toRestaurantId } });
        }
        await prisma.stockTransferItem.update({ where: { id: i.id }, data: { receivedQty: qty } });
      }
    }
    const updated = await prisma.stockTransfer.update({
      where: { id: req.params.id }, data: { status, approvedBy: status === 'APPROVED' ? req.user?.id : undefined, receivedBy: status === 'RECEIVED' ? req.user?.id : undefined },
      include: { fromRestaurant: true, toRestaurant: true, items: { include: { item: true } } },
    });
    res.json(updated);
  } catch (err) { next(err); }
}

// ─── Adjustments ──────────────────────────────────────────────────────────────

async function getAdjustments(req, res, next) {
  try {
    const { restaurantId, status } = req.query;
    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (status) where.status = status;
    const items = await prisma.stockAdjustment.findMany({
      where, include: { items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function createAdjustment(req, res, next) {
  try {
    const { restaurantId, type, reason, notes, items } = req.body;
    if (!items?.length || !reason) return res.status(400).json({ message: 'Items and reason required' });
    const adj = await prisma.stockAdjustment.create({
      data: {
        adjustmentNo: genNo('ADJ'), restaurantId, type: type || 'NEGATIVE', reason, notes,
        requestedBy: req.user?.id,
        items: { create: items.map(i => ({ itemId: i.itemId, quantity: i.quantity, unitCost: i.unitCost || 0 })) },
      },
      include: { items: { include: { item: true } } },
    });
    res.status(201).json(adj);
  } catch (err) { next(err); }
}

async function approveAdjustment(req, res, next) {
  try {
    const adj = await prisma.stockAdjustment.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!adj) return res.status(404).json({ message: 'Adjustment not found' });
    for (const i of adj.items) {
      const stock = await prisma.inventoryStock.findUnique({ where: { itemId: i.itemId } });
      if (stock) {
        const qty = adj.type === 'POSITIVE' ? i.quantity : -i.quantity;
        const bal = stock.available + qty;
        if (bal < 0) {
          const item = await prisma.inventoryItem.findUnique({ where: { id: i.itemId } });
          return res.status(400).json({ message: `Insufficient stock for ${item?.name || i.itemId}` });
        }
        await prisma.inventoryStock.update({ where: { itemId: i.itemId }, data: { quantity: stock.quantity + qty, available: bal, updatedAt: new Date() } });
        await prisma.inventoryMovement.create({ data: { itemId: i.itemId, type: adj.type === 'POSITIVE' ? 'IN' : 'OUT', quantity: i.quantity, balanceBefore: stock.available, balanceAfter: bal, reference: 'ADJUSTMENT', referenceId: adj.id, notes: `${adj.reason} — ${adj.adjustmentNo}`, restaurantId: adj.restaurantId } });
      }
    }
    const updated = await prisma.stockAdjustment.update({ where: { id: req.params.id }, data: { status: 'APPROVED', approvedBy: req.user?.id }, include: { items: { include: { item: true } } } });
    res.json(updated);
  } catch (err) { next(err); }
}

// ─── Stock Count ──────────────────────────────────────────────────────────────

async function getStockCounts(req, res, next) {
  try {
    const { restaurantId, status } = req.query;
    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (status) where.status = status;
    const items = await prisma.physicalStockCount.findMany({
      where, include: { items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function createStockCount(req, res, next) {
  try {
    const { restaurantId, type, notes, items } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Items required' });
    const countItems = [];
    for (const i of items) {
      const stock = await prisma.inventoryStock.findUnique({ where: { itemId: i.itemId } });
      const systemQty = stock?.available || 0;
      const variance = (i.countedQty || 0) - systemQty;
      countItems.push({ itemId: i.itemId, systemQty, countedQty: i.countedQty || 0, variance, notes: i.notes });
    }
    const count = await prisma.physicalStockCount.create({
      data: {
        countNo: genNo('CNT'), restaurantId, type: type || 'MONTHLY', notes,
        countedBy: req.user?.id, items: { create: countItems },
      },
      include: { items: { include: { item: true } } },
    });
    res.status(201).json(count);
  } catch (err) { next(err); }
}

async function reconcileStockCount(req, res, next) {
  try {
    const count = await prisma.physicalStockCount.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!count) return res.status(404).json({ message: 'Count not found' });
    for (const i of count.items) {
      if (i.variance !== 0) {
        const stock = await prisma.inventoryStock.findUnique({ where: { itemId: i.itemId } });
        if (stock) {
          const bal = stock.available + i.variance;
          await prisma.inventoryStock.update({ where: { itemId: i.itemId }, data: { quantity: stock.quantity + i.variance, available: bal, updatedAt: new Date() } });
          await prisma.inventoryMovement.create({ data: { itemId: i.itemId, type: i.variance > 0 ? 'IN' : 'OUT', quantity: Math.abs(i.variance), balanceBefore: stock.available, balanceAfter: bal, reference: 'COUNT', referenceId: count.id, notes: `Stock count ${count.countNo}`, restaurantId: count.restaurantId } });
        }
      }
    }
    const updated = await prisma.physicalStockCount.update({ where: { id: req.params.id }, data: { status: 'RECONCILED', approvedBy: req.user?.id } });
    res.json(updated);
  } catch (err) { next(err); }
}

// ─── Wastage ──────────────────────────────────────────────────────────────────

async function getWastage(req, res, next) {
  try {
    const { restaurantId, type } = req.query;
    const where = {};
    if (restaurantId) where.restaurantId = restaurantId;
    if (type) where.type = type;
    const items = await prisma.wastageEntry.findMany({
      where, include: { items: { include: { item: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function createWastage(req, res, next) {
  try {
    const { restaurantId, type, notes, items } = req.body;
    if (!items?.length) return res.status(400).json({ message: 'Items required' });
    const entry = await prisma.wastageEntry.create({
      data: {
        wastageNo: genNo('WST'), restaurantId, type: type || 'EXPIRY', notes,
        reportedBy: req.user?.id,
        items: { create: items.map(i => ({ itemId: i.itemId, quantity: i.quantity, unitCost: i.unitCost || 0, reason: i.reason })) },
      },
      include: { items: { include: { item: true } } },
    });
    for (const i of items) {
      const stock = await prisma.inventoryStock.findUnique({ where: { itemId: i.itemId } });
      if (stock) {
        const bal = stock.available - (i.quantity || 0);
        await prisma.inventoryStock.update({ where: { itemId: i.itemId }, data: { quantity: stock.quantity - (i.quantity || 0), available: Math.max(0, bal), updatedAt: new Date() } });
        await prisma.inventoryMovement.create({ data: { itemId: i.itemId, type: 'OUT', quantity: i.quantity, balanceBefore: stock.available, balanceAfter: Math.max(0, bal), reference: 'WASTAGE', referenceId: entry.id, notes: `${entry.type} — ${entry.wastageNo}`, restaurantId } });
      }
    }
    res.status(201).json(entry);
  } catch (err) { next(err); }
}

// ─── Recipe Mapping ───────────────────────────────────────────────────────────

async function getRecipes(req, res, next) {
  try {
    const { menuItemId } = req.query;
    const where = {};
    if (menuItemId) where.menuItemId = menuItemId;
    const items = await prisma.recipeMapping.findMany({
      where,
      include: { menuItem: true, ingredients: { include: { item: true } } },
    });
    res.json(items);
  } catch (err) { next(err); }
}

async function upsertRecipe(req, res, next) {
  try {
    const { menuItemId, servings, ingredients } = req.body;
    if (!menuItemId || !ingredients?.length) return res.status(400).json({ message: 'MenuItem and ingredients required' });
    const existing = await prisma.recipeMapping.findUnique({ where: { menuItemId } });
    if (existing) {
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: existing.id } });
      const updated = await prisma.recipeMapping.update({
        where: { menuItemId },
        data: { servings: servings || 1, ingredients: { create: ingredients.map(i => ({ itemId: i.itemId, quantity: i.quantity, unit: i.unit || 'pcs', wastagePct: i.wastagePct || 0 })) } },
        include: { menuItem: true, ingredients: { include: { item: true } } },
      });
      return res.json(updated);
    }
    const recipe = await prisma.recipeMapping.create({
      data: {
        menuItemId, servings: servings || 1,
        ingredients: { create: ingredients.map(i => ({ itemId: i.itemId, quantity: i.quantity, unit: i.unit || 'pcs', wastagePct: i.wastagePct || 0 })) },
      },
      include: { menuItem: true, ingredients: { include: { item: true } } },
    });
    res.status(201).json(recipe);
  } catch (err) { next(err); }
}

async function deleteRecipe(req, res, next) {
  try {
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: req.params.id } });
    await prisma.recipeMapping.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
}

// ─── Movements ────────────────────────────────────────────────────────────────

async function getMovements(req, res, next) {
  try {
    const { itemId, restaurantId, type, limit: qLimit } = req.query;
    const where = {};
    if (itemId) where.itemId = itemId;
    if (restaurantId) where.restaurantId = restaurantId;
    if (type) where.type = type;
    const items = await prisma.inventoryMovement.findMany({
      where, include: { item: true },
      orderBy: { createdAt: 'desc' },
      take: parseInt(qLimit) || 100,
    });
    res.json(items);
  } catch (err) { next(err); }
}

// ─── Reports ──────────────────────────────────────────────────────────────────

async function getDashboard(req, res, next) {
  try {
    const { restaurantId } = req.query;
    const where = restaurantId ? { restaurantId } : {};
    const stockWhere = restaurantId ? { item: { restaurantId } } : {};
    const items = await prisma.inventoryItem.findMany({ where: { ...where, isActive: true }, include: { stock: true } });
    const lowStock = items.filter(i => i.stock && i.stock.available <= i.reorderLevel && i.reorderLevel > 0);
    const outOfStock = items.filter(i => !i.stock || i.stock.available <= 0);
    const totalValue = items.reduce((s, i) => s + ((i.stock?.available || 0) * i.costPrice), 0);
    const expiring = items.filter(i => i.expiryDate && new Date(i.expiryDate) <= new Date(Date.now() + 30 * 86400000));
    const recentMovements = await prisma.inventoryMovement.findMany({ where: stockWhere, orderBy: { createdAt: 'desc' }, take: 20 });
    res.json({ totalItems: items.length, totalValue, lowStock: lowStock.length, outOfStock: outOfStock.length, lowStockItems: lowStock.slice(0, 10), outOfStockItems: outOfStock.slice(0, 10), expiringItems: expiring.slice(0, 10), recentMovements });
  } catch (err) { next(err); }
}

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  getItems, getItem, createItem, updateItem, deleteItem,
  updateStock,
  getVendors, createVendor, updateVendor, deleteVendor,
  getPurchaseOrders, createPurchaseOrder, updatePurchaseOrder,
  getGoodsReceipts, createGoodsReceipt,
  getTransfers, createTransfer, updateTransfer,
  getAdjustments, createAdjustment, approveAdjustment,
  getStockCounts, createStockCount, reconcileStockCount,
  getWastage, createWastage,
  getRecipes, upsertRecipe, deleteRecipe,
  getMovements, getDashboard,
};
