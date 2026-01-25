# MENU MODULE - TESTING GUIDE

## How to Test the Fixes

### 1. Start the Application

#### Backend:
```bash
cd server
npm start
```

#### Frontend (in a new terminal):
```bash
cd client
npm run dev
```

### 2. Test Menu Creation Flow

#### Step 1: Navigate to Menu Management
- Login as admin
- Go to `/admin/menu`

#### Step 2: Create a New Menu
1. Click "Add Menus" button
2. Fill in the form:
   - Name: "Chicken Burger"
   - Description: "Delicious grilled chicken burger"
   - Price: 12.99
   - Upload an image
3. Click "Create Menu"

#### Expected Results:
✅ Success toast appears: "Menu added successfully"  
✅ Dialog closes automatically  
✅ Menu appears in the grid immediately  
✅ NO "Internal Server Error"  

#### Check Browser Console:
```
[CREATE MENU] Response: { success: true, ... }
[GET MENUS] Response: { success: true, menus: [...] }
```

#### Check Backend Logs:
```
[CREATE MENU] Request body: { name: 'Chicken Burger', ... }
[CREATE MENU] Image uploaded: https://...
[CREATE MENU] Menu created: 507f...
[CREATE MENU] Menu added to restaurant: 507f...
[GET MENUS] Found menus: 1
```

### 3. Test Menu Persistence

1. Refresh the page (F5)
2. Menu should still be visible in the grid

✅ Menu persists after refresh

### 4. Test Error Handling

#### Test Missing Image:
1. Click "Add Menus"
2. Fill in name, description, price
3. Don't upload image
4. Click "Create Menu"

Expected: Error toast shows "Image is required"

#### Test Network Error:
1. Stop the backend server
2. Try to create a menu
3. Expected: Error toast shows connection error

### 5. Test Menu List API

#### Using Browser DevTools:
1. Open DevTools → Network tab
2. Go to `/admin/menu`
3. Look for GET request to `/api/v1/menu`

Expected Response:
```json
{
  "success": true,
  "menus": [
    {
      "_id": "...",
      "name": "Chicken Burger",
      "description": "...",
      "price": 12.99,
      "image": "https://..."
    }
  ]
}
```

### 6. Test Restaurant Menu Assignment

1. Go to `/admin/restaurant`
2. Create or edit a restaurant
3. In the menu dropdown, verify:
   - All created menus appear
   - Can select and assign menus

✅ Restaurant can assign global menus

### 7. Verify No Duplicate Toasts

When creating a menu:
- Should see ONE success toast (not two)
- Toast message: "Menu added successfully"

### 8. Test Menu Edit

1. In menu list, click "Edit" on a menu
2. Update any field
3. Save changes

Expected:
- Success toast appears
- Menu updates in the list
- No errors in console

## Common Issues and Solutions

### Issue: Menus still not appearing
**Solution**: Clear browser localStorage
```javascript
// In browser console:
localStorage.clear();
location.reload();
```

### Issue: "Internal Server Error"
**Check**:
1. Backend console for detailed error
2. MongoDB connection is active
3. Cloudinary credentials are correct

### Issue: Image upload fails
**Check**:
1. `.env` file has Cloudinary credentials
2. File size is not too large
3. File format is supported (jpg, png)

### Issue: Menu not added to restaurant
**Check**:
1. User is authenticated
2. Restaurant exists for the user
3. Backend logs show restaurant update

## Debug Commands

### Check Database:
```javascript
// In MongoDB shell or Compass
db.menus.find()
db.restaurants.find()
```

### Test API Directly:
```bash
# Create menu
curl -X POST http://localhost:3000/api/v1/menu \
  -H "Content-Type: multipart/form-data" \
  -F "name=Test Menu" \
  -F "description=Test Description" \
  -F "price=9.99" \
  -F "image=@/path/to/image.jpg"

# Get all menus
curl http://localhost:3000/api/v1/menu
```

## Success Criteria

All tests pass when:
- ✅ Menu creation works without errors
- ✅ Menus appear in list immediately
- ✅ Menus persist after refresh
- ✅ Proper error messages on failures
- ✅ No duplicate toasts
- ✅ Console logs provide debugging info
- ✅ Restaurant can assign menus

## Next Steps After Testing

If all tests pass:
- Deploy to production
- Monitor error logs
- Collect user feedback

If tests fail:
- Check console logs (frontend and backend)
- Verify database connection
- Check API credentials
- Review [MENU_BUG_FIXES.md](./MENU_BUG_FIXES.md) for implementation details
