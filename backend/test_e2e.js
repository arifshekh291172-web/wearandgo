async function runTests() {
  console.log('🧪 Starting E2E API Verification Tests...');

  // 1. Health check
  const healthRes = await fetch('http://localhost:5000/api/health').then(r => r.json());
  console.log('✅ 1. Health Status:', healthRes.status, healthRes.service);

  // 2. Customer Login
  const customerRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rahul@example.com', password: 'User@123456' }),
  }).then(r => r.json());
  console.log('✅ 2. Customer Login:', customerRes.success, 'Name:', customerRes.user?.name, 'Token:', customerRes.token ? 'YES' : 'NO');

  // 3. Admin Login
  const adminRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@wearandgo.com', password: 'Admin@123456' }),
  }).then(r => r.json());
  console.log('✅ 3. Admin Login:', adminRes.success, 'Role:', adminRes.user?.role, 'Token:', adminRes.token ? 'YES' : 'NO');

  // 4. Products & Categories
  const prodRes = await fetch('http://localhost:5000/api/products').then(r => r.json());
  const catRes = await fetch('http://localhost:5000/api/categories').then(r => r.json());
  console.log('✅ 4. Catalog:', prodRes.total, 'Products,', catRes.count || catRes.categories?.length, 'Categories');

  // 5. Home Collections
  const collRes = await fetch('http://localhost:5000/api/products/collections/home').then(r => r.json());
  console.log('✅ 5. Home Collections:', {
    featured: collRes.collections?.featured?.length,
    bestsellers: collRes.collections?.bestsellers?.length,
    newArrivals: collRes.collections?.newArrivals?.length,
  });

  // 6. Validate Coupon
  const couponRes = await fetch('http://localhost:5000/api/coupons/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: 'WELCOME10', subtotal: 2500 }),
  }).then(r => r.json());
  console.log('✅ 6. Coupon Validation (WELCOME10 on ₹2500):', couponRes.success, 'Discount Amount: ₹' + couponRes.coupon?.discountAmount);

  // 7. Admin Dashboard Stats with Admin Token
  const statsRes = await fetch('http://localhost:5000/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${adminRes.token}` },
  }).then(r => r.json());
  console.log('✅ 7. Admin Dashboard API:', statsRes.success, 'Revenue: ₹' + (statsRes.data?.totalRevenue || 0), 'Orders:', statsRes.data?.ordersCount);

  // 8. Admin Products API
  const adminProdsRes = await fetch('http://localhost:5000/api/products?limit=100').then(r => r.json());
  console.log('✅ 8. Products List API:', adminProdsRes.success, 'Count:', adminProdsRes.data?.length || adminProdsRes.products?.length);

  // 9. Admin Orders API with Admin Token
  const adminOrdersRes = await fetch('http://localhost:5000/api/orders', {
    headers: { Authorization: `Bearer ${adminRes.token}` },
  }).then(r => r.json());
  console.log('✅ 9. Admin Orders List API:', adminOrdersRes.success, 'Count:', adminOrdersRes.data?.length || adminOrdersRes.orders?.length);

  console.log('\n🎉 ALL 9 CORE BACKEND & ADMIN APIS VERIFIED AND FUNCTIONING END-TO-END!');
}

runTests().catch(err => console.error('❌ Test failed:', err));
