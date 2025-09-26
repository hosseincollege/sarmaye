# workshops/models.py
from django.db import models
from django.contrib.auth.models import User

class Workshop(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workshops', verbose_name="مالک")
    title = models.CharField(max_length=200, verbose_name="عنوان کارگاه")
    description = models.TextField(verbose_name="توضیحات")
    cover_image = models.ImageField(upload_to='workshop_covers/', blank=True, null=True, verbose_name="تصویر کاور")
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name="موقعیت مکانی")
    start_date = models.DateField(blank=True, null=True, verbose_name="تاریخ شروع فعالیت")

    agency = models.CharField(max_length=200, blank=True, null=True, verbose_name="شرکت")
    contact_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="شماره تماس")
    website = models.CharField(max_length=200, blank=True, null=True, verbose_name="وبسایت")
    email = models.CharField(max_length=254, blank=True, null=True, verbose_name="ایمیل")
    product_type = models.CharField(max_length=150, blank=True, null=True, verbose_name="نوع محصول/خدمات")

    category = models.CharField(max_length=100, blank=True, null=True, verbose_name="دسته‌بندی")


    sales_representative = models.CharField(max_length=200, blank=True, null=True, verbose_name="نمایندگی")
    address = models.TextField(blank=True, null=True, verbose_name="آدرس")

    # === فیلدهای جدید اطلاعات مالی و قرارداد ===
    required_capital = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="سرمایه مورد نیاز (تومان)")
    profit_percentage = models.FloatField(blank=True, null=True, verbose_name="درصد سود برای سرمایه‌گذار")
    funded_percentage = models.FloatField(blank=True, null=True, verbose_name="درصد پوشش سرمایه")
    contract_duration = models.IntegerField(blank=True, null=True, verbose_name="مدت قرارداد (ماه)")
    contract_details = models.TextField(blank=True, null=True, verbose_name="جزئیات تکمیلی قرارداد")

    
    last_year_sales = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="فروش سال گذشته")
    last_year_profit = models.DecimalField(max_digits=15, decimal_places=0, blank=True, null=True, verbose_name="سود سال گذشته")

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="زمان ایجاد")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="زمان بروزرسانی")

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
    profit_percentage = models.FloatField(verbose_name="درصد سود وعده داده شده")
    return_duration_months = models.IntegerField(verbose_name="مدت بازگشت سرمایه (ماه)")


# ======== گزارش ماهانه ========
class MonthlyReport(models.Model):
    workshop = models.ForeignKey(Workshop, related_name='monthly_reports', on_delete=models.CASCADE)
    month = models.IntegerField(verbose_name="ماه")
    year = models.IntegerField(verbose_name="سال")
    sales = models.DecimalField(max_digits=15, decimal_places=0, verbose_name="فروش")
    gross_profit = models.DecimalField(max_digits=15, decimal_places=0, verbose_name="سود ناخالص")
    net_profit = models.DecimalField(max_digits=15, decimal_places=0, verbose_name="سود خالص")
    profit_percentage = models.FloatField(verbose_name="درصد سود")
    production_amount = models.CharField(max_length=50, verbose_name="میزان تولید")
    sold_amount = models.CharField(max_length=50, verbose_name="میزان فروش")
