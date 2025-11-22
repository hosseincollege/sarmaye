# workshops/models.py
from django.db import models
from django.contrib.auth.models import User

class Workshop(models.Model):
    # 👤 مالک
    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='workshops', 
        verbose_name="مالک"
    )

    
    title = models.CharField(max_length=200, verbose_name="عنوان کارگاه")
    description = models.TextField(verbose_name="توضیحات")
    product_type = models.CharField(max_length=150, blank=True, null=True, verbose_name="نوع محصول")
    

    # 🏭 اطلاعات کلی

    category = models.CharField(max_length=100, blank=True, null=True, verbose_name="دسته‌بندی")
    province = models.CharField(max_length=100, blank=True, null=True, verbose_name="استان")
    
    ownership_type = models.CharField(max_length=150, blank=True, null=True, verbose_name="نوع مالکیت")
    contact_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="شماره تماس")

    website = models.CharField(max_length=200, blank=True, null=True, verbose_name="وب‌سایت")
    email = models.EmailField(max_length=254, blank=True, null=True, verbose_name="ایمیل")

    total_members = models.PositiveIntegerField(blank=True, null=True, verbose_name="تعداد نیروهای انسانی")
    area = models.DecimalField(max_digits=12, decimal_places=0, blank=True, null=True, verbose_name="مساحت کارگاه (متر مربع)")
    
    required_capital = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="سرمایه مورد نیاز (تومان)")
    start_date = models.DateField(blank=True, null=True, verbose_name="تاریخ تأسیس / شروع فعالیت")
    

        # 📍 موقعیت مکانی و نمایندگی
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name="موقعیت مکانی")
    sales_representative = models.CharField(max_length=255, blank=True, null=True, verbose_name="نمایندگی فروش اختصاصی")


    # 🖼️ فایل‌ها و تصویر
    cover_image = models.ImageField(upload_to='workshop_covers/', blank=True, null=True, verbose_name="تصویر کاور")

    # 🕓 زمان‌ها
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاریخ ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاریخ بروزرسانی")

    def __str__(self):
        return self.title
    

    class Meta:
        verbose_name = "کارگاه"
        verbose_name_plural = "کارگاه‌ها"
        ordering = ['-created_at']


class WorkshopImage(models.Model):
    workshop = models.ForeignKey(Workshop, related_name='images', on_delete=models.CASCADE, verbose_name="کارگاه")
    image = models.ImageField(upload_to='workshop_gallery/', verbose_name="تصویر")
    
    # === اصلاح کلیدی اینجا انجام شده است ===
    # به جای default=timezone.now از auto_now_add=True استفاده می‌کنیم
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان آپلود")

    def __str__(self):
        return f"Image for {self.workshop.title}"
    
    class Meta:
        verbose_name = "تصویر کارگاه"
        verbose_name_plural = "تصاویر کارگاه‌ها"



# ======== محصول و مشتری ========
class Product(models.Model):
    workshop = models.ForeignKey(Workshop, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, verbose_name="نام محصول")
    monthly_volume = models.CharField(max_length=50, verbose_name="حجم تولید ماهانه")

class Customer(models.Model):
    product = models.ForeignKey(Product, related_name='customers', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, verbose_name="نام مشتری")
    monthly_order_volume = models.CharField(max_length=50, verbose_name="حجم سفارش ماهانه")


# ======== تیم ========
class TeamCategory(models.Model):
    workshop = models.ForeignKey(Workshop, related_name='team_categories', on_delete=models.CASCADE)
    category_name = models.CharField(max_length=100, verbose_name="دسته نیرو")
    count = models.IntegerField(verbose_name="تعداد نیرو")

class Manager(models.Model):
    workshop = models.OneToOneField(Workshop, related_name='manager', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, verbose_name="نام مدیر عامل")
    description = models.TextField(verbose_name="توضیح مختصر")


# ======== سرمایه‌گذاری ========
class InvestmentStage(models.Model):
    workshop = models.ForeignKey(Workshop, related_name='investments', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=15, decimal_places=0, verbose_name="مبلغ (تومان)")
    purpose = models.CharField(max_length=200, verbose_name="هدف سرمایه‌گذاری")



# ======== گزارش ماهانه ========
class MonthlyReport(models.Model):
    workshop = models.ForeignKey(Workshop, related_name='monthly_reports', on_delete=models.CASCADE)
    month = models.IntegerField(verbose_name="ماه")
    year = models.IntegerField(verbose_name="سال")
    sales = models.DecimalField(max_digits=15, decimal_places=0, verbose_name="فروش")
    production_amount = models.CharField(max_length=50, verbose_name="میزان تولید")
    equipment_rent = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="اجاره تجهیزات")
    material_costs = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="هزینه مواد اولیه")
    salary_maintenance = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="حقوق و نگهداری")
    total_monthly_value = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="ارزش کل کارگاه")
    profit = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="سود ماهانه")
    profit_percentage = models.FloatField(blank=True, null=True, verbose_name="درصد سود ماهانه")
    fixed_workshop_rent = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="اجاره ثابت زمین/سالن کارگاه")

