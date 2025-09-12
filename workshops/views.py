# workshops/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.conf import settings
from django.http import Http404

from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from .models import Workshop, WorkshopImage # WorkshopImage را ایمپورت کنید
from .serializers import WorkshopSerializer, UserSerializer
from .forms import WorkshopForm, WorkshopImageFormSet # WorkshopImageFormSet را ایمپورت کنید

from django.db import models

# ===============================================
# PERMISSIONS (برای API)
# ===============================================

class IsOwnerOrReadOnly(BasePermission):
    """
    اجازه دسترسی فقط به صاحب آبجکت برای ویرایش.
    """
    def has_object_permission(self, request, view, obj):
        # متدهای امن (GET, HEAD, OPTIONS) همیشه مجاز هستند.
        if request.method in permissions.SAFE_METHODS:
            return True
        # دسترسی برای نوشتن (Write) فقط برای صاحب آبجکت یا سوپریوزر مجاز است.
        return obj.owner == request.user or request.user.is_superuser

# ===============================================
# API VIEWS
# ===============================================

# --- API ثبت نام کاربر ---
class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

# --- API کارگاه (Workshop) ---
class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all().order_by('-created_at')
    serializer_class = WorkshopSerializer
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="زمان به‌روزرسانی")

    def __str__(self):
        return self.name

    class Meta:
        # می‌توانید برای مرتب‌سازی پیش‌فرض هم از این استفاده کنید
        ordering = ['-created_at']
        verbose_name = "کارگاه"
        verbose_name_plural = "کارگاه‌ها"
        
    def get_permissions(self):
        """
        تعیین دسترسی‌ها بر اساس اکشن (action).
        - 'list' و 'retrieve': همه کاربران (حتی لاگین نکرده) می‌توانند ببینند.
        - بقیه اکشن‌ها (create, update, delete): فقط کاربر لاگین کرده و مالک.
        """
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        return super().get_permissions()

    def perform_create(self, serializer):
        """
        هنگام ایجاد یک کارگاه جدید، کاربر فعلی را به عنوان 'owner' ثبت می‌کند.
        """
        serializer.save(owner=self.request.user)

# --- API های جانبی ---
@api_view(['GET'])
@permission_classes([AllowAny])
def backend_info(request):
    """
    اطلاعات کلی در مورد وضعیت بک‌اند را برمی‌گرداند.
    """
    return Response({
        "backend_env": getattr(settings, 'ENV_TYPE', 'unknown'),
        "ip": getattr(request, "real_ip", request.META.get("REMOTE_ADDR", "unknown")),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    اطلاعات کاربر لاگین کرده فعلی را برمی‌گرداند.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# ===============================================
# HTML TEMPLATE VIEWS (ویوهای مربوط به صفحات وب)
# ===============================================

@login_required
def dashboard_view(request):
    """
    داشبورد کارگاه‌ها.
    - ادمین: همه کارگاه‌ها را می‌بیند.
    - کاربر عادی: فقط کارگاه‌های خودش را می‌بیند.
    """
    if request.user.is_staff or request.user.is_superuser:
        workshops = Workshop.objects.all().order_by('-created_at')
    else:
        workshops = Workshop.objects.filter(owner=request.user).order_by('-created_at')
    
    return render(request, 'dashboard.html', {'workshops': workshops})

@login_required
def workshop_detail_view(request, pk):
    """
    نمایش جزئیات یک کارگاه خاص.
    کاربر باید مالک کارگاه یا ادمین باشد.
    """
    workshop = get_object_or_404(Workshop, pk=pk)
    # بررسی دسترسی: فقط مالک یا ادمین
    if not (request.user == workshop.owner or request.user.is_staff or request.user.is_superuser):
        raise Http404("شما اجازه دسترسی به این کارگاه را ندارید.")
    return render(request, 'workshop_detail.html', {'workshop': workshop})

@login_required
def workshop_create_view(request):
    if request.method == 'POST':
        form = WorkshopForm(request.POST, request.FILES)
        if form.is_valid():
            workshop = form.save(commit=False)
            workshop.owner = request.user
            workshop.save()

            # پردازش چندعکس از یک input
            images = request.FILES.getlist('images')
            for img in images:
                WorkshopImage.objects.create(workshop=workshop, image=img)

            return redirect('dashboard')
    else:
        form = WorkshopForm()

    return render(request, 'workshop_form.html', {
        'form': form
    })


@login_required
def workshop_edit_view(request, pk):
    """
    ویوی ویرایش یک کارگاه موجود با پشتیبانی از آپلود چند تصویر.
    """
    workshop = get_object_or_404(Workshop, pk=pk)
    
    if not (request.user == workshop.owner or request.user.is_staff or request.user.is_superuser):
        raise Http404("شما اجازه ویرایش این کارگاه را ندارید.")
        
    if request.method == 'POST':
        workshop_form = WorkshopForm(request.POST, request.FILES, instance=workshop)
        formset = WorkshopImageFormSet(request.POST, request.FILES, instance=workshop)
        
        if workshop_form.is_valid() and formset.is_valid():
            workshop_form.save()
            formset.save()
            
            return redirect('dashboard')
    else:
        workshop_form = WorkshopForm(instance=workshop)
        formset = WorkshopImageFormSet(instance=workshop)
        
    return render(request, 'workshop_form.html', {
        'form': workshop_form,
        'formset': formset,
        'form_title': 'ویرایش کارگاه'
    })

@login_required
def workshop_delete_view(request, pk):
    """
    ویوی حذف کارگاه. فقط از طریق متد POST عمل می‌کند.
    """
    workshop = get_object_or_404(Workshop, pk=pk)
    # بررسی دسترسی: فقط مالک یا ادمین
    if not (request.user == workshop.owner or request.user.is_staff or request.user.is_superuser):
        raise Http404("شما اجازه حذف این کارگاه را ندارید.")

    if request.method == 'POST':
        workshop.delete()
        return redirect('dashboard')
    
    # اگر متد GET بود، به جزئیات کارگاه برگردان (یا یک صفحه تایید حذف نشان بده)
    return redirect('workshop_detail', pk=workshop.pk)