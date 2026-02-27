/** @type {import('tailwindcss').Config} */
export default {
  // تفعيل الوضع الليلي بناءً على وجود كلاس 'dark' في الـ HTML
  darkMode: 'class',
  
  // تحديد الملفات التي ستقوم المكتبة بمراقبتها لتطبيق التنسيقات
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  
  theme: {
    extend: {
      // إعدادات الخطوط لضمان ظهور الخط العربي بشكل احترافي
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      // يمكنك إضافة ألوان مخصصة هنا إذا أردت مستقبلاً
      colors: {
        medical: {
          50: '#f0fdf4',
          500: '#10b981', // لون الـ Emerald الأساسي للتطبيق
          600: '#059669',
        }
      }
    },
  },
  
  plugins: [],
}