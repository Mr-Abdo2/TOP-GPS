# 🚗 Fleet Track Pro — نظام تتبع الأسطول

<div align="center">

![Fleet Track Pro](https://img.shields.io/badge/Fleet_Track_Pro-v1.0-3b82f6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCI+PHRleHQgeT0iMjAiIGZvbnQtc2l6ZT0iMjAiPvCfmZc8L3RleHQ+PC9zdmc+)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

**لوحة تحكم احترافية لتتبع وإدارة أسطول المركبات في الوقت الفعلي**

</div>

---

## 📋 نظرة عامة

Fleet Track Pro هو نظام متكامل لإدارة وتتبع أسطول المركبات، مبني بـ HTML/CSS/JavaScript خالص مع خريطة تفاعلية مدعومة بـ Leaflet.js وخادم Node.js بسيط.

## ✨ المميزات

| الميزة | الوصف |
|--------|--------|
| 🗺️ **الخريطة الحية** | تتبع مباشر لجميع المركبات على خريطة تفاعلية |
| 🚗 **إدارة السيارات** | إضافة وتعديل وحذف المركبات مع بيانات كاملة |
| 👤 **إدارة السائقين** | ربط السائقين بالمركبات وعرض أدائهم |
| 📍 **تاريخ الرحلات** | عرض مسارات الرحلات السابقة على الخريطة |
| 📊 **التقارير** | تقارير تفصيلية للمسافة والوقود والأداء |
| 🔔 **التنبيهات** | تنبيهات فورية للسرعة والجيوفنس وانقطاع الاتصال |
| 🏁 **الجيوفنس** | تحديد مناطق جغرافية مع تنبيهات الدخول والخروج |
| 👤 **حسابي** | إدارة الملف الشخصي وكلمة المرور والتنبيهات |
| 🌍 **متعدد اللغات** | دعم 30+ لغة |
| 🌙 **الوضع الليلي** | تبديل بين الوضع الفاتح والداكن |

## 🚀 التشغيل المحلي

```bash
# تثبيت المتطلبات
npm install

# تشغيل الخادم
node server.js

# أو استخدام npm
npm start
```

ثم افتح المتصفح على: **http://localhost:5050**

## 📁 هيكل المشروع

```
GPS/
├── index.html          # الصفحة الرئيسية — لوحة التحكم
├── server.js           # خادم Node.js
├── css/
│   └── style.css       # نظام التصميم الكامل
├── js/
│   ├── app.js          # المتحكم الرئيسي
│   ├── data.js         # إدارة البيانات وLocalStorage
│   ├── map.js          # منطق الخريطة (Leaflet)
│   ├── tracking.js     # محرك التتبع الحي
│   └── alerts.js       # نظام التنبيهات
├── pages/
│   ├── vehicles.html   # إدارة المركبات
│   ├── drivers.html    # إدارة السائقين
│   ├── history.html    # تاريخ الرحلات
│   ├── reports.html    # التقارير التفصيلية
│   ├── alerts.html     # التنبيهات
│   ├── geofence.html   # مناطق الجيوفنس
│   └── account.html    # حسابي
└── sw.js               # Service Worker
```

## 🛠️ التقنيات المستخدمة

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **الخريطة**: [Leaflet.js](https://leafletjs.com/) v1.9.4
- **الخطوط**: Google Fonts (Cairo + Inter)
- **الخادم**: Node.js (بدون frameworks)
- **التخزين**: localStorage

## 📸 لقطات الشاشة

> الموقع يعمل على `http://localhost:5050` بعد التشغيل

## 📄 الرخصة

MIT License — حر الاستخدام والتعديل

---

<div align="center">
صُنع بـ ❤️ لإدارة الأساطيل بكفاءة عالية
</div>
