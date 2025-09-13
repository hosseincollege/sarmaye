# workshops/serializers.py

from rest_framework import serializers
from .models import Workshop, WorkshopImage
from django.contrib.auth.models import User

# ================================================
# سریالایزر برای نمایش اطلاعات کاربر (مالک) - بدون تغییر
# ================================================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# ================================================
# سریالایزر برای تصاویر گالری - بدون تغییر
# ================================================
class WorkshopImageSerializer(serializers.ModelSerializer):
    # image = serializers.ImageField(use_url=True) # این خط اضافه است و نیازی به آن نیست، مدل خودش این کار را می‌کند

    class Meta:
        model = WorkshopImage
        fields = ['id', 'image']

# ================================================
# سریالایزر اصلی و اصلاح شده برای کارگاه
# ================================================
class WorkshopSerializer(serializers.ModelSerializer):
    # --- بخش خواندن اطلاعات (Read) ---
    
    # 1. اطلاعات مالک را با سریالایزر خودش نمایش می‌دهد
    owner = UserSerializer(read_only=True)
    
    # 2. **اصلاح کلیدی:** تصاویر گالری را با استفاده از 'related_name' صحیح ('images') می‌خواند
    # نام فیلد در خروجی JSON نیز 'images' خواهد بود.
    images = WorkshopImageSerializer(many=True, read_only=True)
    
    # --- بخش نوشتن اطلاعات (Write) ---
    
    # 3. این فیلد فقط برای آپلود کردن تصاویر جدید استفاده می‌شود (write_only=True)
    # و در خروجی JSON نمایش داده نمی‌شود.
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Workshop
        # تمام فیلدهای مدل را شامل شود
        fields = '__all__'
        
        # فیلدهای زیر را به لیست اضافه می‌کنیم تا در خروجی نهایی سریالایزر قرار بگیرند
        # این کار خوانایی را بالا می‌برد
        extra_fields = ['images']

    def get_fields(self):
        fields = super().get_fields()
        # اطمینان از اینکه فیلد images در خروجی هست
        fields['images'] = WorkshopImageSerializer(many=True, read_only=True)
        return fields

    def create(self, validated_data):
        # تصاویر آپلود شده را از دیتا جدا می‌کنیم
        uploaded_images_data = validated_data.pop('uploaded_images', [])
        
        # کارگاه را با بقیه اطلاعات ایجاد می‌کنیم
        workshop = Workshop.objects.create(**validated_data)
        
        # تصاویر جدا شده را به مدل WorkshopImage اضافه کرده و به کارگاه مرتبط می‌کنیم
        for image_data in uploaded_images_data:
            WorkshopImage.objects.create(workshop=workshop, image=image_data)
            
        return workshop
