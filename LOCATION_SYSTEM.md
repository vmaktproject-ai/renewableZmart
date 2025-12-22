# Location-Based System Documentation

## Overview
RenewableZmart now includes a comprehensive location-based filtering system that ensures products, stores, and installers are displayed according to the user's selected country.

## How It Works

### 1. User Registration with Location
When users register, they must provide:
- **Country**: Selected from 54 African countries
- **City/State**: Dynamically populated based on selected country

**Flow:**
```
User selects country → Cities populate → User selects city → Registration submitted
→ User record created with country & city → Auto-populate localStorage location
```

### 2. Backend Data Structure

#### User Entity
```typescript
{
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  country: string      // NEW: User's country
  city: string         // NEW: User's city
  role: UserRole       // CUSTOMER, VENDOR, INSTALLER, ADMIN
  businessName: string // For vendors
  // ... other fields
}
```

#### Store Entity
```typescript
{
  id: string
  name: string
  ownerId: string
  country: string      // Automatically set from vendor's country
  city: string         // Automatically set from vendor's city
  // ... other fields
}
```

#### Product Entity
```typescript
{
  id: string
  name: string
  storeId: string
  country: string      // Automatically set from store's country
  // ... other fields
}
```

### 3. Automatic Location Propagation

#### Vendor Registration Flow
```
1. Vendor registers with country: "Nigeria", city: "Lagos"
2. User created with country="Nigeria", city="Lagos"
3. Store auto-created with country="Nigeria", city="Lagos"
4. localStorage set: { country: "Nigeria", city: "Lagos" }
```

#### Product Creation Flow
```
1. Vendor creates product with storeId
2. System fetches store by storeId
3. Product automatically assigned country from store
4. Product saved with country="Nigeria"
```

### 4. Frontend Filtering

#### Homepage Products
```typescript
// Reads country from localStorage
const locationData = localStorage.getItem('renewablezmart_location')
const country = locationData ? JSON.parse(locationData).country : null

// Fetches products filtered by country
const products = await productService.getByCountry(country)
```

#### Stores Page
```typescript
// Filter stores by selected country
const filteredStores = stores.filter(store => store.country === selectedCountry)
```

#### Installers Page
```typescript
// Filter installers by selected country
const filteredInstallers = installers.filter(installer => installer.country === selectedCountry)
```

### 5. API Endpoints

#### Get Products by Country
```
GET /api/products?country=Nigeria
```

#### Search Products by Country
```
GET /api/products/search?q=solar&country=Nigeria
```

#### Create Product (Auto-sets country)
```
POST /api/products
Authorization: Bearer <token>
{
  "name": "Solar Panel 400W",
  "storeId": "store-uuid",
  "price": 150000
  // country automatically set from store
}
```

### 6. Location Storage

#### localStorage Keys
- `renewablezmart_location`: `{ country: string, city: string }`
- `renewablezmart_current_user`: `{ id, email, firstName, lastName, role, country, city }`

#### Auto-population
When users register or log in, their country/city is automatically saved to localStorage, ensuring all subsequent requests are filtered by their location.

### 7. Database Schema Updates

#### Required Migrations
```sql
-- Add country and city to users table
ALTER TABLE users ADD COLUMN country VARCHAR(100);
ALTER TABLE users ADD COLUMN city VARCHAR(100);

-- Add country to products table
ALTER TABLE products ADD COLUMN country VARCHAR(100);

-- Stores already have country and city columns
```

**Note:** With `DATABASE_SYNC=true` in `.env`, TypeORM will automatically create these columns.

### 8. Benefits

1. **Vendor Stores**: Automatically display in their country's marketplace
2. **Products**: Show only products available in user's selected country
3. **Installers**: Display installers servicing the user's country
4. **Currency**: Auto-converts to country's default currency
5. **Shipping**: Can be calculated based on location
6. **Regulations**: Country-specific product compliance

### 9. User Experience Flow

#### First-Time User
```
1. User visits site → Default location (or prompt to select)
2. User registers → Selects country & city
3. Location saved to localStorage
4. Homepage shows products from their country
5. Stores page shows stores in their country
6. Installers page shows installers in their country
```

#### Returning User
```
1. User logs in → Location loaded from user record
2. All pages automatically filter by stored location
3. User can change location via header dropdown
```

#### Vendor Workflow
```
1. Vendor registers with business details + location
2. Store auto-created with vendor's location
3. Vendor adds products to store
4. Products auto-tagged with store's country
5. Products appear in country-specific marketplace
```

### 10. Sample Data Coverage

Currently includes sample data for:
- **Nigeria**: 6 stores, 6 installers
- **Ghana**: 1 store, 1 installer
- **Kenya**: 1 store, 1 installer
- **Egypt**: 1 store, 1 installer

### 11. Testing the System

1. **Register as Vendor**:
   - Select country: "Ghana"
   - Select city: "Accra"
   - Complete registration
   - Check if store created with country="Ghana"

2. **View Stores**:
   - Select country: "Ghana" in header
   - Only Ghanaian stores should appear

3. **Create Product** (as vendor):
   - Add product to your store
   - Product should automatically get country="Ghana"

4. **View Products**:
   - Homepage should show only products from selected country
   - Search should respect country filter

## Configuration

### Environment Variables
```env
DATABASE_SYNC=true  # Enable auto-schema updates
```

### Frontend Configuration
```typescript
// lib/services.ts
productService.getByCountry(country)  // Fetch country-specific products
```

### Backend Configuration
```typescript
// products.service.ts
findByCountry(country: string)  // Filter products by country
```

## Future Enhancements

1. **Multi-country stores**: Allow vendors to operate in multiple countries
2. **Cross-border shipping**: Products available in neighboring countries
3. **Regional warehouses**: Track inventory by location
4. **Location-based pricing**: Different prices for different regions
5. **Geolocation**: Auto-detect user's country from IP address
