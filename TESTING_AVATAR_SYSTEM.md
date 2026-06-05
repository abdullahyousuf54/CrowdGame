# Testing the Avatar System

## Quick Start Test

### 1. Start the Server
```bash
npm start
```

The server will automatically run the database migration to add the `avatar_data` column.

### 2. Open Admin Panel
```
https://localhost:3000/admin
```
- Create a new room
- Note the room code (e.g., "ABCD")

### 3. Open Big Screen (Host View)
```
https://localhost:3000/screen/ABCD
```
(Replace ABCD with your room code)

### 4. Open Mobile Join Screen (Player View)
```
https://localhost:3000/join/ABCD
```

On mobile or in a separate browser window/tab.

---

## Test Scenarios

### Scenario 1: Default Avatar Join
1. Open join screen
2. Verify random avatar appears automatically
3. Enter a display name
4. Click "Join Solving Roster"
5. Check that:
   - ✓ Avatar appears in waiting screen
   - ✓ Avatar appears in lobby roster on big screen
   - ✓ Player count increases

### Scenario 2: Randomize Avatar
1. Open join screen
2. Click the 🎲 button multiple times
3. Verify avatar changes each time
4. Join the game
5. Verify the last randomized avatar is used

### Scenario 3: Full Customization
1. Open join screen
2. Click "Customize Avatar"
3. Modal should open with large preview
4. Change each option:
   - Hair Style → Preview updates
   - Hair Color → Preview updates
   - Clothing → Preview updates
   - Clothing Color → Preview updates
   - Accessories → Preview updates
   - Skin Tone → Preview updates
   - Background Color → Preview updates
5. Click "Save Avatar"
6. Verify join screen shows customized avatar
7. Join the game
8. Verify customized avatar appears everywhere

### Scenario 4: Modal Randomize
1. Open join screen
2. Click "Customize Avatar"
3. Click "🎲 Randomize All" in modal
4. Verify all options change and preview updates
5. Click "Save Avatar"
6. Join with randomized avatar

### Scenario 5: Cancel Customization
1. Open join screen
2. Note the current avatar
3. Click "Customize Avatar"
4. Make several changes
5. Click "Cancel" or X
6. Verify original avatar is unchanged
7. Join the game

### Scenario 6: Multiple Players
1. Open join screen in 3+ different windows/devices
2. Customize each player's avatar differently
3. Join all players to the same room
4. Verify on big screen:
   - ✓ Each player has their unique avatar in lobby
   - ✓ All avatars display correctly
   - ✓ No duplicate/missing avatars

### Scenario 7: Gameplay Flow
1. Join as player
2. Admin starts the jigsaw activity
3. Verify avatar appears in:
   - ✓ Gameplay header (small, circular)
   - ✓ Next to player name
4. Complete the puzzle
5. Verify avatar appears in:
   - ✓ Final leaderboard
   - ✓ Next to player score
   - ✓ First place has special styling

### Scenario 8: Reconnection
1. Join as player with custom avatar
2. Note the avatar configuration
3. Close the mobile browser tab
4. Reopen join screen with same room code
5. Enter the SAME display name
6. Join again
7. Verify avatar is preserved (reconnection)

---

## Visual Verification Checklist

### Join Screen
- [ ] Avatar preview is circular, 80px
- [ ] Avatar has cyan neon border
- [ ] Randomize button (🎲) is visible and clickable
- [ ] "Customize Avatar" button is styled correctly

### Customization Modal
- [ ] Modal appears centered, dark overlay behind
- [ ] Large avatar preview (150px) at top
- [ ] All 7 control dropdowns/inputs visible
- [ ] Preview updates immediately on change
- [ ] "🎲 Randomize All" button works
- [ ] "Save" and "Cancel" buttons at bottom

### Waiting Screen
- [ ] Large avatar (120px) displays above summary
- [ ] Avatar has cyan border and glow effect
- [ ] Player color and status visible below

### Gameplay Header
- [ ] Small avatar (32px) next to player name
- [ ] Avatar is circular with colored border
- [ ] Doesn't interfere with progress display

### Lobby Roster (Big Screen)
- [ ] All player avatars visible in grid
- [ ] Each avatar is 50px, circular
- [ ] Border color matches player's assigned color
- [ ] Player name displays below avatar

### Leaderboard (Big Screen)
- [ ] Avatar appears next to each player name
- [ ] Avatar is 36px, circular
- [ ] First place avatar has gold/yellow styling
- [ ] All avatars aligned properly with scores

---

## Browser Console Checks

### Expected Console Logs (Server)
```
Created table: participants
or
Added avatar_data column to participants table
```

### Expected Socket Events (Browser DevTools)
```javascript
// When joining
join-room: {
  roomCode: "ABCD",
  displayName: "TestPlayer",
  avatarData: {
    url: "https://api.dicebear.com/7.x/avataaars/svg?...",
    config: { seed: "...", top: "...", ... }
  }
}

// Response
joined-successfully: {
  playerId: "...",
  color: "#00f3ff",
  displayName: "TestPlayer",
  avatarData: { url: "...", config: {...} }
}

// Host receives
player-joined: {
  id: "...",
  displayName: "TestPlayer",
  color: "#00f3ff",
  avatarData: { url: "...", config: {...} },
  count: 1
}
```

---

## Database Verification

### Check Avatar Data in Database
```sql
-- SQLite
SELECT display_name, avatar_data FROM participants;

-- PostgreSQL
SELECT display_name, avatar_data FROM participants;
```

Expected Result:
```json
{
  "url": "https://api.dicebear.com/7.x/avataaars/svg?seed=abc123&...",
  "config": {
    "seed": "abc123",
    "top": "ShortHairShortFlat",
    "hairColor": "Brown",
    "accessories": "",
    "clothingType": "Hoodie",
    "clothingColor": "Blue03",
    "skinColor": "Light",
    "backgroundColor": "b6e3f4"
  }
}
```

---

## Common Issues & Solutions

### Issue: Avatar not displaying
**Cause**: DiceBear API unreachable or CORS issue
**Solution**: 
- Check network tab in browser DevTools
- Verify URL is accessible: https://api.dicebear.com/7.x/avataaars/svg?seed=test
- Check for CORS errors in console

### Issue: Modal doesn't open
**Cause**: JavaScript error or event listener not attached
**Solution**:
- Check browser console for errors
- Verify mobile.js is loaded
- Check element IDs match

### Issue: Preview doesn't update
**Cause**: Event listeners not firing or URL generation error
**Solution**:
- Check console for errors in `updateModalPreview()`
- Verify all select elements have correct IDs
- Test `getAvatarUrl()` function directly

### Issue: Avatar data not saved
**Cause**: Database migration didn't run or socket error
**Solution**:
- Check server logs for migration success
- Verify `avatar_data` column exists in database
- Check socket payload includes avatarData

### Issue: Avatars all look the same
**Cause**: Seed not randomizing or cache issue
**Solution**:
- Clear browser cache
- Check `generateRandomSeed()` function
- Verify each player gets unique config

---

## Performance Testing

### Load Test
1. Open 10+ player windows simultaneously
2. Join all players with custom avatars
3. Check:
   - [ ] All avatars load without delay
   - [ ] Big screen updates smoothly
   - [ ] No memory leaks (check DevTools Memory tab)
   - [ ] Socket messages are efficient (<1KB each)

### Network Test
1. Open DevTools Network tab
2. Join as player
3. Check avatar requests:
   - [ ] Avatar URLs are CDN-served (DiceBear)
   - [ ] SVG files are small (<50KB)
   - [ ] Images cache properly (304 responses on reload)

---

## Mobile Device Testing

### iOS Safari
- [ ] Join screen loads correctly
- [ ] Avatar preview displays
- [ ] Modal opens and closes smoothly
- [ ] Touch controls work (selects, buttons)
- [ ] Avatar displays throughout gameplay

### Android Chrome
- [ ] Join screen loads correctly
- [ ] Avatar preview displays
- [ ] Modal opens and closes smoothly
- [ ] Touch controls work (selects, buttons)
- [ ] Avatar displays throughout gameplay

### Responsive Design
- [ ] Portrait mode: All elements visible
- [ ] Landscape mode: Layout adjusts properly
- [ ] Small screens (iPhone SE): No overflow
- [ ] Large screens (iPad): Properly scaled

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through form controls
- [ ] Enter key submits form
- [ ] Escape key closes modal
- [ ] All controls focusable

### Screen Reader
- [ ] Avatar has alt text
- [ ] Form labels properly associated
- [ ] Modal has proper ARIA labels
- [ ] Button purposes are clear

---

## Success Criteria

### All tests pass when:
✅ Avatars generate automatically on join screen  
✅ Randomize button creates new avatars  
✅ Customization modal allows full personalization  
✅ Avatars display in all game screens  
✅ Multiple players each have unique avatars  
✅ Avatar data persists in database  
✅ Leaderboard shows avatars correctly  
✅ No console errors during normal usage  
✅ Performance remains smooth with 10+ players  
✅ Mobile devices work flawlessly  

---

## Regression Testing

Ensure existing functionality still works:
- [ ] Players can join without avatars (backward compatibility)
- [ ] Room creation and management unchanged
- [ ] Jigsaw puzzle gameplay functions normally
- [ ] Scoring and leaderboard calculation correct
- [ ] Admin panel controls work
- [ ] QR code generation works
- [ ] All existing socket events functional

---

## Quick Demo Script

**For Presentations:**

1. **Open admin panel** → Create room "DEMO"
2. **Open big screen** → Show QR code and waiting lobby
3. **Open mobile device** → Scan QR or type join link
4. **Show avatar customization** → Click customize, change hair/clothes
5. **Join as player** → Avatar appears in lobby on big screen
6. **Start activity** → Show avatar in gameplay
7. **Complete puzzle** → Show avatar in leaderboard

**Talking Points:**
- "Each player gets a unique, customizable avatar"
- "No server storage required - avatars are generated via API"
- "Avatars appear everywhere: lobby, gameplay, leaderboard"
- "Real-time preview as you customize"
- "Works on all devices and screen sizes"

---

## Emergency Rollback

If issues arise, rollback is simple:

### Option 1: Keep Database Changes (Recommended)
The `avatar_data` column is nullable, so existing code works fine.
No action needed - just fix the bug.

### Option 2: Full Rollback
1. Revert files to previous commit
2. Database column can remain (it's nullable and unused)
3. Restart server

The system is designed for graceful degradation - missing avatars don't break anything.

---

## Next Steps After Testing

1. ✅ Run all test scenarios
2. ✅ Verify visual appearance on multiple devices
3. ✅ Check database persistence
4. ✅ Test with real users
5. ✅ Monitor for DiceBear API issues
6. ✅ Consider implementing fallbacks if needed
7. ✅ Document any discovered edge cases

---

**Happy Testing! 🎉**
