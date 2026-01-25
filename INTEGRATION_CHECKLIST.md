# Integration Checklist & Setup Guide

## 🚀 Quick Start

### 1. Backend Setup

#### Step 1: Install Dependencies (if not already installed)
```bash
npm install express mongoose multer cloudinary
```

#### Step 2: Update Server Index
- ✅ Already updated in `server/index.ts`
- New routes are imported and mounted:
  - `/api/v1/restaurant-management`
  - `/api/v1/menu-item`
  - `/api/v1/option`

#### Step 3: Verify Models
Make sure these files exist:
- ✅ `server/models/restaurant.model.new.ts` (NEW - Separate from old model)
- ✅ `server/models/menuItem.model.ts` (NEW)
- ✅ `server/models/option.model.ts` (NEW)

#### Step 4: Verify Controllers
Make sure these files exist:
- ✅ `server/controller/restaurantManagement.controller.ts` (NEW)
- ✅ `server/controller/menuItem.controller.ts` (NEW)
- ✅ `server/controller/option.controller.ts` (NEW)

#### Step 5: Verify Routes
Make sure these files exist:
- ✅ `server/routes/restaurantManagement.route.ts` (NEW)
- ✅ `server/routes/menuItem.route.ts` (NEW)
- ✅ `server/routes/option.route.ts` (NEW)

#### Step 6: Check Middleware
Verify you have:
- ✅ `isAuthenticated` middleware in use
- ✅ Multer configured for file uploads
- ✅ Cloudinary configured for image upload

---

### 2. Frontend Setup

#### Step 1: Install Dependencies (if not already installed)
```bash
npm install zustand sonner @radix-ui/react-dialog @radix-ui/react-alert-dialog
```

#### Step 2: Verify Stores
Make sure these files exist:
- ✅ `client/src/store/useRestaurantManagementStore.ts` (NEW)
- ✅ `client/src/store/useMenuItemStore.ts` (NEW)
- ✅ `client/src/store/useOptionStore.ts` (NEW)

#### Step 3: Verify Components
Make sure these files exist:
- ✅ `client/src/admin/RestaurantManagement.tsx` (NEW)
- ✅ `client/src/admin/MenuManagement.tsx` (NEW)
- ✅ `client/src/admin/OptionManagement.tsx` (NEW)

#### Step 4: Verify UI Components
Make sure these files exist:
- ✅ `client/src/components/ui/alert-dialog.tsx` (NEW)
- ✅ `client/src/components/ui/checkbox.tsx` (EXISTING)

#### Step 5: Update Admin Navigation (if needed)
Add links to your admin sidebar/menu:
```tsx
<Link to="/admin/restaurants">Restaurant Management</Link>
<Link to="/admin/menu">Menu Management</Link>
```

---

## 📋 File Structure

### Backend Files
```
server/
├── models/
│   ├── restaurant.model.new.ts       ✅ NEW
│   ├── menuItem.model.ts             ✅ NEW
│   ├── option.model.ts               ✅ NEW
│   └── [existing models...]
├── controller/
│   ├── restaurantManagement.controller.ts  ✅ NEW
│   ├── menuItem.controller.ts             ✅ NEW
│   ├── option.controller.ts               ✅ NEW
│   └── [existing controllers...]
├── routes/
│   ├── restaurantManagement.route.ts  ✅ NEW
│   ├── menuItem.route.ts              ✅ NEW
│   ├── option.route.ts                ✅ NEW
│   └── [existing routes...]
├── index.ts                           ✅ UPDATED
└── [other files...]
```

### Frontend Files
```
client/src/
├── store/
│   ├── useRestaurantManagementStore.ts ✅ NEW
│   ├── useMenuItemStore.ts             ✅ NEW
│   ├── useOptionStore.ts               ✅ NEW
│   └── [existing stores...]
├── admin/
│   ├── RestaurantManagement.tsx  ✅ NEW
│   ├── MenuManagement.tsx        ✅ NEW
│   ├── OptionManagement.tsx      ✅ NEW
│   └── [existing admin components...]
├── components/ui/
│   ├── alert-dialog.tsx          ✅ NEW
│   └── [existing UI components...]
└── [other files...]
```

---

## 🔗 API Endpoints Reference

### Restaurant Management
```
POST   /api/v1/restaurant-management/              Create
GET    /api/v1/restaurant-management/list/all      Get All
GET    /api/v1/restaurant-management/my/restaurant Get Current User's
GET    /api/v1/restaurant-management/:id           Get by ID
PUT    /api/v1/restaurant-management/:id           Update
DELETE /api/v1/restaurant-management/:id           Soft Delete
PATCH  /api/v1/restaurant-management/:id/toggle-status
```

### Menu Item Management
```
POST   /api/v1/menu-item/                          Create
GET    /api/v1/menu-item/restaurant/:restaurantId  Get by Restaurant
PUT    /api/v1/menu-item/:menuItemId               Update
DELETE /api/v1/menu-item/:menuItemId               Hard Delete
PATCH  /api/v1/menu-item/:menuItemId/toggle-availability
```

### Option Management
```
POST   /api/v1/option/                             Create
GET    /api/v1/option/menu-item/:menuItemId        Get by Menu Item
PUT    /api/v1/option/:optionId                    Update
DELETE /api/v1/option/:optionId                    Hard Delete
PATCH  /api/v1/option/:optionId/toggle-required    Toggle Required
```

---

## 🧪 Testing the Implementation

### 1. Test Restaurant Creation
```bash
curl -X POST http://localhost:3000/api/v1/restaurant-management/ \
  -H "Content-Type: multipart/form-data" \
  -F "restaurantName=Pizza Place" \
  -F "address=123 Main St" \
  -F "city=NYC" \
  -F "country=USA" \
  -F "deliveryTime=30" \
  -F "cuisines=[\"Italian\",\"Pizza\"]" \
  -F "imageFile=@image.jpg"
```

### 2. Test Menu Item Creation
```bash
curl -X POST http://localhost:3000/api/v1/menu-item/ \
  -H "Content-Type: multipart/form-data" \
  -F "restaurantId=RESTAURANT_ID" \
  -F "name=Margherita Pizza" \
  -F "description=Classic pizza" \
  -F "price=12.99" \
  -F "category=Pizza" \
  -F "image=@image.jpg"
```

### 3. Test Option Creation
```bash
curl -X POST http://localhost:3000/api/v1/option/ \
  -H "Content-Type: application/json" \
  -d '{
    "menuItemId": "MENU_ITEM_ID",
    "name": "Extra Cheese",
    "price": 2.00,
    "isRequired": false
  }'
```

---

## 🔐 Authorization Flow

### Admin Panel Flow
1. **Admin logs in** → Token saved in cookies
2. **Admin visits Restaurant Management** → Fetches all restaurants
3. **Admin selects a restaurant** → Can add/edit/delete for that restaurant
4. **Admin clicks Menu Items** → Filtered to show only selected restaurant's items
5. **Admin clicks Options** → Shows options for selected menu item
6. **Admin deletes item** → Options automatically deleted (cascade)

### Authorization Checks
- ✅ User must be authenticated (isAuthenticated middleware)
- ✅ User must own the restaurant (checked in controller)
- ✅ Restaurant must exist
- ✅ Menu item must belong to restaurant (verified in controller)
- ✅ Option must belong to menu item (verified in controller)

---

## 🎨 Component Usage

### Using RestaurantManagement Component
```tsx
import RestaurantManagement from "@/admin/RestaurantManagement";

export default function AdminPage() {
  return <RestaurantManagement />;
}
```

### Using MenuManagement Component
```tsx
import MenuManagement from "@/admin/MenuManagement";

export default function AdminPage() {
  return <MenuManagement />;
}
```

### Using OptionManagement Component
The component is auto-navigated when clicking "Options" button in MenuManagement.

---

## 📊 Data Models

### Restaurant Schema
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  restaurantName: String,
  description: String,
  address: String,
  city: String,
  country: String,
  deliveryTime: Number,
  cuisines: [String],
  imageUrl: String,
  isActive: Boolean (default: true),
  menus: [ObjectId] (ref: MenuItem),
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItem Schema
```typescript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String,
  isAvailable: Boolean (default: true),
  restaurantId: ObjectId (ref: Restaurant),
  options: [ObjectId] (ref: Option),
  createdAt: Date,
  updatedAt: Date
}
```

### Option Schema
```typescript
{
  _id: ObjectId,
  name: String,
  price: Number (default: 0),
  isRequired: Boolean (default: false),
  menuItemId: ObjectId (ref: MenuItem),
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚙️ Configuration Required

### 1. Environment Variables (.env)
```
VITE_API_BASE_URL=http://localhost:3000
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
```

### 2. Cloudinary Integration
The code uses `uploadImageOnCloudinary` function:
```typescript
// Already used in existing menu.controller.ts
// Same function is used in new controllers
const imageUrl = await uploadImageOnCloudinary(file);
```

---

## ✅ Verification Checklist

### Backend
- [ ] All model files created
- [ ] All controller files created
- [ ] All route files created
- [ ] server/index.ts updated with new routes
- [ ] Middleware (isAuthenticated, multer) working
- [ ] Cloudinary configured
- [ ] MongoDB collections created

### Frontend
- [ ] All store files created
- [ ] All component files created
- [ ] Alert-dialog component created
- [ ] Components imported correctly
- [ ] API endpoints match backend routes
- [ ] Environment variables set

### Integration
- [ ] Backend server starts without errors
- [ ] Frontend builds without errors
- [ ] Can create restaurant from UI
- [ ] Can create menu item from UI
- [ ] Can create option from UI
- [ ] Can edit resources
- [ ] Can delete with confirmation
- [ ] Images upload to Cloudinary

---

## 🐛 Common Issues & Solutions

### Issue: "Restaurant already exists" on Create
**Solution:** Check if user already has a restaurant. This is by design (one restaurant per user in the current implementation).

### Issue: Options not loading
**Solution:** Make sure you're clicking "Options" button after a menu item is created and saved.

### Issue: Images not uploading
**Solution:** 
- Check Cloudinary credentials in .env
- Verify multer middleware is working
- Check file size limits

### Issue: Stores not updating
**Solution:**
- Clear browser localStorage
- Check console for API errors
- Verify API endpoints are correct

### Issue: Authorization errors (403)
**Solution:**
- Make sure user is logged in
- Check user ID is correctly passed
- Verify ownership chain

---

## 📚 Documentation Files

- ✅ `MODULES_IMPLEMENTATION_GUIDE.md` - Complete technical guide
- ✅ `INTEGRATION_CHECKLIST.md` - This file

---

## 🎯 Next Steps After Setup

1. **Start servers:**
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev
   
   # Terminal 2: Frontend
   cd client
   npm run dev
   ```

2. **Test in browser:**
   - Navigate to admin panel
   - Create a restaurant
   - Create menu items
   - Add options to items
   - Test edit/delete functionality

3. **Monitor console:**
   - Check for API errors
   - Verify requests/responses
   - Debug any issues

4. **Database inspection:**
   - Use MongoDB Compass
   - Verify documents created
   - Check references (FKs)

---

## 📞 Support

If you encounter issues:
1. Check `MODULES_IMPLEMENTATION_GUIDE.md` for detailed info
2. Review API response errors
3. Check browser console for client errors
4. Check server logs for backend errors
5. Verify all files are created and properly imported

---

**Last Updated:** January 12, 2025
**Status:** ✅ Ready for Integration
