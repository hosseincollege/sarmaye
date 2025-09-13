# backend/urls.py

from django.contrib import admin
from django.urls import path, include, reverse_lazy
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

# وارد کردن ویوهای احراز هویت آماده جنگو
from django.contrib.auth import views as auth_views

# وارد کردن ویوهای اپلیکیشن workshops
from workshops import views as workshop_views

# وارد کردن ویوهای API و Router
from workshops.views import WorkshopViewSet, RegisterView, current_user, backend_info
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# راه‌اندازی API Router
router = DefaultRouter()
router.register('workshops', WorkshopViewSet, basename='workshops')

# الگوهای URL
urlpatterns = [
    # URL پنل ادمین جنگو
    path('admin/', admin.site.urls),

    # ==============================================================================
    # بخش URL های مربوط به صفحات وب (SSR) با سیستم ورود/خروج
    # ==============================================================================

    # تغییر ۱: مسیر ریشه سایت (/) کاربر را به صفحه لاگین هدایت می‌کند.
    # اگر کاربر لاگین باشد، به طور خودکار به داشبورد می‌رود.
    path('', RedirectView.as_view(url=reverse_lazy('login'), permanent=False), name='home'),

    # تغییر ۲: مسیر داشبورد به صراحت تعریف شده است.
    path('dashboard/', workshop_views.dashboard_view, name='dashboard'),

    # URL های مربوط به مدیریت کارگاه‌ها (ایجاد، مشاهده جزئیات، ویرایش، حذف)
    path('workshops/create/', workshop_views.workshop_create_view, name='workshop_create'),
    path('workshops/<int:pk>/', workshop_views.workshop_detail_view, name='workshop_detail'),
    path('workshops/<int:pk>/edit/', workshop_views.workshop_edit_view, name='workshop_edit'),
    path('workshops/<int:pk>/delete/', workshop_views.workshop_delete_view, name='workshop_delete'),

    # URL های جدید برای ورود و خروج کاربران
    path('login/', auth_views.LoginView.as_view(
        template_name='login.html',
        # اگر کاربر قبلا لاگین کرده بود، او را به داشبورد هدایت کن
        # این مقدار در settings.py با LOGIN_REDIRECT_URL = '/dashboard/' تنظیم می‌شود
        redirect_authenticated_user=True  
    ), name='login'),

    path('logout/', auth_views.LogoutView.as_view(next_page=reverse_lazy('login')), name='logout'),

    # ==============================================================================
    # بخش URL های مربوط به API (بدون تغییر)
    # ==============================================================================
    path('api/', include(router.urls)),
    path('api/user/me/', current_user, name='current_user'),
    path('api/backend-info/', backend_info, name='backend_info'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# افزودن مسیر فایل‌های مدیا در حالت توسعه (DEBUG=True)
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
