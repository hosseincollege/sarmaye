# workshops/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.conf import settings
from django.http import Http404, HttpResponseForbidden
from django.db import transaction
from django.contrib import messages

from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.response import Response
from rest_framework.serializers import ModelSerializer

from .models import Workshop, WorkshopImage
from .serializers import WorkshopSerializer, UserSerializer
from .forms import WorkshopForm

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
# HTML TEMPLATE VIEWS
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

@login_required
@transaction.atomic
def workshop_create_view(request):
    """
    ویوی ایجاد یک کارگاه جدید با آپلود چند تصویر.
    """
    if request.method == 'POST':
        form = WorkshopForm(request.POST, request.FILES)
        
        # Debug information
        print("=== DEBUG CREATE WORKSHOP ===")
        print("REQUEST METHOD:", request.method)
        print("POST DATA:", dict(request.POST))
        print("FILES RECEIVED:", dict(request.FILES))
        
        # گرفتن فایل‌ها از فرم
        images_from_form = form.cleaned_data.get('images', []) if form.is_valid() else []
        images_from_request = request.FILES.getlist('images')
        
        print("Images from form:", images_from_form)
        print("Images from request:", images_from_request)
        
        if form.is_valid():
            print("Form is valid!")
            
            # ایجاد کارگاه
            workshop = form.save(commit=False)
            workshop.owner = request.user
            workshop.save()
            
            print(f"Workshop created with ID: {workshop.id}")
            
            # ذخیره تصاویر - استفاده از هر دو روش برای اطمینان
            all_images = []
            if images_from_form:
                all_images.extend(images_from_form)
            if images_from_request:
                all_images.extend(images_from_request)
            
            # حذف تکراری‌ها
            unique_images = []
            for img in all_images:
                if img and img not in unique_images:
                    unique_images.append(img)
            
            print(f"Number of unique images to save: {len(unique_images)}")
            
            for i, image_file in enumerate(unique_images):
                print(f"Saving image {i+1}: {image_file.name} (size: {image_file.size} bytes)")
                try:
                    workshop_image = WorkshopImage.objects.create(
                        workshop=workshop, 
                        image=image_file
                    )
                    print(f"Image saved with ID: {workshop_image.id}")
                except Exception as e:
                    print(f"Error saving image {i+1}: {str(e)}")
            
            messages.success(request, f'کارگاه "{workshop.title}" با موفقیت ایجاد شد!')
            return redirect('dashboard')
        else:
            print("Form is NOT valid!")
            print("FORM ERRORS:", form.errors)
            messages.error(request, 'خطا در ایجاد کارگاه. لطفاً اطلاعات را بررسی کنید.')
    else:
        form = WorkshopForm()

    return render(request, 'workshop_form.html', {
        'form': form,
        'form_title': 'ایجاد کارگاه جدید'
    })

@login_required
@transaction.atomic
def workshop_edit_view(request, pk):
    """
    ویوی ویرایش یک کارگاه موجود با پشتیبانی از آپلود چند تصویر اضافی.
    """
    workshop = get_object_or_404(Workshop, pk=pk)

    if not (request.user == workshop.owner or request.user.is_staff or request.user.is_superuser):
        return HttpResponseForbidden("شما اجازه ویرایش این کارگاه را ندارید.")

    if request.method == 'POST':
        form = WorkshopForm(request.POST, request.FILES, instance=workshop)
        
        if form.is_valid():
            print("Form is valid for editing!")
            
            # ذخیره تغییرات کارگاه
            form.save()
            
            # اضافه کردن تصاویر جدید
            images_from_form = form.cleaned_data.get('images', [])
            images_from_request = request.FILES.getlist('images')
            
            all_new_images = []
            if images_from_form:
                all_new_images.extend(images_from_form)
            if images_from_request:
                all_new_images.extend(images_from_request)
            
            # حذف تکراری‌ها
            unique_new_images = []
            for img in all_new_images:
                if img and img not in unique_new_images:
                    unique_new_images.append(img)
            
            print(f"Number of new images to add: {len(unique_new_images)}")
            
            for i, img in enumerate(unique_new_images):
                print(f"Adding new image {i+1}: {img.name}")
                try:
                    workshop_image = WorkshopImage.objects.create(workshop=workshop, image=img)
                    print(f"New image saved with ID: {workshop_image.id}")
                except Exception as e:
                    print(f"Error saving new image {i+1}: {str(e)}")
            
            messages.success(request, f'کارگاه "{workshop.title}" با موفقیت ویرایش شد!')
            return redirect('dashboard')
        else:
            print("Form is NOT valid for editing!")
            print("FORM ERRORS:", form.errors)
            messages.error(request, 'خطا در ویرایش کارگاه. لطفاً اطلاعات را بررسی کنید.')
    else:
        form = WorkshopForm(instance=workshop)

    return render(request, 'workshop_form.html', {
        'form': form,
        'workshop': workshop,
        'form_title': 'ویرایش کارگاه'
    })

@login_required
def workshop_delete_view(request, pk):
    workshop = get_object_or_404(Workshop, pk=pk)
    if not (request.user == workshop.owner or request.user.is_staff or request.user.is_superuser):
        return HttpResponseForbidden("شما اجازه حذف این کارگاه را ندارید.")

    if request.method == 'POST':
        workshop_title = workshop.title
        workshop.delete()
        messages.success(request, f'کارگاه "{workshop_title}" با موفقیت حذف شد!')
        return redirect('dashboard')

    return redirect('workshop_detail', pk=workshop.pk)
