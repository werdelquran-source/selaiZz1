# ⚡ سيلايز | SelaiZz — منصة تجارة إلكترونية متعددة البائعين

منصة متكاملة: Next.js 14 (واجهة RTL) + Node.js/Express (REST API) + PostgreSQL/Prisma.

## المزايا
- تسجيل/دخول آمن: bcrypt + JWT (Access 15د / Refresh 30ي مع Rotation) + تحقق ثنائي MFA (TOTP)
- أدوار: CUSTOMER / VENDOR / ADMIN
- لوحة بائع كاملة: منتجات، مخزون، طلبات، تحليلات وإيرادات
- لوحة مؤسس (/admin): إحصائيات، اعتماد البائعين، المستخدمون
- حماية: Helmet + Rate-limiting + Zod validation + Prisma (حماية تلقائية من SQL Injection)
- طبقة تكامل (`apps/api/src/services/integrations/`): محولات جاهزة لـ Shopify / Amazon SP-API / eBay

## التشغيل المحلي
```bash
# 1) قاعدة البيانات (مثال بـ Docker):
docker run --name selaizz-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=selaizz -p 5432:5432 -d postgres:16

# 2) الـ Backend:
cd apps/api
cp .env.example .env            # عدّل DATABASE_URL
npm install
npx prisma migrate dev --name init
node prisma/seed.js             # ينشئ حساب المؤسس + منتجات تجريبية
npm run dev                     # يعمل على :4000

# 3) الواجهة (طرفية أخرى):
cd apps/web
npm install
npm run dev                     # يعمل على :3000
```

## بيانات دخول المؤسس (بعد seed)
- البريد: `founder@selaizz.com`
- كلمة المرور: `ChangeMe!123` ← **غيّرها قبل النشر!**

## النشر (15 دقيقة)
1. **قاعدة البيانات:** أنشئ PostgreSQL مجانية على [neon.tech](https://neon.tech) → انسخ `DATABASE_URL`
2. **الـ Backend:** ارفع مجلد `apps/api` على [Railway](https://railway.app) أو [Render](https://render.com) → أضف متغيرات البيئة من `.env.example` → شغّل أوامر: `npx prisma migrate deploy && node prisma/seed.js`
3. **الواجهة:** ارفع المشروع على [Vercel](https://vercel.com) → Root Directory = `apps/web` → أضف `NEXT_PUBLIC_API_URL` = رابط الـ Backend من الخطوة 2
4. **النتيجة:** `https://selaizz.vercel.app` → سجّل دخولك كمؤسس من `/login`

## أهم مسارات الـ API
| Method | Path | الوصف |
|---|---|---|
| POST | /api/auth/register | تسجيل (عميل/بائع) |
| POST | /api/auth/login | دخول (+ MFA) |
| POST | /api/auth/refresh | تجديد التوكن |
| GET  | /api/products | المتجر العام (بحث/تصنيف/صفحات) |
| POST | /api/products | إضافة منتج (بائع) |
| GET  | /api/vendor/analytics | إحصائيات البائع |
| GET  | /api/admin/overview | نظرة المؤسس |
| PATCH| /api/admin/vendors/:id/approve | اعتماد بائع |
