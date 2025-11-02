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

        # 👇 همه فیلدها
        fields = [
            # --- 🔵 اطلاعات کلی ---
            'title',
            'description',
            'product_type',

            'category',
            'province',

            'ownership_type',
            'contact_number',

            'website',
            'email',

            'total_members',
            'area',

            'required_capital',
            'start_date',

            

            'location',
            'sales_representative',


            'cover_image',
            'images',
        ]

        # 📋 برچسب‌های فارسی‌تر با تفکیک موضوعی
        labels = {
            # 🔵 اطلاعات کلی
            'title': 'عنوان کارگاه',
            'description': 'توضیحات کارگاه',
            'product_type': 'نوع محصول',

            'category': 'دسته‌بندی',
            'province': 'استان',

            'ownership_type': 'نوع مالکیت',
            'contact_number': 'شماره تماس',

            'website': 'آدرس وب‌سایت',
            'email': 'ایمیل کاری',

            'total_members': 'تعداد اعضا',
            'area': 'مساحت کارگاه (متر مربع)',

            'required_capital': 'سرمایه مورد نیاز (تومان)',
            'start_date': 'تاریخ شروع فعالیت',
            

            'location': 'موقعیت مکانی',
            'sales_representative': 'نمایندگی فروش اختصاصی',


            'cover_image': 'تصویر اصلی (کاور)',
            'images': 'تصاویر گالری',
        }

        # 🎨 ویجت‌ها با کلاس‌های Bootstrap
        widgets = {
            # اطلاعات کلی
            'title': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
            'product_type': forms.TextInput(attrs={'class': 'form-control'}),
            
            'category': forms.Select(attrs={'class': 'form-control'}),
            'province': forms.TextInput(attrs={'class': 'form-control'}),

            'ownership_type': forms.TextInput(attrs={'class': 'form-control'}),
            'contact_number': forms.TextInput(attrs={'dir': 'ltr', 'class': 'form-control'}),

            'website': forms.URLInput(attrs={'dir': 'ltr', 'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'dir': 'ltr', 'class': 'form-control'}),

            'total_members': forms.NumberInput(attrs={'class': 'form-control'}),
            'area': forms.NumberInput(attrs={'class': 'form-control'}),

            'required_capital': forms.NumberInput(attrs={'class': 'form-control'}),
            'start_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            
            'cover_image': forms.FileInput(attrs={'class': 'form-control'}),
            
        }

    # برای نمایش مرتب در Template می‌تونی مثلاً sections تعریف کنی:
    def grouped_fields(self):
        """برمی‌گردونه فیلدها بر اساس دسته‌بندی برای رندر مرتب"""
        return {
            'اطلاعات کلی': ['title', 'description', 'category', 'province', 'ownership_type', 'total_members', 'start_date', 'product_type'],
            'اطلاعات مالی': ['required_capital'],
            'اطلاعات فنی': ['area', 'cover_image'],
            'اطلاعات تماس': ['contact_number', 'website', 'email'],
            'گالری تصاویر': ['images'],
        }