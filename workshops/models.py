# workshops/models.py
from django.db import models
from django.contrib.auth.models import User
# from django.utils import timezone  # <--- دیگر نیازی به این import برای default نداریم

class Workshop(models.Model):
    # ... تمام فیلدهای Workshop بدون تغییر باقی می‌مانند ...
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workshops', verbose_name="مالک")
    title = models.CharField(max_length=200, verbose_name="عنوان کارگاه")
    description = models.TextField(verbose_name="توضیحات")
    cover_image = models.ImageField(upload_to='workshop_covers/', blank=True, null=True, verbose_name="تصویر کاور")
    agency = models.CharField(max_length=150, blank=True, null=True, verbose_name="نمایندگی/شرکت")
    contact_number = models.CharField(max_length=20, blank=True, null=True, verbose_name="شماره تماس")
    location = models.CharField(max_length=255, blank=True, null=True, verbose_name="موقعیت مکانی")
    product_type = models.CharField(max_length=100, blank=True, null=True, verbose_name="نوع محصول/خدمات")
    required_capital = models.DecimalField(max_digits=15, decimal_places=0, default=0, verbose_name="سرمایه مورد نیاز (تومان)")
    profit_percentage = models.FloatField(default=0.0, verbose_name="درصد سود برای سرمایه‌گذار")
    contract_duration = models.IntegerField(default=12, verbose_name="مدت قرارداد (به ماه)")
    contract_details = models.TextField(blank=True, null=True, verbose_name="جزئیات تکمیلی قرارداد")
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
