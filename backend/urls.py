from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from workshops.views import WorkshopViewSet, RegisterView, current_user, backend_info
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static

from workshops.views import (
    dashboard_view,
    workshop_detail_view,
    workshop_create_view,
    workshop_edit_view,
    workshop_delete_view
)

# API Router
router = DefaultRouter()
router.register('workshops', WorkshopViewSet, basename='workshops')

urlpatterns = [
    # 1. ریدایرکت صفحه اصلی (/) به صفحه لاگین (/login/)
    path('', auth_views.LoginView.as_view(
        template_name='login.html',
        redirect_authenticated_user=True  # اگر کاربر لاگین بود، او را به داشبورد بفرست
    ), name='home'),

    # 2. صفحه لاگین اصلی
    path('login/', auth_views.LoginView.as_view(
        template_name='login.html',
        redirect_authenticated_user=True  # این تنظیم کلیدی است!
    ), name='login'),

    # 3. صفحه خروج
    path('logout/', auth_views.LogoutView.as_view(
        next_page='login'  # بعد از خروج، به صفحه لاگین برو (و در آنجا بمان!)
    ), name='logout'),

    # داشبورد (نیاز به لاگین دارد)
    path('dashboard/', dashboard_view, name='dashboard'),

    # عملیات کارگاه‌ها (نیاز به لاگین دارد)
    path('workshops/create/', workshop_create_view, name='workshop_create'),
    path('workshops/<int:pk>/', workshop_detail_view, name='workshop_detail'),
    path('workshops/<int:pk>/edit/', workshop_edit_view, name='workshop_edit'),
    path('workshops/<int:pk>/delete/', workshop_delete_view, name='workshop_delete'),

    # پنل ادمین
    path('admin/', admin.site.urls),

    # API ها
    path('api/', include(router.urls)),
    path('api/user/me/', current_user, name='current_user'),
    path('api/backend-info/', backend_info, name='backend_info'),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
