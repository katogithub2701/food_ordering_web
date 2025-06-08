const fs = require('fs');
const path = require('path');
const { Restaurant, Food, User } = require('../src/models');
const sequelize = require('../src/config/database');
const bcrypt = require('bcryptjs');

console.log('🚀 Starting restaurant and food data import...\n');

// Simple CSV parser
function parseCSV(filePath) {
  console.log(`📄 Reading file: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    console.log('⚠️ File is empty');
    return [];
  }
  
  const headers = lines[0].split(',').map(h => h.trim());
  console.log(`📋 Headers: ${headers.join(', ')}`);
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"' && (j === 0 || line[j-1] === ',')) {
        inQuotes = true;
      } else if (char === '"' && (j === line.length - 1 || line[j+1] === ',')) {
        inQuotes = false;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row);
    }
  }
  
  console.log(`✅ Parsed ${data.length} data rows`);
  return data;
}

async function importRestaurants() {
  console.log('\n📊 Importing restaurants...');
  
  const restaurantDataPath = path.join(__dirname, '..', 'restaurant_data.csv');
  const restaurants = parseCSV(restaurantDataPath);
  
  let imported = 0;
  for (const restaurantData of restaurants) {
    try {
      // Create restaurant
      const restaurant = await Restaurant.create({
        name: restaurantData.Ten_nha_hang,
        description: restaurantData.Mo_ta_nha_hang,
        address: restaurantData.Dia_chi_nha_hang,
        phone: restaurantData.So_dien_thoai,
        imageUrl: restaurantData.URL_anh_dai_dien,
        category: restaurantData.Loai_hinh,
        openTime: restaurantData.Gio_mo_cua,
        closeTime: restaurantData.Gio_dong_cua,
        rating: 4.5
      });
      
      // Create restaurant user account
      const hashedPassword = await bcrypt.hash(restaurantData.Mat_khau, 10);
      await User.create({
        username: restaurantData.Ten_dang_nhap,
        email: restaurantData.Email,
        password: hashedPassword,
        role: 'restaurant',
        restaurantId: restaurant.id
      });
      
      imported++;
      console.log(`  ✓ ${restaurant.name} (ID: ${restaurant.id})`);
    } catch (error) {
      console.error(`  ❌ Failed: ${restaurantData.Ten_nha_hang} - ${error.message}`);
    }
  }
  
  console.log(`✅ Imported ${imported}/${restaurants.length} restaurants`);
}

async function importFoods() {
  console.log('\n🍽️ Importing foods...');
  
  const foodDataPath = path.join(__dirname, '..', 'restaurant_foods.csv');
  const foods = parseCSV(foodDataPath);
  
  let imported = 0;
  for (const foodData of foods) {
    try {
      await Food.create({
        name: foodData.name,
        description: foodData.description,
        price: parseFloat(foodData.price),
        rating: parseFloat(foodData.rating),
        imageUrl: foodData.imageUrl,
        restaurantId: parseInt(foodData.restaurantId),
        category: foodData.category,
        isAvailable: foodData.isAvailable === '1'
      });
      
      imported++;
      console.log(`  ✓ ${foodData.name} (Restaurant: ${foodData.restaurantId})`);
    } catch (error) {
      console.error(`  ❌ Failed: ${foodData.name} - ${error.message}`);
    }
  }
  
  console.log(`✅ Imported ${imported}/${foods.length} foods`);
}

async function main() {
  try {
    // Initialize database
    console.log('🔧 Syncing database...');
    await sequelize.sync();
    console.log('✓ Database ready');
    
    // Import data
    await importRestaurants();
    await importFoods();
    
    // Show final statistics
    const restaurantCount = await Restaurant.count();
    const foodCount = await Food.count();
    const userCount = await User.count({ where: { role: 'restaurant' } });
    
    console.log('\n🎉 Import completed successfully!');
    console.log('\n📈 Final Statistics:');
    console.log(`   🏪 Restaurants: ${restaurantCount}`);
    console.log(`   🍽️ Foods: ${foodCount}`);
    console.log(`   👤 Restaurant Users: ${userCount}`);
    
  } catch (error) {
    console.error('\n💥 Import failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed');
  }
}

main();
