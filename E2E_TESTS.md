# TaxStats Refer2Earn - E2E Test Plan

## Critical User Flows to Test

### 1. Authentication Flow
- [ ] User can register with username, email, password
- [ ] User receives unique referral code on registration
- [ ] User can login with credentials
- [ ] User session persists across page reloads
- [ ] User can logout
- [ ] Unauthenticated users redirected to login

### 2. Dashboard Flow
- [ ] Authenticated user can view dashboard
- [ ] User sees referral code displayed
- [ ] User can generate referral link
- [ ] User can generate QR code for referral link
- [ ] Dashboard shows referral statistics

### 3. Referral Management
- [ ] User can create referral with referee email
- [ ] Referral shows in referral list
- [ ] Referral status updates when referee signs up
- [ ] Referral shows pending/signed_up/converted status
- [ ] Share referral link functionality works

### 4. Rewards System
- [ ] User can view earned rewards
- [ ] Rewards show pending/approved/paid status
- [ ] Admin can approve pending rewards
- [ ] User receives notification when reward approved
- [ ] Reward amount calculations are correct

### 5. Admin Functions
- [ ] Admin user can access admin dashboard
- [ ] Admin can view all users
- [ ] Admin can manage users
- [ ] Admin can approve/reject rewards
- [ ] Admin can create campaigns
- [ ] Admin can view campaign performance

### 6. Campaigns
- [ ] Active campaigns display with multipliers
- [ ] Campaign start/end dates respected
- [ ] Rewards calculated with campaign multiplier
- [ ] Campaign rules applied correctly

### 7. Notifications
- [ ] User receives notification on referral signup
- [ ] User receives notification on reward approval
- [ ] Notifications show read/unread status
- [ ] User can mark notifications as read

### 8. Leaderboard
- [ ] Leaderboard displays top referrers
- [ ] Rankings based on successful referrals
- [ ] User position visible
- [ ] Updates in real-time

## Known Issues to Address
1. Firebase UID field in schema but local auth used - needs alignment
2. Passwords stored in plain text - needs bcrypt implementation
3. Email notifications not fully integrated
4. QR code modal might have issues
5. Session management reliability
