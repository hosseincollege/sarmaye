# workshops/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.conf import settings
from django.http import Http404, HttpResponseForbidden # برای خطای دسترسی بهتر است
from django.db import transaction # برای اطمینان از ذخیره کامل یا هیچکدام

from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from .models import Workshop, WorkshopImage
from .serializers import WorkshopSerializer, UserSerializer
from .forms import WorkshopForm

# ... (بخش API Views و Permissions شما بدون تغییر باقی می‌ماند) ...
# ===============================================
# PERMISSIONS (برای API)
# ===============================================

class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.owner == request.user or request.user.is_superuser

# ===============================================
# API VIEWS
# ===============================================

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

class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all().order_by('-created_at')
    serializer_class = WorkshopSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

@api_view(['GET'])
@permission_classes([AllowAny])
def backend_info(request):
    return Response({
        "backend_env": getattr(settings, 'ENV_TYPE', 'unknown'),
        "ip": getattr(request, "real_ip", request.META.get("REMOTE_ADDR", "unknown")),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

# ===============================================
# HTML TEMPLATE VIEWS (بخش اصلاح شده)
# ===============================================

@login_required
def dashboard_view(request):
    if request.user.is_staff or request.user.is_superuser:
        workshops = Workshop.objects.all().order_by('-created_at')
    else:
        workshops = Workshop.objects.filter(owner=request.user).order_by('-created_at')
    return render(request, 'dashboard.html', {'workshops': workshops})

@login_required
def workshop_detail_view(request, pk):
    workshop = get_object_or_404(Workshop, pk=pk)
    if not (request.user == workshop.owner or request.user.is_staff or request.user.is_superuser):
        return HttpResponseForbidden("شما اجازه دسترسی به این کارگاه را ندارید.")
    return render(request, 'workshop_detail.html', {'workshop': workshop})

# -- ویوی ایجاد کارگاه (اصلاح شده) --
@login_required
@transaction.atomic # تضمین می‌کند که تمام عملیات دیتابیس با هم انجام شوند
def workshop_create_view(request):
    """
    ویوی ایجاد یک کارگاه جدید با آپلود چند تصویر.
    """
    if request.method == 'POST':
        # فرم فقط مسئول فیلدهای مدل Workshop است
        form = WorkshopForm(request.POST, request.FILES)
        if form.is_valid():
            # ابتدا آبجکت اصلی کارگاه را ذخیره می‌کنیم اما در دیتابیس ثبت نمی‌کنیم
            # تا بتوانیم اول owner را به آن اختصاص دهیم.
            workshop = form.save(commit=False)
            workshop.owner = request.user
            workshop.save() # حالا کارگاه با مالک مشخص در دیتابیس ذخیره می‌شود

            # حالا تصاویر آپلود شده را از فیلد مجازی 'images' می‌خوانیم
            images = request.FILES.getlist('images')
            for image_file in images:
                WorkshopImage.objects.create(workshop=workshop, image=image_file)

            # پس از ذخیره موفق همه چیز، به داشبورد هدایت می‌شویم
            return redirect('dashboard')
    else:
        form = WorkshopForm()

    return render(request, 'workshop_form.html', {
        'form': form,
        'form_title': 'ایجاد کارگاه جدید'
    })

# -- ویوی ویرایش کارگاه (اصلاح شده) --
@login_required
@transaction.atomic # تضمین می‌کند که تمام عملیات دیتابیس با هم انجام شوند
def workshop_edit_view(request, pk):
    """
    ویوی ویرایش یک کارگاه موجود با پشتیبانی از آپلود چند تصویر اضافی.
    """
    workshop = get_object_or_404(Workshop, pk=pk)

    # بررسی دسترسی: فقط مالک یا ادمین
    if not (request.user == workshop.owner or request.user.is_staff or request.user.is_superuser):
        return HttpResponseForbidden("شما اجازه ویرایش این کارگاه را ندارید.")

    if request.method == 'POST':
        # فرم را با اطلاعات ارسال شده و فایل کاور پر می‌کنیم
        form = WorkshopForm(request.POST, request.FILES, instance=workshop)

        if form.is_valid():
            # فرم اصلی (اطلاعات متنی و کاور) را ذخیره می‌کنیم
            form.save()

            # تصاویر جدید آپلود شده را از فیلد مجازی 'images' به گالری اضافه می‌کنیم
            new_images = request.FILES.getlist('images')
            for img in new_images:
                WorkshopImage.objects.create(workshop=workshop, image=img)
            
            # در اینجا می‌توانید منطق حذف تصاویر قدیمی را هم اضافه کنید اگر نیاز باشد

            return redirect('dashboard')
    else:
        # فرم را با اطلاعات فعلی کارگاه نمایش می‌دهیم
        form = WorkshopForm(instance=workshop)

    return render(request, 'workshop_form.html', {
        'form': form,
        'workshop': workshop,  # ارسال شیء کارگاه برای نمایش تصاویر فعلی در تمپلیت
        'form_title': 'ویرایش کارگاه'
    })

@login_required
def workshop_delete_view(request, pk):
    workshop = get_object_or_404(Workshop, pk=pk)
    if not (request.user == workshop.owner or request.user.is_staff or request.user.is_superuser):
        return HttpResponseForbidden("شما اجازه حذف این کارگاه را ندارید.")

    if request.method == 'POST':
        workshop.delete()
        return redirect('dashboard')

    return redirect('workshop_detail', pk=workshop.pk)
