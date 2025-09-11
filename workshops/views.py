from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Workshop, WorkshopImage
from .serializers import WorkshopSerializer
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ModelViewSet
from rest_framework.serializers import ModelSerializer
from .permissions import IsOwnerOrReadOnly
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer
from django.conf import settings


# ===== Permission =====
class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # صاحب یا سوپریوزر
        return obj.owner == request.user or request.user.is_superuser


# ===== Serializer ثبت نام =====
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

# ===== View ثبت نام =====
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

# ===== ViewSet کارگاه =====
class WorkshopViewSet(viewsets.ModelViewSet):
    queryset = Workshop.objects.all()
    serializer_class = WorkshopSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]  # همه می‌بینند
        else:
            permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]  # ورود + صاحب
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)  # مالک ثبت می‌شود

# ===== ویوهای HTML =====
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .forms import WorkshopForm


from django.conf import settings

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.conf import settings

@api_view(['GET'])
@permission_classes([AllowAny])
def backend_info(request):
    return Response({
        "backend_env": "LOCAL" if settings.DEBUG else "SERVER",
        "ip": getattr(request, "real_ip", request.META.get("REMOTE_ADDR", "unknown"))
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response({
        **serializer.data,
        "backend_env": "LOCAL" if settings.DEBUG else "SERVER",
        "ip": getattr(request, "real_ip", request.META.get("REMOTE_ADDR", "unknown"))
    })



@login_required
def dashboard_view(request):
    workshops = Workshop.objects.all()
    return render(request, 'dashboard.html', {'workshops': workshops})

@login_required
def workshop_detail_view(request, pk):
    workshop = get_object_or_404(Workshop, pk=pk)
    return render(request, 'workshop_detail.html', {'workshop': workshop})

@login_required
def workshop_create_view(request):
    if request.method == 'POST':
        form = WorkshopForm(request.POST, request.FILES)
        if form.is_valid():
            workshop = form.save(commit=False)
            workshop.owner = request.user
            workshop.save()
            return redirect('dashboard')
    else:
        form = WorkshopForm()
    return render(request, 'workshop_form.html', {'form': form, 'form_title': 'ایجاد کارگاه جدید'})

@login_required
def workshop_edit_view(request, pk):
    workshop = get_object_or_404(Workshop, pk=pk)
    if workshop.owner != request.user:
        return redirect('dashboard')
    if request.method == 'POST':
        form = WorkshopForm(request.POST, request.FILES, instance=workshop)
        if form.is_valid():
            form.save()
            return redirect('dashboard')
    else:
        form = WorkshopForm(instance=workshop)
    return render(request, 'workshop_form.html', {'form': form, 'form_title': 'ویرایش کارگاه'})

@login_required
def workshop_delete_view(request, pk):
    workshop = get_object_or_404(Workshop, pk=pk)
    if workshop.owner == request.user:
        workshop.delete()
    return redirect('dashboard')
