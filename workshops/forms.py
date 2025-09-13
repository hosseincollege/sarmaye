# workshops/forms.py

from django import forms
from .models import Workshop

# این ویجت سفارشی برای حل مشکل آپلود چند فایل است، دست نزنید
class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class WorkshopForm(forms.ModelForm):
    # در این فیلد، یک کلاس CSS برای مخفی کردن دکمه اضافه کرده‌ایم
    images = forms.FileField(
        widget=MultipleFileInput(attrs={
            'multiple': True,
            'class': 'd-none'  # <-- این کلاس باعث مخفی شدن دکمه پیش‌فرض می‌شود
        }),
        required=False,
        label="تصاویر گالری"
    )

    class Meta:
        model = Workshop
        fields = [
            'name', 'description', 'cover_image', 'representative', 'phone',
            'location', 'product_type', 'investment_needed', 'funded_percentage',
            'profit_percentage', 'duration_months', 'contract_details'
        ]
