# Restaurant, Menu & Options Module Implementation Guide

## Overview
This document outlines the complete implementation of three new modules:
1. **Restaurant Management Module** - Standalone restaurant CRUD operations
2. **Menu Item Module** - Connected to specific restaurants
3. **Options/Add-ons Module** - Connected to specific menu items

All modules follow a strict hierarchy: **Restaurants → Menu Items → Options**

---

## Backend Structure

### 1. Models

#### Restaurant Model (`server/models/restaurant.model.new.ts`)
```typescript
Fields:
- restaurantId (auto-generated _id)
- name (restaurantName)
- description
- address
- city
- country
- deliveryTime (minutes)
- cuisines (array)
- imageUrl
- isActive (for soft delete)
- user (FK to User)
- menus (array of MenuItem IDs)

Key Features:
- Soft delete support (isActive field)
- Timestamps (createdAt, updatedAt)
- User association for ownership
```

#### MenuItem Model (`server/models/menuItem.model.ts`)
```typescript
Fields:
- menuItemId (auto-generated _id)
- name
- description
- price
- category
- image
- isAvailable
- restaurantId (FK to Restaurant)
- options (array of Option IDs)

Key Features:
- Hard delete (cascades options deletion)
- Connected to specific restaurant
- Availability toggle
- Timestamps
```

#### Option Model (`server/models/option.model.ts`)
```typescript
Fields:
- optionId (auto-generated _id)
- name
- price (additional charge)
- isRequired
- menuItemId (FK to MenuItem)

Key Features:
- Simple structure for flexibility
- Required/Optional designation
- Additional pricing support
- Timestamps
```

---

### 2. Controllers

#### Restaurant Management Controller (`server/controller/restaurantManagement.controller.ts`)
**Endpoints:**
- `createRestaurant(req, res)` - Create new restaurant
- `getAllRestaurants(req, res)` - Fetch all active restaurants
- `getRestaurantById(id)` - Get specific restaurant with menus
- `getRestaurant()` - Get current user's restaurant
- `updateRestaurant(id, data)` - Update restaurant details
- `deleteRestaurant(id)` - Soft delete
- `toggleRestaurantStatus(id)` - Toggle active/inactive

**Key Features:**
- Ownership verification
- Cuisine parsing utility
- Image upload via Cloudinary
- Proper error handling

---

#### MenuItem Controller (`server/controller/menuItem.controller.ts`)
**Endpoints:**
- `createMenuItem(restaurantId, data)` - Add item to restaurant
- `getMenuByRestaurantId(restaurantId)` - Get all items for restaurant
- `updateMenuItem(menuItemId, data)` - Update item
- `deleteMenuItem(menuItemId)` - Delete item + options
- `toggleMenuItemAvailability(menuItemId)` - Toggle availability

**Key Features:**
- Restaurant ownership verification
- Automatic restaurant menu update
- Cascading delete (removes options)
- Availability toggle

---

#### Option Controller (`server/controller/option.controller.ts`)
**Endpoints:**
- `createOption(menuItemId, data)` - Add option to item
- `getOptionsByMenuItemId(menuItemId)` - Get all options
- `updateOption(optionId, data)` - Update option
- `deleteOption(optionId)` - Delete option
- `toggleOptionRequired(optionId)` - Toggle requirement

**Key Features:**
- Three-level authorization (user → restaurant → item → option)
- Automatic menu item update
- Required/Optional toggle

---

### 3. Routes

#### Restaurant Routes (`server/routes/restaurantManagement.route.ts`)
```
POST   /api/v1/restaurant-management/              - Create
GET    /api/v1/restaurant-management/list/all      - Get all
GET    /api/v1/restaurant-management/my/restaurant - Get user's
GET    /api/v1/restaurant-management/:id           - Get by ID
PUT    /api/v1/restaurant-management/:id           - Update
DELETE /api/v1/restaurant-management/:id           - Delete
PATCH  /api/v1/restaurant-management/:id/toggle-status
```

#### MenuItem Routes (`server/routes/menuItem.route.ts`)
```
POST   /api/v1/menu-item/                          - Create
GET    /api/v1/menu-item/restaurant/:restaurantId  - Get by restaurant
PUT    /api/v1/menu-item/:menuItemId               - Update
DELETE /api/v1/menu-item/:menuItemId               - Delete
PATCH  /api/v1/menu-item/:menuItemId/toggle-availability
```

#### Option Routes (`server/routes/option.route.ts`)
```
POST   /api/v1/option/                             - Create
GET    /api/v1/option/menu-item/:menuItemId        - Get by menu item
PUT    /api/v1/option/:optionId                    - Update
DELETE /api/v1/option/:optionId                    - Delete
PATCH  /api/v1/option/:optionId/toggle-required    - Toggle required
```

---

### 4. Server Integration
**File: `server/index.ts`**

Added imports:
```typescript
import restaurantManagementRoute from "./routes/restaurantManagement.route";
import menuItemRoute from "./routes/menuItem.route";
import optionRoute from "./routes/option.route";
```

Added routes:
```typescript
app.use("/api/v1/restaurant-management", restaurantManagementRoute);
app.use("/api/v1/menu-item", menuItemRoute);
app.use("/api/v1/option", optionRoute);
```

---

## Frontend Structure

### 1. Zustand Stores

#### Restaurant Management Store (`client/src/store/useRestaurantManagementStore.ts`)
**State:**
- `loading: boolean`
- `restaurants: Restaurant[]`
- `currentRestaurant: Restaurant | null`

**Methods:**
- `createRestaurant(formData)` - POST new restaurant
- `updateRestaurant(id, formData)` - PUT update
- `getAllRestaurants()` - GET all
- `getRestaurantById(id)` - GET specific
- `getCurrentUserRestaurant()` - GET user's restaurant
- `deleteRestaurant(id)` - DELETE
- `toggleRestaurantStatus(id)` - PATCH status

---

#### MenuItem Store (`client/src/store/useMenuItemStore.ts`)
**State:**
- `loading: boolean`
- `menuItems: MenuItem[]`
- `currentMenuItem: MenuItem | null`

**Methods:**
- `createMenuItem(formData)` - POST new item
- `updateMenuItem(id, formData)` - PUT update
- `getMenuByRestaurantId(restaurantId)` - GET by restaurant
- `deleteMenuItem(id)` - DELETE
- `toggleMenuItemAvailability(id)` - PATCH availability

---

#### Option Store (`client/src/store/useOptionStore.ts`)
**State:**
- `loading: boolean`
- `options: Option[]`

**Methods:**
- `createOption(data)` - POST new option
- `updateOption(id, data)` - PUT update
- `getOptionsByMenuItemId(menuItemId)` - GET by item
- `deleteOption(id)` - DELETE
- `toggleOptionRequired(id)` - PATCH required

---

### 2. Components

#### Restaurant Management Component (`client/src/admin/RestaurantManagement.tsx`)
**Features:**
- ✅ Add/Edit/Delete restaurants
- ✅ Grid view with restaurant cards
- ✅ Restaurant image display
- ✅ Active/Inactive toggle
- ✅ Soft delete with confirmation
- ✅ Form validation
- ✅ Loading states

**Form Fields:**
- Restaurant Name (required)
- Description
- Address (required)
- City (required)
- Country (required)
- Delivery Time (minutes)
- Cuisines (comma-separated)
- Image (required for new)

---

#### Menu Management Component (`client/src/admin/MenuManagement.tsx`)
**Features:**
- ✅ Filter restaurants dropdown
- ✅ Add/Edit/Delete menu items
- ✅ Grid view with item cards
- ✅ Item image display
- ✅ Availability toggle
- ✅ Options management button
- ✅ Hard delete with confirmation
- ✅ Form validation

**Form Fields:**
- Restaurant Selection (required, dropdown)
- Item Name (required)
- Description
- Price (required)
- Category (required)
- Image (required for new)

---

#### Option Management Component (`client/src/admin/OptionManagement.tsx`)
**Features:**
- ✅ Add/Edit/Delete options
- ✅ Linked to specific menu item
- ✅ Required/Optional toggle
- ✅ Additional price per option
- ✅ Option cards view
- ✅ Back button to menu items
- ✅ Form validation

**Form Fields:**
- Option Name (required)
- Additional Price
- Make Required (checkbox)

---

### 3. UI Components Used
- Dialog (for forms)
- AlertDialog (for confirmations)
- Button
- Input
- Label
- Select
- Checkbox
- Loader2 icon (lucide-react)
- Plus, Edit2, Trash2, ToggleLeft, ToggleRight icons

---

## Data Flow

### Create Restaurant
1. Admin fills form → RestaurantManagement component
2. Form validated
3. Image uploaded → Cloudinary
4. `createRestaurant()` store method called
5. POST to `/api/v1/restaurant-management/`
6. Backend validates ownership (unique per user)
7. Restaurant created in DB
8. Response updates store & UI

### Create Menu Item
1. Admin selects restaurant
2. Fills menu form → MenuManagement component
3. Form validated
4. Image uploaded → Cloudinary
5. `createMenuItem()` store method called
6. POST to `/api/v1/menu-item/`
7. Backend verifies restaurant ownership
8. MenuItem created, restaurant.menus updated
9. Response updates store & UI

### Create Option
1. Admin clicks "Options" on menu item
2. Routes to OptionManagement component
3. Fills option form
4. `createOption()` store method called
5. POST to `/api/v1/option/`
6. Backend verifies authorization chain
7. Option created, menuItem.options updated
8. Response updates store & UI

### Delete Option
1. Admin clicks trash icon
2. Confirmation dialog appears
3. Confirms deletion
4. `deleteOption()` called
5. DELETE to `/api/v1/option/:id`
6. Backend removes from menuItem.options
7. Option deleted
8. UI updates immediately (optimistic update)

### Delete Menu Item
1. Admin clicks trash icon on item
2. Confirmation dialog appears
3. Confirms deletion
4. `deleteMenuItem()` called
5. DELETE to `/api/v1/menu-item/:id`
6. Backend cascades delete options
7. Removes from restaurant.menus
8. MenuItem deleted
9. UI updates

### Soft Delete Restaurant
1. Admin clicks trash icon
2. Confirmation dialog appears
3. Confirms deletion
4. `deleteRestaurant()` called
5. DELETE to `/api/v1/restaurant-management/:id`
6. Backend sets `isActive = false`
7. UI filters out inactive restaurants
8. Menus remain in DB but hidden from users

---

## Authorization & Security

### Three-Level Authorization
```
Level 1: User owns the Restaurant
  ↓
Level 2: Restaurant owns the MenuItem
  ↓
Level 3: MenuItem owns the Option
```

Every operation verifies:
1. User authenticated (`isAuthenticated` middleware)
2. User owns the resource
3. Resource exists before modification

### Soft vs Hard Delete
- **Restaurant:** Soft delete (`isActive: false`) - menus hidden but not deleted
- **MenuItem:** Hard delete - cascades options deletion
- **Option:** Hard delete - only affects that option

---

## Key Features Summary

✅ **Complete Module Separation**
- Restaurants (dedicated folder structure)
- Menu Items (linked to restaurants)
- Options (linked to menu items)

✅ **Full CRUD Operations**
- Create with form validation
- Read with filtering capabilities
- Update with pre-filled forms
- Delete with confirmation dialogs

✅ **Proper Error Handling**
- Form validation (client-side)
- Authorization checks (server-side)
- Toast notifications for feedback
- Loading states during API calls

✅ **User Experience**
- Confirmation dialogs before delete
- Immediate UI updates (optimistic)
- Loading spinners during API calls
- Clear error messages
- Status badges (Active/Inactive, Available/Unavailable)

✅ **Data Integrity**
- Foreign key relationships
- Cascading deletes (options when menu deleted)
- Soft deletes (restaurants)
- Ownership verification at every level

---

## Integration Notes

### No Existing Code Modified
- Restaurant module is entirely new (separate from old restaurant.model)
- Menu module is new with restaurant reference
- Options module is completely new
- Frontend components are new

### Backward Compatibility
- Existing routes remain untouched
- Old restaurant model still available
- Can migrate gradually if needed

### Dependencies
Backend:
- mongoose (models)
- express (routing)
- multer (file upload)

Frontend:
- zustand (state management)
- sonner (toast notifications)
- lucide-react (icons)
- @radix-ui/* (UI components)

---

## Next Steps

1. **Database Migration:**
   - Run migrations to create new collections
   - Index on restaurantId for MenuItem
   - Index on menuItemId for Option

2. **Testing:**
   - Test all CRUD operations
   - Verify authorization at each level
   - Test cascading deletes

3. **API Testing:**
   - Use Postman/Thunder Client
   - Verify all endpoints
   - Test error scenarios

4. **Frontend Testing:**
   - Test forms with validation
   - Test delete confirmations
   - Test navigation between components

5. **Deployment:**
   - Deploy backend with new models/routes
   - Deploy frontend with new components
   - Update admin navigation if needed

---

## File Checklist

**Backend Files Created:**
- ✅ `server/models/restaurant.model.new.ts`
- ✅ `server/models/menuItem.model.ts`
- ✅ `server/models/option.model.ts`
- ✅ `server/controller/restaurantManagement.controller.ts`
- ✅ `server/controller/menuItem.controller.ts`
- ✅ `server/controller/option.controller.ts`
- ✅ `server/routes/restaurantManagement.route.ts`
- ✅ `server/routes/menuItem.route.ts`
- ✅ `server/routes/option.route.ts`
- ✅ `server/index.ts` (updated with new routes)

**Frontend Files Created:**
- ✅ `client/src/store/useRestaurantManagementStore.ts`
- ✅ `client/src/store/useMenuItemStore.ts`
- ✅ `client/src/store/useOptionStore.ts`
- ✅ `client/src/admin/RestaurantManagement.tsx`
- ✅ `client/src/admin/MenuManagement.tsx`
- ✅ `client/src/admin/OptionManagement.tsx`
- ✅ `client/src/components/ui/alert-dialog.tsx`

**Frontend Files Updated:**
- None (all existing files untouched)

---

## Troubleshooting

### Issue: Restaurant creation says "already exists"
**Solution:** Check database - ensure clean state or check user ID

### Issue: Menu items not appearing
**Solution:** 
- Verify restaurantId is correct
- Check restaurant ownership
- Verify getMenuByRestaurantId call

### Issue: Options not saving
**Solution:**
- Verify menuItemId is valid
- Check menu item ownership chain
- Verify form submission

### Issue: Images not uploading
**Solution:**
- Check Cloudinary configuration
- Verify file input in form
- Check file size limits

---

## API Response Format

All endpoints return standard JSON:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "restaurant|menuItem|option": { /* data object */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Questions or Support

Refer to this document for:
- API endpoint references
- Data model structure
- Authorization flow
- Component usage
- Feature implementation details
