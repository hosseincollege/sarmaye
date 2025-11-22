# workshops/serializers.py

from rest_framework import serializers
import json

# 1. وارد کردن (Import) تمام مدل‌های مورد نیاز از فایل models.py
from .models import (
    Workshop, WorkshopImage, Product, Customer, TeamCategory, 
    Manager, InvestmentStage, MonthlyReport
)
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


# سریالایزرهای جدید
class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    customers = CustomerSerializer(many=True, read_only=True)
    class Meta:
        model = Product
        fields = '__all__'

class TeamCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamCategory
        fields = '__all__'

class ManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manager
        fields = '__all__'

class InvestmentStageSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvestmentStage
        fields = '__all__'

class MonthlyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyReport
        fields = '__all__'



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

    products = ProductSerializer(many=True, read_only=True)
    team_categories = TeamCategorySerializer(many=True, read_only=True)
    manager = ManagerSerializer(read_only=True)
    investments = InvestmentStageSerializer(many=True, read_only=True)
    monthly_reports = MonthlyReportSerializer(many=True, read_only=True)
    
    # --- بخش نوشتن اطلاعات (Write) ---
    
    # 3. این فیلد فقط برای آپلود کردن تصاویر جدید استفاده می‌شود (write_only=True)
    # و در خروجی JSON نمایش داده نمی‌شود.
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    
    # فیلدهای write-only برای دریافت داده‌های JSON
    products_data = serializers.CharField(write_only=True, required=False, default='[]')
    team_categories_data = serializers.CharField(write_only=True, required=False, default='[]')
    manager_data = serializers.CharField(write_only=True, required=False, default='{}')
    investments_data = serializers.CharField(write_only=True, required=False, default='[]')
    monthly_reports_data = serializers.CharField(write_only=True, required=False, default='[]')
    gallery_images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )

    
    class Meta:
        model = Workshop
        fields = '__all__'
        read_only_fields = ('owner', 'created_at', 'updated_at')
        

    def get_fields(self):
        fields = super().get_fields()
        # اطمینان از اینکه فیلد images در خروجی هست
        fields['images'] = WorkshopImageSerializer(many=True, read_only=True)
        return fields


    def validate(self, data):
        # فیلدهای مالی که اگر خالی باشند باید None شوند
        decimal_fields = [
            'required_capital',
        ]
        
        for field in decimal_fields:
            if field in data and data[field] == '':
                data[field] = None
                
        return data


    def create(self, validated_data):
        # تصاویر آپلود شده را از دیتا جدا می‌کنیم
        uploaded_images = validated_data.pop('uploaded_images', [])


        # داده‌های JSON رشته‌ای را pop می‌کنیم و مقدار پیش‌فرض یک رشته خالی JSON قرار می‌دهیم
        products_str = validated_data.pop('products_data', '[]')
        team_categories_str = validated_data.pop('team_categories_data', '[]')
        manager_str = validated_data.pop('manager_data', '{}')
        investments_str = validated_data.pop('investments_data', '[]')
        monthly_reports_str = validated_data.pop('monthly_reports_data', '[]')
        
        
        # کارگاه را با بقیه اطلاعات ایجاد می‌کنیم
        workshop = Workshop.objects.create(**validated_data)
        

                # ذخیره محصولات و مشتریان آن‌ها
        products_list = json.loads(products_str)
        for product_item in products_list:
            # داده‌های مشتریان را از محصول جدا می‌کنیم
            customers_list = product_item.pop('customers', [])
            # محصول را با بقیه اطلاعاتش ایجاد می‌کنیم
            product_instance = Product.objects.create(workshop=workshop, **product_item)
            # حالا مشتریان را برای این محصول ایجاد می‌کنیم
            for customer_item in customers_list:
                Customer.objects.create(product=product_instance, **customer_item)

        # ذخیره دسته‌بندی تیم
        team_list = json.loads(team_categories_str)
        for team_item in team_list:
            TeamCategory.objects.create(workshop=workshop, **team_item)

        # ذخیره مدیر
        manager_dict = json.loads(manager_str)
        if manager_dict: # اگر دیکشنری خالی نبود
            Manager.objects.create(workshop=workshop, **manager_dict)

        # ذخیره مراحل سرمایه‌گذاری
        investments_list = json.loads(investments_str)
        for investment_item in investments_list:
            InvestmentStage.objects.create(workshop=workshop, **investment_item)

        # ذخیره گزارش‌های ماهانه
        reports_list = json.loads(monthly_reports_str)
        for report_item in reports_list:
            serializer = MonthlyReportSerializer(data={**report_item, 'workshop': workshop.id})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            
        # مرحله ۴: ذخیره تصاویر گالری
        for image_file in uploaded_images:
            WorkshopImage.objects.create(workshop=workshop, image=image_file)

        # مرحله ۵: برگرداندن نمونه کارگاه ایجاد شده
        return workshop
