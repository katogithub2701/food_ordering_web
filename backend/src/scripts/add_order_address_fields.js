const sequelize = require('../config/database');

async function addOrderAddressFields() {
  try {
    console.log('Adding address fields to Order table...');
    
    // Check if columns already exist before adding them
    const tableInfo = await sequelize.query("PRAGMA table_info(Orders);");
    const columns = tableInfo[0].map(col => col.name);
    
    if (!columns.includes('deliveryAddress')) {
      await sequelize.query("ALTER TABLE Orders ADD COLUMN deliveryAddress TEXT;");
      console.log('Added deliveryAddress column');
    }
    
    if (!columns.includes('contactPhone')) {
      await sequelize.query("ALTER TABLE Orders ADD COLUMN contactPhone VARCHAR(255);");
      console.log('Added contactPhone column');
    }
    
    if (!columns.includes('recipientName')) {
      await sequelize.query("ALTER TABLE Orders ADD COLUMN recipientName VARCHAR(255);");
      console.log('Added recipientName column');
    }
    
    if (!columns.includes('customerNotes')) {
      await sequelize.query("ALTER TABLE Orders ADD COLUMN customerNotes TEXT;");
      console.log('Added customerNotes column');
    }
    
    if (!columns.includes('shippingFee')) {
      await sequelize.query("ALTER TABLE Orders ADD COLUMN shippingFee REAL DEFAULT 0;");
      console.log('Added shippingFee column');
    }
    
    if (!columns.includes('paymentMethod')) {
      await sequelize.query("ALTER TABLE Orders ADD COLUMN paymentMethod VARCHAR(255) DEFAULT 'cash';");
      console.log('Added paymentMethod column');
    }
    
    console.log('Successfully added address fields to Order table');
    process.exit(0);
  } catch (error) {
    console.error('Error adding address fields:', error);
    process.exit(1);
  }
}

addOrderAddressFields();
