# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

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

    # صفحه اصلی سایت به داشبورد هدایت می‌شود (این مسیر نیاز به لاگین خواهد داشت)
    path('', workshop_views.dashboard_view, name='dashboard'),

    # URL های مربوط به مدیریت کارگاه‌ها (ایجاد، مشاهده جزئیات، ویرایش، حذف)
    path('workshops/create/', workshop_views.workshop_create_view, name='workshop_create'),
    path('workshops/<int:pk>/', workshop_views.workshop_detail_view, name='workshop_detail'),
    path('workshops/<int:pk>/edit/', workshop_views.workshop_edit_view, name='workshop_edit'),
    path('workshops/<int:pk>/delete/', workshop_views.workshop_delete_view, name='workshop_delete'),

    # URL های جدید برای ورود و خروج کاربران
    path('login/', auth_views.LoginView.as_view(
        template_name='login.html',
        redirect_authenticated_user=True  # اگر کاربر قبلا لاگین کرده بود، او را به داشبورد هدایت کن
    ), name='login'),

    path('logout/', auth_views.LogoutView.as_view(), name='logout'), # بعد از خروج به آدرسی که در settings.py مشخص شده (LOGOUT_REDIRECT_URL) می‌رود

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
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
