# models.py
from django.db import models
from django.contrib.auth.models import User

class Workshop(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workshops')
    name = models.CharField(max_length=255, verbose_name="نام کارگاه")
    description = models.TextField(verbose_name="توضیحات")
    cover_image = models.ImageField(upload_to='workshops/', null=True, blank=True)
    representative = models.CharField(max_length=255, verbose_name="نمایندگی")
    phone = models.CharField(max_length=20, verbose_name="شماره تماس")
    location = models.CharField(max_length=255, verbose_name="موقعیت کارگاه")
    product_type = models.CharField(max_length=255, verbose_name="نوع محصول")
    investment_needed = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="سرمایه مورد نیاز")
    funded_percentage = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="درصد تأمین شده", default=0)
    profit_percentage = models.DecimalField(max_digits=5, decimal_places=2, verbose_name="درصد سود")
    duration_months = models.IntegerField(verbose_name="مدت قرارداد (ماه)")
    contract_details = models.TextField(verbose_name="جزئیات قرارداد")

    def __str__(self):
        return self.name

class WorkshopImage(models.Model):
    workshop = models.ForeignKey(Workshop, related_name='uploaded_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='workshops/')

    def __str__(self):
        return f"{self.workshop.title} - Image {self.id}"
