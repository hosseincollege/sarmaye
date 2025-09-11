from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from workshops.views import WorkshopViewSet, RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from workshops.models import Workshop
from workshops.views import current_user
from django.views.generic import TemplateView
from workshops import views


from workshops.views import (
    dashboard_view,
    workshop_detail_view,
    workshop_create_view,
    workshop_edit_view,
    workshop_delete_view
)
from django.contrib.auth import views as auth_views
from django.contrib.auth.views import LogoutView


# ویوی داشبورد (بعد از لاگین)
@login_required
def dashboard_view(request):
    workshops = Workshop.objects.all()
    return render(request, 'dashboard.html', {'workshops': workshops})

# API Router
router = DefaultRouter()
router.register('workshops', WorkshopViewSet, basename='workshops')

urlpatterns = [
    path('api/user/me/', current_user, name='current_user'),
    # صفحه اصلی → لاگین
    path('', auth_views.LoginView.as_view(template_name='login.html'), name='home'),

    # داشبورد
    path('dashboard/', dashboard_view, name='dashboard'),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name='login'),
    path('logout/', LogoutView.as_view(next_page='/login/'), name='logout'),

    # عملیات کارگاه‌ها
    path('workshops/<int:pk>/', workshop_detail_view, name='workshop_detail'),
    path('workshops/create/', workshop_create_view, name='workshop_create'),
    path('workshops/<int:pk>/edit/', workshop_edit_view, name='workshop_edit'),
    path('workshops/<int:pk>/delete/', workshop_delete_view, name='workshop_delete'),

    # پنل ادمین
    path('admin/', admin.site.urls),

    # API ها
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
