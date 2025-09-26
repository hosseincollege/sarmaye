# workshops/forms.py
from django import forms
from .models import Workshop
from django.contrib.auth.models import User

# ----- ویجت سفارشی برای آپلود چند فایل (بدون تغییر) -----
class MultipleFileInput(forms.FileInput):
    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['widget']['attrs']['multiple'] = True
        return context

    def value_from_datadict(self, data, files, name):
        if hasattr(files, 'getlist'):
            return files.getlist(name)
        return files.get(name)

# ----- فیلد سفارشی برای چند فایل (بدون تغییر) -----
class MultipleFileField(forms.FileField):
    widget = MultipleFileInput
    
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("required", False)
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        single_file_clean = super().clean
        if isinstance(data, (list, tuple)):
            result = [single_file_clean(d, initial) for d in data if d]
        elif data:
            result = [single_file_clean(data, initial)]
        else:
            result = []
        return result

# ----- فرم اصلی و کامل کارگاه -----
class WorkshopForm(forms.ModelForm):
    # فیلد برای آپلود تصاویر گالری
    images = MultipleFileField(
        label="تصاویر گالری",
        help_text='می‌توانید چند تصویر را همزمان انتخاب کنید.'
    )

    class Meta:
        model = Workshop
        # === مهم: تمام فیلدهایی که کاربر باید پر کند را اینجا لیست می‌کنیم ===
        fields = [
            'title',
            'owner',
            'description',
            'agency',
            'contact_number',
            'location',
            'product_type',
            'required_capital',
            'profit_percentage',
            'contract_duration',
            'contract_details',
            'cover_image',
            # فیلد 'images' در بالا به صورت جداگانه تعریف شده است
            # --- فیلدهای باقی‌مانده از مدل که اضافه می‌کنیم ---
            'start_date',
            'last_year_sales',
            'last_year_profit',
        ]

        # برای هر فیلد، یک لیبل فارسی خوانا تعریف می‌کنیم
        labels = {
            'title': 'عنوان کارگاه',
            'owner': 'مالک/نماینده',
            'description': 'توضیحات کامل کارگاه',
            'agency': 'نمایندگی/شرکت',
            'contact_number': 'شماره تماس',
            'location': 'موقعیت مکانی',
            'product_type': 'نوع محصول/خدمات',
            'required_capital': 'سرمایه مورد نیاز (به تومان)',
            'profit_percentage': 'درصد سود برای سرمایه‌گذار',
            'contract_duration': 'مدت قرارداد (به ماه)',
            'contract_details': 'جزئیات تکمیلی قرارداد',
            'cover_image': 'تصویر اصلی (کاور)',
            # --- لیبل برای فیلدهای جدید اضافه شده ---
            'start_date': 'تاریخ شروع فعالیت',
            'last_year_sales': 'فروش سال گذشته (تومان)',
            'last_year_profit': 'سود سال گذشته (تومان)',
        }
        
        # استایل‌های ویجت‌ها برای ظاهر بهتر در فرم
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'owner': forms.Select(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'rows': 5, 'class': 'form-control'}),
            'agency': forms.TextInput(attrs={'class': 'form-control'}),
            'contact_number': forms.TextInput(attrs={'dir': 'ltr', 'class': 'form-control'}),
            'location': forms.TextInput(attrs={'class': 'form-control'}),
            'product_type': forms.TextInput(attrs={'class': 'form-control'}),
            'required_capital': forms.NumberInput(attrs={'class': 'form-control'}),
            'profit_percentage': forms.NumberInput(attrs={'step': '0.01', 'class': 'form-control'}),
            'contract_duration': forms.NumberInput(attrs={'class': 'form-control'}),
            'contract_details': forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
            'cover_image': forms.FileInput(attrs={'class': 'form-control'}),
            # ویجت برای فیلد images به صورت خودکار از MultipleFileField اعمال می‌شود
            # --- ویجت برای فیلدهای جدید اضافه شده ---
            'start_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'last_year_sales': forms.NumberInput(attrs={'class': 'form-control'}),
            'last_year_profit': forms.NumberInput(attrs={'class': 'form-control'}),
        }
