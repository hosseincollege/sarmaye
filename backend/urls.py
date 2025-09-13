# backend/urls.py

from django.contrib import admin
from django.urls import path, include, reverse_lazy
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

# وارد کردن ویوهای احراز هویت آماده جنگو
from django.contrib.auth import views as auth_views

# دیگر نیازی به ایمپورت تمام ویوهای workshop در اینجا نیست
# from workshops import views as workshop_views 

# وارد کردن ویوهای API و Router
from workshops.views import WorkshopViewSet, RegisterView, current_user, backend_info
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# راه‌اندازی API Router
router = DefaultRouter()
router.register('workshops', WorkshopViewSet, basename='workshops-api') # تغییر نام برای جلوگیری از تداخل

from workshops import views

# الگوهای URL
urlpatterns = [
    path('admin/', admin.site.urls),

    # ==============================================================================
    # بخش URL های مربوط به صفحات وب (SSR)
    # ==============================================================================

    # کاربر را از ریشه به صفحه لاگین هدایت کن
    path('', RedirectView.as_view(url=reverse_lazy('login'), permanent=False), name='home'),

    # === تغییر اصلی: استفاده از include برای URL های اپلیکیشن workshops ===
    # تمام URL های با پیشوند /workshops به فایل workshops.urls فرستاده می شوند
    path('workshops/', views.dashboard_view, name='workshop_list'),
    path('workshops/<int:pk>/', views.workshop_detail_view, name='workshop_detail'),
    path('workshops/create/', views.workshop_create_view, name='workshop_create'),
    path('workshops/<int:pk>/edit/', views.workshop_edit_view, name='workshop_edit'),
    path('workshops/<int:pk>/delete/', views.workshop_delete_view, name='workshop_delete'),

    path('dashboard/', views.dashboard_view, name='dashboard'),
    
    # URL های ورود و خروج
    path('login/', auth_views.LoginView.as_view(
        template_name='login.html',
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

# افزودن مسیر فایل‌های مدیا در حالت توسعه
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
